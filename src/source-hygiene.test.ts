import { describe, expect, it } from 'vitest';

// 源码中不换行空格必须写成转义（看不见的字符很容易在编辑时被误删或误加）
const sources = import.meta.glob<string>(['./**/*.ts', './**/*.tsx', '../scripts/**/*.ts'], {
  query: '?raw',
  import: 'default',
  eager: true,
});

// 用字符码构造，避免本文件自己包含这些字符
const INVISIBLE_SPACES = new RegExp(`[${String.fromCharCode(0x00a0, 0x202f)}]`);

describe('源码卫生', () => {
  it('没有字面的不换行空格（U+00A0 / U+202F）', () => {
    expect(Object.keys(sources).length).toBeGreaterThan(10);
    for (const [path, content] of Object.entries(sources)) {
      expect(INVISIBLE_SPACES.test(content), path).toBe(false);
    }
  });
});
