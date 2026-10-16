/* ============================================================
   🛺 توك توك كفر الدوار - النسخة الاحترافية النهائية
   ============================================================ */

(function() {
'use strict';

console.log('🚀 بدء تحميل اللعبة...');

if (typeof THREE === 'undefined') {
  alert('فشل تحميل Three.js');
  return;
}

/* ============================================================
   كشف الجهاز
   ============================================================ */
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  || (navigator.maxTouchPoints && navigator.maxTouchPoints > 2);
const isLowEnd = isMobile && (navigator.hardwareConcurrency || 2) <= 4;

console.log('📱 الجهاز:', isMobile ? 'موبايل' : 'كمبيوتر');

const QUALITY = {
  pixelRatio: isLowEnd ? 1 : (isMobile ? 1.3 : 2),
  shadows: !isLowEnd,
  shadowMapSize: isLowEnd ? 512 : (isMobile ? 1024 : 2048),
  fogFar: isLowEnd ? 450 : (isMobile ? 650 : 1000),
  treeCount: isLowEnd ? 25 : (isMobile ? 50 : 100),
  buildingDensity: isLowEnd ? 0.32 : (isMobile ? 0.5 : 0.7),
  peopleCount: isLowEnd ? 10 : (isMobile ? 18 : 35),
  carsCount: isLowEnd ? 5 : (isMobile ? 8 : 15),
};

/* ============================================================
   الإعدادات
   ============================================================ */
const CONFIG = {
  citySize: 1500,
  canalWidth: 24,
  roadWidth: 20,
  sidewalkWidth: 2.8,
  maxSpeed: 14,
  maxReverseSpeed: 4,
  acceleration: 6,
  braking: 12,
  friction: 0.7,
  steeringSpeed: 3,
  maxWheelAngle: 0.55,
  gameDuration: 300,
  deliveryBonus: 30,
  maxPassengers: 3,
};

const COLORS = {
  sky: 0x87CEEB,
  skyTop: 0x4a90e2,
  ground: 0x5a8a4a,
  road: 0x2a2a2a,
  sidewalk: 0xa0a0a0,
  canal: 0x1a6a9a,
};

/* ============================================================
   المشهد
   ============================================================ */
const scene = new THREE.Scene();
scene.background = new THREE.Color(COLORS.sky);
scene.fog = new THREE.Fog(COLORS.sky, 60, QUALITY.fogFar);

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.3,
  QUALITY.fogFar + 800
);

const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById('gameCanvas'),
  antialias: !isLowEnd,
  powerPreference: 'high-performance',
  stencil: false,
  alpha: false,
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, QUALITY.pixelRatio));
renderer.shadowMap.enabled = QUALITY.shadows;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
renderer.outputColorSpace = THREE.SRGBColorSpace;

/* ============================================================
   الإضاءة
   ============================================================ */
const sunLight = new THREE.DirectionalLight(0xfff5e0, 2.4);
sunLight.position.set(180, 250, 120);
sunLight.castShadow = QUALITY.shadows;

if (QUALITY.shadows) {
  sunLight.shadow.mapSize.width = QUALITY.shadowMapSize;
  sunLight.shadow.mapSize.height = QUALITY.shadowMapSize;
  sunLight.shadow.camera.near = 1;
  sunLight.shadow.camera.far = 350;
  sunLight.shadow.camera.left = -70;
  sunLight.shadow.camera.right = 70;
  sunLight.shadow.camera.top = 70;
  sunLight.shadow.camera.bottom = -70;
  sunLight.shadow.bias = -0.0005;
  sunLight.shadow.normalBias = 0.02;
}
scene.add(sunLight);
scene.add(sunLight.target);

scene.add(new THREE.AmbientLight(0x8899bb, 1.0));
scene.add(new THREE.HemisphereLight(0x87CEEB, 0x3a4a3a, 1.15));

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
  fullscreenBtn: document.getElementById('fullscreenBtn'),
  controls: document.getElementById('controls'),
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
  rotateScreen: document.getElementById('rotateScreen'),
  minimapCanvas: document.getElementById('minimapCanvas'),
  
  updateLoading: function(pct, text) {
    this.loadingFill.style.width = pct + '%';
    if (text) this.loadingText.textContent = text;
  },
  
  showToast: function(msg, dur) {
    dur = dur || 1800;
    this.toast.textContent = msg;
    this.toast.classList.add('show');
    clearTimeout(this._toastTimer);
    var self = this;
    this._toastTimer = setTimeout(function() { self.toast.classList.remove('show'); }, dur);
  },
  
  showHint: function(text, dur) {
    dur = dur || 5000;
    this.hint.textContent = text;
    this.hint.classList.remove('hidden');
    clearTimeout(this._hintTimer);
    var self = this;
    if (dur > 0) {
      this._hintTimer = setTimeout(function() { self.hint.classList.add('hidden'); }, dur);
    }
  },
};

/* ============================================================
   أدوات
   ============================================================ */
const Utils = {
  rand: function(a, b) { return Math.random() * (b - a) + a; },
  pick: function(arr) { return arr[Math.floor(Math.random() * arr.length)]; },
  formatTime: function(s) {
    var m = Math.floor(Math.max(0, s) / 60);
    var ss = Math.floor(Math.max(0, s) % 60);
    return String(m).padStart(2, '0') + ':' + String(ss).padStart(2, '0');
  },
  clamp: function(v, a, b) { return Math.max(a, Math.min(b, v)); },
};

/* ============================================================
   المواد - جودة عالية
   ============================================================ */
const MAT = {
  road: new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.95 }),
  roadLine: new THREE.MeshBasicMaterial({ color: 0xffffff }),
  roadLineYellow: new THREE.MeshBasicMaterial({ color: 0xffcc00 }),
  sidewalk: new THREE.MeshStandardMaterial({ color: 0xa0a0a0, roughness: 0.85 }),
  ground: new THREE.MeshStandardMaterial({ color: COLORS.ground, roughness: 1 }),
  canal: new THREE.MeshStandardMaterial({ color: COLORS.canal, roughness: 0.1, metalness: 0.5, transparent: true, opacity: 0.88 }),
  treeTrunk: new THREE.MeshStandardMaterial({ color: 0x5a3a20, roughness: 0.95 }),
  treeLeaf: new THREE.MeshStandardMaterial({ color: 0x2d5a2d, roughness: 0.9 }),
  treeLeafDark: new THREE.MeshStandardMaterial({ color: 0x1d4a1d, roughness: 0.9 }),
  palmTrunk: new THREE.MeshStandardMaterial({ color: 0x8b6a3a, roughness: 0.95 }),
  palmLeaf: new THREE.MeshStandardMaterial({ color: 0x3a8a3a, roughness: 0.85, side: THREE.DoubleSide }),
  buildingWall: [
    new THREE.MeshStandardMaterial({ color: 0xd4c4a8, roughness: 0.8 }),
    new THREE.MeshStandardMaterial({ color: 0xc9b8a8, roughness: 0.8 }),
    new THREE.MeshStandardMaterial({ color: 0xb8a898, roughness: 0.8 }),
    new THREE.MeshStandardMaterial({ color: 0xe8dcc8, roughness: 0.75 }),
    new THREE.MeshStandardMaterial({ color: 0xa8927a, roughness: 0.85 }),
  ],
  buildingRoof: new THREE.MeshStandardMaterial({ color: 0x5a4a3a, roughness: 0.9 }),
  mosqueWall: new THREE.MeshStandardMaterial({ color: 0xf0e8d0, roughness: 0.7 }),
  mosqueDome: new THREE.MeshStandardMaterial({ color: 0x16a085, roughness: 0.4, metalness: 0.2 }),
  mosqueGold: new THREE.MeshStandardMaterial({ color: 0xffcc00, roughness: 0.3, metalness: 0.7 }),
  stationWall: new THREE.MeshStandardMaterial({ color: 0xe8dcc0, roughness: 0.75 }),
  stationRoof: new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.7 }),
  factoryWall: new THREE.MeshStandardMaterial({ color: 0x95a5a6, roughness: 0.85 }),
  factoryChimney: new THREE.MeshStandardMaterial({ color: 0x7f8c8d, roughness: 0.9 }),
  hospitalWall: new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.8 }),
  hospitalRed: new THREE.MeshBasicMaterial({ color: 0xcc0000 }),
  schoolWall: new THREE.MeshStandardMaterial({ color: 0xf0c880, roughness: 0.8 }),
  window: new THREE.MeshStandardMaterial({ color: 0x88ccff, emissive: 0x4477aa, emissiveIntensity: 0.3, roughness: 0.1, metalness: 0.5 }),
  windowFrame: new THREE.MeshStandardMaterial({ color: 0x444444, roughness: 0.85 }),
  carBody: [
    new THREE.MeshStandardMaterial({ color: 0xcc3333, roughness: 0.3, metalness: 0.6 }),
    new THREE.MeshStandardMaterial({ color: 0x3366cc, roughness: 0.3, metalness: 0.6 }),
    new THREE.MeshStandardMaterial({ color: 0x33cc66, roughness: 0.3, metalness: 0.6 }),
    new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.3, metalness: 0.6 }),
    new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.3, metalness: 0.6 }),
    new THREE.MeshStandardMaterial({ color: 0xf39c12, roughness: 0.3, metalness: 0.6 }),
  ],
  carGlass: new THREE.MeshStandardMaterial({ color: 0x88ccff, transparent: true, opacity: 0.5, roughness: 0.1 }),
  carTire: new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.95 }),
  peopleShirt: [
    new THREE.MeshStandardMaterial({ color: 0xe74c3c, roughness: 0.85 }),
    new THREE.MeshStandardMaterial({ color: 0x3498db, roughness: 0.85 }),
    new THREE.MeshStandardMaterial({ color: 0x2ecc71, roughness: 0.85 }),
    new THREE.MeshStandardMaterial({ color: 0xf39c12, roughness: 0.85 }),
    new THREE.MeshStandardMaterial({ color: 0x9b59b6, roughness: 0.85 }),
    new THREE.MeshStandardMaterial({ color: 0x1abc9c, roughness: 0.85 }),
    new THREE.MeshStandardMaterial({ color: 0xe67e22, roughness: 0.85 }),
  ],
  peoplePants: [
    new THREE.MeshStandardMaterial({ color: 0x2c3e50, roughness: 0.9 }),
    new THREE.MeshStandardMaterial({ color: 0x34495e, roughness: 0.9 }),
    new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.9 }),
    new THREE.MeshStandardMaterial({ color: 0x5a3a2a, roughness: 0.9 }),
  ],
  peopleSkin: [
    new THREE.MeshStandardMaterial({ color: 0xf5d5b0, roughness: 0.9 }),
    new THREE.MeshStandardMaterial({ color: 0xe0b890, roughness: 0.9 }),
    new THREE.MeshStandardMaterial({ color: 0xc89870, roughness: 0.9 }),
    new THREE.MeshStandardMaterial({ color: 0x8d5524, roughness: 0.9 }),
  ],
};

