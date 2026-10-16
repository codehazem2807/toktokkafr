/* ============================================================
   🛺 توك توك كفر الدوار - الكود الكامل
   ============================================================ */
import * as THREE from 'three';

/* ============================================================
   الجزء 1: الإعدادات والمدينة
   ============================================================ */

const CONFIG = {
  citySize: 2000,
  canalWidth: 25,
  roadWidth: 24,
  sidewalkWidth: 3,
  tukTukWidth: 1.4,
  tukTukLength: 2.6,
  tukTukHeight: 2.2,
  cameraHeight: 1.55,
  cameraForwardOffset: 0.35,
  cameraSideOffset: 0,
  maxSpeed: 16,
  maxReverseSpeed: 5,
  acceleration: 7,
  braking: 14,
  friction: 0.8,
  steeringSpeed: 3.2,
  maxWheelAngle: 0.55,
  gameDuration: 180,
  maxPassengers: 3,
  shadowQuality: 2048,
  enableShadows: true,
};

const COLORS = {
  sky: 0x87CEEB,
  skyTop: 0x4a90e2,
  ground: 0x5a8a4a,
  road: 0x3a3a3a,
  sidewalk: 0xa0a0a0,
  building1: 0xc9b8a8,
  building2: 0xa8927a,
  building3: 0x8b7355,
  canal: 0x1a4a6a,
};

const scene = new THREE.Scene();
scene.background = new THREE.Color(COLORS.sky);
scene.fog = new THREE.Fog(COLORS.sky, 250, 1000);

const camera = new THREE.PerspectiveCamera(
  72,
  window.innerWidth / window.innerHeight,
  0.05,
  3000
);

const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById('gameCanvas'),
  antialias: true,
  powerPreference: 'high-performance',
  stencil: false,
  alpha: false,
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = CONFIG.enableShadows;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const sunLight = new THREE.DirectionalLight(0xfff5e0, 2.6);
sunLight.position.set(200, 300, 150);
sunLight.castShadow = CONFIG.enableShadows;
if (CONFIG.enableShadows) {
  sunLight.shadow.mapSize.width = CONFIG.shadowQuality;
  sunLight.shadow.mapSize.height = CONFIG.shadowQuality;
  sunLight.shadow.camera.near = 1;
  sunLight.shadow.camera.far = 700;
  sunLight.shadow.camera.left = -180;
  sunLight.shadow.camera.right = 180;
  sunLight.shadow.camera.top = 180;
  sunLight.shadow.camera.bottom = -180;
  sunLight.shadow.bias = -0.0003;
  sunLight.shadow.normalBias = 0.02;
}
scene.add(sunLight);
scene.add(sunLight.target);

const ambientLight = new THREE.AmbientLight(0x8899bb, 1.0);
scene.add(ambientLight);

const hemiLight = new THREE.HemisphereLight(0x87CEEB, 0x3a4a3a, 1.2);
scene.add(hemiLight);

const UI = {
  startScreen: document.getElementById('startScreen'),
  endScreen: document.getElementById('endScreen'),
  startBtn: document.getElementById('startBtn'),
  restartBtn: document.getElementById('restartBtn'),
  loadingFill: document.getElementById('loadingFill'),
  loadingText: document.getElementById('loadingText'),
  hud: document.getElementById('hud'),
  missionPanel: document.getElementById('missionPanel'),
  pauseBtn: document.getElementById('pauseBtn'),
  mobileControls: document.getElementById('mobileControls'),
  crosshair: document.getElementById('crosshair'),
  hint: document.getElementById('hint'),
  toast: document.getElementById('toast'),
  moneyValue: document.getElementById('moneyValue'),
  deliveriesValue: document.getElementById('deliveriesValue'),
  timeValue: document.getElementById('timeValue'),
  speedValue: document.getElementById('speedValue'),
  endTitle: document.getElementById('endTitle'),
  endMoney: document.getElementById('endMoney'),
  endDeliveries: document.getElementById('endDeliveries'),
  endRating: document.getElementById('endRating'),
  
  updateLoading(pct, text) {
    this.loadingFill.style.width = pct + '%';
    if (text) this.loadingText.textContent = text;
  },
  
  showToast(message, duration = 1800) {
    this.toast.textContent = message;
    this.toast.classList.add('show');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => {
      this.toast.classList.remove('show');
    }, duration);
  },
  
  showHint(text, duration = 5000) {
    this.hint.textContent = text;
    this.hint.classList.remove('hidden');
    clearTimeout(this._hintTimer);
    if (duration > 0) {
      this._hintTimer = setTimeout(() => {
        this.hint.classList.add('hidden');
      }, duration);
    }
  },
  
  hideHint() {
    this.hint.classList.add('hidden');
  },
};

