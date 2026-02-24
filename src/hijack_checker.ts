/**
 * 检查并提示未生效的劫持
 */
export const checkHijack = async () => {
  const hijacks = await betterncm.app.getSucceededHijacks();
  const failedPatchOfflineHijack: string[] = [];
  for (let i = 1; i <= 4; i++) {
    const id = `LibFrontendPlay::PatchOfflineEncryptedMusic::${i}`;
    if (!hijacks.includes(id)) failedPatchOfflineHijack.push(id);
  }

  if (failedPatchOfflineHijack.length === 0) return [];

  // 创建并注入提示框样式
  const style = `
.material-notification {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: fixed;
  bottom: 16px;
  left: 16px;
  max-width: 350px;
  padding: 8px;
  background-color: #323232;
  color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.3);
  animation: slide-up 0.5s ease-in-out;
  z-index: 10000;
}

.material-notification.hide {
  animation: slide-down 0.5s ease-in-out;
  animation-fill-mode: forwards;
}

.material-notification h3 { margin: 0; }
.material-notification p { margin: 0; font-size: 14px; }
  
@keyframes slide-up {
  from { transform: translateY(100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
  
@keyframes slide-down {
  from { transform: translateY(0); opacity: 1; }
  to { transform: translateY(100%); opacity: 0; }
}
`;

  const head = document.head || document.getElementsByTagName('head')[0];
  const styleElem = document.createElement('style');
  styleElem.type = 'text/css';
  styleElem.appendChild(document.createTextNode(style));
  head.appendChild(styleElem);

  // 创建提示框元素
  const notification = document.createElement('div');
  notification.classList.add('material-notification');
  notification.innerHTML =
    '<div style="font-size:16px; font-weight: 800; margin-bottom: 10px;">LibFrontendPlay 警告</div>' +
    '<h4>有一些 Hijack 没有成功生效，可能会影响本地 .ncm 格式歌曲的音频可视化等。<br>以下是失败的 Hijack 名单：</h4><br>' +
    '<p>' + failedPatchOfflineHijack.join('<br>') + '</p>';

  document.body.appendChild(notification);

  // 10秒后自动隐藏
  setTimeout(() => {
    notification.classList.add('hide');
  }, 10000);

  return failedPatchOfflineHijack;
}
