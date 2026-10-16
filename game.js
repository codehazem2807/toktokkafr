/* ============================================================
   🛺 لعبة توك توك كفر الدوار - 3D
   كود واحد كامل - بدون أخطاء
   ============================================================ */

(function() {
'use strict';

console.log('🚀 بدء تحميل اللعبة...');

/* ============================================================
   التحقق من تحميل Three.js
   ============================================================ */
if (typeof THREE === 'undefined') {
  console.error('❌ Three.js لم يتم تحميله! تأكد من الاتصال بالإنترنت.');
  alert('فشل تحميل Three.js. تأكد من الاتصال بالإنترنت وأعد تحميل الصفحة.');
  return;
}
console.log('✅ Three.js جاهز');

/* ============================================================
   الإعدادات
   ============================================================ */
const CONFIG = {
  citySize: 2000,
  canalWidth: 25,
  roadWidth: 24,
  sidewalkWidth: 3,
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
  ground: 0x5a8a4a,
  road: 0x3a3a3a,
  sidewalk: 0xa0a0a0,
  canal: 0x1a4a6a,
};

/* ============================================================
   كشف الجهاز
   ============================================================ */
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  || (navigator.maxTouchPoints && navigator.maxTouchPoints > 2 && /MacIntel/.test(navigator.platform))
  || window.matchMedia('(pointer: coarse)').matches;

console.log('📱 الجهاز:', isMobile ? 'موبايل/تابلت' : 'كمبيوتر');

/* ============================================================
   المشهد والكاميرا والمصير
   ============================================================ */
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

/* ============================================================
   الإضاءة
   ============================================================ */
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

/* ============================================================
   واجهة المستخدم
   ============================================================ */
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
  
  showToast(message, duration) {
    duration = duration || 1800;
    this.toast.textContent = message;
    this.toast.classList.add('show');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => {
      this.toast.classList.remove('show');
    }, duration);
  },
  
  showHint(text, duration) {
    duration = duration || 5000;
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

/* ============================================================
   أدوات مساعدة
   ============================================================ */
const Utils = {
  rand(min, max) { return Math.random() * (max - min) + min; },
  pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; },
  formatTime(seconds) {
    const m = Math.floor(Math.max(0, seconds) / 60);
    const s = Math.floor(Math.max(0, seconds) % 60);
    return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
  },
  clamp(val, min, max) { return Math.max(min, Math.min(max, val)); },
};

/* ============================================================
   المواد المشتركة
   ============================================================ */
const MATERIALS = {
  road: new THREE.MeshStandardMaterial({ color: COLORS.road, roughness: 0.95, metalness: 0.05 }),
  sidewalk: new THREE.MeshStandardMaterial({ color: COLORS.sidewalk, roughness: 0.9 }),
  roadMark: new THREE.MeshBasicMaterial({ color: 0xffcc00 }),
  treeTrunk: new THREE.MeshStandardMaterial({ color: 0x5a3a20, roughness: 1 }),
  treeLeaf: new THREE.MeshStandardMaterial({ color: 0x2d5a2d, roughness: 1 }),
  treeLeafDark: new THREE.MeshStandardMaterial({ color: 0x1d4a1d, roughness: 1 }),
  palmTrunk: new THREE.MeshStandardMaterial({ color: 0x8b6a3a, roughness: 1 }),
  palmLeaf: new THREE.MeshStandardMaterial({ color: 0x3a7a3a, roughness: 0.9, side: THREE.DoubleSide }),
  streetLightPole: new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.4, metalness: 0.7 }),
  streetLightLamp: new THREE.MeshStandardMaterial({ color: 0xffffee, emissive: 0xffee88, emissiveIntensity: 0.8 }),
};

/* ============================================================
   بيانات الشوارع
   ============================================================ */
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

/* ============================================================
   الوجهات الحقيقية
   ============================================================ */
const DESTINATIONS_DATA = [
  { name: 'محطة قطار كفر الدوار', x: -350, z: -50, color: 0x8b4513 },
  { name: 'موقف عزيز المصري', x: 200, z: 80, color: 0xe74c3c },
  { name: 'مجمع الميزانة', x: -150, z: -60, color: 0xf39c12 },
  { name: 'مجمع السعرانية', x: 450, z: 100, color: 0xe67e22 },
  { name: 'مستشفى كفر الدوار العام', x: -700, z: 150, color: 0x3498db },
  { name: 'شركة مصر للغزل والنسيج', x: 500, z: -400, color: 0x95a5a6 },
  { name: 'المسجد الكبير', x: -200, z: 250, color: 0x16a085 },
  { name: 'سوق كفر الدوار التجاري', x: 100, z: 200, color: 0x9b59b6 },
  { name: 'كورنيش ترعة المحمودية', x: 600, z: -20, color: 0x2980b9 },
  { name: 'جامعة كفر الدوار', x: -500, z: -300, color: 0x8e44ad },
];

/* ============================================================
   نظام الأصوات
   ============================================================ */
const AudioSystem = {
  ctx: null,
  engineOsc: null,
  engineGain: null,
  engineFilter: null,
  enabled: true,
  initialized: false,
  
  init() {
    if (this.initialized) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AC();
      this.initialized = true;
      console.log('🔊 نظام الصوت جاهز');
    } catch (e) {
      console.warn('⚠️ فشل تشغيل الصوت:', e);
      this.enabled = false;
    }
  },
  
  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  },
  
  startEngine() {
    if (!this.enabled || !this.ctx || this.engineOsc) return;
    try {
      this.engineOsc = this.ctx.createOscillator();
      this.engineOsc.type = 'sawtooth';
      this.engineOsc.frequency.value = 55;
      
      this.engineFilter = this.ctx.createBiquadFilter();
      this.engineFilter.type = 'lowpass';
      this.engineFilter.frequency.value = 350;
      this.engineFilter.Q.value = 5;
      
      this.engineGain = this.ctx.createGain();
      this.engineGain.gain.value = 0.05;
      
      this.engineOsc.connect(this.engineFilter);
      this.engineFilter.connect(this.engineGain);
      this.engineGain.connect(this.ctx.destination);
      
      this.engineOsc.start();
    } catch (e) {}
  },
  
  stopEngine() {
    if (this.engineOsc) {
      try { this.engineOsc.stop(); } catch (e) {}
      this.engineOsc = null;
      this.engineGain = null;
      this.engineFilter = null;
    }
  },
  
  setEngine(on) {
    if (on) {
      this.resume();
      this.startEngine();
    } else {
      this.stopEngine();
    }
  },
  
  updateEngine(speed, maxSpeed, isAccelerating) {
    if (!this.engineOsc || !this.engineGain || !this.ctx) return;
    const ratio = Math.min(Math.abs(speed) / maxSpeed, 1);
    const baseFreq = 55;
    const maxFreq = 180;
    
    this.engineOsc.frequency.setTargetAtTime(
      baseFreq + ratio * (maxFreq - baseFreq),
      this.ctx.currentTime,
      0.1
    );
    
    const targetGain = 0.03 + ratio * 0.12 + (isAccelerating ? 0.03 : 0);
    this.engineGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.15);
    
    this.engineFilter.frequency.setTargetAtTime(
      300 + ratio * 800,
      this.ctx.currentTime,
      0.1
    );
  },
  
  playPickup() {
    if (!this.enabled || !this.ctx) return;
    this._tone(600, 900, 0.15, 'sine', 0.15);
  },
  
  playDelivery() {
    if (!this.enabled || !this.ctx) return;
    this._tone(523, 523, 0.1, 'sine', 0.15);
    setTimeout(() => this._tone(659, 659, 0.1, 'sine', 0.15), 100);
    setTimeout(() => this._tone(784, 784, 0.2, 'sine', 0.15), 200);
  },
  
  _tone(startFreq, endFreq, duration, type, volume) {
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(startFreq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(endFreq, this.ctx.currentTime + duration);
      gain.gain.setValueAtTime(volume || 0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {}
  },
};

/* ============================================================
   إنشاء الأرضية
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

/* ============================================================
   ترعة المحمودية
   ============================================================ */
let canalRef = null;
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
  canalRef = group;
  return group;
}