const isMobile = (() => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    || (navigator.maxTouchPoints && navigator.maxTouchPoints > 2 && /MacIntel/.test(navigator.platform))
    || window.matchMedia('(pointer: coarse)').matches;
})();

console.log('📱 الجهاز:', isMobile ? 'موبايل/تابلت' : 'كمبيوتر');

const MATERIALS = {
  road: new THREE.MeshStandardMaterial({ color: COLORS.road, roughness: 0.95, metalness: 0.05 }),
  sidewalk: new THREE.MeshStandardMaterial({ color: COLORS.sidewalk, roughness: 0.9 }),
  roadMark: new THREE.MeshBasicMaterial({ color: 0xffcc00 }),
  roadMarkWhite: new THREE.MeshBasicMaterial({ color: 0xffffff }),
  treeTrunk: new THREE.MeshStandardMaterial({ color: 0x5a3a20, roughness: 1 }),
  treeLeaf: new THREE.MeshStandardMaterial({ color: 0x2d5a2d, roughness: 1 }),
  treeLeafDark: new THREE.MeshStandardMaterial({ color: 0x1d4a1d, roughness: 1 }),
  palmTrunk: new THREE.MeshStandardMaterial({ color: 0x8b6a3a, roughness: 1 }),
  palmLeaf: new THREE.MeshStandardMaterial({ color: 0x3a7a3a, roughness: 0.9, side: THREE.DoubleSide }),
  streetLightPole: new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.4, metalness: 0.7 }),
  streetLightLamp: new THREE.MeshStandardMaterial({ color: 0xffffee, emissive: 0xffee88, emissiveIntensity: 0.8 }),
};

const ROADS_DATA = [
  { name: 'شارع أحمد عرابي', x: 0, z: -15, width: CONFIG.roadWidth, length: CONFIG.citySize, rotation: 0, isMain: true },
  { name: 'مدخل الكوبري الجديد', x: 700, z: 150, width: CONFIG.roadWidth * 0.9, length: 500, rotation: Math.PI / 2, isMain: true },
  { name: 'شارع بورسعيد', x: 0, z: 25, width: CONFIG.roadWidth * 0.85, length: CONFIG.citySize, rotation: 0 },
  { name: 'شارع الجيش', x: 300, z: 100, width: CONFIG.roadWidth * 0.8, length: 800, rotation: Math.PI / 2 },
  { name: 'شارع الجمهورية', x: -400, z: 0, width: CONFIG.roadWidth * 0.75, length: 750, rotation: Math.PI / 2 },
  { name: 'شارع جلال الدسوقي', x: -150, z: 500, width: CONFIG.roadWidth * 0.7, length: 700, rotation: Math.PI / 2 },
  { name: 'شارع سيدي عبد القادر', x: -700, z: 100, width: CONFIG.roadWidth * 0.75, length: 500, rotation: Math.PI / 2 },
  { name: 'شارع الحدائق', x: 100, z: 400, width: CONFIG.roadWidth * 0.65, length: 600, rotation: Math.PI / 2 },
  { name: 'شارع المحور', x: 600, z: 400, width: CONFIG.roadWidth * 0.65, length: 500, rotation: Math.PI / 2 },
  { name: 'شارع سيدي شحاته', x: -800, z: -400, width: 16, length: 400, rotation: 0 },
  { name: 'شارع الرحمة', x: -200, z: -500, width: 16, length: 300, rotation: 0 },
  { name: 'شارع مجمع المحاكم', x: 500, z: -300, width: 16, length: 400, rotation: 0 },
  { name: 'شارع صلاح الدين الأيوبي', x: 900, z: -500, width: 16, length: 300, rotation: 0 },
  { name: 'شارع الإدكاوي', x: -600, z: 600, width: 16, length: 400, rotation: Math.PI / 2 },
  { name: 'شارع العروبة', x: 200, z: 700, width: 16, length: 300, rotation: Math.PI / 2 },
  { name: 'شارع النصر', x: 700, z: 600, width: 16, length: 400, rotation: Math.PI / 2 },
];

