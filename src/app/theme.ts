// 主题：auto 跟随系统；light / dark 通过 <html data-theme> 强制（见 global.css）。
import { effect } from '@preact/signals';
import type { Theme } from '../storage/settings';
import { appSettings } from './state';

const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');

/** 让手机状态栏颜色跟页面背景一致 */
function syncThemeColor() {
  const bg = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim();
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', bg);
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === 'auto') delete root.dataset.theme;
  else root.dataset.theme = theme;
  syncThemeColor();
}

export function initTheme(): void {
  effect(() => applyTheme(appSettings.value.theme));
  darkQuery.addEventListener('change', syncThemeColor);
}
