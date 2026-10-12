import { fr, type MessageKey } from './fr';

export type { MessageKey };

// 第一期只有法语；以后加 zh / en 时在这里按设置选择词典。
export function t(key: MessageKey): string {
  return fr[key];
}
