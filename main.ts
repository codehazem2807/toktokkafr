import { Engine, Scene, Vector3, FreeCamera, HemisphericLight, Color4, Color3 } from '@babylonjs/core';
import { buildMap } from './map';
import { createTukTuk } from './player';
import { AudioManager } from './audio';
import { createHUD } from './ui';

// @ts-ignore
window.__booted = false;

const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;
const engine = new Engine(canvas, true, {
  preserveDrawingBuffer: true,
  stencil: true,
  antialias: true,
  powerPreference: 'high-performance'
});

const scene = new Scene(engine);
scene.clearColor = new Color4(0.55, 0.72, 0.9, 1);

// إضاءة
const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);
light.intensity = 0.9;
light.groundColor = new Color3(0.3, 0.3, 0.3);

// كاميرا
const camera = new FreeCamera('camera', new Vector3(0, 8, -12), scene);
camera.setTarget(Vector3.Zero());

// بناء الخريطة
buildMap(scene);

// التوك توك
const player = createTukTuk(scene, camera);

// الأصوات
const audio = new AudioManager(scene);

// الواجهة
createHUD(audio);

// إخفاء شاشة التحميل
const loading = document.getElementById('loading');
if (loading) {
  loading.style.transition = 'opacity 0.5s';
  loading.style.opacity = '0';
  setTimeout(() => loading.remove(), 600);
}
// @ts-ignore
window.__booted = true;

// حلقة العرض
engine.runRenderLoop(() => {
  player.update();
  scene.render();
});

window.addEventListener('resize', () => engine.resize());