const Utils = {
  rand(min, max) { return Math.random() * (max - min) + min; },
  pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; },
  toDeg(rad) { return rad * 180 / Math.PI; },
  formatTime(seconds) {
    const m = Math.floor(Math.max(0, seconds) / 60);
    const s = Math.floor(Math.max(0, seconds) % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  },
  clamp(val, min, max) { return Math.max(min, Math.min(max, val)); },
  lerp(a, b, t) { return a + (b - a) * t; },
};

/* ============================================================
   دوال بناء المدينة (نفسها زي الجزء 1)
   ============================================================ */

function createGround() {
  const groundGeo = new THREE.PlaneGeometry(6000, 6000, 1, 1);
  const groundMat = new THREE.MeshStandardMaterial({
    color: COLORS.ground, roughness: 1, metalness: 0,
  });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);
  return ground;
}

function createCanal() {
  const group = new THREE.Group();
  group.name = 'canal';
  
  const waterGeo = new THREE.PlaneGeometry(CONFIG.citySize * 1.2, CONFIG.canalWidth, 80, 8);
  const waterMat = new THREE.MeshStandardMaterial({
    color: COLORS.canal, roughness: 0.15, metalness: 0.65, transparent: true, opacity: 0.9,
  });
  const water = new THREE.Mesh(waterGeo, waterMat);
  water.rotation.x = -Math.PI / 2;
  water.position.y = -0.5;
  water.receiveShadow = true;
  group.add(water);
  group.userData.water = water;
  group.userData.waterBasePositions = waterGeo.attributes.position.array.slice();
  
  const bankMat = new THREE.MeshStandardMaterial({ color: 0x8b7355, roughness: 1 });
  const bankGeo = new THREE.BoxGeometry(CONFIG.citySize * 1.2, 2, 4);
  
  const northBank = new THREE.Mesh(bankGeo, bankMat);
  northBank.position.set(0, 1, -(CONFIG.canalWidth / 2 + 2));
  northBank.castShadow = true;
  northBank.receiveShadow = true;
  group.add(northBank);
  
  const southBank = new THREE.Mesh(bankGeo, bankMat);
  southBank.position.set(0, 1, (CONFIG.canalWidth / 2 + 2));
  southBank.castShadow = true;
  southBank.receiveShadow = true;
  group.add(southBank);
  
  const railMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.5, metalness: 0.4 });
  
  for (let side = -1; side <= 1; side += 2) {
    for (let x = -CONFIG.citySize * 0.6; x < CONFIG.citySize * 0.6; x += 8) {
      const postGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.1);
      const post = new THREE.Mesh(postGeo, railMat);
      post.position.set(x, 1.55, side * (CONFIG.canalWidth / 2 + 3.8));
      post.castShadow = true;
      group.add(post);
    }
    const wireGeo = new THREE.BoxGeometry(CONFIG.citySize * 1.2, 0.06, 0.06);
    const wire = new THREE.Mesh(wireGeo, railMat);
    wire.position.set(0, 2.1, side * (CONFIG.canalWidth / 2 + 3.8));
    wire.castShadow = true;
    group.add(wire);
  }
  
  // الجسر
  const bridgeGeo = new THREE.BoxGeometry(30, 3, CONFIG.canalWidth + 20);
  const bridgeMat = new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.9 });
  const bridge = new THREE.Mesh(bridgeGeo, bridgeMat);
  bridge.position.set(0, 2, 0);
  bridge.castShadow = true;
  bridge.receiveShadow = true;
  group.add(bridge);
  
  for (let side = -1; side <= 1; side += 2) {
    const railGeo = new THREE.BoxGeometry(2, 1.2, CONFIG.canalWidth + 20);
    const rail = new THREE.Mesh(railGeo, railMat);
    rail.position.set(side * 14, 3.6, 0);
    rail.castShadow = true;
    group.add(rail);
  }
  
  const pillarGeo = new THREE.CylinderGeometry(1.5, 1.5, 8, 12);
  const pillarMat = new THREE.MeshStandardMaterial({ color: 0x666666, roughness: 0.95 });
  for (let side = -1; side <= 1; side += 2) {
    for (let z = -1; z <= 1; z += 2) {
      const pillar = new THREE.Mesh(pillarGeo, pillarMat);
      pillar.position.set(side * 12, -2, z * (CONFIG.canalWidth / 2));
      pillar.castShadow = true;
      group.add(pillar);
    }
  }
  
  scene.add(group);
  return group;
}

