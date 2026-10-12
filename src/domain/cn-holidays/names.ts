import type { LocalizedText } from '../text';
import type { CnHolidayId } from './types';

export const CN_HOLIDAY_NAMES: Readonly<Record<Exclude<CnHolidayId, 'other'>, LocalizedText>> = {
  'new-year': { fr: 'Nouvel An', zh: '元旦', en: "New Year's Day" },
  'spring-festival': { fr: 'Nouvel An chinois', zh: '春节', en: 'Chinese New Year' },
  qingming: { fr: 'Fête de Qingming', zh: '清明节', en: 'Qingming Festival' },
  'labour-day': { fr: 'Fête du Travail (Chine)', zh: '劳动节', en: 'Labour Day (China)' },
  'dragon-boat': { fr: 'Fête des bateaux-dragons', zh: '端午节', en: 'Dragon Boat Festival' },
  'mid-autumn': { fr: 'Fête de la mi-automne', zh: '中秋节', en: 'Mid-Autumn Festival' },
  'national-day': { fr: 'Fête nationale (Chine)', zh: '国庆节', en: 'National Day (China)' },
};

/** 名称未知（id = other）时三种语言都用原文名称 */
export function cnHolidayName(id: CnHolidayId, rawName: string): LocalizedText {
  return id === 'other' ? { fr: rawName, zh: rawName, en: rawName } : CN_HOLIDAY_NAMES[id];
}
