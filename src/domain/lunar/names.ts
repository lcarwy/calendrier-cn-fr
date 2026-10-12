import type { LocalizedText } from '../text';

export interface NamedItem {
  zh: string;
  pinyin: string;
  name: LocalizedText;
}

/** 月名（冬月、腊月为传统叫法） */
export const LUNAR_MONTH_NAMES = [
  '正月',
  '二月',
  '三月',
  '四月',
  '五月',
  '六月',
  '七月',
  '八月',
  '九月',
  '十月',
  '冬月',
  '腊月',
] as const;

export const LUNAR_DAY_NAMES = [
  '初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
  '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
  '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十',
] as const; // prettier-ignore

/** 二十四节气，按惯例从立春开始编号（立春 = 1） */
export const SOLAR_TERMS: readonly NamedItem[] = [
  { zh: '立春', pinyin: 'Lìchūn', name: { fr: 'Début du printemps', zh: '立春', en: 'Beginning of Spring' } },
  { zh: '雨水', pinyin: 'Yǔshuǐ', name: { fr: 'Eau de pluie', zh: '雨水', en: 'Rain Water' } },
  { zh: '惊蛰', pinyin: 'Jīngzhé', name: { fr: 'Réveil des insectes', zh: '惊蛰', en: 'Awakening of Insects' } },
  { zh: '春分', pinyin: 'Chūnfēn', name: { fr: 'Équinoxe de printemps', zh: '春分', en: 'Spring Equinox' } },
  { zh: '清明', pinyin: 'Qīngmíng', name: { fr: 'Clarté pure', zh: '清明', en: 'Clear and Bright' } },
  { zh: '谷雨', pinyin: 'Gǔyǔ', name: { fr: 'Pluie des céréales', zh: '谷雨', en: 'Grain Rain' } },
  { zh: '立夏', pinyin: 'Lìxià', name: { fr: "Début de l'été", zh: '立夏', en: 'Beginning of Summer' } },
  { zh: '小满', pinyin: 'Xiǎomǎn', name: { fr: 'Petite plénitude', zh: '小满', en: 'Grain Buds' } },
  { zh: '芒种', pinyin: 'Mángzhòng', name: { fr: 'Épis barbus', zh: '芒种', en: 'Grain in Ear' } },
  { zh: '夏至', pinyin: 'Xiàzhì', name: { fr: "Solstice d'été", zh: '夏至', en: 'Summer Solstice' } },
  { zh: '小暑', pinyin: 'Xiǎoshǔ', name: { fr: 'Petite chaleur', zh: '小暑', en: 'Minor Heat' } },
  { zh: '大暑', pinyin: 'Dàshǔ', name: { fr: 'Grande chaleur', zh: '大暑', en: 'Major Heat' } },
  { zh: '立秋', pinyin: 'Lìqiū', name: { fr: "Début de l'automne", zh: '立秋', en: 'Beginning of Autumn' } },
  { zh: '处暑', pinyin: 'Chǔshǔ', name: { fr: 'Fin des chaleurs', zh: '处暑', en: 'End of Heat' } },
  { zh: '白露', pinyin: 'Báilù', name: { fr: 'Rosée blanche', zh: '白露', en: 'White Dew' } },
  { zh: '秋分', pinyin: 'Qiūfēn', name: { fr: "Équinoxe d'automne", zh: '秋分', en: 'Autumn Equinox' } },
  { zh: '寒露', pinyin: 'Hánlù', name: { fr: 'Rosée froide', zh: '寒露', en: 'Cold Dew' } },
  { zh: '霜降', pinyin: 'Shuāngjiàng', name: { fr: 'Descente du givre', zh: '霜降', en: "Frost's Descent" } },
  { zh: '立冬', pinyin: 'Lìdōng', name: { fr: "Début de l'hiver", zh: '立冬', en: 'Beginning of Winter' } },
  { zh: '小雪', pinyin: 'Xiǎoxuě', name: { fr: 'Petite neige', zh: '小雪', en: 'Minor Snow' } },
  { zh: '大雪', pinyin: 'Dàxuě', name: { fr: 'Grande neige', zh: '大雪', en: 'Major Snow' } },
  { zh: '冬至', pinyin: 'Dōngzhì', name: { fr: "Solstice d'hiver", zh: '冬至', en: 'Winter Solstice' } },
  { zh: '小寒', pinyin: 'Xiǎohán', name: { fr: 'Petit froid', zh: '小寒', en: 'Minor Cold' } },
  { zh: '大寒', pinyin: 'Dàhán', name: { fr: 'Grand froid', zh: '大寒', en: 'Major Cold' } },
]; // prettier-ignore

