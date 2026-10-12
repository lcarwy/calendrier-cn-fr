import { describe, expect, it } from 'vitest';
import { fr } from './fr';
import { t } from './index';

describe('i18n fr', () => {
  it('每条文案都非空', () => {
    for (const [key, value] of Object.entries(fr)) {
      expect(value.trim(), key).not.toBe('');
    }
  });

  it('« : ; ! ? » 前不能是普通空格或紧贴文字（法语排版）', () => {
    for (const [key, value] of Object.entries(fr)) {
      // 允许 URL 和时间里的冒号，如 https:// 或 14:30
      const stripped = value.replace(/https?:\/\/\S+/g, '').replace(/\d:\d/g, '');
      expect(stripped, key).not.toMatch(/[^\u00a0\u202f][:;!?]/);
    }
  });

  it('t() 返回对应文案', () => {
    expect(t('app.title')).toBe('Calendrier franco-chinois');
  });
});