/* ============================================================
   بيانات الشوارع الحقيقية
   ============================================================ */
const ROADS_DATA = [
  // شوارع رئيسية (شرق-غرب)
  { x: 0, z: -15, width: 20, length: 1500, rotation: 0, isMain: true },      // شارع أحمد عرابي
  { x: 0, z: 25, width: 17, length: 1500, rotation: 0 },                     // شارع بورسعيد
  { x: -450, z: -250, width: 14, length: 500, rotation: 0 },
  { x: 400, z: -250, width: 14, length: 500, rotation: 0 },
  
  // شوارع رئيسية (شمال-جنوب)
  { x: 280, z: 100, width: 17, length: 700, rotation: Math.PI / 2 },         // شارع الجيش
  { x: -350, z: 0, width: 15, length: 600, rotation: Math.PI / 2 },          // شارع الجمهورية
  { x: -120, z: 400, width: 14, length: 500, rotation: Math.PI / 2 },        // شارع جلال الدسوقي
  { x: -550, z: 100, width: 15, length: 450, rotation: Math.PI / 2 },        // شارع سيدي عبد القادر
  { x: 100, z: 350, width: 13, length: 450, rotation: Math.PI / 2 },         // شارع الحدائق
  { x: 500, z: 300, width: 13, length: 400, rotation: Math.PI / 2 },         // شارع المحور
  { x: -250, z: -300, width: 13, length: 400, rotation: Math.PI / 2 },
  { x: 700, z: 0, width: 13, length: 500, rotation: Math.PI / 2 },
];

/* ============================================================
   الوجهات الحقيقية
   ============================================================ */
const DESTINATIONS_DATA = [
  { name: 'محطة قطار كفر الدوار', x: -250, z: -60, color: 0x8b4513 },
  { name: 'مسجد الثورة', x: -120, z: 200, color: 0x16a085 },
  { name: 'شركة مصر للغزل والنسيج', x: 400, z: -300, color: 0x95a5a6 },
  { name: 'موقف عزيز المصري', x: 180, z: 70, color: 0xe74c3c },
  { name: 'مجمع الميزانة', x: -150, z: -80, color: 0xf39c12 },
  { name: 'مجمع السعرانية', x: 400, z: 100, color: 0xe67e22 },
  { name: 'مستشفى كفر الدوار العام', x: -550, z: 140, color: 0x3498db },
  { name: 'سوق الأربعاء', x: 100, z: 180, color: 0x9b59b6 },
  { name: 'كورنيش ترعة المحمودية', x: 550, z: -20, color: 0x2980b9 },
  { name: 'جامعة كفر الدوار', x: -450, z: -280, color: 0x8e44ad },
  { name: 'مدرسة صلاح سالم', x: -280, z: 350, color: 0xf39c12 },
  { name: 'شارع الجيش التجاري', x: 300, z: 200, color: 0xe74c3c },
];

/* ============================================================
   نظام الأصوات
   ============================================================ */
const AudioSystem = {
  ctx: null, engineOsc: null, engineGain: null, engineFilter: null,
  enabled: true, initialized: false,
  
  init: function() {
    if (this.initialized) return;
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AC();
      this.initialized = true;
    } catch (e) { this.enabled = false; }
  },
  
  resume: function() {
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  },
  
  startEngine: function() {
    if (!this.enabled || !this.ctx || this.engineOsc) return;
    try {
      this.engineOsc = this.ctx.createOscillator();
      this.engineOsc.type = 'sawtooth';
      this.engineOsc.frequency.value = 55;
      this.engineFilter = this.ctx.createBiquadFilter();
      this.engineFilter.type = 'lowpass';
      this.engineFilter.frequency.value = 350;
      this.engineGain = this.ctx.createGain();
      this.engineGain.gain.value = 0.03;
      this.engineOsc.connect(this.engineFilter);
      this.engineFilter.connect(this.engineGain);
      this.engineGain.connect(this.ctx.destination);
      this.engineOsc.start();
    } catch (e) {}
  },
  
  stopEngine: function() {
    if (this.engineOsc) {
      try { this.engineOsc.stop(); } catch (e) {}
      this.engineOsc = null; this.engineGain = null; this.engineFilter = null;
    }
  },
  
  setEngine: function(on) { if (on) { this.resume(); this.startEngine(); } else { this.stopEngine(); } },
  
  updateEngine: function(speed, maxSpeed, isAcc) {
    if (!this.engineOsc || !this.engineGain || !this.ctx) return;
    var r = Math.min(Math.abs(speed) / maxSpeed, 1);
    this.engineOsc.frequency.setTargetAtTime(55 + r * 125, this.ctx.currentTime, 0.1);
    this.engineGain.gain.setTargetAtTime(0.025 + r * 0.08 + (isAcc ? 0.02 : 0), this.ctx.currentTime, 0.15);
  },
  
  playPickup: function() { if (this.enabled && this.ctx) this._tone(700, 1000, 0.2, 0.12); },
  playDelivery: function() {
    if (!this.enabled || !this.ctx) return;
    var s = this;
    this._tone(523, 523, 0.1, 0.12);
    setTimeout(function() { s._tone(659, 659, 0.1, 0.12); }, 100);
    setTimeout(function() { s._tone(784, 784, 0.2, 0.12); }, 200);
  },
  
  _tone: function(f1, f2, dur, vol) {
    try {
      var o = this.ctx.createOscillator();
      var g = this.ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(f1, this.ctx.currentTime);
      o.frequency.exponentialRampToValueAtTime(f2, this.ctx.currentTime + dur);
      g.gain.setValueAtTime(vol, this.ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + dur);
      o.connect(g); g.connect(this.ctx.destination);
      o.start(); o.stop(this.ctx.currentTime + dur);
    } catch (e) {}
  },
};

/* ============================================================
   بناء الأرضية
   ============================================================ */
function createGround() {
  var ground = new THREE.Mesh(new THREE.PlaneGeometry(5000, 5000), MAT.ground);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = QUALITY.shadows;
  scene.add(ground);
}

/* ============================================================
   الترعة
   ============================================================ */
var canalRef = null;
function createCanal() {
  var group = new THREE.Group();
  
  var waterGeo = new THREE.PlaneGeometry(CONFIG.citySize * 1.4, CONFIG.canalWidth, 30, 4);
  var water = new THREE.Mesh(waterGeo, MAT.canal);
  water.rotation.x = -Math.PI / 2;
  water.position.y = -0.4;
  water.receiveShadow = QUALITY.shadows;
  group.add(water);
  group.userData.water = water;
  
  var bankMat = new THREE.MeshStandardMaterial({ color: 0x8b7355, roughness: 0.95 });
  for (var s = -1; s <= 1; s += 2) {
    var bank = new THREE.Mesh(new THREE.BoxGeometry(CONFIG.citySize * 1.4, 2, 3), bankMat);
    bank.position.set(0, 0.8, s * (CONFIG.canalWidth / 2 + 1.5));
    if (QUALITY.shadows) { bank.castShadow = true; bank.receiveShadow = true; }
    group.add(bank);
    
    // درابزين
    var rail = new THREE.Mesh(new THREE.BoxGeometry(CONFIG.citySize * 1.4, 0.8, 0.15), new THREE.MeshStandardMaterial({ color: 0xdddddd, roughness: 0.5, metalness: 0.4 }));
    rail.position.set(0, 2.2, s * (CONFIG.canalWidth / 2 + 3.2));
    if (QUALITY.shadows) rail.castShadow = true;
    group.add(rail);
  }
  
  // الجسر
  var bridge = new THREE.Mesh(new THREE.BoxGeometry(26, 2.5, CONFIG.canalWidth + 16), new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.9 }));
  bridge.position.set(0, 1.5, 0);
  if (QUALITY.shadows) { bridge.castShadow = true; bridge.receiveShadow = true; }
  group.add(bridge);
  
  // درابزين الجسر
  for (var s = -1; s <= 1; s += 2) {
    var brail = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1, CONFIG.canalWidth + 16), new THREE.MeshStandardMaterial({ color: 0xdddddd, roughness: 0.5, metalness: 0.4 }));
    brail.position.set(s * 12, 3.2, 0);
    if (QUALITY.shadows) brail.castShadow = true;
    group.add(brail);
  }
  
  scene.add(group);
  canalRef = group;
}

/* ============================================================
   الشوارع
   ============================================================ */
function createRoads() {
  var group = new THREE.Group();
  
  for (var i = 0; i < ROADS_DATA.length; i++) {
    var rd = ROADS_DATA[i];
    
    var road = new THREE.Mesh(new THREE.BoxGeometry(rd.width, 0.15, rd.length), MAT.road);
    road.position.set(rd.x, 0.08, rd.z);
    road.rotation.y = rd.rotation;
    road.receiveShadow = QUALITY.shadows;
    group.add(road);
    
    // أرصفة
    for (var s = -1; s <= 1; s += 2) {
      var sidewalk = new THREE.Mesh(new THREE.BoxGeometry(CONFIG.sidewalkWidth, 0.3, rd.length), MAT.sidewalk);
      var so = s * (rd.width / 2 + CONFIG.sidewalkWidth / 2);
      var dx = Math.cos(rd.rotation) * so;
      var dz = -Math.sin(rd.rotation) * so;
      sidewalk.position.set(rd.x + dx, 0.22, rd.z + dz);
      sidewalk.rotation.y = rd.rotation;
      sidewalk.receiveShadow = QUALITY.shadows;
      group.add(sidewalk);
    }
    
    // خطوط الطريق
    if (rd.width >= 16) {
      var mc = Math.floor(rd.length / 30);
      for (var j = 0; j < mc; j++) {
        var off = -rd.length / 2 + j * 30 + 15;
        var mark = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.05, 6), MAT.roadLineYellow);
        var mx = rd.x + Math.sin(rd.rotation) * off;
        var mz = rd.z + Math.cos(rd.rotation) * off;
        mark.position.set(mx, 0.18, mz);
        mark.rotation.y = rd.rotation;
        group.add(mark);
      }
    }
  }
  
  scene.add(group);
}