/* ============================================================
   الشوارع
   ============================================================ */
function createRoads() {
  const group = new THREE.Group();
  group.name = 'roads';
  
  ROADS_DATA.forEach(function(roadData) {
    const x = roadData.x;
    const z = roadData.z;
    const width = roadData.width;
    const length = roadData.length;
    const rotation = roadData.rotation || 0;
    
    const roadGeo = new THREE.BoxGeometry(width, 0.2, length);
    const road = new THREE.Mesh(roadGeo, MATERIALS.road);
    road.position.set(x, 0.1, z);
    road.rotation.y = rotation;
    road.receiveShadow = true;
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

/* ============================================================
   السكة الحديد
   ============================================================ */
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
  for (let z = -CONFIG.citySize / 2; z < CONFIG.citySize / 2; z += 2) {
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

/* ============================================================
   الأشجار والنخيل
   ============================================================ */
function createTree(x, z, scale) {
  scale = scale || 1;
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
  
  tree.position.set(x, 0, z);
  return tree;
}

function createPalm(x, z, scale) {
  scale = scale || 1;
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
  
  ROADS_DATA.forEach(function(road) {
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

/* ============================================================
   أعمدة النور
   ============================================================ */
function createStreetLight(x, z, rotation) {
  const light = new THREE.Group();
  
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 6), MATERIALS.streetLightPole);
  pole.position.y = 3;
  pole.castShadow = true;
  light.add(pole);
  
  const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.2), MATERIALS.streetLightPole);
  arm.rotation.z = Math.PI / 2;
  arm.position.set(0.6, 6, 0);
  arm.castShadow = true;
  light.add(arm);
  
  const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.15, 0.3), MATERIALS.streetLightLamp);
  lamp.position.set(1.2, 5.95, 0);
  light.add(lamp);
  
  light.position.set(x, 0, z);
  light.rotation.y = rotation;
  return light;
}

function createStreetLights() {
  const group = new THREE.Group();
  group.name = 'streetLights';
  
  ROADS_DATA.forEach(function(road) {
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

/* ============================================================
   المباني
   ============================================================ */
function createBuilding(x, z, width, depth, height, type) {
  const group = new THREE.Group();
  
  let color;
  if (type === 'commercial') {
    color = Utils.pick([0xccb89a, 0xd4c4a8, 0xbca888]);
  } else {
    color = Utils.pick([0xc9b8a8, 0xa8927a, 0x8b7355, 0xb8a898, 0xa89888]);
  }
  
  const wallMat = new THREE.MeshStandardMaterial({ color: color, roughness: 0.85, metalness: 0.05 });
  
  const box = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), wallMat);
  box.position.y = height / 2;
  box.castShadow = true;
  box.receiveShadow = true;
  group.add(box);
  
  const roofMat = new THREE.MeshStandardMaterial({ color: 0x5a4a3a, roughness: 0.95 });
  const roof = new THREE.Mesh(new THREE.BoxGeometry(width + 0.4, 0.3, depth + 0.4), roofMat);
  roof.position.y = height + 0.15;
  roof.castShadow = true;
  group.add(roof);
  
  const windowMat = new THREE.MeshStandardMaterial({
    color: 0x88ccff, emissive: 0x4477aa, emissiveIntensity: 0.4, roughness: 0.1, metalness: 0.5,
  });
  const windowFrameMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.8 });
  
  const floors = Math.max(1, Math.floor(height / 3));
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
  
  const doorMat = new THREE.MeshStandardMaterial({ color: 0x4a2a1a, roughness: 0.7 });
  const door = new THREE.Mesh(new THREE.BoxGeometry(1.4, 2.4, 0.15), doorMat);
  door.position.set(0, 1.2, depth / 2 + 0.05);
  group.add(door);
  
  group.position.set(x, 0, z);
  return group;
}

