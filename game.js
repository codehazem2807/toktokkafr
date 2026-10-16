/* ============================================================
   🛺 توك توك كفر الدوار - النسخة الاحترافية النهائية
   منظور الشخص الثالث | ملء الشاشة | ناس | معالم حقيقية
   ============================================================ */

(function() {
'use strict';

console.log('🚀 بدء تحميل اللعبة...');

if (typeof THREE === 'undefined') {
  alert('فشل تحميل Three.js. تأكد من الاتصال بالإنترنت.');
  return;
}

/* ============================================================
   كشف الجهاز والجودة
   ============================================================ */
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  || (navigator.maxTouchPoints && navigator.maxTouchPoints > 2 && /MacIntel/.test(navigator.platform))
  || window.matchMedia('(pointer: coarse)').matches;

const isLowEnd = isMobile && (navigator.hardwareConcurrency || 2) <= 4;

console.log('📱 الجهاز:', isMobile ? 'موبايل' : 'كمبيوتر');
console.log('⚙️ الجودة:', isLowEnd ? 'منخفضة' : (isMobile ? 'متوسطة' : 'عالية'));

const QUALITY = {
  pixelRatio: isLowEnd ? 1 : (isMobile ? 1.4 : 2),
  shadows: !isLowEnd,
  shadowMapSize: isLowEnd ? 512 : (isMobile ? 1024 : 2048),
  fogFar: isLowEnd ? 500 : (isMobile ? 700 : 1200),
  treeCount: isLowEnd ? 30 : (isMobile ? 60 : 120),
  buildingDensity: isLowEnd ? 0.3 : (isMobile ? 0.5 : 0.7),
  peopleCount: isLowEnd ? 8 : (isMobile ? 15 : 30),
  enableWindows: !isLowEnd,
};

/* ============================================================
   الإعدادات
   ============================================================ */
const CONFIG = {
  citySize: 1600,
  canalWidth: 25,
  roadWidth: 22,
  sidewalkWidth: 3,
  maxSpeed: 15,
  maxReverseSpeed: 4,
  acceleration: 6.5,
  braking: 13,
  friction: 0.7,
  steeringSpeed: 3.2,
  maxWheelAngle: 0.55,
  gameDuration: 300,
  deliveryBonus: 30,
  maxPassengers: 2,
  peopleSpeed: 0.8,
};

const COLORS = {
  sky: 0x87CEEB,
  ground: 0x5a8a4a,
  road: 0x2a2a2a,
  roadLine: 0xffcc00,
  sidewalk: 0x9a9a9a,
  canal: 0x1a5a8a,
};

/* ============================================================
   المشهد
   ============================================================ */
const scene = new THREE.Scene();
scene.background = new THREE.Color(COLORS.sky);
scene.fog = new THREE.Fog(COLORS.sky, 80, QUALITY.fogFar);

const camera = new THREE.PerspectiveCamera(62, window.innerWidth / window.innerHeight, 0.3, QUALITY.fogFar + 800);

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
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
renderer.outputColorSpace = THREE.SRGBColorSpace;

/* ============================================================
   الإضاءة
   ============================================================ */
const sunLight = new THREE.DirectionalLight(0xfff5e0, 2.5);
sunLight.position.set(200, 300, 150);
sunLight.castShadow = QUALITY.shadows;

if (QUALITY.shadows) {
  sunLight.shadow.mapSize.width = QUALITY.shadowMapSize;
  sunLight.shadow.mapSize.height = QUALITY.shadowMapSize;
  sunLight.shadow.camera.near = 1;
  sunLight.shadow.camera.far = 400;
  sunLight.shadow.camera.left = -80;
  sunLight.shadow.camera.right = 80;
  sunLight.shadow.camera.top = 80;
  sunLight.shadow.camera.bottom = -80;
  sunLight.shadow.bias = -0.0005;
  sunLight.shadow.normalBias = 0.02;
}

scene.add(sunLight);
scene.add(sunLight.target);

scene.add(new THREE.AmbientLight(0x8899bb, 1.2));
scene.add(new THREE.HemisphereLight(0x87CEEB, 0x3a4a3a, 1.1));

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
  mobileControls: document.getElementById('mobileControls'),
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
  
  updateLoading: function(pct, text) {
    this.loadingFill.style.width = pct + '%';
    if (text) this.loadingText.textContent = text;
  },
  
  showToast: function(message, duration) {
    duration = duration || 1800;
    this.toast.textContent = message;
    this.toast.classList.add('show');
    clearTimeout(this._toastTimer);
    var self = this;
    this._toastTimer = setTimeout(function() { self.toast.classList.remove('show'); }, duration);
  },
  
  showHint: function(text, duration) {
    duration = duration || 5000;
    this.hint.textContent = text;
    this.hint.classList.remove('hidden');
    clearTimeout(this._hintTimer);
    var self = this;
    if (duration > 0) {
      this._hintTimer = setTimeout(function() { self.hint.classList.add('hidden'); }, duration);
    }
  },
};

/* ============================================================
   أدوات
   ============================================================ */
const Utils = {
  rand: function(min, max) { return Math.random() * (max - min) + min; },
  pick: function(arr) { return arr[Math.floor(Math.random() * arr.length)]; },
  formatTime: function(seconds) {
    var m = Math.floor(Math.max(0, seconds) / 60);
    var s = Math.floor(Math.max(0, seconds) % 60);
    return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
  },
  clamp: function(val, min, max) { return Math.max(min, Math.min(max, val)); },
};

/* ============================================================
   المواد - جودة عالية
   ============================================================ */
const MAT = {
  road: new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.95 }),
  roadLine: new THREE.MeshBasicMaterial({ color: 0xffcc00 }),
  sidewalk: new THREE.MeshStandardMaterial({ color: 0x9a9a9a, roughness: 0.85 }),
  ground: new THREE.MeshStandardMaterial({ color: 0x5a8a4a, roughness: 1 }),
  canal: new THREE.MeshStandardMaterial({ color: 0x1a5a8a, roughness: 0.1, metalness: 0.6, transparent: true, opacity: 0.9 }),
  treeTrunk: new THREE.MeshStandardMaterial({ color: 0x5a3a20, roughness: 0.95 }),
  treeLeaf: new THREE.MeshStandardMaterial({ color: 0x2d5a2d, roughness: 0.9 }),
  palmTrunk: new THREE.MeshStandardMaterial({ color: 0x8b6a3a, roughness: 0.95 }),
  palmLeaf: new THREE.MeshStandardMaterial({ color: 0x3a7a3a, roughness: 0.85, side: THREE.DoubleSide }),
  buildingWall: [
    new THREE.MeshStandardMaterial({ color: 0xc9b8a8, roughness: 0.8 }),
    new THREE.MeshStandardMaterial({ color: 0xa8927a, roughness: 0.8 }),
    new THREE.MeshStandardMaterial({ color: 0x8b7355, roughness: 0.85 }),
    new THREE.MeshStandardMaterial({ color: 0xd4c4a8, roughness: 0.75 }),
  ],
  buildingRoof: new THREE.MeshStandardMaterial({ color: 0x5a4a3a, roughness: 0.9 }),
  landmarkWall: new THREE.MeshStandardMaterial({ color: 0xe8dcc8, roughness: 0.7 }),
  landmarkRoof: new THREE.MeshStandardMaterial({ color: 0x8b6914, roughness: 0.6 }),
  streetLightPole: new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.4, metalness: 0.7 }),
  streetLightLamp: new THREE.MeshBasicMaterial({ color: 0xffffdd }),
  carBody: [
    new THREE.MeshStandardMaterial({ color: 0xcc3333, roughness: 0.3, metalness: 0.5 }),
    new THREE.MeshStandardMaterial({ color: 0x3366cc, roughness: 0.3, metalness: 0.5 }),
    new THREE.MeshStandardMaterial({ color: 0x33cc66, roughness: 0.3, metalness: 0.5 }),
    new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.3, metalness: 0.5 }),
    new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.3, metalness: 0.5 }),
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
  ],
  peoplePants: [
    new THREE.MeshStandardMaterial({ color: 0x2c3e50, roughness: 0.9 }),
    new THREE.MeshStandardMaterial({ color: 0x34495e, roughness: 0.9 }),
    new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.9 }),
  ],
  peopleSkin: [
    new THREE.MeshStandardMaterial({ color: 0xf5d5b0, roughness: 0.9 }),
    new THREE.MeshStandardMaterial({ color: 0xe0b890, roughness: 0.9 }),
    new THREE.MeshStandardMaterial({ color: 0xc89870, roughness: 0.9 }),
  ],
};