/* ============================================================
   السكة الحديد
   ============================================================ */
function createRailway() {
  var group = new THREE.Group();
  var railX = -280;
  var railMat = new THREE.MeshStandardMaterial({ color: 0x808080, roughness: 0.4, metalness: 0.8 });
  
  for (var s = -1; s <= 1; s += 2) {
    var rail = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.3, CONFIG.citySize), railMat);
    rail.position.set(railX + s * 1.2, 0.4, 0);
    if (QUALITY.shadows) rail.castShadow = true;
    group.add(rail);
  }
  
  var sleeperMat = new THREE.MeshStandardMaterial({ color: 0x4a3a2a, roughness: 1 });
  for (var z = -CONFIG.citySize / 2; z < CONFIG.citySize / 2; z += 4) {
    var sl = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.15, 0.3), sleeperMat);
    sl.position.set(railX, 0.28, z);
    group.add(sl);
  }
  
  scene.add(group);
}

/* ============================================================
   الأشجار
   ============================================================ */
function createTree(x, z, scale) {
  scale = scale || 1;
  var t = new THREE.Group();
  
  var trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.15 * scale, 0.22 * scale, 2.2 * scale, 6), MAT.treeTrunk);
  trunk.position.y = 1.1 * scale;
  if (QUALITY.shadows) trunk.castShadow = true;
  t.add(trunk);
  
  var leafMat = Math.random() > 0.5 ? MAT.treeLeaf : MAT.treeLeafDark;
  var l1 = new THREE.Mesh(new THREE.SphereGeometry(1.3 * scale, 7, 6), leafMat);
  l1.position.y = 2.9 * scale;
  if (QUALITY.shadows) l1.castShadow = true;
  t.add(l1);
  
  var l2 = new THREE.Mesh(new THREE.SphereGeometry(0.9 * scale, 6, 5), leafMat);
  l2.position.set(0.5 * scale, 3.4 * scale, 0.3 * scale);
  t.add(l2);
  
  var l3 = new THREE.Mesh(new THREE.SphereGeometry(0.85 * scale, 6, 5), leafMat);
  l3.position.set(-0.4 * scale, 3.3 * scale, -0.3 * scale);
  t.add(l3);
  
  t.position.set(x, 0, z);
  return t;
}

function createPalm(x, z, scale) {
  scale = scale || 1;
  var p = new THREE.Group();
  
  var trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.14 * scale, 0.2 * scale, 5.5 * scale, 7), MAT.palmTrunk);
  trunk.position.y = 2.75 * scale;
  if (QUALITY.shadows) trunk.castShadow = true;
  p.add(trunk);
  
  for (var i = 0; i < 7; i++) {
    var angle = (i / 7) * Math.PI * 2;
    var leaf = new THREE.Mesh(new THREE.PlaneGeometry(0.85 * scale, 3.2 * scale), MAT.palmLeaf);
    leaf.position.set(Math.cos(angle) * 0.5 * scale, 5.5 * scale, Math.sin(angle) * 0.5 * scale);
    leaf.rotation.z = Math.PI / 2.2;
    leaf.rotation.y = angle;
    p.add(leaf);
  }
  
  p.position.set(x, 0, z);
  return p;
}

function createFoliage() {
  var group = new THREE.Group();
  
  // نخيل على الترعة
  var step = isLowEnd ? 50 : 30;
  for (var x = -CONFIG.citySize * 0.55; x < CONFIG.citySize * 0.55; x += step) {
    if (Math.random() > 0.4) group.add(createPalm(x + Utils.rand(-4, 4), -(CONFIG.canalWidth / 2 + 5), Utils.rand(0.85, 1.15)));
    if (Math.random() > 0.4) group.add(createPalm(x + Utils.rand(-4, 4), (CONFIG.canalWidth / 2 + 5), Utils.rand(0.85, 1.15)));
  }
  
  // أشجار على الشوارع
  var count = 0;
  for (var i = 0; i < ROADS_DATA.length && count < QUALITY.treeCount; i++) {
    var rd = ROADS_DATA[i];
    if (rd.width < 13) continue;
    var trees = Math.floor(rd.length / 50);
    for (var j = 0; j < trees && count < QUALITY.treeCount; j++) {
      var off = -rd.length / 2 + j * 50 + 25;
      var s = Math.random() > 0.5 ? 1 : -1;
      var so = s * (rd.width / 2 + CONFIG.sidewalkWidth + 2);
      var tx = rd.x + Math.sin(rd.rotation) * off + Math.cos(rd.rotation) * so;
      var tz = rd.z + Math.cos(rd.rotation) * off - Math.sin(rd.rotation) * so;
      if (Math.abs(tz) > CONFIG.canalWidth / 2 + 7) {
        group.add(createTree(tx, tz, Utils.rand(0.85, 1.15)));
        count++;
      }
    }
  }
  
  scene.add(group);
}

/* ============================================================
   المباني
   ============================================================ */
function isOnRoad(x, z, pad) {
  pad = pad || 0;
  for (var i = 0; i < ROADS_DATA.length; i++) {
    var r = ROADS_DATA[i];
    var hw = r.width / 2 + CONFIG.sidewalkWidth + pad;
    var hl = r.length / 2 + pad;
    var dx = x - r.x, dz = z - r.z;
    var c = Math.cos(-r.rotation), s = Math.sin(-r.rotation);
    var lx = dx * c - dz * s, lz = dx * s + dz * c;
    if (Math.abs(lx) < hw && Math.abs(lz) < hl) return true;
  }
  return false;
}

function isNearLandmark(x, z) {
  for (var i = 0; i < DESTINATIONS_DATA.length; i++) {
    var d = DESTINATIONS_DATA[i];
    if (Math.abs(x - d.x) < 25 && Math.abs(z - d.z) < 25) return true;
  }
  return false;
}

function createBuildings() {
  var group = new THREE.Group();
  var grid = 45;
  var half = CONFIG.citySize / 2;
  var buildings = [];
  
  for (var gx = -half; gx < half; gx += grid) {
    for (var gz = -half; gz < half; gz += grid) {
      var x = gx + grid / 2, z = gz + grid / 2;
      
      if (isOnRoad(x, z, 4)) continue;
      if (Math.abs(z) < CONFIG.canalWidth / 2 + 8) continue;
      if (Math.abs(x + 280) < 15) continue;
      if (Math.abs(x) < 18 && Math.abs(z) < 20) continue;
      if (isNearLandmark(x, z)) continue;
      if (Math.random() > QUALITY.buildingDensity) continue;
      
      buildings.push({
        x: x, z: z,
        w: Utils.rand(11, 18),
        d: Utils.rand(11, 18),
        h: Utils.rand(7, 22),
        matIdx: Math.floor(Math.random() * MAT.buildingWall.length),
      });
    }
  }
  
  // تجميع بـ InstancedMesh
  var boxGeo = new THREE.BoxGeometry(1, 1, 1);
  var byMat = {};
  for (var i = 0; i < buildings.length; i++) {
    var b = buildings[i];
    if (!byMat[b.matIdx]) byMat[b.matIdx] = [];
    byMat[b.matIdx].push(b);
  }
  
  for (var idx in byMat) {
    var arr = byMat[idx];
    var inst = new THREE.InstancedMesh(boxGeo, MAT.buildingWall[idx], arr.length);
    var m = new THREE.Matrix4();
    for (var i = 0; i < arr.length; i++) {
      var b = arr[i];
      m.makeScale(b.w, b.h, b.d);
      m.setPosition(b.x, b.h / 2, b.z);
      inst.setMatrixAt(i, m);
    }
    inst.instanceMatrix.needsUpdate = true;
    if (QUALITY.shadows) { inst.castShadow = true; inst.receiveShadow = true; }
    group.add(inst);
  }
  
  scene.add(group);
}

/* ============================================================
   المعالم الحقيقية
   ============================================================ */
function createMosqueAlThawra(x, z) {
  var g = new THREE.Group();
  
  // المبنى الرئيسي
  var base = new THREE.Mesh(new THREE.BoxGeometry(16, 10, 16), MAT.mosqueWall);
  base.position.y = 5;
  if (QUALITY.shadows) base.castShadow = true;
  g.add(base);
  
  // القبة الرئيسية
  var dome = new THREE.Mesh(new THREE.SphereGeometry(5, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2), MAT.mosqueDome);
  dome.position.y = 10;
  if (QUALITY.shadows) dome.castShadow = true;
  g.add(dome);
  
  // رأس القبة
  var finial = new THREE.Mesh(new THREE.ConeGeometry(0.6, 2, 8), MAT.mosqueGold);
  finial.position.y = 15.5;
  if (QUALITY.shadows) finial.castShadow = true;
  g.add(finial);
  
  // مآذن
  for (var s = -1; s <= 1; s += 2) {
    var minaret = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 20, 8), MAT.mosqueWall);
    minaret.position.set(s * 9, 10, 0);
    if (QUALITY.shadows) minaret.castShadow = true;
    g.add(minaret);
    
    var mTop = new THREE.Mesh(new THREE.ConeGeometry(1.3, 3, 8), MAT.mosqueDome);
    mTop.position.set(s * 9, 21.5, 0);
    if (QUALITY.shadows) mTop.castShadow = true;
    g.add(mTop);
    
    var mFinial = new THREE.Mesh(new THREE.ConeGeometry(0.4, 1.5, 6), MAT.mosqueGold);
    mFinial.position.set(s * 9, 23.5, 0);
    g.add(mFinial);
  }
  
  // أبواب ونوافذ
  var doorMat = new THREE.MeshStandardMaterial({ color: 0x5a3a20, roughness: 0.8 });
  var door = new THREE.Mesh(new THREE.BoxGeometry(2, 4, 0.3), doorMat);
  door.position.set(0, 2, 8);
  g.add(door);
  
  g.position.set(x, 0, z);
  return g;
}

