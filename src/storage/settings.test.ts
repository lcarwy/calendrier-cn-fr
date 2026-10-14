import { describe, expect, it } from 'vitest';
import { ALL_LAYERS } from '../domain/day-info';
import {
  DEFAULT_SETTINGS,
  loadSettings,
  parseSettings,
  saveSettings,
  SETTINGS_KEY,
} from './settings';

/** 内存版 Storage */
function memoryStorage(initial: Record<string, string> = {}): Storage {
  const data = new Map(Object.entries(initial));
  return {
    get length() {
      return data.size;
    },
    clear: () => data.clear(),
    getItem: (key) => data.get(key) ?? null,
    key: (index) => [...data.keys()][index] ?? null,
    removeItem: (key) => void data.delete(key),
    setItem: (key, value) => void data.set(key, value),
  };
}

describe('parseSettings', () => {
  it('空值或非对象返回默认设置', () => {
    expect(parseSettings(null)).toEqual(DEFAULT_SETTINGS);
    expect(parseSettings('x')).toEqual(DEFAULT_SETTINGS);
  });

  it('保留合法字段，非法字段回到默认值', () => {
    const parsed = parseSettings({
      frZone: 'alsace-moselle',
      theme: 'neon',
      showWeekNumbers: 'yes',
      layers: { lunar: false, solarTerms: 'no' },
    });
    expect(parsed.frZone).toBe('alsace-moselle');
    expect(parsed.theme).toBe('auto');
    expect(parsed.showWeekNumbers).toBe(false);
    expect(parsed.layers).toEqual({ ...ALL_LAYERS, lunar: false });
  });

  it('未知地区回到 metropole', () => {
    expect(parseSettings({ frZone: 'guyane' }).frZone).toBe('metropole');
  });
});

describe('load / save', () => {
  it('保存后读回相同设置', () => {
    const storage = memoryStorage();
    const settings = {
      ...DEFAULT_SETTINGS,
      frZone: 'alsace-moselle' as const,
      theme: 'dark' as const,
    };
    saveSettings(settings, storage);
    expect(loadSettings(storage)).toEqual(settings);
  });

  it('JSON 损坏或没有存储时返回默认设置', () => {
    expect(loadSettings(memoryStorage({ [SETTINGS_KEY]: '{oops' }))).toEqual(DEFAULT_SETTINGS);
    expect(loadSettings(undefined)).toEqual(DEFAULT_SETTINGS);
  });

  it('写入失败不抛错', () => {
    const storage = memoryStorage();
    storage.setItem = () => {
      throw new Error('QuotaExceededError');
    };
    expect(() => saveSettings(DEFAULT_SETTINGS, storage)).not.toThrow();
  });
});