/* ============================================================
   الشوارع الحقيقية لكفر الدوار
   ============================================================ */
const ROADS_DATA = [
  // الشوارع الرئيسية
  { x: 0, z: -15, width: 22, length: 1600, rotation: 0, isMain: true },     // شارع أحمد عرابي
  { x: 0, z: 25, width: 18, length: 1600, rotation: 0 },                     // شارع بورسعيد
  { x: 280, z: 100, width: 18, length: 700, rotation: Math.PI / 2 },         // شارع الجيش
  { x: -350, z: 0, width: 16, length: 600, rotation: Math.PI / 2 },          // شارع الجمهورية
  { x: -120, z: 450, width: 15, length: 550, rotation: Math.PI / 2 },        // شارع جلال الدسوقي
  { x: -550, z: 100, width: 16, length: 450, rotation: Math.PI / 2 },        // شارع سيدي عبد القادر
  { x: 100, z: 350, width: 14, length: 500, rotation: Math.PI / 2 },         // شارع الحدائق
  { x: 500, z: 350, width: 14, length: 450, rotation: Math.PI / 2 },         // شارع المحور
  // شوارع ثانوية
  { x: -650, z: -350, width: 14, length: 350, rotation: 0 },
  { x: -250, z: -400, width: 14, length: 300, rotation: 0 },
  { x: 450, z: -250, width: 14, length: 350, rotation: 0 },
  { x: 750, z: -450, width: 14, length: 300, rotation: 0 },
  { x: -500, z: 550, width: 13, length: 350, rotation: Math.PI / 2 },
  { x: 180, z: 600, width: 13, length: 300, rotation: Math.PI / 2 },
  { x: 600, z: 500, width: 13, length: 350, rotation: Math.PI / 2 },
];

/* ============================================================
   الوجهات والمعالم الحقيقية
   ============================================================ */
const DESTINATIONS_DATA = [
  { name: 'محطة قطار كفر الدوار', x: -250, z: -60, color: 0x8b4513, icon: '🚂' },
  { name: 'مسجد الثورة', x: -120, z: 200, color: 0x16a085, icon: '🕌' },
  { name: 'شركة مصر للغزل والنسيج', x: 400, z: -350, color: 0x95a5a6, icon: '🏭' },
  { name: 'موقف عزيز المصري', x: 180, z: 70, color: 0xe74c3c, icon: '🚌' },
  { name: 'مجمع الميزانة', x: -150, z: -80, color: 0xf39c12, icon: '🚐' },
  { name: 'مجمع السعرانية', x: 400, z: 100, color: 0xe67e22, icon: '🚕' },
  { name: 'مستشفى كفر الدوار العام', x: -550, z: 140, color: 0x3498db, icon: '🏥' },
  { name: 'سوق الأربعاء', x: 100, z: 180, color: 0x9b59b6, icon: '🛒' },
  { name: 'كورنيش ترعة المحمودية', x: 550, z: -20, color: 0x2980b9, icon: '🌊' },
  { name: 'جامعة كفر الدوار', x: -450, z: -280, color: 0x8e44ad, icon: '🎓' },
  { name: 'شارع الجيش', x: 300, z: 200, color: 0xe74c3c, icon: '🏪' },
  { name: 'مدرسة صلاح سالم', x: -280, z: 350, color: 0xf39c12, icon: '🏫' },
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
      this.engineGain.gain.value = 0.04;
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
  
  updateEngine: function(speed, maxSpeed, isAccelerating) {
    if (!this.engineOsc || !this.engineGain || !this.ctx) return;
    var ratio = Math.min(Math.abs(speed) / maxSpeed, 1);
    this.engineOsc.frequency.setTargetAtTime(55 + ratio * 125, this.ctx.currentTime, 0.1);
    this.engineGain.gain.setTargetAtTime(0.03 + ratio * 0.1 + (isAccelerating ? 0.02 : 0), this.ctx.currentTime, 0.15);
  },
  
  playPickup: function() { if (this.enabled && this.ctx) this._tone(600, 900, 0.15, 0.15); },
  playDelivery: function() {
    if (!this.enabled || !this.ctx) return;
    var self = this;
    this._tone(523, 523, 0.1, 0.15);
    setTimeout(function() { self._tone(659, 659, 0.1, 0.15); }, 100);
    setTimeout(function() { self._tone(784, 784, 0.2, 0.15); }, 200);
  },
  
  _tone: function(startFreq, endFreq, duration, volume) {
    try {
      var osc = this.ctx.createOscillator();
      var gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(startFreq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(endFreq, this.ctx.currentTime + duration);
      gain.gain.setValueAtTime(volume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
      osc.connect(gain); gain.connect(this.ctx.destination);
      osc.start(); osc.stop(this.ctx.currentTime + duration);
    } catch (e) {}
  },
};

/* ============================================================
   بناء المدينة
   ============================================================ */
function createGround() {
  var geo = new THREE.PlaneGeometry(5000, 5000);
  var ground = new THREE.Mesh(geo, MAT.ground);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = QUALITY.shadows;
  scene.add(ground);
}

var canalRef = null;
function createCanal() {
  var group = new THREE.Group();
  
  // الماء
  var waterGeo = new THREE.PlaneGeometry(CONFIG.citySize * 1.3, CONFIG.canalWidth, 40, 4);
  var water = new THREE.Mesh(waterGeo, MAT.canal);
  water.rotation.x = -Math.PI / 2;
  water.position.y = -0.4;
  water.receiveShadow = QUALITY.shadows;
  group.add(water);
  group.userData.water = water;
  group.userData.basePos = waterGeo.attributes.position.array.slice();
  
  // الضفاف
  var bankMat = new THREE.MeshStandardMaterial({ color: 0x8b7355, roughness: 0.95 });
  for (var side = -1; side <= 1; side += 2) {
    var bank = new THREE.Mesh(new THREE.BoxGeometry(CONFIG.citySize * 1.3, 2, 3), bankMat);
    bank.position.set(0, 0.8, side * (CONFIG.canalWidth / 2 + 1.5));
    if (QUALITY.shadows) { bank.castShadow = true; bank.receiveShadow = true; }
    group.add(bank);
  }
  
  // الجسر
  var bridge = new THREE.Mesh(new THREE.BoxGeometry(28, 2.5, CONFIG.canalWidth + 18), new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.9 }));
  bridge.position.set(0, 1.5, 0);
  if (QUALITY.shadows) { bridge.castShadow = true; bridge.receiveShadow = true; }
  group.add(bridge);
  
  // درابزين
  var railMat = new THREE.MeshStandardMaterial({ color: 0xdddddd, roughness: 0.5, metalness: 0.4 });
  for (var side = -1; side <= 1; side += 2) {
    var rail = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1, CONFIG.canalWidth + 18), railMat);
    rail.position.set(side * 13, 3.2, 0);
    if (QUALITY.shadows) rail.castShadow = true;
    group.add(rail);
  }
  
  scene.add(group);
  canalRef = group;
}

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
    for (var side = -1; side <= 1; side += 2) {
      var sidewalk = new THREE.Mesh(new THREE.BoxGeometry(CONFIG.sidewalkWidth, 0.3, rd.length), MAT.sidewalk);
      var sideOffset = side * (rd.width / 2 + CONFIG.sidewalkWidth / 2);
      var dx = Math.cos(rd.rotation) * sideOffset;
      var dz = -Math.sin(rd.rotation) * sideOffset;
      sidewalk.position.set(rd.x + dx, 0.22, rd.z + dz);
      sidewalk.rotation.y = rd.rotation;
      sidewalk.receiveShadow = QUALITY.shadows;
      group.add(sidewalk);
    }
    
    // خطوط الطريق
    if (rd.width >= 18) {
      var markCount = Math.floor(rd.length / 30);
      for (var j = 0; j < markCount; j++) {
        var offset = -rd.length / 2 + j * 30 + 15;
        var mark = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.05, 8), MAT.roadLine);
        var mx = rd.x + Math.sin(rd.rotation) * offset;
        var mz = rd.z + Math.cos(rd.rotation) * offset;
        mark.position.set(mx, 0.18, mz);
        mark.rotation.y = rd.rotation;
        group.add(mark);
      }
    }
  }
  
  scene.add(group);
}