function createStation(x, z) {
  var g = new THREE.Group();
  
  // المبنى الرئيسي
  var main = new THREE.Mesh(new THREE.BoxGeometry(28, 8, 12), MAT.stationWall);
  main.position.y = 4;
  if (QUALITY.shadows) main.castShadow = true;
  g.add(main);
  
  // السقف
  var roof = new THREE.Mesh(new THREE.BoxGeometry(30, 0.6, 14), MAT.stationRoof);
  roof.position.y = 8.3;
  if (QUALITY.shadows) roof.castShadow = true;
  g.add(roof);
  
  // برج الساعة
  var tower = new THREE.Mesh(new THREE.BoxGeometry(4.5, 14, 4.5), MAT.stationWall);
  tower.position.set(10, 11, 0);
  if (QUALITY.shadows) tower.castShadow = true;
  g.add(tower);
  
  var towerRoof = new THREE.Mesh(new THREE.ConeGeometry(3, 3, 4), MAT.stationRoof);
  towerRoof.position.set(10, 19.5, 0);
  towerRoof.rotation.y = Math.PI / 4;
  if (QUALITY.shadows) towerRoof.castShadow = true;
  g.add(towerRoof);
  
  // الساعة
  var clockFace = new THREE.Mesh(new THREE.CircleGeometry(1.5, 20), new THREE.MeshBasicMaterial({ color: 0xffffff }));
  clockFace.position.set(10, 15, 2.3);
  g.add(clockFace);
  
  var clockHand1 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1, 0.05), new THREE.MeshBasicMaterial({ color: 0x000000 }));
  clockHand1.position.set(10, 15.5, 2.31);
  g.add(clockHand1);
  
  var clockHand2 = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.1, 0.05), new THREE.MeshBasicMaterial({ color: 0x000000 }));
  clockHand2.position.set(10.35, 15, 2.31);
  g.add(clockHand2);
  
  // نوافذ
  for (var i = -10; i <= 10; i += 5) {
    var win = new THREE.Mesh(new THREE.BoxGeometry(2.5, 3, 0.15), MAT.window);
    win.position.set(i, 4.5, 6.05);
    g.add(win);
  }
  
  g.position.set(x, 0, z);
  return g;
}

function createFactory(x, z) {
  var g = new THREE.Group();
  
  // المبنى الرئيسي
  var main = new THREE.Mesh(new THREE.BoxGeometry(42, 14, 32), MAT.factoryWall);
  main.position.y = 7;
  if (QUALITY.shadows) main.castShadow = true;
  g.add(main);
  
  // مداخن
  for (var i = 0; i < 3; i++) {
    var chimney = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.8, 25, 10), MAT.factoryChimney);
    chimney.position.set(-12 + i * 12, 19.5, -12);
    if (QUALITY.shadows) chimney.castShadow = true;
    g.add(chimney);
    
    // حلقة حمراء
    var band = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 0.8), new THREE.MeshStandardMaterial({ color: 0xcc0000 }));
    band.position.set(-12 + i * 12, 28, -12);
    g.add(band);
  }
  
  // نوافذ صناعية
  for (var i = 0; i < 10; i++) {
    var w = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 0.15), MAT.window);
    w.position.set(-18 + i * 4, 5, 16.05);
    g.add(w);
    
    var w2 = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 0.15), MAT.window);
    w2.position.set(-18 + i * 4, 10, 16.05);
    g.add(w2);
  }
  
  g.position.set(x, 0, z);
  return g;
}

function createHospital(x, z) {
  var g = new THREE.Group();
  
  // المبنى الرئيسي
  var main = new THREE.Mesh(new THREE.BoxGeometry(28, 14, 20), MAT.hospitalWall);
  main.position.y = 7;
  if (QUALITY.shadows) main.castShadow = true;
  g.add(main);
  
  // برج طبي
  var tower = new THREE.Mesh(new THREE.BoxGeometry(12, 20, 12), MAT.hospitalWall);
  tower.position.set(-5, 10, 0);
  if (QUALITY.shadows) tower.castShadow = true;
  g.add(tower);
  
  // الهلال الأحمر
  var crescent = new THREE.Mesh(
    new THREE.TorusGeometry(2.5, 0.6, 8, 16, Math.PI * 1.5),
    MAT.hospitalRed
  );
  crescent.position.set(0, 10, 10.1);
  crescent.rotation.z = -Math.PI / 2;
  g.add(crescent);
  
  // صليب أحمر
  var crossV = new THREE.Mesh(new THREE.BoxGeometry(0.8, 3, 0.2), MAT.hospitalRed);
  crossV.position.set(-5, 20, 6.1);
  g.add(crossV);
  
  var crossH = new THREE.Mesh(new THREE.BoxGeometry(3, 0.8, 0.2), MAT.hospitalRed);
  crossH.position.set(-5, 20, 6.1);
  g.add(crossH);
  
  g.position.set(x, 0, z);
  return g;
}

function createSouk(x, z) {
  var g = new THREE.Group();
  var colors = [0xe74c3c, 0x3498db, 0xf39c12, 0x2ecc71, 0x9b59b6, 0xe67e22, 0x1abc9c, 0xcc3333];
  
  // خيام السوق
  for (var i = 0; i < 12; i++) {
    var angle = (i / 12) * Math.PI * 2;
    var radius = 10;
    var cx = Math.cos(angle) * radius;
    var cz = Math.sin(angle) * radius;
    
    // كشك
    var stall = new THREE.Mesh(
      new THREE.BoxGeometry(3, 2.5, 3),
      new THREE.MeshStandardMaterial({ color: colors[i % colors.length], roughness: 0.85 })
    );
    stall.position.set(cx, 1.25, cz);
    if (QUALITY.shadows) stall.castShadow = true;
    g.add(stall);
    
    // مظلة
    var awning = new THREE.Mesh(
      new THREE.ConeGeometry(2.5, 1.8, 4),
      new THREE.MeshStandardMaterial({ color: 0xf0f0f0, roughness: 0.85 })
    );
    awning.position.set(cx, 3.4, cz);
    awning.rotation.y = Math.PI / 4;
    if (QUALITY.shadows) awning.castShadow = true;
    g.add(awning);
  }
  
  g.position.set(x, 0, z);
  return g;
}

function createSchool(x, z) {
  var g = new THREE.Group();
  
  var main = new THREE.Mesh(new THREE.BoxGeometry(24, 10, 16), MAT.schoolWall);
  main.position.y = 5;
  if (QUALITY.shadows) main.castShadow = true;
  g.add(main);
  
  var roof = new THREE.Mesh(new THREE.BoxGeometry(25, 0.5, 17), MAT.buildingRoof);
  roof.position.y = 10.25;
  g.add(roof);
  
  // نوافذ
  for (var i = -9; i <= 9; i += 3) {
    for (var f = 0; f < 3; f++) {
      var w = new THREE.Mesh(new THREE.BoxGeometry(1.8, 2, 0.15), MAT.window);
      w.position.set(i, 2 + f * 3, 8.05);
      g.add(w);
    }
  }
  
  g.position.set(x, 0, z);
  return g;
}

function createLandmarks() {
  var group = new THREE.Group();
  
  group.add(createStation(-250, -60));
  group.add(createMosqueAlThawra(-120, 200));
  group.add(createFactory(400, -300));
  group.add(createHospital(-550, 140));
  group.add(createSouk(100, 180));
  group.add(createSchool(-280, 350));
  
  scene.add(group);
}

/* ============================================================
   السيارات
   ============================================================ */
var cars = [];
function createCar(x, z, rot) {
  var car = new THREE.Group();
  var bodyMat = Utils.pick(MAT.carBody);
  
  var body = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.6, 3.8), bodyMat);
  body.position.y = 0.5;
  if (QUALITY.shadows) body.castShadow = true;
  car.add(body);
  
  var cabin = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.5, 1.8), bodyMat);
  cabin.position.set(0, 1.05, -0.2);
  if (QUALITY.shadows) cabin.castShadow = true;
  car.add(cabin);
  
  var windshield = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.4, 0.1), MAT.carGlass);
  windshield.position.set(0, 1.05, 0.7);
  car.add(windshield);
  
  var tireGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 10);
  for (var wx = -1; wx <= 1; wx += 2) {
    for (var wz = -1; wz <= 1; wz += 2) {
      var tire = new THREE.Mesh(tireGeo, MAT.carTire);
      tire.rotation.z = Math.PI / 2;
      tire.position.set(wx * 0.9, 0.3, wz * 1.2);
      car.add(tire);
    }
  }
  
  car.position.set(x, 0, z);
  car.rotation.y = rot;
  return car;
}

function createCars() {
  var group = new THREE.Group();
  
  for (var i = 0; i < QUALITY.carsCount; i++) {
    var rd = Utils.pick(ROADS_DATA);
    var off = Utils.rand(-rd.length / 2 + 30, rd.length / 2 - 30);
    var x = rd.x + Math.sin(rd.rotation) * off;
    var z = rd.z + Math.cos(rd.rotation) * off;
    
    var car = createCar(x, z, rd.rotation + (Math.random() > 0.5 ? 0 : Math.PI));
    car.userData = { road: rd, offset: off, speed: Utils.rand(2, 5), direction: Math.random() > 0.5 ? 1 : -1 };
    group.add(car);
    cars.push(car);
  }
  
  scene.add(group);
}

function updateCars(dt) {
  for (var i = 0; i < cars.length; i++) {
    var c = cars[i];
    var ud = c.userData;
    ud.offset += ud.speed * ud.direction * dt;
    
    if (ud.offset > ud.road.length / 2 - 20) { ud.direction = -1; c.rotation.y = ud.road.rotation + Math.PI; }
    if (ud.offset < -ud.road.length / 2 + 20) { ud.direction = 1; c.rotation.y = ud.road.rotation; }
    
    c.position.x = ud.road.x + Math.sin(ud.road.rotation) * ud.offset;
    c.position.z = ud.road.z + Math.cos(ud.road.rotation) * ud.offset;
  }
}