function isOnRoad(x, z, padding) {
  padding = padding || 0;
  for (let i = 0; i < ROADS_DATA.length; i++) {
    const road = ROADS_DATA[i];
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

/* ============================================================
   موجات الترعة
   ============================================================ */
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

/* ============================================================
   بناء المدينة
   ============================================================ */
async function buildCity(onProgress) {
  const steps = [
    { name: 'إنشاء الأرضية...', fn: createGround, weight: 5 },
    { name: 'بناء ترعة المحمودية...', fn: createCanal, weight: 15 },
    { name: 'رصف الشوارع...', fn: createRoads, weight: 20 },
    { name: 'مد خط السكة الحديد...', fn: createRailway, weight: 10 },
    { name: 'زراعة النخيل والأشجار...', fn: createFoliage, weight: 15 },
    { name: 'ترك أعمدة النور...', fn: createStreetLights, weight: 10 },
    { name: 'بناء المنازل والمحلات...', fn: createBuildings, weight: 25 },
  ];
  
  let accumulated = 0;
  const totalWeight = steps.reduce(function(sum, s) { return sum + s.weight; }, 0);
  
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    if (onProgress) onProgress(Math.round((accumulated / totalWeight) * 100), step.name);
    
    await new Promise(function(resolve) {
      requestAnimationFrame(function() {
        try { step.fn(); } catch (e) { console.error('خطأ في', step.name, e); }
        resolve();
      });
    });
    
    accumulated += step.weight;
  }
  
  if (onProgress) onProgress(100, 'جاهز للانطلاق! 🚀');
}

/* ============================================================
   التوك توك
   ============================================================ */
function createTukTuk() {
  const tukTuk = new THREE.Group();
  tukTuk.name = 'tukTuk';

  const yellowBody = new THREE.MeshStandardMaterial({ color: 0xffc800, roughness: 0.35, metalness: 0.35 });
  const yellowDark = new THREE.MeshStandardMaterial({ color: 0xe6a800, roughness: 0.4, metalness: 0.3 });
  const blackPart = new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.85, metalness: 0.1 });
  const rubberMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.95, metalness: 0 });
  const rimMat = new THREE.MeshStandardMaterial({ color: 0xdddddd, roughness: 0.2, metalness: 0.95 });
  const chromeMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.15, metalness: 0.98 });
  const headlightMat = new THREE.MeshStandardMaterial({ color: 0xffffcc, emissive: 0xffee88, emissiveIntensity: 1.2 });
  const taillightMat = new THREE.MeshStandardMaterial({ color: 0xff2222, emissive: 0xcc0000, emissiveIntensity: 0.8 });
  const seatMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.95 });
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xaaddff, roughness: 0.02, metalness: 0.05,
    transmission: 0.92, transparent: true, opacity: 0.45, thickness: 0.05, ior: 1.5,
  });

  // الهيكل
  const chassis = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.12, 2.5), blackPart);
  chassis.position.y = 0.42;
  chassis.castShadow = true;
  tukTuk.add(chassis);

  const floorFront = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.08, 1.1), blackPart);
  floorFront.position.set(0, 0.52, 0.7);
  floorFront.castShadow = true;
  tukTuk.add(floorFront);

  const floorRear = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.08, 1.4), blackPart);
  floorRear.position.set(0, 0.52, -0.65);
  floorRear.castShadow = true;
  tukTuk.add(floorRear);

  // المقدمة
  const frontPanel = new THREE.Mesh(new THREE.BoxGeometry(1.32, 0.85, 0.15), yellowBody);
  frontPanel.position.set(0, 0.98, 1.28);
  frontPanel.castShadow = true;
  tukTuk.add(frontPanel);

  const hood = new THREE.Mesh(new THREE.BoxGeometry(1.32, 0.08, 0.5), yellowDark);
  hood.position.set(0, 1.42, 1.05);
  hood.rotation.x = -0.08;
  hood.castShadow = true;
  tukTuk.add(hood);

  const fender = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.25, 1.15), yellowBody);
  fender.position.set(0, 0.72, 1.15);
  fender.castShadow = true;
  tukTuk.add(fender);

  // المقصورة الأمامية
  const frontCabin = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.95, 1.1), yellowBody);
  frontCabin.position.set(0, 1.0, 0.7);
  frontCabin.castShadow = true;
  tukTuk.add(frontCabin);

  // المقصورة الخلفية
  const rearCabin = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.55, 1.5), yellowBody);
  rearCabin.position.set(0, 1.28, -0.65);
  rearCabin.castShadow = true;
  tukTuk.add(rearCabin);

  const stripe = new THREE.Mesh(new THREE.BoxGeometry(1.42, 0.08, 1.52), blackPart);
  stripe.position.set(0, 1.35, -0.65);
  tukTuk.add(stripe);

  // السقف
  const roof = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.12, 2.7), blackPart);
  roof.position.set(0, 2.15, 0);
  roof.castShadow = true;
  tukTuk.add(roof);

  const roofTrim = new THREE.Mesh(new THREE.BoxGeometry(1.52, 0.04, 2.72), chromeMat);
  roofTrim.position.set(0, 2.09, 0);
  tukTuk.add(roofTrim);

  // الأعمدة
  const pillarGeo = new THREE.CylinderGeometry(0.05, 0.05, 1.85, 8);
  const pillarPositions = [
    [-0.68, 1.25, -1.35], [0.68, 1.25, -1.35],
    [-0.68, 1.25, -0.1], [0.68, 1.25, -0.1],
    [-0.68, 1.25, 1.15], [0.68, 1.25, 1.15],
  ];
  pillarPositions.forEach(function(pos) {
    const pillar = new THREE.Mesh(pillarGeo, blackPart);
    pillar.position.set(pos[0], pos[1], pos[2]);
    pillar.castShadow = true;
    tukTuk.add(pillar);
  });

  // الزجاج
  const windshield = new THREE.Mesh(new THREE.BoxGeometry(1.28, 0.9, 0.04), glassMat);
  windshield.position.set(0, 1.88, 1.28);
  windshield.rotation.x = -0.1;
  tukTuk.add(windshield);

  const sideGlassGeo = new THREE.BoxGeometry(0.04, 0.85, 1.0);
  const sideGlassL = new THREE.Mesh(sideGlassGeo, glassMat);
  sideGlassL.position.set(-0.69, 1.85, 0.7);
  tukTuk.add(sideGlassL);

  const sideGlassR = new THREE.Mesh(sideGlassGeo, glassMat);
  sideGlassR.position.set(0.69, 1.85, 0.7);
  tukTuk.add(sideGlassR);

  const rearGlassSideGeo = new THREE.BoxGeometry(0.04, 1.0, 1.35);
  const rearGlassL = new THREE.Mesh(rearGlassSideGeo, glassMat);
  rearGlassL.position.set(-0.71, 1.75, -0.65);
  tukTuk.add(rearGlassL);

  const rearGlassR = new THREE.Mesh(rearGlassSideGeo, glassMat);
  rearGlassR.position.set(0.71, 1.75, -0.65);
  tukTuk.add(rearGlassR);

  const rearWindow = new THREE.Mesh(new THREE.BoxGeometry(1.35, 1.05, 0.04), glassMat);
  rearWindow.position.set(0, 1.75, -1.41);
  tukTuk.add(rearWindow);

  // الشبكة
  const grillFrame = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.35, 0.06), chromeMat);
  grillFrame.position.set(0, 1.0, 1.37);
  tukTuk.add(grillFrame);

  for (let i = 0; i < 5; i++) {
    const slat = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.04, 0.04), blackPart);
    slat.position.set(0, 0.88 + i * 0.06, 1.4);
    tukTuk.add(slat);
  }

  // المصابيح الأمامية
  const headlightGeo = new THREE.CylinderGeometry(0.13, 0.13, 0.1, 20);
  const hl1 = new THREE.Mesh(headlightGeo, chromeMat);
  hl1.rotation.x = Math.PI / 2;
  hl1.position.set(-0.48, 1.2, 1.35);
  tukTuk.add(hl1);

  const hl1Glass = new THREE.Mesh(headlightGeo, headlightMat);
  hl1Glass.rotation.x = Math.PI / 2;
  hl1Glass.position.set(-0.48, 1.2, 1.38);
  tukTuk.add(hl1Glass);

  const hl2 = new THREE.Mesh(headlightGeo, chromeMat);
  hl2.rotation.x = Math.PI / 2;
  hl2.position.set(0.48, 1.2, 1.35);
  tukTuk.add(hl2);

  const hl2Glass = new THREE.Mesh(headlightGeo, headlightMat);
  hl2Glass.rotation.x = Math.PI / 2;
  hl2Glass.position.set(0.48, 1.2, 1.38);
  tukTuk.add(hl2Glass);

  // الفوانيس الخلفية
  const taillightGeo = new THREE.BoxGeometry(0.14, 0.22, 0.06);
  const tl1 = new THREE.Mesh(taillightGeo, taillightMat);
  tl1.position.set(-0.52, 0.95, -1.42);
  tukTuk.add(tl1);

  const tl2 = new THREE.Mesh(taillightGeo, taillightMat);
  tl2.position.set(0.52, 0.95, -1.42);
  tukTuk.add(tl2);

  // لوحة الأرقام
  const plateMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 });
  const plate = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.16, 0.03), plateMat);
  plate.position.set(0, 0.68, -1.43);
  tukTuk.add(plate);

  // المقود
  const steeringGroup = new THREE.Group();
  const steeringRing = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.022, 8, 24), blackPart);
  steeringGroup.add(steeringRing);

  for (let i = 0; i < 3; i++) {
    const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.15, 0.02), blackPart);
    spoke.rotation.z = (i / 3) * Math.PI * 2;
    steeringGroup.add(spoke);
  }

  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.04), blackPart);
  hub.rotation.x = Math.PI / 2;
  steeringGroup.add(hub);

  const column = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.35), blackPart);
  column.rotation.x = -0.55;
  column.position.set(0, -0.14, 0.12);
  steeringGroup.add(column);

  steeringGroup.position.set(0, 1.55, 0.9);
  steeringGroup.rotation.x = -0.35;
  tukTuk.add(steeringGroup);

  // لوحة القيادة
  const dashMat = new THREE.MeshStandardMaterial({ color: 0x151515, roughness: 0.9 });
  const dashboard = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.22, 0.35), dashMat);
  dashboard.position.set(0, 1.32, 1.08);
  dashboard.castShadow = true;
  tukTuk.add(dashboard);

  // المقاعد
  const seatDriver = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.12, 0.5), seatMat);
  seatDriver.position.set(0, 0.8, 0.4);
  seatDriver.castShadow = true;
  tukTuk.add(seatDriver);

  const backDriver = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.55, 0.08), seatMat);
  backDriver.position.set(0, 1.12, 0.16);
  backDriver.castShadow = true;
  tukTuk.add(backDriver);

  const rearSeat = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.12, 0.55), seatMat);
  rearSeat.position.set(0, 0.8, -0.75);
  rearSeat.castShadow = true;
  tukTuk.add(rearSeat);

  const rearBack = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.65, 0.08), seatMat);
  rearBack.position.set(0, 1.18, -1.05);
  rearBack.castShadow = true;
  tukTuk.add(rearBack);

  // العجلات
  const wheels = [];
  
  function createWheel(x, z, isFront) {
    const wheelGroup = new THREE.Group();
    wheelGroup.userData.isFront = isFront;

    const tire = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.11, 12, 24), rubberMat);
    tire.rotation.y = Math.PI / 2;
    tire.castShadow = true;
    wheelGroup.add(tire);

    const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.13, 12), rimMat);
    rim.rotation.z = Math.PI / 2;
    rim.castShadow = true;
    wheelGroup.add(rim);

    for (let i = 0; i < 5; i++) {
      const bolt = new THREE.Mesh(new THREE.SphereGeometry(0.025, 6, 6), blackPart);
      const angle = (i / 5) * Math.PI * 2;
      bolt.position.set(0, Math.cos(angle) * 0.08, Math.sin(angle) * 0.08);
      wheelGroup.add(bolt);
    }

    wheelGroup.position.set(x, 0.26, z);
    tukTuk.add(wheelGroup);
    wheels.push(wheelGroup);
    return wheelGroup;
  }

  const frontWheel = createWheel(0, 1.25, true);
  createWheel(-0.68, -0.85, false);
  createWheel(0.68, -0.85, false);

  // الإضاءة الفعلية
  const headlight = new THREE.SpotLight(0xfff5cc, 4, 35, Math.PI / 5, 0.4, 1.5);
  headlight.position.set(0, 1.2, 1.3);
  headlight.target.position.set(0, 0.3, 15);
  tukTuk.add(headlight);
  tukTuk.add(headlight.target);

  tukTuk.userData = {
    wheels: wheels,
    frontWheel: frontWheel,
    steeringWheel: steeringGroup,
    headlight: headlight,
  };

  return tukTuk;
}

