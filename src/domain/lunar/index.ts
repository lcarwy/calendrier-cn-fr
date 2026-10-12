// 农历、节气、传统节日。唯一调用 tyme4ts 的地方，换库只需改本文件。
// tyme4ts 按北京时间（UTC+8）计算节气时刻和农历初一，符合中国历法惯例。
import { LunarDay, SolarDay, SolarTerm } from 'tyme4ts';
import { addDays, plainDate, toYmd, type PlainDate } from '../date';
import type { LocalizedText } from '../text';
import {
  CN_FESTIVALS,
  LUNAR_DAY_NAMES,
  LUNAR_MONTH_NAMES,
  SOLAR_TERMS,
  ZODIAC,
  type CnFestivalId,
  type NamedItem,
} from './names';

export { CN_FESTIVALS, SOLAR_TERMS, type CnFestivalId, type NamedItem } from './names';

export interface LunarDate {
  /** 农历年（以正月初一为界） */
  year: number;
  /** 1–12 */
  month: number;
  /** 1–30 */
  day: number;
  isLeapMonth: boolean;
  /** 本月天数：大月 30，小月 29 */
  monthDayCount: number;
  /** 正月 … 腊月，闰月前加"闰" */
  monthName: string;
  /** 初一 … 三十 */
  dayName: string;
  /** 年干支，如 丙午 */
  yearGanzhi: string;
  zodiac: LocalizedText;
}

export interface SolarTermInfo extends NamedItem {
  /** 1–24，立春 = 1 */
  order: number;
  /** 交节时刻（UTC 毫秒） */
  instant: number;
}

export interface CnFestival extends NamedItem {
  id: CnFestivalId;
}

const BEIJING_OFFSET_MS = 8 * 3_600_000;
const JD_UNIX_EPOCH = 2_440_587.5;

const solarDayOf = (date: PlainDate) => {
  const { year, month, day } = toYmd(date);
  return SolarDay.fromYmd(year, month, day);
};

export function lunarDateOf(date: PlainDate): LunarDate {
  const lunar = solarDayOf(date).getLunarDay();
  const lunarMonth = lunar.getLunarMonth();
  const month = lunarMonth.getMonth();
  const isLeapMonth = lunarMonth.isLeap();
  // 年干支/生肖以正月初一换年（日历惯例）；LunarDay.getYearSixtyCycle() 以立春为界，是八字用法
  const yearCycle = lunarMonth.getLunarYear().getSixtyCycle();
  const zodiacZh = yearCycle.getEarthBranch().getZodiac().getName();
  return {
    year: lunar.getYear(),
    month,
    day: lunar.getDay(),
    isLeapMonth,
    monthDayCount: lunarMonth.getDayCount(),
    monthName: `${isLeapMonth ? '闰' : ''}${LUNAR_MONTH_NAMES[month - 1]}`,
    dayName: LUNAR_DAY_NAMES[lunar.getDay() - 1] ?? '',
    yearGanzhi: yearCycle.getName(),
    zodiac: ZODIAC[zodiacZh] ?? { fr: zodiacZh, zh: zodiacZh, en: zodiacZh },
  };
}

/** 农历日期 → 公历；isLeapMonth 时该年必须有这个闰月 */
export function lunarToSolar(year: number, month: number, day: number, isLeapMonth = false) {
  const solar = LunarDay.fromYmd(year, isLeapMonth ? -month : month, day).getSolarDay();
  return plainDate(solar.getYear(), solar.getMonth(), solar.getDay());
}

/** 当天交节则返回节气，否则 undefined */
export function solarTermOn(date: PlainDate): SolarTermInfo | undefined {
  const termDay = solarDayOf(date).getTermDay();
  if (termDay.getDayIndex() !== 0) return undefined;
  const term = termDay.getSolarTerm();
  const index = SOLAR_TERMS.findIndex((t) => t.zh === term.getName());
  const item = SOLAR_TERMS[index];
  if (!item) return undefined;
  // tyme4ts 的儒略日以北京时间为基准
  const instant = (term.getJulianDay().getDay() - JD_UNIX_EPOCH) * 86_400_000 - BEIJING_OFFSET_MS;
  return { ...item, order: index + 1, instant: Math.round(instant / 1000) * 1000 };
}

/** 某公历年中某节气的日期（北京时间） */
export function solarTermDate(year: number, zh: string): PlainDate {
  // tyme4ts 的节气年从上一年冬至开始，所以本年 12 月的冬至属于下一个节气年
  const solar = SolarTerm.fromName(zh === '冬至' ? year + 1 : year, zh).getSolarDay();
  return plainDate(solar.getYear(), solar.getMonth(), solar.getDay());
}

/** 按农历月日固定的节日（只在非闰月） */
const LUNAR_FIXED: ReadonlyArray<[month: number, day: number, id: CnFestivalId]> = [
  [1, 1, 'spring-festival'],
  [1, 15, 'lantern'],
  [2, 2, 'longtaitou'],
  [5, 5, 'dragon-boat'],
  [7, 7, 'qixi'],
  [7, 15, 'zhongyuan'],
  [8, 15, 'mid-autumn'],
  [9, 9, 'double-ninth'],
  [12, 8, 'laba'],
  [12, 23, 'xiaonian'], // 北方习俗；南方为廿四
];

const TERM_FESTIVALS: Readonly<Record<string, CnFestivalId>> = {
  清明: 'qingming',
  冬至: 'dongzhi',
};

export function cnFestivalsOn(date: PlainDate): CnFestival[] {
  const lunar = lunarDateOf(date);
  const ids: CnFestivalId[] = [];
  if (!lunar.isLeapMonth) {
    for (const [month, day, id] of LUNAR_FIXED) {
      if (lunar.month === month && lunar.day === day) ids.push(id);
    }
  }
  // 除夕 = 正月初一的前一天（腊月可能只有 29 天）
  const tomorrow = lunarDateOf(addDays(date, 1));
  if (tomorrow.month === 1 && tomorrow.day === 1 && !tomorrow.isLeapMonth) ids.push('chuxi');

  const term = solarTermOn(date);
  const termFestival = term && TERM_FESTIVALS[term.zh];
  if (termFestival) ids.push(termFestival);

  return ids.map((id) => ({ id, ...CN_FESTIVALS[id] }));
}
