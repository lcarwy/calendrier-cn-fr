import { fr, type MessageKey } from './fr';

export type { MessageKey };

export type Params = Record<string, string | number>;

// 第一期只有法语；以后加 zh / en 时在这里按设置选择词典。
export function t(key: MessageKey, params?: Params): string {
  const message: string = fr[key];
  if (!params) return message;
  return message.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match,
  );
}
