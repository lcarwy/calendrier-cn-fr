// 法国 jours fériés，按 Code du travail L3133-1 及 Alsace-Moselle 地方法规计算。
import { addDays, compareDates, plainDate, toYmd, type PlainDate } from '../date';
import type { LocalizedText } from '../text';
import { easterSunday } from './easter';

export { easterSunday };

export type FrZone = 'metropole' | 'alsace-moselle';
export const FR_ZONES: readonly FrZone[] = ['metropole', 'alsace-moselle'];

export type FrHolidayId =
  | 'jour-de-l-an'
  | 'vendredi-saint'
  | 'lundi-de-paques'
  | 'fete-du-travail'
  | 'victoire-1945'
  | 'ascension'
  | 'lundi-de-pentecote'
  | 'fete-nationale'
  | 'assomption'
  | 'toussaint'
  | 'armistice-1918'
  | 'noel'
  | 'saint-etienne';

export interface FrHoliday {
  id: FrHolidayId;
  date: PlainDate;
  name: LocalizedText;
  /** 法律规定必须休息且照常付薪（férié ET chômé）——目前只有 5 月 1 日 */
  mandatoryOff: boolean;
  /** 常被用作 journée de solidarité，可能需要上班 */
  solidarityDay: boolean;
}

interface Rule {
  id: FrHolidayId;
  name: LocalizedText;
  date: (year: number) => PlainDate;
  /** 不填 = 所有地区 */
  zones?: readonly FrZone[];
  mandatoryOff?: boolean;
  solidarityDay?: boolean;
}

const fixed = (month: number, day: number) => (year: number) => plainDate(year, month, day);
const fromEaster = (offset: number) => (year: number) => addDays(easterSunday(year), offset);

const RULES: readonly Rule[] = [
  {
    id: 'jour-de-l-an',
    name: { fr: 'Jour de l’An', zh: '元旦', en: "New Year's Day" },
    date: fixed(1, 1),
  },
  {
    id: 'vendredi-saint',
    name: { fr: 'Vendredi saint', zh: '耶稣受难日', en: 'Good Friday' },
    date: fromEaster(-2),
    zones: ['alsace-moselle'],
  },
  {
    id: 'lundi-de-paques',
    name: { fr: 'Lundi de Pâques', zh: '复活节星期一', en: 'Easter Monday' },
    date: fromEaster(1),
  },
  {
    id: 'fete-du-travail',
    name: { fr: 'Fête du Travail', zh: '劳动节', en: 'Labour Day' },
    date: fixed(5, 1),
    mandatoryOff: true,
  },
  {
    id: 'victoire-1945',
    name: { fr: 'Victoire 1945', zh: '二战欧洲胜利纪念日', en: 'Victory in Europe Day' },
    date: fixed(5, 8),
  },
  {
    id: 'ascension',
    name: { fr: 'Ascension', zh: '耶稣升天节', en: 'Ascension Day' },
    date: fromEaster(39),
  },
  {
    id: 'lundi-de-pentecote',
    name: { fr: 'Lundi de Pentecôte', zh: '圣灵降临节星期一', en: 'Whit Monday' },
    date: fromEaster(50),
    solidarityDay: true,
  },
  {
    id: 'fete-nationale',
    name: { fr: 'Fête nationale', zh: '法国国庆日', en: 'Bastille Day' },
    date: fixed(7, 14),
  },
  {
    id: 'assomption',
    name: { fr: 'Assomption', zh: '圣母升天节', en: 'Assumption Day' },
    date: fixed(8, 15),
  },
  {
    id: 'toussaint',
    name: { fr: 'Toussaint', zh: '诸圣节', en: "All Saints' Day" },
    date: fixed(11, 1),
  },
  {
    id: 'armistice-1918',
    name: { fr: 'Armistice 1918', zh: '一战停战纪念日', en: 'Armistice Day' },
    date: fixed(11, 11),
  },
  {
    id: 'noel',
    name: { fr: 'Noël', zh: '圣诞节', en: 'Christmas Day' },
    date: fixed(12, 25),
  },
  {
    id: 'saint-etienne',
    name: { fr: 'Saint-Étienne', zh: '圣斯德望日', en: "St Stephen's Day" },
    date: fixed(12, 26),
    zones: ['alsace-moselle'],
  },
];

const cache = new Map<string, FrHoliday[]>();

/** 某年某地区的全部 jours fériés，按日期排序 */
export function frHolidaysOfYear(year: number, zone: FrZone): readonly FrHoliday[] {
  const key = `${zone}:${year}`;
  let holidays = cache.get(key);
  if (!holidays) {
    holidays = RULES.filter((rule) => !rule.zones || rule.zones.includes(zone))
      .map((rule) => ({
        id: rule.id,
        date: rule.date(year),
        name: rule.name,
        mandatoryOff: rule.mandatoryOff ?? false,
        solidarityDay: rule.solidarityDay ?? false,
      }))
      .sort((a, b) => compareDates(a.date, b.date));
    cache.set(key, holidays);
  }
  return holidays;
}

/** 某一天的 jours fériés（偶尔会有两个重合，如 2008 年 5 月 1 日 = Ascension） */
export function frHolidaysOn(date: PlainDate, zone: FrZone): FrHoliday[] {
  return frHolidaysOfYear(toYmd(date).year, zone).filter((h) => h.date === date);
}