const tukTuk = createTukTuk();
tukTuk.position.set(0, 0, 200);
tukTuk.rotation.y = 0;
scene.add(tukTuk);

/* ============================================================
   حالة اللاعب
   ============================================================ */
const player = {
  speed: 0,
  maxSpeed: CONFIG.maxSpeed,
  maxReverseSpeed: CONFIG.maxReverseSpeed,
  acceleration: CONFIG.acceleration,
  braking: CONFIG.braking,
  friction: CONFIG.friction,
  steering: 0,
  currentWheelAngle: 0,
  isLocked: false,
  engineOn: true,
  handbrake: false,
  headYaw: 0,
  headPitch: 0,
  hasPassenger: false,
  currentPassenger: null,
};

const CAMERA_OFFSET = new THREE.Vector3(0, 1.55, 0.15);

/* ============================================================
   المدخلات
   ============================================================ */
const keys = {};

document.addEventListener('keydown', function(e) {
  keys[e.code] = true;
  if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab'].indexOf(e.code) !== -1) {
    e.preventDefault();
  }
  if (e.code === 'Space') player.handbrake = true;
  if (e.code === 'KeyE') {
    player.engineOn = !player.engineOn;
    AudioSystem.setEngine(player.engineOn);
    UI.showToast(player.engineOn ? '🔊 المحرك شغّال' : '🔇 المحرك مطفأ', 1000);
  }
  if (e.code === 'KeyR') {
    player.headYaw = 0;
    player.headPitch = 0;
  }
});

document.addEventListener('keyup', function(e) {
  keys[e.code] = false;
  if (e.code === 'Space') player.handbrake = false;
});

/* ============================================================
   Pointer Lock للماوس
   ============================================================ */
let isPointerLocked = false;

function setupPointerLock() {
  if (isMobile) return;
  document.addEventListener('pointerlockchange', function() {
    isPointerLocked = document.pointerLockElement === renderer.domElement;
    player.isLocked = isPointerLocked;
  });
  document.addEventListener('mousemove', function(e) {
    if (!isPointerLocked) return;
    player.headYaw -= e.movementX * 0.002;
    player.headPitch -= e.movementY * 0.002;
    player.headYaw = Utils.clamp(player.headYaw, -Math.PI * 0.75, Math.PI * 0.75);
    player.headPitch = Utils.clamp(player.headPitch, -0.55, 0.45);
  });
}

/* ============================================================
   مدخلات اللمس
   ============================================================ */
const mobileInput = {
  accel: false,
  brake: false,
  left: false,
  right: false,
};