function createRailway() {
  var group = new THREE.Group();
  var railMat = new THREE.MeshStandardMaterial({ color: 0x808080, roughness: 0.4, metalness: 0.8 });
  var railX = -280;
  
  for (var side = -1; side <= 1; side += 2) {
    var rail = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.3, CONFIG.citySize), railMat);
    rail.position.set(railX + side * 1.2, 0.4, 0);
    if (QUALITY.shadows) rail.castShadow = true;
    group.add(rail);
  }
  
  var sleeperMat = new THREE.MeshStandardMaterial({ color: 0x4a3a2a, roughness: 1 });
  for (var z = -CONFIG.citySize / 2; z < CONFIG.citySize / 2; z += 4) {
    var sleeper = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.15, 0.3), sleeperMat);
    sleeper.position.set(railX, 0.28, z);
    group.add(sleeper);
  }
  
  scene.add(group);
}

function createTree(x, z, scale) {
  scale = scale || 1;
  var tree = new THREE.Group();
  
  var trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.15 * scale, 0.22 * scale, 2.2 * scale, 6), MAT.treeTrunk);
  trunk.position.y = 1.1 * scale;
  if (QUALITY.shadows) trunk.castShadow = true;
  tree.add(trunk);
  
  var leaf1 = new THREE.Mesh(new THREE.SphereGeometry(1.2 * scale, 7, 6), MAT.treeLeaf);
  leaf1.position.y = 2.8 * scale;
  if (QUALITY.shadows) leaf1.castShadow = true;
  tree.add(leaf1);
  
  var leaf2 = new THREE.Mesh(new THREE.SphereGeometry(0.9 * scale, 6, 5), MAT.treeLeaf);
  leaf2.position.set(0.5 * scale, 3.3 * scale, 0.3 * scale);
  tree.add(leaf2);
  
  tree.position.set(x, 0, z);
  return tree;
}

function createPalm(x, z, scale) {
  scale = scale || 1;
  var palm = new THREE.Group();
  
  var trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.14 * scale, 0.2 * scale, 5.5 * scale, 7), MAT.palmTrunk);
  trunk.position.y = 2.75 * scale;
  if (QUALITY.shadows) trunk.castShadow = true;
  palm.add(trunk);
  
  for (var i = 0; i < 6; i++) {
    var angle = (i / 6) * Math.PI * 2;
    var leaf = new THREE.Mesh(new THREE.PlaneGeometry(0.8 * scale, 3 * scale), MAT.palmLeaf);
    leaf.position.set(Math.cos(angle) * 0.4 * scale, 5.5 * scale, Math.sin(angle) * 0.4 * scale);
    leaf.rotation.z = Math.PI / 2.2;
    leaf.rotation.y = angle;
    palm.add(leaf);
  }
  
  palm.position.set(x, 0, z);
  return palm;
}

function createFoliage() {
  var group = new THREE.Group();
  
  // نخيل على الترعة
  var step = isLowEnd ? 60 : 40;
  for (var x = -CONFIG.citySize * 0.55; x < CONFIG.citySize * 0.55; x += step) {
    if (Math.random() > 0.4) group.add(createPalm(x + Utils.rand(-5, 5), -(CONFIG.canalWidth / 2 + 5), Utils.rand(0.85, 1.15)));
    if (Math.random() > 0.4) group.add(createPalm(x + Utils.rand(-5, 5), (CONFIG.canalWidth / 2 + 5), Utils.rand(0.85, 1.15)));
  }
  
  // أشجار على الشوارع
  var count = 0;
  for (var i = 0; i < ROADS_DATA.length && count < QUALITY.treeCount; i++) {
    var road = ROADS_DATA[i];
    if (road.width < 14) continue;
    var trees = Math.floor(road.length / 60);
    for (var j = 0; j < trees && count < QUALITY.treeCount; j++) {
      var offset = -road.length / 2 + j * 60 + 30;
      var side = Math.random() > 0.5 ? 1 : -1;
      var so = side * (road.width / 2 + CONFIG.sidewalkWidth + 2);
      var tx = road.x + Math.sin(road.rotation) * offset + Math.cos(road.rotation) * so;
      var tz = road.z + Math.cos(road.rotation) * offset - Math.sin(road.rotation) * so;
      if (Math.abs(tz) > CONFIG.canalWidth / 2 + 7) {
        group.add(createTree(tx, tz, Utils.rand(0.9, 1.2)));
        count++;
      }
    }
  }
  
  scene.add(group);
}

