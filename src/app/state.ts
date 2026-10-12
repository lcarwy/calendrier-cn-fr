// 全局界面状态（Preact signals）。设置的持久化在第 7 步加入。
import { computed, signal } from '@preact/signals';
import {
  addMonths,
  daysInMonth,
  plainDate,
  today,
  toYmd,
  yearMonthOf,
  type PlainDate,
  type YearMonth,
} from '../domain/date';
import {
  ALL_LAYERS,
  getDayInfo,
  getMonthInfo,
  type DaySettings,
  type Layers,
} from '../domain/day-info';

export const MIN_YEAR = 1990;
export const MAX_YEAR = 2100;

export const todayDate = signal<PlainDate>(today());
export const viewMonth = signal<YearMonth>(yearMonthOf(todayDate.value));
export const selectedDate = signal<PlainDate>(todayDate.value);
export const settings = signal<DaySettings>({ frZone: 'metropole' });
export const layers = signal<Layers>(ALL_LAYERS);

export const monthDays = computed(() => getMonthInfo(viewMonth.value, settings.value));
export const selectedInfo = computed(() => getDayInfo(selectedDate.value, settings.value));

const inRange = (year: number) => year >= MIN_YEAR && year <= MAX_YEAR;
const sameMonth = (a: YearMonth, b: YearMonth) => a.year === b.year && a.month === b.month;

/** 切换月份；选中日期移到今天（若在该月）或该月 1 日 */
export function goToMonth(ym: YearMonth): void {
  if (!inRange(ym.year)) return;
  viewMonth.value = ym;
  selectedDate.value = sameMonth(yearMonthOf(todayDate.value), ym)
    ? todayDate.value
    : plainDate(ym.year, ym.month, 1);
}

export function shiftMonth(months: number): void {
  goToMonth(addMonths(viewMonth.value, months));
}

/** 选中某天；不在当前月份时自动翻到那个月 */
export function selectDate(date: PlainDate): void {
  const ym = yearMonthOf(date);
  if (!inRange(ym.year)) return;
  selectedDate.value = date;
  if (!sameMonth(ym, viewMonth.value)) viewMonth.value = ym;
}

/** 选中日期移动若干个月，日数超出时取月末 */
export function shiftSelectionByMonths(months: number): void {
  const { day } = toYmd(selectedDate.value);
  const ym = addMonths(yearMonthOf(selectedDate.value), months);
  if (!inRange(ym.year)) return;
  selectDate(plainDate(ym.year, ym.month, Math.min(day, daysInMonth(ym.year, ym.month))));
}

export function goToToday(): void {
  todayDate.value = today();
  selectDate(todayDate.value);
}

// 应用可能跨过午夜一直开着：页面重新可见时刷新"今天"
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') todayDate.value = today();
  });
}
