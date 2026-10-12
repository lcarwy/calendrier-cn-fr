import { describe, expect, it } from 'vitest';
import { sameDays, serialize, validateUpstream } from './cn-holidays.ts';

const GOV = 'https://www.gov.cn/zhengce/zhengceku/202511/content_7047091.htm';
const ALL_NAMES = ['元旦', '春节', '清明节', '劳动节', '端午节', '中秋节', '国庆节'];

/** 构造一份 2026 年的最小合法上游数据 */
function upstream(extra: { name: string; date: string; isOffDay: boolean }[] = []) {
  const base = [
    { name: '元旦', date: '2026-01-01', isOffDay: true },
    { name: '春节', date: '2026-02-14', isOffDay: false },
    { name: '春节', date: '2026-02-17', isOffDay: true },
    { name: '清明节', date: '2026-04-05', isOffDay: true },
    { name: '劳动节', date: '2026-05-01', isOffDay: true },
    { name: '劳动节', date: '2026-05-02', isOffDay: true },
    { name: '端午节', date: '2026-06-19', isOffDay: true },
    { name: '中秋节', date: '2026-09-25', isOffDay: true },
    { name: '国庆节', date: '2026-10-01', isOffDay: true },
    { name: '国庆节', date: '2026-10-02', isOffDay: true },
    { name: '国庆节', date: '2026-10-03', isOffDay: true },
  ];
  return { year: 2026, papers: [GOV], days: [...extra, ...base] };
}

describe('validateUpstream', () => {
  it('合法数据：按日期排序、映射 id、班/休', () => {
    const result = validateUpstream(upstream(), 2026);
    expect(result.status).toBe('ok');
    if (result.status !== 'ok') return;
    expect(result.warnings).toEqual([]);
    expect(result.file.days[0]).toEqual({
      date: '2026-01-01',
      ids: ['new-year'],
      name: '元旦',
      kind: 'off',
    });
    expect(result.file.days[1]?.kind).toBe('work');
    expect(new Set(result.file.days.map((d) => d.name))).toEqual(new Set(ALL_NAMES));
  });

  it('上游的空占位文件 = 未公布', () => {
    expect(validateUpstream({ year: 2027, papers: [], days: [] }, 2027)).toEqual({
      status: 'unpublished',
    });
  });

  it('原文链接必须是 gov.cn', () => {
    const raw = { ...upstream(), papers: ['https://example.com/fake-gov.cn'] };
    expect(validateUpstream(raw, 2026).status).toBe('invalid');
  });

  it('补班日在周末才有效；工作日标为上班会被忽略并警告', () => {
    const result = validateUpstream(
      upstream([{ name: '春节', date: '2026-02-24', isOffDay: false }]),
      2026,
    );
    expect(result.status).toBe('ok');
    if (result.status !== 'ok') return;
    expect(result.file.days.some((d) => d.date === '2026-02-24')).toBe(false);
    expect(result.warnings.join()).toContain('2026-02-24');
  });

  it('2025 年起固定日期的法定假日必须放假', () => {
    const raw = upstream();
    raw.days = raw.days.filter((d) => d.date !== '2026-05-02');
    const result = validateUpstream(raw, 2026);
    expect(result.status).toBe('invalid');
    if (result.status === 'invalid') expect(result.errors.join()).toContain('2026-05-02');
  });

  it('中秋国庆合并名称拆成两个 id', () => {
    const result = validateUpstream(
      upstream([{ name: '国庆节、中秋节', date: '2026-10-04', isOffDay: true }]),
      2026,
    );
    expect(
      result.status === 'ok' && result.file.days.find((d) => d.date === '2026-10-04')?.ids,
    ).toEqual(['national-day', 'mid-autumn']);
  });

  it('未知名称：记为 other 并警告', () => {
    const result = validateUpstream(
      upstream([{ name: '抗战胜利纪念日', date: '2026-09-03', isOffDay: true }]),
      2026,
    );
    expect(result.status).toBe('ok');
    if (result.status !== 'ok') return;
    expect(result.file.days.find((d) => d.date === '2026-09-03')?.ids).toEqual(['other']);
    expect(result.warnings.join()).toContain('抗战胜利纪念日');
  });

  it('日期重复、非法、超出范围、年份不符都会报错', () => {
    const cases = [
      upstream([{ name: '元旦', date: '2026-01-01', isOffDay: true }]),
      upstream([{ name: '元旦', date: '2026-02-30', isOffDay: true }]),
      upstream([{ name: '元旦', date: '2025-11-30', isOffDay: true }]),
      { ...upstream(), year: 2025 },
    ];
    for (const raw of cases) expect(validateUpstream(raw, 2026).status).toBe('invalid');
  });

  it('允许上一年 12 月的日期（通知年份 ≠ 日期年份）', () => {
    const result = validateUpstream(
      upstream([{ name: '元旦', date: '2025-12-27', isOffDay: false }]),
      2026,
    );
    expect(result.status).toBe('ok');
  });
});

describe('serialize', () => {
  it('每天一行、结尾换行，可被 JSON 解析回原数据', () => {
    const result = validateUpstream(upstream(), 2026);
    if (result.status !== 'ok') throw new Error('fixture invalid');
    const text = serialize(result.file);
    expect(text.endsWith('}\n')).toBe(true);
    expect(text).toContain(
      '\n    {"date":"2026-01-01","ids":["new-year"],"name":"元旦","kind":"off"},\n',
    );
    expect(JSON.parse(text)).toEqual(result.file);
    expect(sameDays(JSON.parse(text), result.file)).toBe(true);
  });
});
