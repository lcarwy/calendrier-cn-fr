/** 某些浏览器（隐私模式、禁用站点数据）访问 localStorage 会直接抛错 */
export function safeLocalStorage(): Storage | undefined {
  try {
    return globalThis.localStorage ?? undefined;
  } catch {
    return undefined;
  }
}