function setupMobileButtons() {
  const buttons = {
    btnAccel: 'accel',
    btnBrake: 'brake',
    btnSteerLeft: 'left',
    btnSteerRight: 'right',
  };
  
  Object.keys(buttons).forEach(function(id) {
    const el = document.getElementById(id);
    if (!el) return;
    const key = buttons[id];
    
    const press = function(e) {
      e.preventDefault();
      e.stopPropagation();
      mobileInput[key] = true;
      el.classList.add('pressed');
    };
    const release = function(e) {
      e.preventDefault();
      e.stopPropagation();
      mobileInput[key] = false;
      el.classList.remove('pressed');
    };
    
    el.addEventListener('touchstart', press, { passive: false });
    el.addEventListener('touchend', release, { passive: false });
    el.addEventListener('touchcancel', release, { passive: false });
    el.addEventListener('mousedown', press);
    el.addEventListener('mouseup', release);
    el.addEventListener('mouseleave', release);
  });
  
  // زر فرملة اليد
  const hbBtn = document.getElementById('btnHandbrake');
  if (hbBtn) {
    const hbPress = function(e) {
      e.preventDefault();
      e.stopPropagation();
      player.handbrake = true;
      hbBtn.classList.add('pressed');
    };
    const hbRelease = function(e) {
      e.preventDefault();
      e.stopPropagation();
      player.handbrake = false;
      hbBtn.classList.remove('pressed');
    };
    hbBtn.addEventListener('touchstart', hbPress, { passive: false });
    hbBtn.addEventListener('touchend', hbRelease, { passive: false });
    hbBtn.addEventListener('mousedown', hbPress);
    hbBtn.addEventListener('mouseup', hbRelease);
  }
  
  // السحب بإصبع للنظر
  let touchLookId = null;
  let touchLastX = 0;
  let touchLastY = 0;
  
  renderer.domElement.addEventListener('touchstart', function(e) {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const t = e.changedTouches[i];
      const target = document.elementFromPoint(t.clientX, t.clientY);
      if (!target || target.classList.contains('mobile-btn')) continue;
      touchLookId = t.identifier;
      touchLastX = t.clientX;
      touchLastY = t.clientY;
      break;
    }
  }, { passive: true });
  
  renderer.domElement.addEventListener('touchmove', function(e) {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const t = e.changedTouches[i];
      if (t.identifier === touchLookId) {
        const dx = t.clientX - touchLastX;
        const dy = t.clientY - touchLastY;
        player.headYaw -= dx * 0.005;
        player.headPitch -= dy * 0.005;
        player.headYaw = Utils.clamp(player.headYaw, -Math.PI * 0.75, Math.PI * 0.75);
        player.headPitch = Utils.clamp(player.headPitch, -0.55, 0.45);
        touchLastX = t.clientX;
        touchLastY = t.clientY;
      }
    }
  }, { passive: true });
  
  renderer.domElement.addEventListener('touchend', function(e) {
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === touchLookId) {
        touchLookId = null;
      }
    }
  }, { passive: true });
}

/* ============================================================
   فيزياء التوك توك
   ============================================================ */
function updateTukTukPhysics(dt) {
  if (!gameState.running || gameState.paused) return;

  const throttle = (keys['KeyW'] || keys['ArrowUp'] || mobileInput.accel) ? 1 : 0;
  const brake = (keys['KeyS'] || keys['ArrowDown'] || mobileInput.brake) ? 1 : 0;

  if (!player.engineOn) {
    player.speed *= (1 - 3 * dt);
    if (Math.abs(player.speed) < 0.1) player.speed = 0;
  } else if (player.handbrake) {
    player.speed *= (1 - 10 * dt);
    if (Math.abs(player.speed) < 0.1) player.speed = 0;
  } else {
    if (throttle && !brake) {
      const accel = player.acceleration * (1 - Math.abs(player.speed) / player.maxSpeed * 0.4);
      player.speed += accel * dt;
    } else if (brake && !throttle) {
      if (player.speed > 0.5) {
        player.speed -= player.braking * dt;
      } else {
        player.speed -= player.acceleration * 0.6 * dt;
      }
    } else {
      if (player.speed > 0) {
        player.speed -= player.friction * dt * 4;
        if (player.speed < 0.05) player.speed = 0;
      } else if (player.speed < 0) {
        player.speed += player.friction * dt * 4;
        if (player.speed > -0.05) player.speed = 0;
      }
    }
    player.speed = Utils.clamp(player.speed, -player.maxReverseSpeed, player.maxSpeed);
  }

  const leftInput = (keys['KeyA'] || keys['ArrowLeft'] || mobileInput.left) ? 1 : 0;
  const rightInput = (keys['KeyD'] || keys['ArrowRight'] || mobileInput.right) ? 1 : 0;
  const steerInput = rightInput - leftInput;

  const steerDiff = steerInput - player.steering;
  const steerStep = Math.sign(steerDiff) * Math.min(Math.abs(steerDiff), CONFIG.steeringSpeed * dt);
  player.steering += steerStep;
  player.steering = Utils.clamp(player.steering, -1, 1);
  if (steerInput === 0) player.steering *= (1 - 2 * dt);

  const speedRatio = Math.min(Math.abs(player.speed) / player.maxSpeed, 1);
  const maxAngle = CONFIG.maxWheelAngle * (1 - speedRatio * 0.55);
  player.currentWheelAngle = player.steering * maxAngle;

  if (Math.abs(player.speed) > 0.1) {
    const speedFactor = Math.min(Math.abs(player.speed) / 8, 1.2);
    const direction = player.speed >= 0 ? 1 : -1;
    const turnRate = player.currentWheelAngle * speedFactor * dt * 3.2 * direction;
    tukTuk.rotation.y -= turnRate;
  }

  const forward = new THREE.Vector3(
    Math.sin(tukTuk.rotation.y), 0, Math.cos(tukTuk.rotation.y)
  );
  const velocity = forward.clone().multiplyScalar(player.speed * dt);
  const newPos = tukTuk.position.clone().add(velocity);

  const inCanalX = !(newPos.x > -15 && newPos.x < 15);
  const nearCanal = Math.abs(newPos.z) < CONFIG.canalWidth / 2 + 1.5;
  
  if (nearCanal && inCanalX) {
    player.speed *= -0.25;
  } else if (Math.abs(newPos.x) < CONFIG.citySize / 2 - 5 && Math.abs(newPos.z) < CONFIG.citySize / 2 - 5) {
    tukTuk.position.copy(newPos);
  } else {
    player.speed *= -0.3;
  }

  const wheelRollSpeed = (player.speed * dt) / 0.28;
  tukTuk.userData.wheels.forEach(function(wheel) {
    const tire = wheel.children[0];
    if (tire) tire.rotation.x += wheelRollSpeed;
    if (wheel.children[1]) wheel.children[1].rotation.x += wheelRollSpeed;
    if (wheel.userData.isFront) wheel.rotation.y = player.currentWheelAngle;
  });

  tukTuk.userData.steeringWheel.rotation.z = -player.steering * Math.PI * 0.85;

  let engineShake = 0;
  if (player.engineOn) {
    engineShake = Math.sin(performance.now() * 0.015) * 0.008 * (1 + speedRatio);
  }
  tukTuk.position.y = Math.max(0, engineShake);

  const targetRoll = -player.steering * 0.06 * speedRatio;
  tukTuk.rotation.z += (targetRoll - tukTuk.rotation.z) * 6 * dt;
}

/* ============================================================
   الكاميرا
   ============================================================ */
