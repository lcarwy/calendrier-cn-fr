// 用户设置，存在本浏览器的 localStorage。
import { ALL_LAYERS, type Layers } from '../domain/day-info';
import { FR_ZONES, type FrZone } from '../domain/fr-holidays';
import { safeLocalStorage } from './local';

export type Theme = 'auto' | 'light' | 'dark';
export const THEMES: readonly Theme[] = ['auto', 'light', 'dark'];

export interface AppSettings {
  schemaVersion: 1;
  frZone: FrZone;
  layers: Layers;
  theme: Theme;
  showWeekNumbers: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  schemaVersion: 1,
  frZone: 'metropole',
  layers: ALL_LAYERS,
  theme: 'auto',
  showWeekNumbers: false,
};

export const SETTINGS_KEY = 'calendrier-cn-fr.settings';

const isOneOf = <T extends string>(values: readonly T[], value: unknown): value is T =>
  typeof value === 'string' && (values as readonly string[]).includes(value);

/** 宽容解析：缺失或非法的字段用默认值，不会因为一个坏字段丢掉全部设置 */
export function parseSettings(raw: unknown): AppSettings {
  if (typeof raw !== 'object' || raw === null) return DEFAULT_SETTINGS;
  const r = raw as Record<string, unknown>;
  const rawLayers = (typeof r.layers === 'object' && r.layers) || {};
  const layers = { ...ALL_LAYERS };
  for (const key of Object.keys(ALL_LAYERS) as (keyof Layers)[]) {
    const value = (rawLayers as Record<string, unknown>)[key];
    if (typeof value === 'boolean') layers[key] = value;
  }
  return {
    schemaVersion: 1,
    frZone: isOneOf(FR_ZONES, r.frZone) ? r.frZone : DEFAULT_SETTINGS.frZone,
    layers,
    theme: isOneOf(THEMES, r.theme) ? r.theme : DEFAULT_SETTINGS.theme,
    showWeekNumbers:
      typeof r.showWeekNumbers === 'boolean' ? r.showWeekNumbers : DEFAULT_SETTINGS.showWeekNumbers,
  };
}

export function loadSettings(storage = safeLocalStorage()): AppSettings {
  try {
    const text = storage?.getItem(SETTINGS_KEY);
    return text ? parseSettings(JSON.parse(text)) : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings, storage = safeLocalStorage()): void {
  try {
    storage?.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // 隐私模式或存储已满时写入失败：本次会话仍可使用，只是不会被记住
  }
}
