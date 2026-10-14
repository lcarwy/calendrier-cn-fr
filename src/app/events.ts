// 事件的界面状态与增删改。先更新界面（signal），再写入 IndexedDB。
import { computed, signal } from '@preact/signals';
import { type PlainDate } from '../domain/date';
import {
  DEFAULT_COLOR,
  occurrencesInRange,
  type CalendarEvent,
  type ColorKey,
} from '../domain/events';
import { deleteEvent, getAllEvents, putEvent, requestPersistentStorage } from '../storage/events';
import { monthDays, selectedDate } from './state';

export const events = signal<CalendarEvent[]>([]);
/** 存储不可用或写入失败（隐私模式、空间已满等） */
export const storageError = signal(false);

export const monthOccurrences = computed(() => {
  const grid = monthDays.value;
  const first = grid[0];
  const last = grid[grid.length - 1];
  return first && last ? occurrencesInRange(events.value, first.date, last.date) : new Map();
});

export const selectedOccurrences = computed(() => {
  const date = selectedDate.value;
  return occurrencesInRange(events.value, date, date).get(date) ?? [];
});

export async function initEvents(): Promise<void> {
  try {
    events.value = await getAllEvents();
  } catch {
    storageError.value = true;
  }
}

async function persist(action: () => Promise<void>) {
  try {
    await action();
  } catch {
    storageError.value = true;
  }
}

let persistRequested = false;

export function saveEvent(event: CalendarEvent): Promise<void> {
  // 第一次保存事件时请浏览器不要自动清理本站数据（Firefox 会弹出询问，所以不在启动时请求）
  if (!persistRequested) {
    persistRequested = true;
    void requestPersistentStorage();
  }
  events.value = [...events.value.filter((e) => e.id !== event.id), event];
  return persist(() => putEvent(event));
}

export function removeEvent(id: string): Promise<void> {
  events.value = events.value.filter((e) => e.id !== id);
  return persist(() => deleteEvent(id));
}

/** 编辑器里的草稿 */
export interface EventDraft {
  id?: string;
  title: string;
  start: PlainDate;
  end?: PlainDate;
  time?: string;
  color: ColorKey;
  notes: string;
  yearly: boolean;
  createdAt?: string;
}

/** 当前正在编辑的事件；null = 编辑器关闭 */
export const editingDraft = signal<EventDraft | null>(null);

export function openNewEvent(date: PlainDate = selectedDate.value): void {
  editingDraft.value = { title: '', start: date, color: DEFAULT_COLOR, notes: '', yearly: false };
}

export function openEditEvent(event: CalendarEvent): void {
  editingDraft.value = {
    id: event.id,
    title: event.title,
    start: event.start,
    ...(event.end && { end: event.end }),
    ...(event.time && { time: event.time }),
    color: event.color,
    notes: event.notes ?? '',
    yearly: event.recurrence?.freq === 'yearly',
    createdAt: event.createdAt,
  };
}

export function closeEditor(): void {
  editingDraft.value = null;
}