function isOnRoad(x, z, padding) {
  padding = padding || 0;
  for (var i = 0; i < ROADS_DATA.length; i++) {
    var road = ROADS_DATA[i];
    var halfW = road.width / 2 + CONFIG.sidewalkWidth + padding;
    var halfL = road.length / 2 + padding;
    var dx = x - road.x, dz = z - road.z;
    var cos = Math.cos(-road.rotation), sin = Math.sin(-road.rotation);
    var lx = dx * cos - dz * sin, lz = dx * sin + dz * cos;
    if (Math.abs(lx) < halfW && Math.abs(lz) < halfL) return true;
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
      if (Math.abs(x) < 18 && Math.abs(z) < 22) continue;
      if (Math.random() > QUALITY.buildingDensity) continue;
      
      buildings.push({
        x: x, z: z,
        w: Utils.rand(10, 18), d: Utils.rand(10, 18),
        h: Utils.rand(6, 20),
      });
    }
  }
  
  var boxGeo = new THREE.BoxGeometry(1, 1, 1);
  
  for (var c = 0; c < MAT.buildingWall.length; c++) {
    var filtered = buildings.filter(function(b, idx) { return idx % MAT.buildingWall.length === c; });
    if (filtered.length === 0) continue;
    
    var inst = new THREE.InstancedMesh(boxGeo, MAT.buildingWall[c], filtered.length);
    var matrix = new THREE.Matrix4();
    
    for (var i = 0; i < filtered.length; i++) {
      var b = filtered[i];
      matrix.makeScale(b.w, b.h, b.d);
      matrix.setPosition(b.x, b.h / 2, b.z);
      inst.setMatrixAt(i, matrix);
    }
    inst.instanceMatrix.needsUpdate = true;
    if (QUALITY.shadows) { inst.castShadow = true; inst.receiveShadow = true; }
    group.add(inst);
  }
  
  scene.add(group);
}

/* ============================================================
   معالم كفر الدوار الحقيقية (3D)
   ============================================================ */
function createLandmark(type, x, z) {
  var group = new THREE.Group();
  
  if (type === 'mosque') {
    // مسجد الثورة - قبة ومآذن
    var base = new THREE.Mesh(new THREE.BoxGeometry(14, 10, 14), MAT.landmarkWall);
    base.position.y = 5;
    if (QUALITY.shadows) base.castShadow = true;
    group.add(base);
    
    // قبة
    var dome = new THREE.Mesh(new THREE.SphereGeometry(5, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0x16a085, roughness: 0.5 }));
    dome.position.y = 10;
    if (QUALITY.shadows) dome.castShadow = true;
    group.add(dome);
    
    // مآذن
    for (var side = -1; side <= 1; side += 2) {
      var minaret = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 18, 8), MAT.landmarkWall);
      minaret.position.set(side * 8, 9, 0);
      if (QUALITY.shadows) minaret.castShadow = true;
      group.add(minaret);
      
      var top = new THREE.Mesh(new THREE.ConeGeometry(1.2, 3, 8), new THREE.MeshStandardMaterial({ color: 0x16a085 }));
      top.position.set(side * 8, 19.5, 0);
      if (QUALITY.shadows) top.castShadow = true;
      group.add(top);
    }
    
  } else if (type === 'station') {
    // محطة القطار
    var main = new THREE.Mesh(new THREE.BoxGeometry(30, 8, 12), MAT.landmarkWall);
    main.position.y = 4;
    if (QUALITY.shadows) main.castShadow = true;
    group.add(main);
    
    var roof = new THREE.Mesh(new THREE.BoxGeometry(32, 0.5, 14), MAT.landmarkRoof);
    roof.position.y = 8.5;
    if (QUALITY.shadows) roof.castShadow = true;
    group.add(roof);
    
    // برج الساعة
    var tower = new THREE.Mesh(new THREE.BoxGeometry(4, 14, 4), MAT.landmarkWall);
    tower.position.set(12, 11, 0);
    if (QUALITY.shadows) tower.castShadow = true;
    group.add(tower);
    
    var clockFace = new THREE.Mesh(new THREE.CircleGeometry(1.5, 16), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    clockFace.position.set(12, 15, 2.01);
    group.add(clockFace);
    
  } else if (type === 'factory') {
    // شركة مصر للغزل والنسيج
    var factory = new THREE.Mesh(new THREE.BoxGeometry(40, 12, 30), new THREE.MeshStandardMaterial({ color: 0x95a5a6, roughness: 0.85 }));
    factory.position.y = 6;
    if (QUALITY.shadows) factory.castShadow = true;
    group.add(factory);
    
    // مداخن
    for (var i = 0; i < 3; i++) {
      var chimney = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.5, 20, 8), new THREE.MeshStandardMaterial({ color: 0x7f8c8d, roughness: 0.9 }));
      chimney.position.set(-10 + i * 10, 16, -10);
      if (QUALITY.shadows) chimney.castShadow = true;
      group.add(chimney);
    }
    
  } else if (type === 'hospital') {
    // المستشفى العام
    var hospital = new THREE.Mesh(new THREE.BoxGeometry(25, 12, 18), new THREE.MeshStandardMaterial({ color: 0xe8e8e8, roughness: 0.8 }));
    hospital.position.y = 6;
    if (QUALITY.shadows) hospital.castShadow = true;
    group.add(hospital);
    
    // علامة الهلال الأحمر
    var crescent = new THREE.Mesh(new THREE.TorusGeometry(2, 0.4, 8, 16, Math.PI * 1.5), new THREE.MeshBasicMaterial({ color: 0xcc0000 }));
    crescent.position.set(0, 9, 9.1);
    group.add(crescent);
    
  } else if (type === 'souk') {
    // سوق الأربعاء - مظلات وخيام
    for (var i = 0; i < 8; i++) {
      var angle = (i / 8) * Math.PI * 2;
      var stall = new THREE.Mesh(new THREE.BoxGeometry(3, 2, 3), new THREE.MeshStandardMaterial({ color: Utils.pick([0xe74c3c, 0x3498db, 0xf39c12, 0x2ecc71]) }));
      stall.position.set(Math.cos(angle) * 8, 1, Math.sin(angle) * 8);
      if (QUALITY.shadows) stall.castShadow = true;
      group.add(stall);
      
      var awning = new THREE.Mesh(new THREE.ConeGeometry(2.5, 1.5, 4), new THREE.MeshStandardMaterial({ color: 0xdddddd }));
      awning.position.set(Math.cos(angle) * 8, 2.75, Math.sin(angle) * 8);
      awning.rotation.y = Math.PI / 4;
      group.add(awning);
    }
    
  } else if (type === 'school') {
    // مدرسة
    var school = new THREE.Mesh(new THREE.BoxGeometry(22, 8, 14), MAT.landmarkWall);
    school.position.y = 4;
    if (QUALITY.shadows) school.castShadow = true;
    group.add(school);
    
    var schoolRoof = new THREE.Mesh(new THREE.BoxGeometry(23, 0.5, 15), MAT.landmarkRoof);
    schoolRoof.position.y = 8.25;
    group.add(schoolRoof);
  }
  
  group.position.set(x, 0, z);
  return group;
}