function createRoads() {
  const group = new THREE.Group();
  group.name = 'roads';
  
  ROADS_DATA.forEach((roadData) => {
    const { x, z, width, length, rotation = 0 } = roadData;
    
    const roadGeo = new THREE.BoxGeometry(width, 0.2, length);
    const road = new THREE.Mesh(roadGeo, MATERIALS.road);
    road.position.set(x, 0.1, z);
    road.rotation.y = rotation;
    road.receiveShadow = true;
    road.userData.roadName = roadData.name;
    group.add(road);
    
    const sideGeo = new THREE.BoxGeometry(CONFIG.sidewalkWidth, 0.4, length);
    
    for (let side = -1; side <= 1; side += 2) {
      const sidewalk = new THREE.Mesh(sideGeo, MATERIALS.sidewalk);
      const sideOffset = side * (width / 2 + CONFIG.sidewalkWidth / 2);
      const dx = Math.cos(rotation) * sideOffset;
      const dz = -Math.sin(rotation) * sideOffset;
      sidewalk.position.set(x + dx, 0.3, z + dz);
      sidewalk.rotation.y = rotation;
      sidewalk.receiveShadow = true;
      sidewalk.castShadow = true;
      group.add(sidewalk);
    }
    
    if (width >= 18) {
      const markCount = Math.floor(length / 25);
      for (let i = 0; i < markCount; i++) {
        const offset = -length / 2 + i * 25 + 12.5;
        const markGeo = new THREE.BoxGeometry(0.35, 0.08, 10);
        const mark = new THREE.Mesh(markGeo, MATERIALS.roadMark);
        const mx = x + Math.sin(rotation) * offset;
        const mz = z + Math.cos(rotation) * offset;
        mark.position.set(mx, 0.22, mz);
        mark.rotation.y = rotation;
        group.add(mark);
      }
    }
  });
  
  scene.add(group);
  return group;
}

function createRailway() {
  const group = new THREE.Group();
  group.name = 'railway';
  
  const railMat = new THREE.MeshStandardMaterial({ color: 0x808080, metalness: 0.9, roughness: 0.35 });
  const sleeperMat = new THREE.MeshStandardMaterial({ color: 0x4a3a2a, roughness: 1 });
  const railX = -350;
  
  for (let side = -1; side <= 1; side += 2) {
    const railGeo = new THREE.BoxGeometry(0.18, 0.35, CONFIG.citySize);
    const rail = new THREE.Mesh(railGeo, railMat);
    rail.position.set(railX + (side * 1.5), 0.55, 0);
    rail.castShadow = true;
    group.add(rail);
  }
  
  const sleeperGeo = new THREE.BoxGeometry(4.2, 0.2, 0.35);
  for (let z = -CONFIG.citySize / 2; z < CONFIG.citySize / 2; z += 1.5) {
    const sleeper = new THREE.Mesh(sleeperGeo, sleeperMat);
    sleeper.position.set(railX, 0.4, z);
    sleeper.receiveShadow = true;
    group.add(sleeper);
  }
  
  const gravelGeo = new THREE.BoxGeometry(6, 0.15, CONFIG.citySize);
  const gravelMat = new THREE.MeshStandardMaterial({ color: 0x707070, roughness: 1 });
  const gravel = new THREE.Mesh(gravelGeo, gravelMat);
  gravel.position.set(railX, 0.3, 0);
  gravel.receiveShadow = true;
  group.add(gravel);
  
  scene.add(group);
  return group;
}

