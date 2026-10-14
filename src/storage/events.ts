// 自定义事件存在本浏览器的 IndexedDB。
import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { CalendarEvent } from '../domain/events';

const DB_NAME = 'calendrier-cn-fr';
const DB_VERSION = 1;

interface CalendarDB extends DBSchema {
  events: { key: string; value: CalendarEvent };
}

let dbPromise: Promise<IDBPDatabase<CalendarDB>> | undefined;

function db() {
  dbPromise ??= openDB<CalendarDB>(DB_NAME, DB_VERSION, {
    upgrade(database, oldVersion) {
      // 以后升级数据结构时，按 oldVersion 逐步迁移
      if (oldVersion < 1) database.createObjectStore('events', { keyPath: 'id' });
    },
  });
  return dbPromise;
}

export async function getAllEvents(): Promise<CalendarEvent[]> {
  return (await db()).getAll('events');
}

export async function putEvent(event: CalendarEvent): Promise<void> {
  await (await db()).put('events', event);
}

export async function deleteEvent(id: string): Promise<void> {
  await (await db()).delete('events', id);
}

/** 用一个事务整体替换（导入备份时用），失败则全部回滚 */
export async function replaceAllEvents(events: readonly CalendarEvent[]): Promise<void> {
  const tx = (await db()).transaction('events', 'readwrite');
  await tx.store.clear();
  await Promise.all(events.map((event) => tx.store.put(event)));
  await tx.done;
}

/** 请求浏览器不要自动清理本站数据（iOS / Safari 尤其需要） */
export async function requestPersistentStorage(): Promise<boolean> {
  try {
    return (await navigator.storage?.persist?.()) ?? false;
  } catch {
    return false;
  }
}