function createLandmarks() {
  var group = new THREE.Group();
  var landmarkData = [
    { type: 'station', x: -250, z: -60 },
    { type: 'mosque', x: -120, z: 200 },
    { type: 'factory', x: 400, z: -350 },
    { type: 'hospital', x: -550, z: 140 },
    { type: 'souk', x: 100, z: 180 },
    { type: 'school', x: -280, z: 350 },
  ];
  
  for (var i = 0; i < landmarkData.length; i++) {
    var lm = landmarkData[i];
    group.add(createLandmark(lm.type, lm.x, lm.z));
  }
  
  scene.add(group);
}

/* ============================================================
   السيارات في الشوارع
   ============================================================ */
var cars = [];
function createCar(x, z, rotation) {
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
  
  // زجاج
  var windshield = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.4, 0.1), MAT.carGlass);
  windshield.position.set(0, 1.05, 0.7);
  car.add(windshield);
  
  // عجلات
  var tireGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 12);
  for (var wx = -1; wx <= 1; wx += 2) {
    for (var wz = -1; wz <= 1; wz += 2) {
      var tire = new THREE.Mesh(tireGeo, MAT.carTire);
      tire.rotation.z = Math.PI / 2;
      tire.position.set(wx * 0.9, 0.3, wz * 1.2);
      car.add(tire);
    }
  }
  
  car.position.set(x, 0, z);
  car.rotation.y = rotation;
  return car;
}

function createCars() {
  var group = new THREE.Group();
  
  for (var i = 0; i < 10; i++) {
    var road = Utils.pick(ROADS_DATA);
    var offset = Utils.rand(-road.length / 2 + 20, road.length / 2 - 20);
    var x = road.x + Math.sin(road.rotation) * offset;
    var z = road.z + Math.cos(road.rotation) * offset;
    
    var rotation = road.rotation;
    var car = createCar(x, z, rotation);
    car.userData = { road: road, offset: offset, speed: Utils.rand(0.5, 2) };
    group.add(car);
    cars.push(car);
  }
  
  scene.add(group);
}

/* ============================================================
   الناس في الشوارع
   ============================================================ */
var people = [];
function createPerson(x, z) {
  var person = new THREE.Group();
  
  var shirtMat = Utils.pick(MAT.peopleShirt);
  var pantsMat = Utils.pick(MAT.peoplePants);
  var skinMat = Utils.pick(MAT.peopleSkin);
  
  // الجسم
  var torso = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.6, 0.25), shirtMat);
  torso.position.y = 1.05;
  if (QUALITY.shadows) torso.castShadow = true;
  person.add(torso);
  
  // الرأس
  var head = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 8), skinMat);
  head.position.y = 1.55;
  if (QUALITY.shadows) head.castShadow = true;
  person.add(head);
  
  // الأرجل
  var legs = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.75, 0.25), pantsMat);
  legs.position.y = 0.38;
  if (QUALITY.shadows) legs.castShadow = true;
  person.add(legs);
  
  // الذراعين
  var armGeo = new THREE.BoxGeometry(0.12, 0.55, 0.12);
  var armL = new THREE.Mesh(armGeo, shirtMat);
  armL.position.set(-0.26, 1.05, 0);
  person.add(armL);
  
  var armR = new THREE.Mesh(armGeo, shirtMat);
  armR.position.set(0.26, 1.05, 0);
  person.add(armR);
  
  person.position.set(x, 0, z);
  person.userData = {
    speed: Utils.rand(-0.5, 0.5),
    direction: Math.random() * Math.PI * 2,
    walkPhase: Math.random() * Math.PI * 2,
    armL: armL, armR: armR,
  };
  
  return person;
}

function createPeople() {
  var group = new THREE.Group();
  
  for (var i = 0; i < QUALITY.peopleCount; i++) {
    var road = Utils.pick(ROADS_DATA);
    var offset = Utils.rand(-road.length / 2 + 30, road.length / 2 - 30);
    var side = Math.random() > 0.5 ? 1 : -1;
    var sideOffset = side * (road.width / 2 + CONFIG.sidewalkWidth / 2);
    
    var x = road.x + Math.sin(road.rotation) * offset + Math.cos(road.rotation) * sideOffset;
    var z = road.z + Math.cos(road.rotation) * offset - Math.sin(road.rotation) * sideOffset;
    
    if (Math.abs(z) < CONFIG.canalWidth / 2 + 5) continue;
    
    var person = createPerson(x, z);
    group.add(person);
    people.push(person);
  }
  
  scene.add(group);
}

function updatePeople(dt) {
  for (var i = 0; i < people.length; i++) {
    var p = people[i];
    var ud = p.userData;
    
    // حركة بسيطة
    ud.walkPhase += dt * 4;
    p.position.y = Math.abs(Math.sin(ud.walkPhase)) * 0.05;
    
    // دوران طفيف
    if (Math.random() < 0.01) {
      ud.direction += Utils.rand(-0.5, 0.5);
    }
    
    // تحرك بطيء
    if (ud.speed > 0.1) {
      var dx = Math.cos(ud.direction) * ud.speed * dt;
      var dz = Math.sin(ud.direction) * ud.speed * dt;
      p.position.x += dx;
      p.position.z += dz;
    }
    
    // تحريك الذراعين
    if (ud.armL) ud.armL.rotation.x = Math.sin(ud.walkPhase) * 0.5;
    if (ud.armR) ud.armR.rotation.x = -Math.sin(ud.walkPhase) * 0.5;
  }
}

/* ============================================================
   التوك توك - مفصّل وواقعي
   ============================================================ */