/* ============================================================
   الناس
   ============================================================ */
var people = [];
function createPerson(x, z, type) {
  var p = new THREE.Group();
  
  var shirtMat = Utils.pick(MAT.peopleShirt);
  var pantsMat = Utils.pick(MAT.peoplePants);
  var skinMat = Utils.pick(MAT.peopleSkin);
  
  var torso = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.65, 0.26), shirtMat);
  torso.position.y = 1.08;
  if (QUALITY.shadows) torso.castShadow = true;
  p.add(torso);
  
  var head = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 8), skinMat);
  head.position.y = 1.6;
  if (QUALITY.shadows) head.castShadow = true;
  p.add(head);
  
  var legs = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.75, 0.26), pantsMat);
  legs.position.y = 0.38;
  if (QUALITY.shadows) legs.castShadow = true;
  p.add(legs);
  
  var armGeo = new THREE.BoxGeometry(0.12, 0.55, 0.12);
  var armL = new THREE.Mesh(armGeo, shirtMat);
  armL.position.set(-0.27, 1.08, 0);
  p.add(armL);
  
  var armR = new THREE.Mesh(armGeo, shirtMat);
  armR.position.set(0.27, 1.08, 0);
  p.add(armR);
  
  p.position.set(x, 0, z);
  p.userData = {
    type: type,
    direction: Math.random() * Math.PI * 2,
    speed: type === 'walker' ? Utils.rand(0.8, 1.5) : 0,
    walkPhase: Math.random() * Math.PI * 2,
    armL: armL,
    armR: armR,
    homeX: x,
    homeZ: z,
    wanderTimer: 0,
  };
  
  return p;
}

function createPeople() {
  var group = new THREE.Group();
  
  for (var i = 0; i < QUALITY.peopleCount; i++) {
    var rd = Utils.pick(ROADS_DATA);
    var off = Utils.rand(-rd.length / 2 + 30, rd.length / 2 - 30);
    var side = Math.random() > 0.5 ? 1 : -1;
    var so = side * (rd.width / 2 + CONFIG.sidewalkWidth / 2);
    
    var x = rd.x + Math.sin(rd.rotation) * off + Math.cos(rd.rotation) * so;
    var z = rd.z + Math.cos(rd.rotation) * off - Math.sin(rd.rotation) * so;
    
    if (Math.abs(z) < CONFIG.canalWidth / 2 + 4) continue;
    
    var person = createPerson(x, z, 'walker');
    group.add(person);
    people.push(person);
  }
  
  scene.add(group);
}

function updatePeople(dt) {
  for (var i = 0; i < people.length; i++) {
    var p = people[i];
    var ud = p.userData;
    
    ud.walkPhase += dt * 5;
    p.position.y = Math.abs(Math.sin(ud.walkPhase)) * 0.05;
    
    // حركة عشوائية
    ud.wanderTimer -= dt;
    if (ud.wanderTimer <= 0) {
      ud.direction += Utils.rand(-0.8, 0.8);
      ud.wanderTimer = Utils.rand(1, 3);
    }
    
    // ارجع للمنزل لو بعد كتير
    var dx = ud.homeX - p.position.x;
    var dz = ud.homeZ - p.position.z;
    var distFromHome = Math.hypot(dx, dz);
    if (distFromHome > 8) {
      ud.direction = Math.atan2(dz, dx);
    }
    
    p.position.x += Math.cos(ud.direction) * ud.speed * dt;
    p.position.z += Math.sin(ud.direction) * ud.speed * dt;
    p.rotation.y = -ud.direction + Math.PI / 2;
    
    if (ud.armL) ud.armL.rotation.x = Math.sin(ud.walkPhase) * 0.6;
    if (ud.armR) ud.armR.rotation.x = -Math.sin(ud.walkPhase) * 0.6;
  }
}

/* ============================================================
   التوك توك
   ============================================================ */
function createTukTuk() {
  var t = new THREE.Group();
  
  var yellow = new THREE.MeshStandardMaterial({ color: 0xffc800, roughness: 0.35, metalness: 0.35 });
  var yellowDark = new THREE.MeshStandardMaterial({ color: 0xe6a800, roughness: 0.4, metalness: 0.3 });
  var black = new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.7, metalness: 0.15 });
  var rubber = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.95 });
  var chrome = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.15, metalness: 0.95 });
  var hlMat = new THREE.MeshBasicMaterial({ color: 0xffffcc });
  var tlMat = new THREE.MeshBasicMaterial({ color: 0xff2222 });
  var seatMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.9 });
  var glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xaaddff, roughness: 0.05, metalness: 0.1,
    transmission: 0.9, transparent: true, opacity: 0.45, thickness: 0.05, ior: 1.5,
  });
  
  // الهيكل
  var chassis = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.12, 2.5), black);
  chassis.position.y = 0.42;
  if (QUALITY.shadows) chassis.castShadow = true;
  t.add(chassis);
  
  var floor = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.08, 2.3), black);
  floor.position.set(0, 0.52, 0);
  t.add(floor);
  
  // المقدمة
  var front = new THREE.Mesh(new THREE.BoxGeometry(1.28, 0.85, 1.1), yellow);
  front.position.set(0, 0.95, 0.7);
  if (QUALITY.shadows) front.castShadow = true;
  t.add(front);
  
  var hood = new THREE.Mesh(new THREE.BoxGeometry(1.28, 0.08, 0.45), yellowDark);
  hood.position.set(0, 1.38, 1.0);
  hood.rotation.x = -0.08;
  if (QUALITY.shadows) hood.castShadow = true;
  t.add(hood);
  
  var fender = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.22, 1.1), yellow);
  fender.position.set(0, 0.7, 1.15);
  if (QUALITY.shadows) fender.castShadow = true;
  t.add(fender);
  
  // الكابينة الخلفية
  var rear = new THREE.Mesh(new THREE.BoxGeometry(1.35, 1.5, 1.45), yellow);
  rear.position.set(0, 1.25, -0.6);
  if (QUALITY.shadows) rear.castShadow = true;
  t.add(rear);
  
  var stripe = new THREE.Mesh(new THREE.BoxGeometry(1.37, 0.08, 1.47), black);
  stripe.position.set(0, 1.32, -0.6);
  t.add(stripe);
  
  // السقف
  var roof = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.1, 2.65), black);
  roof.position.set(0, 2.1, 0);
  if (QUALITY.shadows) roof.castShadow = true;
  t.add(roof);
  
  var roofTrim = new THREE.Mesh(new THREE.BoxGeometry(1.47, 0.04, 2.67), chrome);
  roofTrim.position.set(0, 2.05, 0);
  t.add(roofTrim);
  
  // الأعمدة
  var pillarGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.8, 6);
  var positions = [
    [-0.65, 1.2, -1.28], [0.65, 1.2, -1.28],
    [-0.65, 1.2, -0.05], [0.65, 1.2, -0.05],
    [-0.65, 1.2, 1.1], [0.65, 1.2, 1.1],
  ];
  for (var i = 0; i < positions.length; i++) {
    var pi = new THREE.Mesh(pillarGeo, black);
    pi.position.set(positions[i][0], positions[i][1], positions[i][2]);
    t.add(pi);
  }
  
  // الزجاج
  var windshield = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.85, 0.04), glassMat);
  windshield.position.set(0, 1.82, 1.22);
  windshield.rotation.x = -0.1;
  t.add(windshield);
  
  for (var s = -1; s <= 1; s += 2) {
    var sg = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.8, 0.95), glassMat);
    sg.position.set(s * 0.66, 1.78, 0.65);
    t.add(sg);
    
    var rg = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.95, 1.3), glassMat);
    rg.position.set(s * 0.68, 1.7, -0.6);
    t.add(rg);
  }
  
  var rearGlass = new THREE.Mesh(new THREE.BoxGeometry(1.28, 1, 0.04), glassMat);
  rearGlass.position.set(0, 1.7, -1.34);
  t.add(rearGlass);
  
  // الشبكة
  var grill = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.3, 0.05), chrome);
  grill.position.set(0, 0.95, 1.28);
  t.add(grill);
  
  // المصابيح
  var hlGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.08, 12);
  for (var s = -1; s <= 1; s += 2) {
    var hl = new THREE.Mesh(hlGeo, chrome);
    hl.rotation.x = Math.PI / 2;
    hl.position.set(s * 0.42, 1.15, 1.26);
    t.add(hl);
    
    var hlg = new THREE.Mesh(hlGeo, hlMat);
    hlg.rotation.x = Math.PI / 2;
    hlg.position.set(s * 0.42, 1.15, 1.29);
    t.add(hlg);
  }
  
  var tlGeo = new THREE.BoxGeometry(0.12, 0.2, 0.05);
  for (var s = -1; s <= 1; s += 2) {
    var tl = new THREE.Mesh(tlGeo, tlMat);
    tl.position.set(s * 0.5, 0.9, -1.35);
    t.add(tl);
  }
  
  // المقود
  var steering = new THREE.Group();
  var ring = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.02, 6, 16), black);
  steering.add(ring);
  for (var i = 0; i < 3; i++) {
    var sp = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.13, 0.015), black);
    sp.rotation.z = (i / 3) * Math.PI * 2;
    steering.add(sp);
  }
  steering.position.set(0, 1.48, 0.85);
  steering.rotation.x = -0.35;
  t.add(steering);
  
  // لوحة القيادة
  var dash = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.2, 0.3), black);
  dash.position.set(0, 1.28, 1.0);
  t.add(dash);
  
  // المقاعد
  var seatD = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.1, 0.45), seatMat);
  seatD.position.set(0, 0.78, 0.35);
  t.add(seatD);
  
  var seatR = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.1, 0.5), seatMat);
  seatR.position.set(0, 0.78, -0.7);
  t.add(seatR);
  
  var seatBack = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.55, 0.08), seatMat);
  seatBack.position.set(0, 1.1, -1.0);
  t.add(seatBack);
  
  // العجلات
  var wheels = [];
  function makeWheel(x, z, isFront) {
    var wg = new THREE.Group();
    wg.userData.isFront = isFront;
    
    var tire = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.1, 8, 16), rubber);
    tire.rotation.y = Math.PI / 2;
    if (QUALITY.shadows) tire.castShadow = true;
    wg.add(tire);
    
    var rim = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.12, 8), chrome);
    rim.rotation.z = Math.PI / 2;
    wg.add(rim);
    
    wg.position.set(x, 0.24, z);
    t.add(wg);
    wheels.push(wg);
    return wg;
  }
  
  makeWheel(0, 1.15, true);
  makeWheel(-0.6, -0.8, false);
  makeWheel(0.6, -0.8, false);
  
  t.userData = { wheels: wheels, steeringWheel: steering };
  return t;
}

