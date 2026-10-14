import { useState } from 'preact/hooks';
import { safeLocalStorage } from '../storage/local';
import { t } from '../i18n';

const DISMISS_KEY = 'calendrier-cn-fr.iosHintDismissed';

/** iOS 没有"安装应用"提示，需要手动引导；已安装（独立窗口打开）时不显示 */
function shouldShow(): boolean {
  const isIos =
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    // iPadOS 13+ 伪装成 Mac
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const standalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
  let dismissed = false;
  try {
    dismissed = safeLocalStorage()?.getItem(DISMISS_KEY) === '1';
  } catch {
    // 读不到就当作没关闭过
  }
  return isIos && !standalone && !dismissed;
}

export function InstallHint() {
  const [visible, setVisible] = useState(shouldShow);
  if (!visible) return null;

  const dismiss = () => {
    try {
      safeLocalStorage()?.setItem(DISMISS_KEY, '1');
    } catch {
      // 记不住也没关系，本次先隐藏
    }
    setVisible(false);
  };

  return (
    <div class="install-hint" role="note">
      <p>{t('install.ios')}</p>
      <button type="button" class="text-button" onClick={dismiss}>
        {t('install.dismiss')}
      </button>
    </div>
  );
}