function updateCamera(dt) {
  const offset = CAMERA_OFFSET.clone();
  offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), tukTuk.rotation.y);
  
  const targetPos = tukTuk.position.clone().add(offset);
  targetPos.y += tukTuk.position.y;
  
  camera.position.lerp(targetPos, 1 - Math.pow(0.001, dt));
  
  const baseYaw = tukTuk.rotation.y + Math.PI;
  const totalYaw = baseYaw + player.headYaw;
  const totalPitch = player.headPitch;
  
  const lookDir = new THREE.Vector3(
    Math.sin(totalYaw) * Math.cos(totalPitch),
    Math.sin(totalPitch),
    Math.cos(totalYaw) * Math.cos(totalPitch)
  );
  
  const lookTarget = camera.position.clone().add(lookDir);
  camera.lookAt(lookTarget);
  
  const sr = Math.min(Math.abs(player.speed) / player.maxSpeed, 1);
  camera.rotation.z = -player.steering * 0.025 * sr;
  
  if (player.engineOn) {
    const shake = 0.003 * (1 + sr);
    camera.position.x += Math.sin(performance.now() * 0.02) * shake;
    camera.position.y += Math.cos(performance.now() * 0.025) * shake;
  }
}

/* ============================================================
   حالة اللعبة
   ============================================================ */
const gameState = {
  running: false,
  paused: false,
  money: 0,
  deliveries: 0,
  ratingSum: 0,
  timeLeft: CONFIG.gameDuration,
  lastTime: 0,
  spawnTimer: 0,
  elapsedTime: 0,
};

/* ============================================================
   الركاب
   ============================================================ */
const passengers = [];
let activeDestination = null;

function getPassengerSpawnPoint() {
  const candidates = [];
  
  ROADS_DATA.forEach(function(road) {
    if (road.width < 14) return;
    const steps = Math.floor(road.length / 60);
    
    for (let i = 0; i < steps; i++) {
      const offset = -road.length / 2 + i * 60 + 30;
      
      for (let side = -1; side <= 1; side += 2) {
        const sideOffset = side * (road.width / 2 + CONFIG.sidewalkWidth / 2);
        const x = road.x + Math.sin(road.rotation) * offset + Math.cos(road.rotation) * sideOffset;
        const z = road.z + Math.cos(road.rotation) * offset - Math.sin(road.rotation) * sideOffset;
        
        if (Math.abs(z) < CONFIG.canalWidth / 2 + 5) continue;
        if (Math.abs(x + 350) < 10) continue;
        
        const dist = Math.hypot(x - tukTuk.position.x, z - tukTuk.position.z);
        if (dist < 80 || dist > 500) continue;
        
        candidates.push({ x: x, z: z });
      }
    }
  });
  
  if (candidates.length === 0) return null;
  return Utils.pick(candidates);
}

function createPassengerMesh() {
  const group = new THREE.Group();
  
  const shirtColors = [0xe74c3c, 0x3498db, 0x2ecc71, 0xf39c12, 0x9b59b6, 0xe67e22, 0x1abc9c, 0x34495e];
  const pantsColors = [0x2c3e50, 0x34495e, 0x1a1a1a, 0x5a3a2a];
  const skinColors = [0xf5d5b0, 0xe0b890, 0xc89870, 0x8d5524];
  
  const shirtColor = Utils.pick(shirtColors);
  const pantsColor = Utils.pick(pantsColors);
  const skinColor = Utils.pick(skinColors);
  
  const torsoMat = new THREE.MeshStandardMaterial({ color: shirtColor, roughness: 0.85 });
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.7, 0.3), torsoMat);
  torso.position.y = 1.15;
  torso.castShadow = true;
  group.add(torso);
  
  const headMat = new THREE.MeshStandardMaterial({ color: skinColor, roughness: 0.9 });
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 12), headMat);
  head.position.y = 1.68;
  head.castShadow = true;
  group.add(head);
  
  const pantsMat = new THREE.MeshStandardMaterial({ color: pantsColor, roughness: 0.9 });
  const legs = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.8, 0.3), pantsMat);
  legs.position.y = 0.4;
  legs.castShadow = true;
  group.add(legs);
  
  const armGeo = new THREE.BoxGeometry(0.14, 0.65, 0.14);
  const armL = new THREE.Mesh(armGeo, torsoMat);
  armL.position.set(-0.32, 1.15, 0);
  armL.castShadow = true;
  group.add(armL);
  
  const armR = new THREE.Mesh(armGeo, torsoMat);
  armR.position.set(0.32, 1.15, 0);
  armR.castShadow = true;
  group.add(armR);
  
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0x00ff88, transparent: true, opacity: 0.6, side: THREE.DoubleSide,
  });
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.5, 0.7, 24), ringMat);
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.05;
  group.add(ring);
  group.userData.ring = ring;
  
  const arrowMat = new THREE.MeshBasicMaterial({ color: 0x00ff88 });
  const arrow = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.4, 4), arrowMat);
  arrow.position.y = 2.3;
  arrow.rotation.x = Math.PI;
  group.add(arrow);
  group.userData.arrow = arrow;
  
  return group;
}

function spawnPassenger() {
  if (passengers.length >= CONFIG.maxPassengers) return;
  if (player.hasPassenger) return;
  
  const spawnPoint = getPassengerSpawnPoint();
  if (!spawnPoint) return;
  
  let destination;
  let attempts = 0;
  do {
    destination = Utils.pick(DESTINATIONS_DATA);
    attempts++;
  } while (attempts < 10 && passengers.some(function(p) { return p.destination.name === destination.name; }));
  
  const mesh = createPassengerMesh();
  mesh.position.set(spawnPoint.x, 0, spawnPoint.z);
  mesh.rotation.y = Math.random() * Math.PI * 2;
  scene.add(mesh);
  
  passengers.push({
    mesh: mesh,
    x: spawnPoint.x,
    z: spawnPoint.z,
    destination: destination,
    spawnTime: performance.now(),
    bobPhase: Math.random() * Math.PI * 2,
  });
  
  updateMissionUI();
}

function createDestinationMarker(destination) {
  const group = new THREE.Group();
  
  const ringMat = new THREE.MeshBasicMaterial({
    color: destination.color, transparent: true, opacity: 0.7, side: THREE.DoubleSide,
  });
  const ring = new THREE.Mesh(new THREE.RingGeometry(2, 3, 32), ringMat);
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.1;
  group.add(ring);
  
  const innerMat = new THREE.MeshBasicMaterial({
    color: destination.color, transparent: true, opacity: 0.3, side: THREE.DoubleSide,
  });
  const inner = new THREE.Mesh(new THREE.CircleGeometry(1.5, 24), innerMat);
  inner.rotation.x = -Math.PI / 2;
  inner.position.y = 0.15;
  group.add(inner);
  
  const beamMat = new THREE.MeshBasicMaterial({
    color: destination.color, transparent: true, opacity: 0.2, side: THREE.DoubleSide,
  });
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 1.5, 8, 16, 1, true), beamMat);
  beam.position.y = 4;
  group.add(beam);
  
  const iconMat = new THREE.MeshStandardMaterial({
    color: destination.color, emissive: destination.color, emissiveIntensity: 0.8,
  });
  const icon = new THREE.Mesh(new THREE.SphereGeometry(0.6, 16, 16), iconMat);
  icon.position.y = 6;
  group.add(icon);
  
  const pointLight = new THREE.PointLight(destination.color, 1.5, 15);
  pointLight.position.y = 3;
  group.add(pointLight);
  
  group.position.set(destination.x, 0, destination.z);
  group.userData.destination = destination;
  group.userData.startTime = performance.now();
  group.userData.icon = icon;
  group.userData.beam = beam;
  group.userData.ring = ring;
  
  return group;
}

