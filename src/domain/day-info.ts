// 每一天的所有信息的唯一合并点。UI 只读 DayInfo，不直接调用各数据源。
import {
  cnHolidayDayOn,
  cnHolidayName,
  cnStatutoryIdsOn,
  cnYearStatusOf,
  type CnYearStatus,
} from './cn-holidays';
import {
  isoWeek,
  isWeekend,
  monthGrid,
  weekday,
  type PlainDate,
  type Weekday,
  type YearMonth,
} from './date';
import { frHolidaysOn, type FrHoliday, type FrZone } from './fr-holidays';
import {
  cnFestivalsOn,
  lunarDateOf,
  solarTermOn,
  type CnFestival,
  type LunarDate,
  type SolarTermInfo,
} from './lunar';
import type { LocalizedText } from './text';

export interface DaySettings {
  frZone: FrZone;
}

export type CnHolidayMark =
  | {
      /** 已公布：off = 休，work = 班 */
      kind: 'off' | 'work';
      names: LocalizedText[];
      noticeYear: number;
      papers: string[];
    }
  | {
      /** 安排未公布：只知道是法定节日，不知道放假和调休 */
      kind: 'statutory-unpublished';
      names: LocalizedText[];
    };

export interface DayInfo {
  date: PlainDate;
  weekday: Weekday;
  isWeekend: boolean;
  isoWeek: { year: number; week: number };
  lunar: LunarDate;
  solarTerm?: SolarTermInfo;
  cnFestivals: CnFestival[];
  cnHoliday?: CnHolidayMark;
  cnYearStatus: CnYearStatus;
  frHolidays: FrHoliday[];
}

function cnHolidayMarkOn(date: PlainDate): CnHolidayMark | undefined {
  const day = cnHolidayDayOn(date);
  if (day) {
    return { kind: day.kind, names: day.names, noticeYear: day.noticeYear, papers: day.papers };
  }
  const statutory = cnStatutoryIdsOn(date);
  if (statutory.length) {
    return {
      kind: 'statutory-unpublished',
      names: statutory.map((id) => cnHolidayName(id, '')),
    };
  }
  return undefined;
}

export function getDayInfo(date: PlainDate, settings: DaySettings): DayInfo {
  const solarTerm = solarTermOn(date);
  const cnHoliday = cnHolidayMarkOn(date);
  return {
    date,
    weekday: weekday(date),
    isWeekend: isWeekend(date),
    isoWeek: isoWeek(date),
    lunar: lunarDateOf(date),
    ...(solarTerm && { solarTerm }),
    cnFestivals: cnFestivalsOn(date),
    ...(cnHoliday && { cnHoliday }),
    cnYearStatus: cnYearStatusOf(date),
    frHolidays: frHolidaysOn(date, settings.frZone),
  };
}

const monthCache = new Map<string, DayInfo[]>();

/** 月视图的 42 天 */
export function getMonthInfo(ym: YearMonth, settings: DaySettings): DayInfo[] {
  const key = `${settings.frZone}:${ym.year}-${ym.month}`;
  let days = monthCache.get(key);
  if (!days) {
    days = monthGrid(ym).map((date) => getDayInfo(date, settings));
    monthCache.set(key, days);
  }
  return days;
}

/** 图层开关（设置里可关闭） */
export interface Layers {
  cnHolidays: boolean;
  frHolidays: boolean;
  lunar: boolean;
  solarTerms: boolean;
  festivals: boolean;
}

export const ALL_LAYERS: Layers = {
  cnHolidays: true,
  frHolidays: true,
  lunar: true,
  solarTerms: true,
  festivals: true,
};

export interface CellLabel {
  /** 汉字，如 "中秋""寒露""九月""初四" */
  text: string;
  kind: 'festival' | 'term' | 'month' | 'day';
}

/** 日格副标题，优先级：传统节日 > 节气 > 农历月首 > 农历日 */
export function cellLabel(info: DayInfo, layers: Layers): CellLabel | undefined {
  const festival = info.cnFestivals[0];
  if (layers.festivals && festival) return { text: festival.zh, kind: 'festival' };
  if (layers.solarTerms && info.solarTerm) return { text: info.solarTerm.zh, kind: 'term' };
  if (!layers.lunar) return undefined;
  return info.lunar.day === 1
    ? { text: info.lunar.monthName, kind: 'month' }
    : { text: info.lunar.dayName, kind: 'day' };
}