function createTukTuk() {
  var tukTuk = new THREE.Group();
  
  var yellowBody = new THREE.MeshStandardMaterial({ color: 0xffc800, roughness: 0.35, metalness: 0.3 });
  var yellowDark = new THREE.MeshStandardMaterial({ color: 0xe6a800, roughness: 0.4, metalness: 0.25 });
  var blackPart = new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.7, metalness: 0.15 });
  var rubberMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.95 });
  var chromeMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.15, metalness: 0.95 });
  var headlightMat = new THREE.MeshBasicMaterial({ color: 0xffffcc });
  var taillightMat = new THREE.MeshBasicMaterial({ color: 0xff2222 });
  var seatMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.9 });
  var glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xaaddff, roughness: 0.05, metalness: 0.1,
    transmission: 0.9, transparent: true, opacity: 0.45, thickness: 0.05, ior: 1.5,
  });
  
  // الهيكل السفلي
  var chassis = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.12, 2.5), blackPart);
  chassis.position.y = 0.42;
  if (QUALITY.shadows) chassis.castShadow = true;
  tukTuk.add(chassis);
  
  // أرضية
  var floor = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.08, 2.3), blackPart);
  floor.position.set(0, 0.52, 0);
  tukTuk.add(floor);
  
  // المقدمة
  var front = new THREE.Mesh(new THREE.BoxGeometry(1.28, 0.85, 1.1), yellowBody);
  front.position.set(0, 0.95, 0.7);
  if (QUALITY.shadows) front.castShadow = true;
  tukTuk.add(front);
  
  // غطاء أمامي
  var hood = new THREE.Mesh(new THREE.BoxGeometry(1.28, 0.08, 0.45), yellowDark);
  hood.position.set(0, 1.38, 1.0);
  hood.rotation.x = -0.08;
  if (QUALITY.shadows) hood.castShadow = true;
  tukTuk.add(hood);
  
  // رفرف أمامي
  var fender = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.22, 1.1), yellowBody);
  fender.position.set(0, 0.7, 1.15);
  if (QUALITY.shadows) fender.castShadow = true;
  tukTuk.add(fender);
  
  // الكابينة الخلفية
  var rear = new THREE.Mesh(new THREE.BoxGeometry(1.35, 1.5, 1.45), yellowBody);
  rear.position.set(0, 1.25, -0.6);
  if (QUALITY.shadows) rear.castShadow = true;
  tukTuk.add(rear);
  
  // خط أسود
  var stripe = new THREE.Mesh(new THREE.BoxGeometry(1.37, 0.08, 1.47), blackPart);
  stripe.position.set(0, 1.32, -0.6);
  tukTuk.add(stripe);
  
  // السقف
  var roof = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.1, 2.65), blackPart);
  roof.position.set(0, 2.1, 0);
  if (QUALITY.shadows) roof.castShadow = true;
  tukTuk.add(roof);
  
  // حافة السقف
  var roofTrim = new THREE.Mesh(new THREE.BoxGeometry(1.47, 0.04, 2.67), chromeMat);
  roofTrim.position.set(0, 2.05, 0);
  tukTuk.add(roofTrim);
  
  // الأعمدة
  var pillarGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.8, 6);
  var positions = [
    [-0.65, 1.2, -1.28], [0.65, 1.2, -1.28],
    [-0.65, 1.2, -0.05], [0.65, 1.2, -0.05],
    [-0.65, 1.2, 1.1], [0.65, 1.2, 1.1],
  ];
  for (var i = 0; i < positions.length; i++) {
    var pillar = new THREE.Mesh(pillarGeo, blackPart);
    pillar.position.set(positions[i][0], positions[i][1], positions[i][2]);
    tukTuk.add(pillar);
  }
  
  // الزجاج الأمامي
  var windshield = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.85, 0.04), glassMat);
  windshield.position.set(0, 1.82, 1.22);
  windshield.rotation.x = -0.1;
  tukTuk.add(windshield);
  
  // الزجاج الجانبي
  for (var side = -1; side <= 1; side += 2) {
    var sg = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.8, 0.95), glassMat);
    sg.position.set(side * 0.66, 1.78, 0.65);
    tukTuk.add(sg);
    
    var rg = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.95, 1.3), glassMat);
    rg.position.set(side * 0.68, 1.7, -0.6);
    tukTuk.add(rg);
  }
  
  // الزجاج الخلفي
  var rearGlass = new THREE.Mesh(new THREE.BoxGeometry(1.28, 1, 0.04), glassMat);
  rearGlass.position.set(0, 1.7, -1.34);
  tukTuk.add(rearGlass);
  
  // الشبكة
  var grill = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.3, 0.05), chromeMat);
  grill.position.set(0, 0.95, 1.28);
  tukTuk.add(grill);
  
  // المصابيح الأمامية
  var hlGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.08, 12);
  for (var side = -1; side <= 1; side += 2) {
    var hl = new THREE.Mesh(hlGeo, chromeMat);
    hl.rotation.x = Math.PI / 2;
    hl.position.set(side * 0.42, 1.15, 1.26);
    tukTuk.add(hl);
    
    var hlg = new THREE.Mesh(hlGeo, headlightMat);
    hlg.rotation.x = Math.PI / 2;
    hlg.position.set(side * 0.42, 1.15, 1.29);
    tukTuk.add(hlg);
  }
  
  // الفوانيس الخلفية
  var tlGeo = new THREE.BoxGeometry(0.12, 0.2, 0.05);
  for (var side = -1; side <= 1; side += 2) {
    var tl = new THREE.Mesh(tlGeo, taillightMat);
    tl.position.set(side * 0.5, 0.9, -1.35);
    tukTuk.add(tl);
  }
  
  // لوحة الأرقام
  var plate = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.15, 0.03), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 }));
  plate.position.set(0, 0.65, -1.36);
  tukTuk.add(plate);
  
  // المقود
  var steering = new THREE.Group();
  var ring = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.02, 6, 16), blackPart);
  steering.add(ring);
  for (var i = 0; i < 3; i++) {
    var spoke = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.13, 0.015), blackPart);
    spoke.rotation.z = (i / 3) * Math.PI * 2;
    steering.add(spoke);
  }
  steering.position.set(0, 1.48, 0.85);
  steering.rotation.x = -0.35;
  tukTuk.add(steering);
  
  // لوحة القيادة
  var dash = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.2, 0.3), blackPart);
  dash.position.set(0, 1.28, 1.0);
  tukTuk.add(dash);
  
  // عدادات
  var gaugeGeo = new THREE.CircleGeometry(0.05, 12);
  for (var i = 0; i < 3; i++) {
    var gauge = new THREE.Mesh(gaugeGeo, new THREE.MeshBasicMaterial({ color: 0x111111 }));
    gauge.position.set(-0.3 + i * 0.3, 1.32, 1.16);
    tukTuk.add(gauge);
  }
  
  // المرايا
  for (var side = -1; side <= 1; side += 2) {
    var stem = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.2), blackPart);
    stem.rotation.z = Math.PI / 3 * side;
    stem.position.set(side * 0.8, 1.85, 1.1);
    tukTuk.add(stem);
    
    var mirror = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.09, 0.02), chromeMat);
    mirror.position.set(side * 0.88, 1.95, 1.1);
    tukTuk.add(mirror);
  }
  
  // المقاعد
  var seatDriver = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.1, 0.45), seatMat);
  seatDriver.position.set(0, 0.78, 0.35);
  tukTuk.add(seatDriver);
  
  var rearSeat = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.1, 0.5), seatMat);
  rearSeat.position.set(0, 0.78, -0.7);
  tukTuk.add(rearSeat);
  
  var rearBack = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.55, 0.08), seatMat);
  rearBack.position.set(0, 1.1, -1.0);
  tukTuk.add(rearBack);
  
  // العجلات
  var wheels = [];
  
  function makeWheel(x, z, isFront) {
    var wg = new THREE.Group();
    wg.userData.isFront = isFront;
    
    var tire = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.1, 8, 16), rubberMat);
    tire.rotation.y = Math.PI / 2;
    if (QUALITY.shadows) tire.castShadow = true;
    wg.add(tire);
    
    var rim = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.12, 8), chromeMat);
    rim.rotation.z = Math.PI / 2;
    wg.add(rim);
    
    wg.position.set(x, 0.24, z);
    tukTuk.add(wg);
    wheels.push(wg);
    return wg;
  }
  
  makeWheel(0, 1.15, true);
  makeWheel(-0.6, -0.8, false);
  makeWheel(0.6, -0.8, false);
  
  tukTuk.userData = { wheels: wheels, steeringWheel: steering };
  return tukTuk;
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