function checkPassengerPickup() {
  if (player.hasPassenger) return;
  
  for (let i = passengers.length - 1; i >= 0; i--) {
    const p = passengers[i];
    const dist = Math.hypot(p.x - tukTuk.position.x, p.z - tukTuk.position.z);
    
    if (dist < 2.6) {
      const dest = p.destination;
      
      scene.remove(p.mesh);
      passengers.splice(i, 1);
      
      player.hasPassenger = true;
      player.currentPassenger = dest;
      player.tripStartTime = performance.now();
      
      activeDestination = createDestinationMarker(dest);
      scene.add(activeDestination);
      
      AudioSystem.playPickup();
      UI.showToast('✅ راكب صعد! → ' + dest.name, 2000);
      
      const riderMesh = createPassengerMesh();
      riderMesh.scale.set(0.85, 0.85, 0.85);
      riderMesh.position.set(0, 0.4, -0.75);
      riderMesh.userData.ring.visible = false;
      riderMesh.userData.arrow.visible = false;
      tukTuk.add(riderMesh);
      tukTuk.userData.passengerRider = riderMesh;
      
      updateMissionUI();
      break;
    }
  }
}

function checkDelivery() {
  if (!player.hasPassenger || !activeDestination) return;
  
  const dest = activeDestination.userData.destination;
  const dist = Math.hypot(dest.x - tukTuk.position.x, dest.z - tukTuk.position.z);
  
  if (dist < 4) {
    const tripTime = (performance.now() - player.tripStartTime) / 1000;
    let reward = 60;
    let rating = 3;
    
    if (tripTime < 20) { reward = 100; rating = 5; }
    else if (tripTime < 40) { reward = 80; rating = 4; }
    else if (tripTime < 60) { reward = 60; rating = 3; }
    else { reward = 40; rating = 2; }
    
    gameState.timeLeft = Math.min(gameState.timeLeft + 15, CONFIG.gameDuration);
    gameState.money += reward;
    gameState.deliveries++;
    gameState.ratingSum += rating;
    
    AudioSystem.playDelivery();
    UI.showToast('🎉 تم التوصيل! +' + reward + ' جنيه +15 ثانية', 2200);
    
    scene.remove(activeDestination);
    activeDestination = null;
    
    if (tukTuk.userData.passengerRider) {
      tukTuk.remove(tukTuk.userData.passengerRider);
      tukTuk.userData.passengerRider = null;
    }
    
    player.hasPassenger = false;
    player.currentPassenger = null;
    
    gameState.spawnTimer = 1.5;
    
    updateHUD();
    updateMissionUI();
  }
}

function updateHUD() {
  UI.moneyValue.textContent = gameState.money;
  UI.deliveriesValue.textContent = gameState.deliveries;
  UI.timeValue.textContent = Utils.formatTime(gameState.timeLeft);
  
  if (gameState.timeLeft < 20) {
    UI.timeValue.classList.add('warning');
  } else {
    UI.timeValue.classList.remove('warning');
  }
  
  const speedKmh = Math.abs(player.speed) * 3.6 * 3.5;
  UI.speedValue.textContent = Math.round(speedKmh);
}

function updateMissionUI() {
  if (player.hasPassenger && player.currentPassenger) {
    UI.missionPanel.textContent = '🎯 اوصل الراكب إلى: ' + player.currentPassenger.name;
    UI.missionPanel.style.borderRightColor = '#00ff88';
  } else if (passengers.length > 0) {
    UI.missionPanel.textContent = '👤 ' + passengers.length + ' راكب ينتظر — اقترب منهم لالتقاطهم';
    UI.missionPanel.style.borderRightColor = '#ffc800';
  } else {
    UI.missionPanel.textContent = '🔍 جاري البحث عن راكب...';
    UI.missionPanel.style.borderRightColor = '#ffc800';
  }
}

function updatePassengers(dt) {
  const now = performance.now();
  
  passengers.forEach(function(p) {
    p.bobPhase += dt * 3;
    const bob = Math.sin(p.bobPhase) * 0.05;
    if (p.mesh) p.mesh.position.y = bob;
    
    if (p.mesh && p.mesh.userData.ring) {
      p.mesh.userData.ring.rotation.z += dt * 0.5;
    }
    if (p.mesh && p.mesh.userData.arrow) {
      p.mesh.userData.arrow.position.y = 2.3 + Math.sin(now * 0.003 + p.bobPhase) * 0.15;
      p.mesh.userData.arrow.rotation.y += dt * 2;
    }
  });
  
  if (activeDestination) {
    const ud = activeDestination.userData;
    const time = (now - ud.startTime) / 1000;
    const pulse = 1 + Math.sin(time * 3) * 0.1;
    ud.ring.scale.set(pulse, pulse, 1);
    ud.beam.material.opacity = 0.15 + Math.sin(time * 2) * 0.08;
    ud.icon.rotation.y += dt * 2;
    ud.icon.position.y = 6 + Math.sin(time * 2) * 0.3;
  }
  
  if (tukTuk.userData.passengerRider) {
    tukTuk.userData.passengerRider.position.y = 0.4 + Math.sin(now * 0.005) * 0.02;
  }
}

/* ============================================================
   الحلقة الرئيسية
   ============================================================ */
function animate() {
  requestAnimationFrame(animate);
  
  const now = performance.now();
  let dt = (now - gameState.lastTime) / 1000;
  gameState.lastTime = now;
  dt = Math.min(dt, 0.05);
  
  animateCanal(now);
  
  if (!gameState.running || gameState.paused) {
    renderer.render(scene, camera);
    return;
  }
  
  gameState.elapsedTime += dt;
  
  gameState.timeLeft -= dt;
  if (gameState.timeLeft <= 0) {
    gameState.timeLeft = 0;
    endGame();
    return;
  }
  
  gameState.spawnTimer -= dt;
  if (gameState.spawnTimer <= 0) {
    if (passengers.length < CONFIG.maxPassengers && !player.hasPassenger) {
      spawnPassenger();
    }
    gameState.spawnTimer = 2 + Math.random() * 3;
  }
  
  updateTukTukPhysics(dt);
  checkPassengerPickup();
  checkDelivery();
  updateCamera(dt);
  updatePassengers(dt);
  
  const isAccelerating = !!(keys['KeyW'] || keys['ArrowUp'] || mobileInput.accel);
  AudioSystem.updateEngine(Math.abs(player.speed), player.maxSpeed, isAccelerating);
  
  sunLight.position.set(tukTuk.position.x + 180, 280, tukTuk.position.z + 150);
  sunLight.target.position.copy(tukTuk.position);
  sunLight.target.updateMatrixWorld();
  
  updateHUD();
  renderer.render(scene, camera);
}