function createTree(x, z, scale = 1) {
  const tree = new THREE.Group();
  const trunkGeo = new THREE.CylinderGeometry(0.2 * scale, 0.28 * scale, 2.5 * scale, 6);
  const trunk = new THREE.Mesh(trunkGeo, MATERIALS.treeTrunk);
  trunk.position.y = 1.25 * scale;
  trunk.castShadow = true;
  tree.add(trunk);
  
  const leafMat = Math.random() > 0.5 ? MATERIALS.treeLeaf : MATERIALS.treeLeafDark;
  const leaf1 = new THREE.Mesh(new THREE.SphereGeometry(1.2 * scale, 8, 6), leafMat);
  leaf1.position.y = 3 * scale;
  leaf1.castShadow = true;
  tree.add(leaf1);
  
  const leaf2 = new THREE.Mesh(new THREE.SphereGeometry(1 * scale, 8, 6), leafMat);
  leaf2.position.set(0.5 * scale, 3.6 * scale, 0.3 * scale);
  leaf2.castShadow = true;
  tree.add(leaf2);
  
  const leaf3 = new THREE.Mesh(new THREE.SphereGeometry(0.9 * scale, 8, 6), leafMat);
  leaf3.position.set(-0.4 * scale, 3.8 * scale, -0.3 * scale);
  leaf3.castShadow = true;
  tree.add(leaf3);
  
  tree.position.set(x, 0, z);
  return tree;
}

function createPalm(x, z, scale = 1) {
  const palm = new THREE.Group();
  const segments = 5;
  const trunkHeight = 6 * scale;
  let prevY = 0;
  let prevX = 0;
  
  for (let i = 0; i < segments; i++) {
    const segHeight = trunkHeight / segments;
    const segGeo = new THREE.CylinderGeometry(
      0.15 * scale * (1 - i * 0.05),
      0.2 * scale * (1 - i * 0.05),
      segHeight, 8
    );
    const seg = new THREE.Mesh(segGeo, MATERIALS.palmTrunk);
    const y = prevY + segHeight / 2;
    const bendX = Math.sin(i * 0.3) * 0.15 * scale * i;
    seg.position.set(bendX, y, 0);
    seg.castShadow = true;
    palm.add(seg);
    prevY = y + segHeight / 2;
    prevX = bendX;
  }
  
  for (let i = 0; i < 7; i++) {
    const angle = (i / 7) * Math.PI * 2;
    const leafGeo = new THREE.PlaneGeometry(0.8 * scale, 3 * scale);
    const leaf = new THREE.Mesh(leafGeo, MATERIALS.palmLeaf);
    leaf.position.set(
      prevX + Math.cos(angle) * 0.5 * scale,
      prevY + 0.2 * scale,
      Math.sin(angle) * 0.5 * scale
    );
    leaf.rotation.z = Math.PI / 2.2;
    leaf.rotation.y = angle;
    leaf.castShadow = true;
    palm.add(leaf);
  }
  
  palm.position.set(x, 0, z);
  return palm;
}

