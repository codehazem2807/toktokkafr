import {
  Scene, MeshBuilder, Vector3,
  StandardMaterial, Color3, FreeCamera
} from '@babylonjs/core';

export interface Player {
  mesh: any;
  update: () => void;
}

export function createTukTuk(scene: Scene, camera: FreeCamera): Player {
  // جسم التوك توك
  const body = MeshBuilder.CreateBox('tuktuk_body', {
    width: 2, height: 1.4, depth: 3
  }, scene);
  body.position = new Vector3(0, 1, 0);

  const bodyMat = new StandardMaterial('tuktuk_bodyMat', scene);
  bodyMat.diffuseColor = new Color3(0.9, 0.7, 0.1); // أصفر
  body.material = bodyMat;

  // كابينة
  const cabin = MeshBuilder.CreateBox('tuktuk_cabin', {
    width: 1.8, height: 1.2, depth: 1.5
  }, scene);
  cabin.position = new Vector3(0, 2.2, 0.5);
  cabin.parent = body;
  const cabinMat = new StandardMaterial('tuktuk_cabinMat', scene);
  cabinMat.diffuseColor = new Color3(0.1, 0.1, 0.1);
  cabin.material = cabinMat;

  // عجلات
  const wheelPositions = [
    new Vector3(-0.9, 0.5, 1),
    new Vector3(0.9, 0.5, 1),
    new Vector3(0, 0.5, -1.2)
  ];
  wheelPositions.forEach((p, i) => {
    const wheel = MeshBuilder.CreateCylinder(`wheel_${i}`, {
      diameter: 1, height: 0.4, tessellation: 16
    }, scene);
    wheel.rotation.z = Math.PI / 2;
    wheel.position = p;
    wheel.parent = body;
    const wMat = new StandardMaterial(`wheelMat_${i}`, scene);
    wMat.diffuseColor = new Color3(0.05, 0.05, 0.05);
    wheel.material = wMat;
  });

  // تحكم
  const keys: Record<string, boolean> = {};
  window.addEventListener('keydown', e => { keys[e.key.toLowerCase()] = true; });
  window.addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });

  // أزرار اللمس للموبايل
  setupTouchControls(keys);

  const speed = 0.35;
  let rotation = 0;

  function update(): void {
    let move = 0;
    if (keys['w'] || keys['arrowup']) move = speed;
    if (keys['s'] || keys['arrowdown']) move = -speed;

    if (keys['a'] || keys['arrowleft']) rotation -= 0.03;
    if (keys['d'] || keys['arrowright']) rotation += 0.03;

    body.rotation.y = rotation;
    body.position.x += Math.sin(rotation) * move;
    body.position.z += Math.cos(rotation) * move;

    // الكاميرا تتبع التوك توك
    const camOffset = new Vector3(
      -Math.sin(rotation) * 12,
      8,
      -Math.cos(rotation) * 12
    );
    camera.position = body.position.add(camOffset);
    camera.setTarget(body.position);
  }

  return { mesh: body, update };
}

function setupTouchControls(keys: Record<string, boolean>): void {
  // أزرار بسيطة للموبايل
  const hud = document.getElementById('hud')!;
  const controls = document.createElement('div');
  controls.style.cssText = `
    position: fixed; bottom: 20px; right: 20px;
    display: grid; grid-template-columns: repeat(3, 60px);
    grid-template-rows: repeat(2, 60px); gap: 8px;
    pointer-events: auto; z-index: 10;
  `;

  const btnStyle = `
    background: rgba(245,197,66,0.85); border: none; border-radius: 50%;
    font-size: 24px; color: #06141a; font-weight: 900;
    touch-action: none; user-select: none;
  `;

  const layout = [
    { key: '', label: '', grid: '1 / 1' },
    { key: 'arrowup', label: '▲', grid: '1 / 2' },
    { key: '', label: '', grid: '1 / 3' },
    { key: 'arrowleft', label: '◀', grid: '2 / 1' },
    { key: 'arrowdown', label: '▼', grid: '2 / 2' },
    { key: 'arrowright', label: '▶', grid: '2 / 3' }
  ];

  layout.forEach(item => {
    if (!item.key) return;
    const btn = document.createElement('button');
    btn.textContent = item.label;
    btn.style.cssText = btnStyle + `grid-area: ${item.grid};`;
    btn.addEventListener('touchstart', e => { e.preventDefault(); keys[item.key] = true; });
    btn.addEventListener('touchend', e => { e.preventDefault(); keys[item.key] = false; });
    btn.addEventListener('mousedown', () => { keys[item.key] = true; });
    btn.addEventListener('mouseup', () => { keys[item.key] = false; });
    btn.addEventListener('mouseleave', () => { keys[item.key] = false; });
    controls.appendChild(btn);
  });

  hud.appendChild(controls);
}
