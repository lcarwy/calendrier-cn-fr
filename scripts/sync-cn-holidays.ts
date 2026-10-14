// 从 NateScarlet/holiday-cn 同步中国节假日安排到 src/data/cn-holidays/。
// 用法：node scripts/sync-cn-holidays.ts [--from 2020] [--to 2027]
// 默认同步 去年..明年。有错误时退出码为 1，且不写入任何出错的年份。
import { appendFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { parseArgs } from 'node:util';
import type { CnHolidayFile } from '../src/domain/cn-holidays/types.ts';
import { sameDays, serialize, validateUpstream } from './lib/cn-holidays.ts';

const DATA_DIR = new URL('../src/data/cn-holidays/', import.meta.url);
const upstreamUrl = (year: number) =>
  `https://raw.githubusercontent.com/NateScarlet/holiday-cn/master/${year}.json`;

const currentYear = new Date().getFullYear();
const { values } = parseArgs({
  options: { from: { type: 'string' }, to: { type: 'string' } },
});
const from = Number(values.from ?? currentYear - 1);
const to = Number(values.to ?? currentYear + 1);

async function readExisting(year: number): Promise<CnHolidayFile | undefined> {
  try {
    return JSON.parse(await readFile(new URL(`${year}.json`, DATA_DIR), 'utf8')) as CnHolidayFile;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return undefined;
    throw error;
  }
}

const report: string[] = [];
const log = (line: string) => {
  console.log(line);
  report.push(line);
};
let failed = false;

await mkdir(DATA_DIR, { recursive: true });

for (let year = from; year <= to; year++) {
  const response = await fetch(upstreamUrl(year));
  const existing = await readExisting(year);

  if (response.status === 404) {
    log(`- ${year}：上游没有文件，视为未公布`);
    continue;
  }
  if (!response.ok) {
    log(`- ${year}：❌ 下载失败 HTTP ${response.status}`);
    failed = true;
    continue;
  }

  const result = validateUpstream(await response.json(), year);

  if (result.status === 'unpublished') {
    if (existing) {
      log(`- ${year}：❌ 本地已有数据，但上游变成了空文件，未做任何修改，请人工检查`);
      failed = true;
    } else {
      log(`- ${year}：尚未公布`);
    }
    continue;
  }

  for (const warning of result.warnings) log(`- ${year}：⚠️ ${warning}`);

  if (result.status === 'invalid') {
    for (const error of result.errors) log(`- ${year}：❌ ${error}`);
    failed = true;
    continue;
  }

  if (existing?.source === 'manual') {
    log(
      sameDays(existing, result.file)
        ? `- ${year}：本地为手工录入，与上游一致`
        : `- ${year}：⚠️ 本地为手工录入，与上游不一致，未覆盖，请对照 gov.cn 原文`,
    );
    continue;
  }

  const next = serialize(result.file);
  if (existing && serialize(existing) === next) {
    log(`- ${year}：无变化`);
    continue;
  }
  await writeFile(new URL(`${year}.json`, DATA_DIR), next, 'utf8');
  log(`- ${year}：✅ ${existing ? '已更新' : '新增'}（原文：${result.file.papers.join('，')}）`);
}

// 在 GitHub Actions 中：报告写进运行摘要；SYNC_REPORT_FILE 指定时另存一份，作为 PR 正文
const reportText = `${report.join('\n')}\n`;
if (process.env.GITHUB_STEP_SUMMARY) {
  await appendFile(process.env.GITHUB_STEP_SUMMARY, reportText);
}
if (process.env.SYNC_REPORT_FILE) {
  await writeFile(process.env.SYNC_REPORT_FILE, reportText, 'utf8');
}
if (failed) process.exitCode = 1;