function createFoliage() {
  const group = new THREE.Group();
  group.name = 'foliage';
  
  for (let x = -CONFIG.citySize * 0.55; x < CONFIG.citySize * 0.55; x += 30) {
    if (Math.random() > 0.4) {
      group.add(createPalm(x + Utils.rand(-5, 5), -(CONFIG.canalWidth / 2 + 6), Utils.rand(0.85, 1.15)));
    }
    if (Math.random() > 0.4) {
      group.add(createPalm(x + Utils.rand(-5, 5), (CONFIG.canalWidth / 2 + 6), Utils.rand(0.85, 1.15)));
    }
  }
  
  ROADS_DATA.forEach(road => {
    if (road.width < 16) return;
    const treeCount = Math.floor(road.length / 40);
    
    for (let i = 0; i < treeCount; i++) {
      const offset = -road.length / 2 + i * 40 + 20;
      
      for (let side = -1; side <= 1; side += 2) {
        if (Math.random() < 0.3) continue;
        const sideOffset = side * (road.width / 2 + CONFIG.sidewalkWidth + 2);
        const tx = road.x + Math.sin(road.rotation) * offset + Math.cos(road.rotation) * sideOffset;
        const tz = road.z + Math.cos(road.rotation) * offset - Math.sin(road.rotation) * sideOffset;
        
        if (Math.abs(tz) > CONFIG.canalWidth / 2 + 8) {
          group.add(createTree(tx, tz, Utils.rand(0.85, 1.2)));
        }
      }
    }
  });
  
  scene.add(group);
  return group;
}

function createStreetLight(x, z, rotation = 0) {
  const light = new THREE.Group();
  
  const poleGeo = new THREE.CylinderGeometry(0.1, 0.12, 6);
  const pole = new THREE.Mesh(poleGeo, MATERIALS.streetLightPole);
  pole.position.y = 3;
  pole.castShadow = true;
  light.add(pole);
  
  const armGeo = new THREE.CylinderGeometry(0.06, 0.06, 1.2);
  const arm = new THREE.Mesh(armGeo, MATERIALS.streetLightPole);
  arm.rotation.z = Math.PI / 2;
  arm.position.set(0.6, 6, 0);
  arm.castShadow = true;
  light.add(arm);
  
  const lampGeo = new THREE.BoxGeometry(0.6, 0.15, 0.3);
  const lamp = new THREE.Mesh(lampGeo, MATERIALS.streetLightLamp);
  lamp.position.set(1.2, 5.95, 0);
  light.add(lamp);
  
  light.position.set(x, 0, z);
  light.rotation.y = rotation;
  return light;
}

function createStreetLights() {
  const group = new THREE.Group();
  group.name = 'streetLights';
  
  ROADS_DATA.forEach(road => {
    if (road.width < 14) return;
    const count = Math.floor(road.length / 50);
    
    for (let i = 0; i < count; i++) {
      const offset = -road.length / 2 + i * 50 + 25;
      const sideOffset = road.width / 2 + CONFIG.sidewalkWidth - 0.5;
      const side = i % 2 === 0 ? 1 : -1;
      
      const lx = road.x + Math.sin(road.rotation) * offset + Math.cos(road.rotation) * sideOffset * side;
      const lz = road.z + Math.cos(road.rotation) * offset - Math.sin(road.rotation) * sideOffset * side;
      
      if (Math.abs(lz) > CONFIG.canalWidth / 2 + 6) {
        group.add(createStreetLight(lx, lz, road.rotation + (side > 0 ? Math.PI : 0)));
      }
    }
  });
  
  scene.add(group);
  return group;
}