var cameraOffset = { distance: 7, height: 3.2, lookAtHeight: 1.3 };

function updateCamera(dt) {
  var forward = new THREE.Vector3(Math.sin(tukTuk.rotation.y), 0, Math.cos(tukTuk.rotation.y));
  var targetPos = tukTuk.position.clone().sub(forward.multiplyScalar(cameraOffset.distance));
  targetPos.y = cameraOffset.height;
  
  camera.position.lerp(targetPos, 1 - Math.pow(0.001, dt));
  
  var lookTarget = tukTuk.position.clone();
  lookTarget.y += cameraOffset.lookAtHeight;
  camera.lookAt(lookTarget);
  
  var sr = Math.min(Math.abs(player.speed) / CONFIG.maxSpeed, 1);
  camera.rotation.z = -player.steering * 0.025 * sr;
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
  var buttons = { btnAccel: 'accel', btnBrake: 'brake', btnSteerLeft: 'left', btnSteerRight: 'right' };
  
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
   فيزياء التوك توك
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
    if (throttle && !brake) {
      player.speed += CONFIG.acceleration * dt;
    } else if (brake && !throttle) {
      if (player.speed > 0.5) player.speed -= CONFIG.braking * dt;
      else player.speed -= CONFIG.acceleration * 0.5 * dt;
    } else {
      if (player.speed > 0) { player.speed -= CONFIG.friction * dt * 3; if (player.speed < 0.05) player.speed = 0; }
      else if (player.speed < 0) { player.speed += CONFIG.friction * dt * 3; if (player.speed > -0.05) player.speed = 0; }
    }
    player.speed = Utils.clamp(player.speed, -CONFIG.maxReverseSpeed, CONFIG.maxSpeed);
  }
  
  var left = (keys['KeyA'] || keys['ArrowLeft'] || mobileInput.left) ? 1 : 0;
  var right = (keys['KeyD'] || keys['ArrowRight'] || mobileInput.right) ? 1 : 0;
  var steerInput = right - left;
  
  player.steering += (steerInput - player.steering) * CONFIG.steeringSpeed * dt;
  player.steering = Utils.clamp(player.steering, -1, 1);
  if (steerInput === 0) player.steering *= (1 - 2 * dt);
  
  var sr = Math.min(Math.abs(player.speed) / CONFIG.maxSpeed, 1);
  player.currentWheelAngle = player.steering * CONFIG.maxWheelAngle * (1 - sr * 0.55);
  
  if (Math.abs(player.speed) > 0.1) {
    var sf = Math.min(Math.abs(player.speed) / 7, 1.2);
    var dir = player.speed >= 0 ? 1 : -1;
    tukTuk.rotation.y -= player.currentWheelAngle * sf * dt * 3 * dir;
  }
  
  var forward = new THREE.Vector3(Math.sin(tukTuk.rotation.y), 0, Math.cos(tukTuk.rotation.y));
  var velocity = forward.multiplyScalar(player.speed * dt);
  var newPos = tukTuk.position.clone().add(velocity);
  
  var inCanalX = !(newPos.x > -14 && newPos.x < 14);
  var nearCanal = Math.abs(newPos.z) < CONFIG.canalWidth / 2 + 1.5;
  
  if (nearCanal && inCanalX) { player.speed *= -0.25; }
  else if (Math.abs(newPos.x) < CONFIG.citySize / 2 - 3 && Math.abs(newPos.z) < CONFIG.citySize / 2 - 3) {
    tukTuk.position.copy(newPos);
  } else { player.speed *= -0.3; }
  
  var wheelRoll = (player.speed * dt) / 0.24;
  for (var i = 0; i < tukTuk.userData.wheels.length; i++) {
    var w = tukTuk.userData.wheels[i];
    if (w.children[0]) w.children[0].rotation.x += wheelRoll;
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
    var road = ROADS_DATA[i];
    if (road.width < 14) continue;
    var steps = Math.floor(road.length / 80);
    for (var j = 0; j < steps; j++) {
      var offset = -road.length / 2 + j * 80 + 40;
      var side = Math.random() > 0.5 ? 1 : -1;
      var so = side * (road.width / 2 + CONFIG.sidewalkWidth / 2);
      var x = road.x + Math.sin(road.rotation) * offset + Math.cos(road.rotation) * so;
      var z = road.z + Math.cos(road.rotation) * offset - Math.sin(road.rotation) * so;
      if (Math.abs(z) < CONFIG.canalWidth / 2 + 4) continue;
      if (Math.abs(x + 280) < 8) continue;
      var dist = Math.hypot(x - tukTuk.position.x, z - tukTuk.position.z);
      if (dist < 60 || dist > 400) continue;
      candidates.push({ x: x, z: z });
    }
  }
  return candidates.length > 0 ? Utils.pick(candidates) : null;
}

function createPassengerMesh() {
  var group = new THREE.Group();
  var shirtMat = Utils.pick(MAT.peopleShirt);
  var skinMat = Utils.pick(MAT.peopleSkin);
  var pantsMat = Utils.pick(MAT.peoplePants);
  
  var torso = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.65, 0.28), shirtMat);
  torso.position.y = 1.1;
  if (QUALITY.shadows) torso.castShadow = true;
  group.add(torso);
  
  var head = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 8), skinMat);
  head.position.y = 1.6;
  if (QUALITY.shadows) head.castShadow = true;
  group.add(head);
  
  var legs = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.75, 0.28), pantsMat);
  legs.position.y = 0.4;
  if (QUALITY.shadows) legs.castShadow = true;
  group.add(legs);
  
  var ring = new THREE.Mesh(new THREE.RingGeometry(0.5, 0.75, 16), new THREE.MeshBasicMaterial({ color: 0x00ff88, transparent: true, opacity: 0.7, side: THREE.DoubleSide }));
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.05;
  group.add(ring);
  group.userData.ring = ring;
  
  return group;
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
  var group = new THREE.Group();
  
  var ring = new THREE.Mesh(new THREE.RingGeometry(2, 3, 24), new THREE.MeshBasicMaterial({ color: dest.color, transparent: true, opacity: 0.7, side: THREE.DoubleSide }));
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.1;
  group.add(ring);
  
  var beam = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 1.5, 8, 12, 1, true), new THREE.MeshBasicMaterial({ color: dest.color, transparent: true, opacity: 0.25, side: THREE.DoubleSide }));
  beam.position.y = 4;
  group.add(beam);
  
  var icon = new THREE.Mesh(new THREE.SphereGeometry(0.6, 12, 12), new THREE.MeshBasicMaterial({ color: dest.color }));
  icon.position.y = 6;
  group.add(icon);
  
  var light = new THREE.PointLight(dest.color, 1.2, 12);
  light.position.y = 3;
  group.add(light);
  
  group.position.set(dest.x, 0, dest.z);
  group.userData = { destination: dest, startTime: performance.now(), icon: icon, beam: beam, ring: ring };
  return group;
}

