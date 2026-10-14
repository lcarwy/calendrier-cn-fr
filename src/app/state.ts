// 全局界面状态（Preact signals）。设置自动保存到 localStorage。
import { computed, effect, signal } from '@preact/signals';
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
import { getDayInfo, getMonthInfo, type DaySettings, type Layers } from '../domain/day-info';
import { loadSettings, saveSettings, type AppSettings } from '../storage/settings';

export const MIN_YEAR = 1990;
export const MAX_YEAR = 2100;

export const todayDate = signal<PlainDate>(today());
export const viewMonth = signal<YearMonth>(yearMonthOf(todayDate.value));
export const selectedDate = signal<PlainDate>(todayDate.value);

export const appSettings = signal<AppSettings>(loadSettings());
export const daySettings = computed<DaySettings>(() => ({ frZone: appSettings.value.frZone }));
export const layers = computed<Layers>(() => appSettings.value.layers);

export const monthDays = computed(() => getMonthInfo(viewMonth.value, daySettings.value));
export const selectedInfo = computed(() => getDayInfo(selectedDate.value, daySettings.value));

export function updateSettings(patch: Partial<Omit<AppSettings, 'schemaVersion'>>): void {
  appSettings.value = { ...appSettings.value, ...patch };
}

export function setLayer(key: keyof Layers, visible: boolean): void {
  updateSettings({ layers: { ...appSettings.value.layers, [key]: visible } });
}

effect(() => saveSettings(appSettings.value));

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