function createBuilding(x, z, width, depth, height, type = 'residential') {
  const group = new THREE.Group();
  
  let color;
  if (type === 'commercial') {
    color = Utils.pick([0xccb89a, 0xd4c4a8, 0xbca888]);
  } else {
    color = Utils.pick([COLORS.building1, COLORS.building2, COLORS.building3, 0xb8a898, 0xa89888]);
  }
  
  const wallMat = new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0.05 });
  
  const boxGeo = new THREE.BoxGeometry(width, height, depth);
  const box = new THREE.Mesh(boxGeo, wallMat);
  box.position.y = height / 2;
  box.castShadow = true;
  box.receiveShadow = true;
  group.add(box);
  
  const roofMat = new THREE.MeshStandardMaterial({ color: 0x5a4a3a, roughness: 0.95 });
  const roofGeo = new THREE.BoxGeometry(width + 0.4, 0.3, depth + 0.4);
  const roof = new THREE.Mesh(roofGeo, roofMat);
  roof.position.y = height + 0.15;
  roof.castShadow = true;
  group.add(roof);
  
  const windowMat = new THREE.MeshStandardMaterial({
    color: 0x88ccff, emissive: 0x4477aa, emissiveIntensity: 0.4, roughness: 0.1, metalness: 0.5,
  });
  const windowFrameMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.8 });
  
  const floors = Math.floor(height / 3);
  const windowsPerFloor = Math.floor(width / 2.5);
  
  for (let face = -1; face <= 1; face += 2) {
    for (let floor = 0; floor < floors; floor++) {
      for (let w = 0; w < windowsPerFloor; w++) {
        const frame = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.5, 0.15), windowFrameMat);
        frame.position.set(-width / 2 + 1.5 + w * 2.5, 1.5 + floor * 3, (depth / 2) * face + 0.05 * face);
        group.add(frame);
        
        const glass = new THREE.Mesh(new THREE.BoxGeometry(1, 1.3, 0.05), windowMat);
        glass.position.set(-width / 2 + 1.5 + w * 2.5, 1.5 + floor * 3, (depth / 2) * face + 0.1 * face);
        group.add(glass);
      }
    }
  }
  
  const windowsPerSide = Math.floor(depth / 2.5);
  for (let face = -1; face <= 1; face += 2) {
    for (let floor = 0; floor < floors; floor++) {
      for (let w = 0; w < windowsPerSide; w++) {
        const frame = new THREE.Mesh(new THREE.BoxGeometry(0.15, 1.5, 1.2), windowFrameMat);
        frame.position.set((width / 2) * face + 0.05 * face, 1.5 + floor * 3, -depth / 2 + 1.5 + w * 2.5);
        group.add(frame);
        
        const glass = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.3, 1), windowMat);
        glass.position.set((width / 2) * face + 0.1 * face, 1.5 + floor * 3, -depth / 2 + 1.5 + w * 2.5);
        group.add(glass);
      }
    }
  }
  
  const doorMat = new THREE.MeshStandardMaterial({ color: 0x4a2a1a, roughness: 0.7 });
  const door = new THREE.Mesh(new THREE.BoxGeometry(1.4, 2.4, 0.15), doorMat);
  door.position.set(0, 1.2, depth / 2 + 0.05);
  group.add(door);
  
  if (type === 'commercial') {
    const signMat = new THREE.MeshStandardMaterial({
      color: Utils.pick([0xff5555, 0x55ff55, 0x5588ff, 0xffaa00, 0xff55ff]),
      emissiveIntensity: 0.3,
    });
    const sign = new THREE.Mesh(new THREE.BoxGeometry(width * 0.7, 0.8, 0.15), signMat);
    sign.position.set(0, 2.8, depth / 2 + 0.2);
    group.add(sign);
  }
  
  group.position.set(x, 0, z);
  return group;
}

function isOnRoad(x, z, padding = 0) {
  for (const road of ROADS_DATA) {
    const halfW = road.width / 2 + CONFIG.sidewalkWidth + padding;
    const halfL = road.length / 2 + padding;
    const dx = x - road.x;
    const dz = z - road.z;
    const cos = Math.cos(-road.rotation);
    const sin = Math.sin(-road.rotation);
    const localX = dx * cos - dz * sin;
    const localZ = dx * sin + dz * cos;
    if (Math.abs(localX) < halfW && Math.abs(localZ) < halfL) return true;
  }
  return false;
}