/* ============================================================
   بدء اللعبة
   ============================================================ */
let isInitialized = false;

async function startGame() {
  console.log('🎬 محاولة بدء اللعبة...');
  
  AudioSystem.init();
  AudioSystem.resume();
  
  if (isInitialized) {
    console.log('✅ إعادة تشغيل اللعبة');
    resetGame();
    gameState.running = true;
    gameState.paused = false;
    UI.startScreen.classList.add('hidden');
    UI.endScreen.classList.add('hidden');
    UI.hud.style.display = 'flex';
    UI.missionPanel.style.display = 'block';
    UI.pauseBtn.style.display = 'flex';
    UI.crosshair.style.display = 'block';
    
    if (isMobile) {
      UI.mobileControls.classList.add('visible');
      UI.showHint('استخدم الأزرار للقيادة — اسحب للنظر', 6000);
    } else {
      UI.showHint('W/A/S/D للحركة — الماوس للنظر — Space فرملة', 6000);
      if (renderer.domElement.requestPointerLock) {
        renderer.domElement.requestPointerLock();
      }
    }
    
    if (player.engineOn) AudioSystem.setEngine(true);
    gameState.lastTime = performance.now();
    return;
  }
  
  UI.startBtn.disabled = true;
  UI.startBtn.textContent = '⏳ جاري التحميل...';
  
  try {
    await buildCity(function(pct, text) {
      UI.updateLoading(pct, text);
    });
    
    setupMobileButtons();
    setupPointerLock();
    
    isInitialized = true;
    
    resetGame();
    gameState.running = true;
    gameState.lastTime = performance.now();
    
    UI.startScreen.classList.add('hidden');
    UI.endScreen.classList.add('hidden');
    UI.hud.style.display = 'flex';
    UI.missionPanel.style.display = 'block';
    UI.pauseBtn.style.display = 'flex';
    UI.crosshair.style.display = 'block';
    
    if (isMobile) {
      UI.mobileControls.classList.add('visible');
      UI.showHint('استخدم الأزرار للقيادة — اسحب للنظر', 6000);
    } else {
      UI.showHint('W/A/S/D للحركة — الماوس للنظر — Space فرملة', 6000);
    }
    
    if (player.engineOn) AudioSystem.setEngine(true);
    
    setTimeout(function() { spawnPassenger(); }, 500);
    setTimeout(function() { spawnPassenger(); }, 1500);
    
    UI.showToast('🛺 رحلة سعيدة!', 2000);
    
    if (!animate.started) {
      animate.started = true;
      gameState.lastTime = performance.now();
      animate();
    }
    
    console.log('✅ اللعبة بدأت!');
    
  } catch (error) {
    console.error('❌ خطأ في تحميل اللعبة:', error);
    UI.showToast('حدث خطأ أثناء التحميل، حاول مرة أخرى', 3000);
    UI.startBtn.disabled = false;
    UI.startBtn.textContent = '🚀 ابدأ الرحلة';
  }
}

function resetGame() {
  gameState.money = 0;
  gameState.deliveries = 0;
  gameState.ratingSum = 0;
  gameState.timeLeft = CONFIG.gameDuration;
  gameState.spawnTimer = 1;
  gameState.elapsedTime = 0;
  gameState.paused = false;
  
  tukTuk.position.set(0, 0, 200);
  tukTuk.rotation.set(0, 0, 0);
  
  player.speed = 0;
  player.steering = 0;
  player.currentWheelAngle = 0;
  player.headYaw = 0;
  player.headPitch = 0;
  player.hasPassenger = false;
  player.currentPassenger = null;
  player.engineOn = true;
  player.handbrake = false;
  
  passengers.forEach(function(p) {
    scene.remove(p.mesh);
  });
  passengers.length = 0;
  
  if (activeDestination) {
    scene.remove(activeDestination);
    activeDestination = null;
  }
  
  if (tukTuk.userData.passengerRider) {
    tukTuk.remove(tukTuk.userData.passengerRider);
    tukTuk.userData.passengerRider = null;
  }
  
  const offset = CAMERA_OFFSET.clone();
  offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), tukTuk.rotation.y);
  camera.position.copy(tukTuk.position).add(offset);
  camera.lookAt(tukTuk.position.x, tukTuk.position.y + 1.5, tukTuk.position.z + 10);
  
  updateHUD();
  updateMissionUI();
}

function togglePause() {
  if (!gameState.running) return;
  gameState.paused = !gameState.paused;
  
  if (gameState.paused) {
    UI.pauseBtn.textContent = '▶️';
    UI.showToast('⏸️ اللعبة متوقفة', 1500);
    AudioSystem.setEngine(false);
    if (document.pointerLockElement) document.exitPointerLock();
  } else {
    UI.pauseBtn.textContent = '⏸️';
    UI.showToast('▶️ استمر!', 1000);
    if (player.engineOn) AudioSystem.setEngine(true);
    if (!isMobile && renderer.domElement.requestPointerLock) {
      renderer.domElement.requestPointerLock();
    }
  }
}

function endGame() {
  gameState.running = false;
  AudioSystem.setEngine(false);
  
  if (document.pointerLockElement) document.exitPointerLock();
  
  const avgRating = gameState.deliveries > 0
    ? (gameState.ratingSum / gameState.deliveries).toFixed(1)
    : '0';
  
  UI.endTitle.textContent = gameState.deliveries > 0 ? '🎉 رحلة رائعة!' : '⏰ انتهى الوقت!';
  UI.endMoney.textContent = gameState.money + ' جنيه';
  UI.endDeliveries.textContent = gameState.deliveries;
  UI.endRating.textContent = avgRating + ' ⭐';
  
  UI.endScreen.classList.remove('hidden');
  UI.mobileControls.classList.remove('visible');
  UI.pauseBtn.style.display = 'none';
  
  console.log('🏁 انتهت اللعبة', {
    money: gameState.money,
    deliveries: gameState.deliveries,
    rating: avgRating,
  });
}

/* ============================================================
   ربط الأزرار - في النهاية بعد تعريف كل الدوال
   ============================================================ */
console.log('🔗 ربط أزرار اللعبة...');

UI.startBtn.addEventListener('click', function(e) {
  e.preventDefault();
  startGame();
});

UI.startBtn.addEventListener('touchstart', function(e) {
  e.preventDefault();
  startGame();
}, { passive: false });

UI.restartBtn.addEventListener('click', function() {
  UI.endScreen.classList.add('hidden');
  startGame();
});

UI.pauseBtn.addEventListener('click', function() {
  togglePause();
});

document.addEventListener('keydown', function(e) {
  if (e.code === 'Escape' || e.code === 'KeyP') {
    if (gameState.running) togglePause();
  }
});

document.addEventListener('contextmenu', function(e) { e.preventDefault(); });

window.addEventListener('resize', function() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

window.addEventListener('orientationchange', function() {
  setTimeout(function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }, 200);
});

console.log('🎮 اللعبة جاهزة! اضغط "🚀 ابدأ الرحلة"');

})();