var tukTuk = createTukTuk();
tukTuk.position.set(0, 0, 180);
scene.add(tukTuk);

/* ============================================================
   حالة اللاعب
   ============================================================ */
var player = {
  speed: 0, steering: 0, currentWheelAngle: 0,
  engineOn: true, handbrake: false,
  hasPassenger: false, currentPassenger: null, tripStartTime: 0,
};

var cameraOffset = { distance: 6.5, height: 3, lookAtHeight: 1.3 };

function updateCamera(dt) {
  var fwd = new THREE.Vector3(Math.sin(tukTuk.rotation.y), 0, Math.cos(tukTuk.rotation.y));
  var target = tukTuk.position.clone().sub(fwd.multiplyScalar(cameraOffset.distance));
  target.y = cameraOffset.height;
  
  camera.position.lerp(target, 1 - Math.pow(0.001, dt));
  
  var look = tukTuk.position.clone();
  look.y += cameraOffset.lookAtHeight;
  camera.lookAt(look);
  
  var sr = Math.min(Math.abs(player.speed) / CONFIG.maxSpeed, 1);
  camera.rotation.z = -player.steering * 0.02 * sr;
}

/* ============================================================
   المدخلات
   ============================================================ */
var keys = {};

document.addEventListener('keydown', function(e) {
  keys[e.code] = true;
  if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].indexOf(e.code) !== -1) e.preventDefault();
  if (e.code === 'Space') player.handbrake = true;
  if (e.code === 'KeyE') {
    player.engineOn = !player.engineOn;
    AudioSystem.setEngine(player.engineOn);
    UI.showToast(player.engineOn ? '🔊 المحرك شغّال' : '🔇 المحرك مطفأ', 1000);
  }
});

document.addEventListener('keyup', function(e) {
  keys[e.code] = false;
  if (e.code === 'Space') player.handbrake = false;
});

var mobileInput = { accel: false, brake: false, left: false, right: false };

function setupMobileButtons() {
  var buttons = { btnAccel: 'accel', btnBrake: 'brake', btnLeft: 'left', btnRight: 'right' };
  
  Object.keys(buttons).forEach(function(id) {
    var el = document.getElementById(id);
    if (!el) return;
    var key = buttons[id];
    
    var press = function(e) { e.preventDefault(); e.stopPropagation(); mobileInput[key] = true; el.classList.add('pressed'); };
    var release = function(e) { e.preventDefault(); e.stopPropagation(); mobileInput[key] = false; el.classList.remove('pressed'); };
    
    el.addEventListener('touchstart', press, { passive: false });
    el.addEventListener('touchend', release, { passive: false });
    el.addEventListener('touchcancel', release, { passive: false });
    el.addEventListener('mousedown', press);
    el.addEventListener('mouseup', release);
    el.addEventListener('mouseleave', release);
  });
  
  var hb = document.getElementById('btnHandbrake');
  if (hb) {
    hb.addEventListener('touchstart', function(e) { e.preventDefault(); player.handbrake = true; hb.classList.add('pressed'); }, { passive: false });
    hb.addEventListener('touchend', function(e) { e.preventDefault(); player.handbrake = false; hb.classList.remove('pressed'); }, { passive: false });
    hb.addEventListener('mousedown', function(e) { e.preventDefault(); player.handbrake = true; hb.classList.add('pressed'); });
    hb.addEventListener('mouseup', function(e) { e.preventDefault(); player.handbrake = false; hb.classList.remove('pressed'); });
  }
}

/* ============================================================
   الفيزياء
   ============================================================ */
function updateTukTukPhysics(dt) {
  if (!gameState.running || gameState.paused) return;
  
  var throttle = (keys['KeyW'] || keys['ArrowUp'] || mobileInput.accel) ? 1 : 0;
  var brake = (keys['KeyS'] || keys['ArrowDown'] || mobileInput.brake) ? 1 : 0;
  
  if (!player.engineOn) {
    player.speed *= (1 - 3 * dt);
    if (Math.abs(player.speed) < 0.1) player.speed = 0;
  } else if (player.handbrake) {
    player.speed *= (1 - 10 * dt);
    if (Math.abs(player.speed) < 0.1) player.speed = 0;
  } else {
    if (throttle && !brake) player.speed += CONFIG.acceleration * dt;
    else if (brake && !throttle) {
      if (player.speed > 0.5) player.speed -= CONFIG.braking * dt;
      else player.speed -= CONFIG.acceleration * 0.5 * dt;
    } else {
      if (player.speed > 0) { player.speed -= CONFIG.friction * dt * 3; if (player.speed < 0.05) player.speed = 0; }
      else if (player.speed < 0) { player.speed += CONFIG.friction * dt * 3; if (player.speed > -0.05) player.speed = 0; }
    }
    player.speed = Utils.clamp(player.speed, -CONFIG.maxReverseSpeed, CONFIG.maxSpeed);
  }
  
  var l = (keys['KeyA'] || keys['ArrowLeft'] || mobileInput.left) ? 1 : 0;
  var r = (keys['KeyD'] || keys['ArrowRight'] || mobileInput.right) ? 1 : 0;
  var si = r - l;
  
  player.steering += (si - player.steering) * CONFIG.steeringSpeed * dt;
  player.steering = Utils.clamp(player.steering, -1, 1);
  if (si === 0) player.steering *= (1 - 2 * dt);
  
  var sr = Math.min(Math.abs(player.speed) / CONFIG.maxSpeed, 1);
  player.currentWheelAngle = player.steering * CONFIG.maxWheelAngle * (1 - sr * 0.55);
  
  if (Math.abs(player.speed) > 0.1) {
    var sf = Math.min(Math.abs(player.speed) / 7, 1.2);
    var dir = player.speed >= 0 ? 1 : -1;
    tukTuk.rotation.y -= player.currentWheelAngle * sf * dt * 3 * dir;
  }
  
  var fwd = new THREE.Vector3(Math.sin(tukTuk.rotation.y), 0, Math.cos(tukTuk.rotation.y));
  var vel = fwd.multiplyScalar(player.speed * dt);
  var np = tukTuk.position.clone().add(vel);
  
  var inCanalX = !(np.x > -13 && np.x < 13);
  var nearCanal = Math.abs(np.z) < CONFIG.canalWidth / 2 + 1.5;
  
  if (nearCanal && inCanalX) player.speed *= -0.25;
  else if (Math.abs(np.x) < CONFIG.citySize / 2 - 3 && Math.abs(np.z) < CONFIG.citySize / 2 - 3) tukTuk.position.copy(np);
  else player.speed *= -0.3;
  
  var wr = (player.speed * dt) / 0.24;
  for (var i = 0; i < tukTuk.userData.wheels.length; i++) {
    var w = tukTuk.userData.wheels[i];
    if (w.children[0]) w.children[0].rotation.x += wr;
    if (w.userData.isFront) w.rotation.y = player.currentWheelAngle;
  }
  
  tukTuk.userData.steeringWheel.rotation.z = -player.steering * Math.PI * 0.85;
  tukTuk.position.y = Math.max(0, Math.sin(performance.now() * 0.02) * 0.005 * (1 + sr));
}

/* ============================================================
   حالة اللعبة
   ============================================================ */
var gameState = {
  running: false, paused: false,
  money: 0, deliveries: 0, ratingSum: 0,
  timeLeft: CONFIG.gameDuration, lastTime: 0,
  spawnTimer: 0, elapsedTime: 0,
};

/* ============================================================
   الركاب
   ============================================================ */
var passengers = [];
var activeDestination = null;

function getPassengerSpawnPoint() {
  var candidates = [];
  for (var i = 0; i < ROADS_DATA.length; i++) {
    var rd = ROADS_DATA[i];
    if (rd.width < 13) continue;
    var steps = Math.floor(rd.length / 70);
    for (var j = 0; j < steps; j++) {
      var off = -rd.length / 2 + j * 70 + 35;
      var side = Math.random() > 0.5 ? 1 : -1;
      var so = side * (rd.width / 2 + CONFIG.sidewalkWidth / 2);
      var x = rd.x + Math.sin(rd.rotation) * off + Math.cos(rd.rotation) * so;
      var z = rd.z + Math.cos(rd.rotation) * off - Math.sin(rd.rotation) * so;
      if (Math.abs(z) < CONFIG.canalWidth / 2 + 4) continue;
      if (Math.abs(x + 280) < 8) continue;
      var dist = Math.hypot(x - tukTuk.position.x, z - tukTuk.position.z);
      if (dist < 50 || dist > 350) continue;
      candidates.push({ x: x, z: z });
    }
  }
  return candidates.length > 0 ? Utils.pick(candidates) : null;
}

