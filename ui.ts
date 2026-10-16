import { AudioManager } from './audio';

export function createHUD(audio: AudioManager): void {
  const hud = document.getElementById('hud')!;

  // شريط العنوان
  const title = document.createElement('div');
  title.style.cssText = `
    position: fixed; top: 15px; right: 15px;
    color: #f5c542; font-family: 'Cairo', sans-serif;
    font-weight: 800; font-size: 18px;
    text-shadow: 0 2px 4px rgba(0,0,0,0.6);
    pointer-events: none;
  `;
  title.textContent = 'توك توك كفر الدوار';
  hud.appendChild(title);

  // أزرار الأصوات
  const audioBar = document.createElement('div');
  audioBar.style.cssText = `
    position: fixed; bottom: 20px; left: 20px;
    display: flex; gap: 8px; pointer-events: auto;
    z-index: 10; flex-wrap: wrap; max-width: 320px;
  `;

  const btnStyle = `
    background: #f5c542; color: #06141a;
    border: none; border-radius: 10px;
    padding: 10px 16px; font-size: 15px;
    font-family: 'Cairo', sans-serif; font-weight: 800;
    cursor: pointer; box-shadow: 0 3px 8px rgba(0,0,0,0.4);
  `;

  for (let i = 0; i < 5; i++) {
    const btn = document.createElement('button');
    btn.textContent = `🎵 ${i + 1}`;
    btn.style.cssText = btnStyle;
    btn.onclick = () => audio.playTrack(i);
    audioBar.appendChild(btn);
  }

  const stopBtn = document.createElement('button');
  stopBtn.textContent = '⏹';
  stopBtn.style.cssText = btnStyle + 'background:#ff6b6b;color:#fff;';
  stopBtn.onclick = () => audio.stopCurrent();
  audioBar.appendChild(stopBtn);

  hud.appendChild(audioBar);
}
