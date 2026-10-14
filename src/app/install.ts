// Android / 电脑版 Chrome、Edge 的"安装应用"：浏览器发出 beforeinstallprompt 后显示安装按钮。
// iOS 没有这个事件，见 components/InstallHint.tsx。
import { signal } from '@preact/signals';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/** 可以安装时不为 null */
export const installPrompt = signal<BeforeInstallPromptEvent | null>(null);

export function initInstall(): void {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); // 不让浏览器自己弹出迷你提示，改用页面上的按钮
    installPrompt.value = e as BeforeInstallPromptEvent;
  });
  window.addEventListener('appinstalled', () => {
    installPrompt.value = null;
  });
}

export async function promptInstall(): Promise<void> {
  const prompt = installPrompt.value;
  if (!prompt) return;
  await prompt.prompt();
  await prompt.userChoice;
  installPrompt.value = null; // 每个事件只能用一次
}