function checkPassengerPickup() {
  if (player.hasPassenger) return;
  for (var i = passengers.length - 1; i >= 0; i--) {
    var p = passengers[i];
    if (Math.hypot(p.x - tukTuk.position.x, p.z - tukTuk.position.z) < 3) {
      var dest = p.destination;
      scene.remove(p.mesh);
      passengers.splice(i, 1);
      
      player.hasPassenger = true;
      player.currentPassenger = dest;
      player.tripStartTime = performance.now();
      
      activeDestination = createDestinationMarker(dest);
      scene.add(activeDestination);
      
      AudioSystem.playPickup();
      UI.showToast('✅ راكب صعد! → ' + dest.name, 2000);
      
      var rider = createPassengerMesh();
      rider.scale.set(0.8, 0.8, 0.8);
      rider.position.set(0, 0.35, -0.7);
      rider.userData.ring.visible = false;
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
  if (Math.hypot(dest.x - tukTuk.position.x, dest.z - tukTuk.position.z) < 5) {
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
    UI.showToast('🎉 توصيل! +' + reward + ' جنيه +30 ثانية', 2200);
    
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
    UI.missionPanel.textContent = '🎯 اوصل الراكب إلى: ' + player.currentPassenger.name;
    UI.missionPanel.style.borderRightColor = '#00ff88';
  } else if (passengers.length > 0) {
    UI.missionPanel.textContent = '👤 ' + passengers.length + ' راكب ينتظر';
    UI.missionPanel.style.borderRightColor = '#ffc800';
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
      p.mesh.position.y = Math.sin(p.bobPhase) * 0.04;
      if (p.mesh.userData.ring) p.mesh.userData.ring.rotation.z += dt * 0.5;
    }
  }
  
  if (activeDestination) {
    var ud = activeDestination.userData;
    var time = (now - ud.startTime) / 1000;
    var pulse = 1 + Math.sin(time * 3) * 0.1;
    ud.ring.scale.set(pulse, pulse, 1);
    ud.icon.rotation.y += dt * 2;
    ud.icon.position.y = 6 + Math.sin(time * 2) * 0.3;
  }
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
  
  var isAcc = !!(keys['KeyW'] || keys['ArrowUp'] || mobileInput.accel);
  AudioSystem.updateEngine(Math.abs(player.speed), CONFIG.maxSpeed, isAcc);
  
  sunLight.position.set(tukTuk.position.x + 100, 200, tukTuk.position.z + 80);
  sunLight.target.position.copy(tukTuk.position);
  sunLight.target.updateMatrixWorld();
  
  updateHUD();
  renderer.render(scene, camera);
}

/* ============================================================
   بدء اللعبة
   ============================================================ */
var isInitialized = false;

async function startGame() {
  AudioSystem.init();
  AudioSystem.resume();
  
  if (isInitialized) {
    resetGame();
    gameState.running = true;
    gameState.paused = false;
    UI.startScreen.classList.add('hidden');
    UI.endScreen.classList.add('hidden');
    UI.hud.style.display = 'flex';
    UI.missionPanel.style.display = 'block';
    UI.pauseBtn.style.display = 'flex';
    if (isMobile) UI.mobileControls.classList.add('visible');
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
    UI.hud.style.display = 'flex';
    UI.missionPanel.style.display = 'block';
    UI.pauseBtn.style.display = 'flex';
    if (isMobile) UI.mobileControls.classList.add('visible');
    
    if (player.engineOn) AudioSystem.setEngine(true);
    
    setTimeout(function() { spawnPassenger(); }, 500);
    setTimeout(function() { spawnPassenger(); }, 1500);
    UI.showToast('🛺 رحلة سعيدة!', 2000);
    
    if (!animate.started) {
      animate.started = true;
      gameState.lastTime = performance.now();
      animate();
    }
  } catch (error) {
    console.error('❌', error);
    UI.showToast('حدث خطأ', 3000);
    UI.startBtn.disabled = false;
    UI.startBtn.textContent = '🚀 ابدأ الرحلة';
  }
}

async function buildCity(onProgress) {
  var steps = [
    { name: 'إنشاء الأرضية...', fn: createGround, weight: 5 },
    { name: 'بناء ترعة المحمودية...', fn: createCanal, weight: 10 },
    { name: 'رصف الشوارع...', fn: createRoads, weight: 15 },
    { name: 'مد السكة الحديد...', fn: createRailway, weight: 8 },
    { name: 'زراعة النخيل والأشجار...', fn: createFoliage, weight: 12 },
    { name: 'بناء المنازل والمحلات...', fn: createBuildings, weight: 20 },
    { name: 'بناء المعالم الشهيرة...', fn: createLandmarks, weight: 15 },
    { name: 'إضافة السيارات...', fn: createCars, weight: 5 },
    { name: 'ملء الشوارع بالناس...', fn: createPeople, weight: 10 },
  ];
  
  var acc = 0;
  var total = steps.reduce(function(s, x) { return s + x.weight; }, 0);
  
  for (var i = 0; i < steps.length; i++) {
    var step = steps[i];
    if (onProgress) onProgress(Math.round((acc / total) * 100), step.name);
    await new Promise(function(resolve) {
      requestAnimationFrame(function() { try { step.fn(); } catch (e) {} resolve(); });
    });
    acc += step.weight;
  }
  if (onProgress) onProgress(100, 'جاهز للانطلاق! 🚀');
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
  UI.mobileControls.classList.remove('visible');
  UI.pauseBtn.style.display = 'none';
}

/* ============================================================
   ملء الشاشة
   ============================================================ */
function toggleFullscreen() {
  if (!document.fullscreenElement && !document.webkitFullscreenElement) {
    var elem = document.documentElement;
    if (elem.requestFullscreen) elem.requestFullscreen();
    else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
    else if (elem.msRequestFullscreen) elem.msRequestFullscreen();
    UI.fullscreenBtn.textContent = '🔙';
  } else {
    if (document.exitFullscreen) document.exitFullscreen();
    else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    UI.fullscreenBtn.textContent = '⛶';
  }
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

window.addEventListener('resize', function() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

console.log('🎮 اللعبة جاهزة!');

})();
