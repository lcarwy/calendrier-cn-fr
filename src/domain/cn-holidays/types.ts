// 中国节假日数据文件格式。同步脚本（scripts/）也在运行时导入本文件，
// 所以这里不能有任何相对路径 import。

export type CnHolidayId =
  | 'new-year'
  | 'spring-festival'
  | 'qingming'
  | 'labour-day'
  | 'dragon-boat'
  | 'mid-autumn'
  | 'national-day'
  | 'other';

/** off = 放假（休），work = 调休补班（班） */
export type CnDayKind = 'off' | 'work';

export interface CnHolidayDayEntry {
  date: string;
  /** 通常一个；中秋与国庆连休时为两个（原文名称"国庆节、中秋节"） */
  ids: CnHolidayId[];
  /** 通知原文中的节日名称 */
  name: string;
  kind: CnDayKind;
}

/** src/data/cn-holidays/YYYY.json；文件存在 = 该年安排已公布 */
export interface CnHolidayFile {
  /** 国务院通知标题中的年份（可能包含上一年 12 月的日期） */
  year: number;
  source: 'holiday-cn' | 'manual';
  /** gov.cn 原文链接 */
  papers: string[];
  days: CnHolidayDayEntry[];
}

export const CN_HOLIDAY_ID_BY_NAME: Readonly<Record<string, CnHolidayId>> = {
  元旦: 'new-year',
  春节: 'spring-festival',
  清明节: 'qingming',
  劳动节: 'labour-day',
  端午节: 'dragon-boat',
  中秋节: 'mid-autumn',
  国庆节: 'national-day',
};