export type CnFestivalId =
  | 'spring-festival'
  | 'lantern'
  | 'longtaitou'
  | 'qingming'
  | 'dragon-boat'
  | 'qixi'
  | 'zhongyuan'
  | 'mid-autumn'
  | 'double-ninth'
  | 'dongzhi'
  | 'laba'
  | 'xiaonian'
  | 'chuxi';

export const CN_FESTIVALS: Readonly<Record<CnFestivalId, NamedItem>> = {
  'spring-festival': { zh: '春节', pinyin: 'Chūnjié', name: { fr: 'Nouvel An chinois', zh: '春节', en: 'Chinese New Year' } },
  lantern: { zh: '元宵', pinyin: 'Yuánxiāo', name: { fr: 'Fête des Lanternes', zh: '元宵节', en: 'Lantern Festival' } },
  longtaitou: { zh: '龙抬头', pinyin: 'Lóngtáitóu', name: { fr: 'Le dragon lève la tête', zh: '龙抬头', en: 'Dragon Raises Its Head' } },
  qingming: { zh: '清明', pinyin: 'Qīngmíng', name: { fr: 'Fête de Qingming (fête des morts)', zh: '清明节', en: 'Qingming Festival' } },
  'dragon-boat': { zh: '端午', pinyin: 'Duānwǔ', name: { fr: 'Fête des bateaux-dragons', zh: '端午节', en: 'Dragon Boat Festival' } },
  qixi: { zh: '七夕', pinyin: 'Qīxī', name: { fr: 'Qixi, fête des amoureux', zh: '七夕节', en: 'Qixi Festival' } },
  zhongyuan: { zh: '中元', pinyin: 'Zhōngyuán', name: { fr: 'Fête des fantômes', zh: '中元节', en: 'Ghost Festival' } },
  'mid-autumn': { zh: '中秋', pinyin: 'Zhōngqiū', name: { fr: 'Fête de la mi-automne', zh: '中秋节', en: 'Mid-Autumn Festival' } },
  'double-ninth': { zh: '重阳', pinyin: 'Chóngyáng', name: { fr: 'Fête du double neuf', zh: '重阳节', en: 'Double Ninth Festival' } },
  dongzhi: { zh: '冬至', pinyin: 'Dōngzhì', name: { fr: "Fête du solstice d'hiver", zh: '冬至', en: 'Winter Solstice Festival' } },
  laba: { zh: '腊八', pinyin: 'Làbā', name: { fr: 'Fête de Laba', zh: '腊八节', en: 'Laba Festival' } },
  xiaonian: { zh: '小年', pinyin: 'Xiǎonián', name: { fr: 'Petit Nouvel An', zh: '小年', en: 'Little New Year' } },
  chuxi: { zh: '除夕', pinyin: 'Chúxī', name: { fr: 'Réveillon du Nouvel An chinois', zh: '除夕', en: "Chinese New Year's Eve" } },
}; // prettier-ignore

/** 生肖（地支顺序：子鼠 … 亥猪） */
export const ZODIAC: Readonly<Record<string, LocalizedText>> = {
  鼠: { fr: 'Rat', zh: '鼠', en: 'Rat' },
  牛: { fr: 'Bœuf', zh: '牛', en: 'Ox' },
  虎: { fr: 'Tigre', zh: '虎', en: 'Tiger' },
  兔: { fr: 'Lapin', zh: '兔', en: 'Rabbit' },
  龙: { fr: 'Dragon', zh: '龙', en: 'Dragon' },
  蛇: { fr: 'Serpent', zh: '蛇', en: 'Snake' },
  马: { fr: 'Cheval', zh: '马', en: 'Horse' },
  羊: { fr: 'Chèvre', zh: '羊', en: 'Goat' },
  猴: { fr: 'Singe', zh: '猴', en: 'Monkey' },
  鸡: { fr: 'Coq', zh: '鸡', en: 'Rooster' },
  狗: { fr: 'Chien', zh: '狗', en: 'Dog' },
  猪: { fr: 'Cochon', zh: '猪', en: 'Pig' },
};