function createPassengerMesh() {
  var g = new THREE.Group();
  var shirtMat = Utils.pick(MAT.peopleShirt);
  var skinMat = Utils.pick(MAT.peopleSkin);
  var pantsMat = Utils.pick(MAT.peoplePants);
  
  var torso = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.65, 0.28), shirtMat);
  torso.position.y = 1.1;
  if (QUALITY.shadows) torso.castShadow = true;
  g.add(torso);
  
  var head = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 8), skinMat);
  head.position.y = 1.6;
  if (QUALITY.shadows) head.castShadow = true;
  g.add(head);
  
  var legs = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.75, 0.28), pantsMat);
  legs.position.y = 0.4;
  if (QUALITY.shadows) legs.castShadow = true;
  g.add(legs);
  
  // هالة خضراء واضحة
  var ringGeo = new THREE.RingGeometry(0.6, 0.9, 24);
  var ringMat = new THREE.MeshBasicMaterial({ color: 0x00ff88, transparent: true, opacity: 0.85, side: THREE.DoubleSide });
  var ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.05;
  g.add(ring);
  g.userData.ring = ring;
  
  // عمود ضوء أخضر من الأرض
  var beamGeo = new THREE.CylinderGeometry(0.3, 0.8, 5, 12, 1, true);
  var beamMat = new THREE.MeshBasicMaterial({ color: 0x00ff88, transparent: true, opacity: 0.18, side: THREE.DoubleSide });
  var beam = new THREE.Mesh(beamGeo, beamMat);
  beam.position.y = 2.5;
  g.add(beam);
  g.userData.beam = beam;
  
  // سهم فوق الراس
  var arrowGeo = new THREE.ConeGeometry(0.35, 0.7, 4);
  var arrowMat = new THREE.MeshBasicMaterial({ color: 0x00ff88 });
  var arrow = new THREE.Mesh(arrowGeo, arrowMat);
  arrow.position.y = 2.6;
  arrow.rotation.x = Math.PI;
  g.add(arrow);
  g.userData.arrow = arrow;
  
  return g;
}

function spawnPassenger() {
  if (passengers.length >= CONFIG.maxPassengers) return;
  if (player.hasPassenger) return;
  
  var sp = getPassengerSpawnPoint();
  if (!sp) return;
  
  var dest;
  var attempts = 0;
  do { dest = Utils.pick(DESTINATIONS_DATA); attempts++; }
  while (attempts < 10 && passengers.some(function(p) { return p.destination.name === dest.name; }));
  
  var mesh = createPassengerMesh();
  mesh.position.set(sp.x, 0, sp.z);
  scene.add(mesh);
  
  passengers.push({ mesh: mesh, x: sp.x, z: sp.z, destination: dest, bobPhase: Math.random() * Math.PI * 2 });
  updateMissionUI();
}

function createDestinationMarker(dest) {
  var g = new THREE.Group();
  
  var ring = new THREE.Mesh(new THREE.RingGeometry(2.5, 3.8, 32), new THREE.MeshBasicMaterial({ color: dest.color, transparent: true, opacity: 0.75, side: THREE.DoubleSide }));
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.1;
  g.add(ring);
  
  var beam = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 2, 10, 14, 1, true), new THREE.MeshBasicMaterial({ color: dest.color, transparent: true, opacity: 0.28, side: THREE.DoubleSide }));
  beam.position.y = 5;
  g.add(beam);
  
  var icon = new THREE.Mesh(new THREE.SphereGeometry(0.8, 14, 14), new THREE.MeshBasicMaterial({ color: dest.color }));
  icon.position.y = 7.5;
  g.add(icon);
  
  var light = new THREE.PointLight(dest.color, 1.5, 15);
  light.position.y = 3;
  g.add(light);
  
  g.position.set(dest.x, 0, dest.z);
  g.userData = { destination: dest, startTime: performance.now(), icon: icon, beam: beam, ring: ring };
  return g;
}

function checkPassengerPickup() {
  if (player.hasPassenger) return;
  for (var i = passengers.length - 1; i >= 0; i--) {
    var p = passengers[i];
    if (Math.hypot(p.x - tukTuk.position.x, p.z - tukTuk.position.z) < 3.2) {
      var dest = p.destination;
      scene.remove(p.mesh);
      passengers.splice(i, 1);
      
      player.hasPassenger = true;
      player.currentPassenger = dest;
      player.tripStartTime = performance.now();
      
      activeDestination = createDestinationMarker(dest);
      scene.add(activeDestination);
      
      AudioSystem.playPickup();
      UI.showToast('✅ راكب صعد! → ' + dest.name, 2200);
      
      var rider = createPassengerMesh();
      rider.scale.set(0.75, 0.75, 0.75);
      rider.position.set(0, 0.35, -0.7);
      rider.userData.ring.visible = false;
      rider.userData.beam.visible = false;
      rider.userData.arrow.visible = false;
      tukTuk.add(rider);
      tukTuk.userData.passengerRider = rider;
      
      updateMissionUI();
      break;
    }
  }
}

function checkDelivery() {
  if (!player.hasPassenger || !activeDestination) return;
  var dest = activeDestination.userData.destination;
  if (Math.hypot(dest.x - tukTuk.position.x, dest.z - tukTuk.position.z) < 6) {
    var tripTime = (performance.now() - player.tripStartTime) / 1000;
    var reward = 60, rating = 3;
    if (tripTime < 30) { reward = 120; rating = 5; }
    else if (tripTime < 60) { reward = 100; rating = 4; }
    else if (tripTime < 90) { reward = 80; rating = 3; }
    
    gameState.timeLeft = Math.min(gameState.timeLeft + CONFIG.deliveryBonus, CONFIG.gameDuration);
    gameState.money += reward;
    gameState.deliveries++;
    gameState.ratingSum += rating;
    
    AudioSystem.playDelivery();
    UI.showToast('🎉 توصيل! +' + reward + ' جنيه +30 ثانية', 2400);
    
    scene.remove(activeDestination);
    activeDestination = null;
    
    if (tukTuk.userData.passengerRider) {
      tukTuk.remove(tukTuk.userData.passengerRider);
      tukTuk.userData.passengerRider = null;
    }
    
    player.hasPassenger = false;
    player.currentPassenger = null;
    gameState.spawnTimer = 1;
    
    updateHUD();
    updateMissionUI();
  }
}

function updateHUD() {
  UI.moneyValue.textContent = gameState.money;
  UI.deliveriesValue.textContent = gameState.deliveries;
  UI.timeValue.textContent = Utils.formatTime(gameState.timeLeft);
  if (gameState.timeLeft < 30) UI.timeValue.classList.add('warning');
  else UI.timeValue.classList.remove('warning');
  UI.speedValue.textContent = Math.round(Math.abs(player.speed) * 3.6 * 3.5);
}

function updateMissionUI() {
  if (player.hasPassenger && player.currentPassenger) {
    UI.missionPanel.textContent = '🎯 اوصل إلى: ' + player.currentPassenger.name;
    UI.missionPanel.style.borderRightColor = '#00ff88';
  } else if (passengers.length > 0) {
    UI.missionPanel.textContent = '👤 ' + passengers.length + ' راكب ينتظر (شوف الهالة الخضراء)';
    UI.missionPanel.style.borderRightColor = '#00ff88';
  } else {
    UI.missionPanel.textContent = '🔍 جاري البحث عن راكب...';
    UI.missionPanel.style.borderRightColor = '#ffc800';
  }
}

function updatePassengers(dt) {
  var now = performance.now();
  for (var i = 0; i < passengers.length; i++) {
    var p = passengers[i];
    p.bobPhase += dt * 3;
    if (p.mesh) {
      p.mesh.position.y = Math.sin(p.bobPhase) * 0.05;
      if (p.mesh.userData.ring) p.mesh.userData.ring.rotation.z += dt * 1;
      if (p.mesh.userData.arrow) {
        p.mesh.userData.arrow.position.y = 2.6 + Math.sin(now * 0.004 + p.bobPhase) * 0.2;
        p.mesh.userData.arrow.rotation.y += dt * 3;
      }
      if (p.mesh.userData.beam) p.mesh.userData.beam.material.opacity = 0.12 + Math.sin(now * 0.003 + p.bobPhase) * 0.08;
    }
  }
  
  if (activeDestination) {
    var ud = activeDestination.userData;
    var time = (now - ud.startTime) / 1000;
    var pulse = 1 + Math.sin(time * 3) * 0.12;
    ud.ring.scale.set(pulse, pulse, 1);
    ud.icon.rotation.y += dt * 2;
    ud.icon.position.y = 7.5 + Math.sin(time * 2) * 0.4;
  }
}

/* ============================================================
   الخريطة المصغرة
   ============================================================ */
var minimapCtx = UI.minimapCanvas.getContext('2d');
var minimapSize = 260;