function createBuildings() {
  const group = new THREE.Group();
  group.name = 'buildings';
  const gridSize = 50;
  const halfCity = CONFIG.citySize / 2;
  
  for (let gx = -halfCity; gx < halfCity; gx += gridSize) {
    for (let gz = -halfCity; gz < halfCity; gz += gridSize) {
      const x = gx + gridSize / 2;
      const z = gz + gridSize / 2;
      
      if (isOnRoad(x, z, 5)) continue;
      if (Math.abs(z) < CONFIG.canalWidth / 2 + 10) continue;
      if (Math.abs(x + 350) < 17) continue;
      if (Math.abs(x) < 20 && Math.abs(z) < 25) continue;
      if (Math.random() > 0.75) continue;
      
      const width = Utils.rand(12, 22);
      const depth = Utils.rand(12, 22);
      const rand = Math.random();
      let height, type;
      
      if (rand < 0.6) { height = Utils.rand(6, 14); type = 'residential'; }
      else if (rand < 0.9) { height = Utils.rand(14, 24); type = 'residential'; }
      else { height = Utils.rand(4, 8); type = 'commercial'; }
      
      group.add(createBuilding(x, z, width, depth, height, type));
    }
  }
  
  scene.add(group);
  return group;
}

let canalRef = null;
function animateCanal(time) {
  if (!canalRef || !canalRef.userData.water) return;
  const water = canalRef.userData.water;
  const basePositions = canalRef.userData.waterBasePositions;
  const pos = water.geometry.attributes.position;
  const t = time * 0.0008;
  
  for (let i = 0; i < pos.count; i++) {
    const baseX = basePositions[i * 3];
    const baseY = basePositions[i * 3 + 1];
    const wave1 = Math.sin(baseX * 0.05 + t) * 0.25;
    const wave2 = Math.cos(baseY * 0.1 + t * 1.3) * 0.15;
    const wave3 = Math.sin((baseX + baseY) * 0.03 + t * 0.7) * 0.2;
    pos.setZ(i, wave1 + wave2 + wave3);
  }
  pos.needsUpdate = true;
  water.geometry.computeVertexNormals();
}

async function buildCity(onProgress) {
  const steps = [
    { name: 'إنشاء الأرضية...', fn: createGround, weight: 5 },
    { name: 'بناء ترعة المحمودية...', fn: () => { canalRef = createCanal(); }, weight: 15 },
    { name: 'رصف الشوارع...', fn: createRoads, weight: 20 },
    { name: 'مد خط السكة الحديد...', fn: createRailway, weight: 10 },
    { name: 'زراعة النخيل والأشجار...', fn: createFoliage, weight: 15 },
    { name: 'ترك أعمدة النور...', fn: createStreetLights, weight: 10 },
    { name: 'بناء المنازل والمحلات...', fn: createBuildings, weight: 25 },
  ];
  
  let accumulated = 0;
  const totalWeight = steps.reduce((sum, s) => sum + s.weight, 0);
  
  for (const step of steps) {
    if (onProgress) onProgress(Math.round((accumulated / totalWeight) * 100), step.name);
    await new Promise(resolve => {
      requestAnimationFrame(() => {
        try { step.fn(); } catch (e) { console.error('خطأ في', step.name, e); }
        resolve();
      });
    });
    accumulated += step.weight;
  }
  
  if (onProgress) onProgress(100, 'جاهز للانطلاق! 🚀');
}

/* ============================================================
   الجزء 2: التوك توك ونظام القيادة
   ============================================================ */

// [كل دوال التوك توك من الجزء 2]
// (انسخ نفس الكود من الجزء 2 هنا بدون التصدير)

function createTukTuk() {
  // ... (نفس الكود من الجزء 2)
}

// ... إلخ

/* ============================================================
   الجزء 3: الركاب والأصوات والحلقة الرئيسية
   ============================================================ */

// [كل دوال الجزء 3]

/* ============================================================
   الحلقة الرئيسية
   ============================================================ */
function animate() {
  // ...
}

/* ============================================================
   بدء اللعبة
   ============================================================ */
UI.startBtn.addEventListener('click', startGame);

console.log('🎮 اللعبة جاهزة!');
