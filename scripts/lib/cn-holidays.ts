// 校验并规范化 holiday-cn 的年度文件。纯函数，便于测试。
import {
  CN_HOLIDAY_ID_BY_NAME,
  type CnHolidayDayEntry,
  type CnHolidayFile,
} from '../../src/domain/cn-holidays/types.ts';

export type ValidationResult =
  | { status: 'unpublished' }
  | { status: 'invalid'; errors: string[]; warnings: string[] }
  | { status: 'ok'; file: CnHolidayFile; warnings: string[] };

/** 现行放假办法（2025-01-01 起）中公历日期固定、必须放假的日子 */
const FIXED_STATUTORY_SINCE_2025 = ['01-01', '05-01', '05-02', '10-01', '10-02', '10-03'];

const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

/** 返回 ISO 星期（1 = 周一 … 7 = 周日），日期不合法时返回 undefined */
function isoWeekday(date: string): number | undefined {
  const m = DATE_PATTERN.exec(date);
  if (!m) return undefined;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const t = new Date(Date.UTC(y, mo - 1, d));
  if (t.getUTCFullYear() !== y || t.getUTCMonth() !== mo - 1 || t.getUTCDate() !== d) {
    return undefined;
  }
  return t.getUTCDay() === 0 ? 7 : t.getUTCDay();
}

function isGovCnUrl(value: string): boolean {
  try {
    const host = new URL(value).hostname;
    return host === 'gov.cn' || host.endsWith('.gov.cn');
  } catch {
    return false;
  }
}

export function validateUpstream(raw: unknown, year: number): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const invalid = () => ({ status: 'invalid' as const, errors, warnings });

  if (typeof raw !== 'object' || raw === null) {
    errors.push('不是 JSON 对象');
    return invalid();
  }
  const { year: rawYear, papers, days } = raw as Record<string, unknown>;
  if (rawYear !== year) errors.push(`year 字段是 ${String(rawYear)}，应为 ${year}`);
  if (!Array.isArray(papers) || !papers.every((p) => typeof p === 'string')) {
    errors.push('papers 不是字符串数组');
  }
  if (!Array.isArray(days)) errors.push('days 不是数组');
  if (errors.length) return invalid();

  const paperList = papers as string[];
  const dayList = days as unknown[];

  // holiday-cn 会为尚未公布的年份预先放一个空文件
  if (paperList.length === 0 && dayList.length === 0) return { status: 'unpublished' };
  if (paperList.length === 0) errors.push('有日期但没有 papers（原文链接）');
  for (const paper of paperList) {
    if (!isGovCnUrl(paper)) errors.push(`原文链接不是 gov.cn：${paper}`);
  }

  const minDate = `${year - 1}-12-01`;
  const maxDate = `${year}-12-31`;
  const seen = new Set<string>();
  const entries: CnHolidayDayEntry[] = [];

  for (const item of dayList) {
    const { date, name, isOffDay } = (item ?? {}) as Record<string, unknown>;
    if (typeof date !== 'string' || typeof name !== 'string' || typeof isOffDay !== 'boolean') {
      errors.push(`条目格式错误：${JSON.stringify(item)}`);
      continue;
    }
    const wd = isoWeekday(date);
    if (wd === undefined) {
      errors.push(`日期不合法：${date}`);
      continue;
    }
    if (date < minDate || date > maxDate) errors.push(`日期超出 ${minDate}..${maxDate}：${date}`);
    if (seen.has(date)) errors.push(`日期重复：${date}`);
    seen.add(date);
    if (!isOffDay && wd < 6) {
      // 如 2020-02-03"正常上班"：工作日本来就上班，不是补班，不需要标记
      warnings.push(`工作日 ${date}（${name}）被标为上班，属正常上班日而非补班，已忽略`);
      continue;
    }

    const ids = name.split(/[、,，]/).map((part) => {
      const id = CN_HOLIDAY_ID_BY_NAME[part.trim()];
      if (!id) warnings.push(`未知节日名称「${part}」（${date}），记为 other，请对照原文确认`);
      return id ?? 'other';
    });
    entries.push({ date, ids: [...new Set(ids)], name, kind: isOffDay ? 'off' : 'work' });
  }

  if (year >= 2025) {
    const offDates = new Set(entries.filter((e) => e.kind === 'off').map((e) => e.date));
    for (const md of FIXED_STATUTORY_SINCE_2025) {
      if (!offDates.has(`${year}-${md}`)) errors.push(`法定假日 ${year}-${md} 没有标为放假`);
    }
  }
  const presentIds = new Set(entries.flatMap((e) => e.ids));
  for (const [name, id] of Object.entries(CN_HOLIDAY_ID_BY_NAME)) {
    if (!presentIds.has(id)) warnings.push(`通知中没有「${name}」，请对照原文确认`);
  }

  if (errors.length) return invalid();
  entries.sort((a, b) => (a.date < b.date ? -1 : 1));
  return {
    status: 'ok',
    file: { year, source: 'holiday-cn', papers: paperList, days: entries },
    warnings,
  };
}

/** 稳定的 JSON 输出：每个日期一行，方便在 PR 里逐行对照 */
export function serialize(file: CnHolidayFile): string {
  const lines = [
    '{',
    `  "year": ${file.year},`,
    `  "source": ${JSON.stringify(file.source)},`,
    `  "papers": [`,
    file.papers.map((p) => `    ${JSON.stringify(p)}`).join(',\n'),
    '  ],',
    '  "days": [',
    file.days.map((d) => `    ${JSON.stringify(d)}`).join(',\n'),
    '  ]',
    '}',
    '',
  ];
  return lines.join('\n');
}

/** 两份数据的日期安排是否一致（忽略 source） */
export function sameDays(a: CnHolidayFile, b: CnHolidayFile): boolean {
  return JSON.stringify(a.days) === JSON.stringify(b.days);
}