function drawMinimap() {
  var ctx = minimapCtx;
  var size = minimapSize;
  var scale = size / CONFIG.citySize;
  
  // خلفية
  ctx.fillStyle = '#1a2a3a';
  ctx.fillRect(0, 0, size, size);
  
  // تحويل إحداثيات
  function toMap(x, z) {
    return {
      x: size / 2 + x * scale,
      y: size / 2 + z * scale,
    };
  }
  
  // الشوارع
  ctx.fillStyle = '#4a5a6a';
  for (var i = 0; i < ROADS_DATA.length; i++) {
    var rd = ROADS_DATA[i];
    var p = toMap(rd.x, rd.z);
    var w = rd.width * scale;
    var l = rd.length * scale;
    
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(rd.rotation);
    ctx.fillRect(-l / 2, -w / 2, l, w);
    ctx.restore();
  }
  
  // الترعة
  ctx.fillStyle = '#1a5a8a';
  var cTop = toMap(-CONFIG.citySize / 2, -CONFIG.canalWidth / 2);
  var cBot = toMap(-CONFIG.citySize / 2, CONFIG.canalWidth / 2);
  ctx.fillRect(cTop.x, cTop.y, CONFIG.citySize * scale, (cBot.y - cTop.y));
  
  // الوجهات
  for (var i = 0; i < DESTINATIONS_DATA.length; i++) {
    var d = DESTINATIONS_DATA[i];
    var p = toMap(d.x, d.z);
    ctx.fillStyle = '#' + d.color.toString(16).padStart(6, '0');
    ctx.beginPath();
    ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // الركاب (باللون الأخضر الفاتح)
  for (var i = 0; i < passengers.length; i++) {
    var p = toMap(passengers[i].x, passengers[i].z);
    ctx.fillStyle = '#00ff88';
    ctx.beginPath();
    ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
    ctx.stroke();
  }
  
  // الوجهة النشطة (في حال وجود راكب)
  if (activeDestination) {
    var p = toMap(activeDestination.userData.destination.x, activeDestination.userData.destination.z);
    ctx.fillStyle = '#ffff00';
    ctx.beginPath();
    ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffff00';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 10, 0, Math.PI * 2);
    ctx.stroke();
  }
  
  // التوك توك
  var p = toMap(tukTuk.position.x, tukTuk.position.z);
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(-tukTuk.rotation.y);
  
  // مثلث الاتجاه
  ctx.fillStyle = '#ffc800';
  ctx.beginPath();
  ctx.moveTo(0, -8);
  ctx.lineTo(-5, 6);
  ctx.lineTo(5, 6);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 1;
  ctx.stroke();
  
  ctx.restore();
}

/* ============================================================
   سهم يدلك على الهدف
   ============================================================ */
function updateDirectionArrow() {
  // نستخدم DOM في المستقبل، حالياً بالـ minimap يكفي
}

/* ============================================================
   الحلقة الرئيسية
   ============================================================ */
function animate() {
  requestAnimationFrame(animate);
  
  var now = performance.now();
  var dt = (now - gameState.lastTime) / 1000;
  gameState.lastTime = now;
  dt = Math.min(dt, 0.05);
  
  if (!gameState.running || gameState.paused) {
    renderer.render(scene, camera);
    return;
  }
  
  gameState.elapsedTime += dt;
  gameState.timeLeft -= dt;
  if (gameState.timeLeft <= 0) { gameState.timeLeft = 0; endGame(); return; }
  
  gameState.spawnTimer -= dt;
  if (gameState.spawnTimer <= 0) {
    if (passengers.length < CONFIG.maxPassengers && !player.hasPassenger) spawnPassenger();
    gameState.spawnTimer = 2 + Math.random() * 2;
  }
  
  updateTukTukPhysics(dt);
  checkPassengerPickup();
  checkDelivery();
  updateCamera(dt);
  updatePassengers(dt);
  updatePeople(dt);
  updateCars(dt);
  
  var isAcc = !!(keys['KeyW'] || keys['ArrowUp'] || mobileInput.accel);
  AudioSystem.updateEngine(Math.abs(player.speed), CONFIG.maxSpeed, isAcc);
  
  sunLight.position.set(tukTuk.position.x + 100, 200, tukTuk.position.z + 80);
  sunLight.target.position.copy(tukTuk.position);
  sunLight.target.updateMatrixWorld();
  
  updateHUD();
  drawMinimap();
  renderer.render(scene, camera);
}

/* ============================================================
   ملء الشاشة التلقائي
   ============================================================ */
function enterFullscreen() {
  var elem = document.documentElement;
  var promise = null;
  
  if (elem.requestFullscreen) promise = elem.requestFullscreen();
  else if (elem.webkitRequestFullscreen) promise = elem.webkitRequestFullscreen();
  else if (elem.msRequestFullscreen) promise = elem.msRequestFullscreen();
  
  if (promise && promise.catch) {
    promise.catch(function() { console.log('⚠️ ملء الشاشة اترفض'); });
  }
  
  // قفل اتجاه الشاشة للأفقي على الموبايل
  if (screen.orientation && screen.orientation.lock) {
    screen.orientation.lock('landscape').catch(function() {});
  }
}

function toggleFullscreen() {
  if (!document.fullscreenElement && !document.webkitFullscreenElement) {
    enterFullscreen();
    UI.fullscreenBtn.textContent = '⛶';
  } else {
    if (document.exitFullscreen) document.exitFullscreen();
    else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    UI.fullscreenBtn.textContent = '⛶';
  }
}

/* ============================================================
   بدء اللعبة
   ============================================================ */
var isInitialized = false;

async function startGame() {
  console.log('🎬 بدء اللعبة...');
  
  AudioSystem.init();
  AudioSystem.resume();
  
  // ملء الشاشة تلقائي
  enterFullscreen();
  
  if (isInitialized) {
    resetGame();
    gameState.running = true;
    gameState.paused = false;
    UI.startScreen.classList.add('hidden');
    UI.endScreen.classList.add('hidden');
    UI.hud.classList.add('visible');
    UI.missionPanel.classList.add('visible');
    UI.controls.classList.add('visible');
    UI.pauseBtn.style.display = 'flex';
    UI.fullscreenBtn.style.display = 'flex';
    
    if (player.engineOn) AudioSystem.setEngine(true);
    gameState.lastTime = performance.now();
    return;
  }
  
  UI.startBtn.disabled = true;
  UI.startBtn.textContent = '⏳ جاري التحميل...';
  
  try {
    await buildCity(function(pct, text) { UI.updateLoading(pct, text); });
    setupMobileButtons();
    isInitialized = true;
    
    resetGame();
    gameState.running = true;
    gameState.lastTime = performance.now();
    
    UI.startScreen.classList.add('hidden');
    UI.endScreen.classList.add('hidden');
    UI.hud.classList.add('visible');
    UI.missionPanel.classList.add('visible');
    UI.controls.classList.add('visible');
    UI.pauseBtn.style.display = 'flex';
    UI.fullscreenBtn.style.display = 'flex';
    
    if (player.engineOn) AudioSystem.setEngine(true);
    
    setTimeout(function() { spawnPassenger(); }, 500);
    setTimeout(function() { spawnPassenger(); }, 1500);
    
    UI.showToast('🛺 رحلة سعيدة!', 2000);
    UI.showHint('اتبع الهالة الخضراء عشان تلتقط الركاب', 6000);
    
    if (!animate.started) {
      animate.started = true;
      gameState.lastTime = performance.now();
      animate();
    }
    
    console.log('✅ اللعبة بدأت!');
  } catch (err) {
    console.error('❌', err);
    UI.showToast('حدث خطأ', 3000);
    UI.startBtn.disabled = false;
    UI.startBtn.textContent = '🚀 ابدأ الرحلة';
  }
}

async function buildCity(onProgress) {
  var steps = [
    { name: 'إنشاء الأرضية...', fn: createGround, w: 5 },
    { name: 'بناء ترعة المحمودية...', fn: createCanal, w: 10 },
    { name: 'رصف الشوارع...', fn: createRoads, w: 15 },
    { name: 'مد السكة الحديد...', fn: createRailway, w: 8 },
    { name: 'زراعة النخيل...', fn: createFoliage, w: 12 },
    { name: 'بناء المنازل...', fn: createBuildings, w: 20 },
    { name: 'بناء المعالم الشهيرة...', fn: createLandmarks, w: 15 },
    { name: 'إضافة السيارات...', fn: createCars, w: 5 },
    { name: 'ملء الشوارع بالناس...', fn: createPeople, w: 10 },
  ];
  
  var acc = 0;
  var total = steps.reduce(function(s, x) { return s + x.w; }, 0);
  
  for (var i = 0; i < steps.length; i++) {
    var step = steps[i];
    if (onProgress) onProgress(Math.round((acc / total) * 100), step.name);
    await new Promise(function(res) {
      requestAnimationFrame(function() { try { step.fn(); } catch (e) {} res(); });
    });
    acc += step.w;
  }
  if (onProgress) onProgress(100, 'جاهز! 🚀');
}

function resetGame() {
  gameState.money = 0;
  gameState.deliveries = 0;
  gameState.ratingSum = 0;
  gameState.timeLeft = CONFIG.gameDuration;
  gameState.spawnTimer = 1;
  gameState.elapsedTime = 0;
  gameState.paused = false;
  
  tukTuk.position.set(0, 0, 180);
  tukTuk.rotation.set(0, 0, 0);
  
  player.speed = 0;
  player.steering = 0;
  player.currentWheelAngle = 0;
  player.hasPassenger = false;
  player.currentPassenger = null;
  player.engineOn = true;
  player.handbrake = false;
  
  for (var i = 0; i < passengers.length; i++) scene.remove(passengers[i].mesh);
  passengers.length = 0;
  
  if (activeDestination) { scene.remove(activeDestination); activeDestination = null; }
  if (tukTuk.userData.passengerRider) { tukTuk.remove(tukTuk.userData.passengerRider); tukTuk.userData.passengerRider = null; }
  
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
  } else {
    UI.pauseBtn.textContent = '⏸️';
    UI.showToast('▶️ استمر!', 1000);
    if (player.engineOn) AudioSystem.setEngine(true);
  }
}

function endGame() {
  gameState.running = false;
  AudioSystem.setEngine(false);
  
  var avg = gameState.deliveries > 0 ? (gameState.ratingSum / gameState.deliveries).toFixed(1) : '0';
  
  UI.endTitle.textContent = gameState.deliveries > 0 ? '🎉 رحلة رائعة!' : '⏰ انتهى الوقت!';
  UI.endMoney.textContent = gameState.money + ' جنيه';
  UI.endDeliveries.textContent = gameState.deliveries;
  UI.endRating.textContent = avg + ' ⭐';
  UI.endScreen.classList.remove('hidden');
  UI.controls.classList.remove('visible');
  UI.pauseBtn.style.display = 'none';
  UI.fullscreenBtn.style.display = 'none';
}

/* ============================================================
   ربط الأزرار
   ============================================================ */
UI.startBtn.addEventListener('click', function(e) { e.preventDefault(); startGame(); });
UI.startBtn.addEventListener('touchstart', function(e) { e.preventDefault(); startGame(); }, { passive: false });
UI.restartBtn.addEventListener('click', function() { UI.endScreen.classList.add('hidden'); startGame(); });
UI.pauseBtn.addEventListener('click', togglePause);
UI.fullscreenBtn.addEventListener('click', toggleFullscreen);

document.addEventListener('keydown', function(e) {
  if (e.code === 'Escape' || e.code === 'KeyP') {
    if (gameState.running) togglePause();
  }
  if (e.code === 'KeyF') toggleFullscreen();
});

document.addEventListener('contextmenu', function(e) { e.preventDefault(); });

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', onResize);
window.addEventListener('orientationchange', function() {
  setTimeout(onResize, 300);
});

// كشف شاشة الدوران
function checkOrientation() {
  if (isMobile && window.innerHeight > window.innerWidth && window.innerWidth < 500) {
    UI.rotateScreen.classList.add('visible');
  } else {
    UI.rotateScreen.classList.remove('visible');
  }
}
window.addEventListener('resize', checkOrientation);
window.addEventListener('orientationchange', function() { setTimeout(checkOrientation, 300); });
checkOrientation();

console.log('🎮 اللعبة جاهزة!');

})();
