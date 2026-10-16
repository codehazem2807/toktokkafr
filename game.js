/* ============================================================
   🛺 توك توك كفر الدوار - منظور الشخص الثالث
   نسخة محسّنة للموبايل والأداء العالي
   ============================================================ */

(function() {
'use strict';

console.log('🚀 بدء تحميل اللعبة...');

if (typeof THREE === 'undefined') {
  alert('فشل تحميل Three.js. تأكد من الاتصال بالإنترنت.');
  return;
}

/* ============================================================
   كشف الجهاز وتحديد الجودة تلقائياً
   ============================================================ */
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  || (navigator.maxTouchPoints && navigator.maxTouchPoints > 2 && /MacIntel/.test(navigator.platform))
  || window.matchMedia('(pointer: coarse)').matches;

const isLowEnd = isMobile && (navigator.hardwareConcurrency || 2) <= 4;

console.log('📱 الجهاز:', isMobile ? 'موبايل' : 'كمبيوتر');
console.log('⚙️ الجودة:', isLowEnd ? 'منخفضة' : (isMobile ? 'متوسطة' : 'عالية'));

/* ============================================================
   إعدادات الجودة التلقائية
   ============================================================ */
const QUALITY = {
  pixelRatio: isLowEnd ? 1 : (isMobile ? 1.3 : 1.8),
  shadows: !isLowEnd,
  shadowMapSize: isLowEnd ? 512 : (isMobile ? 1024 : 2048),
  fogFar: isLowEnd ? 400 : (isMobile ? 600 : 1000),
  drawDistance: isLowEnd ? 400 : (isMobile ? 600 : 1000),
  treeCount: isLowEnd ? 40 : (isMobile ? 80 : 150),
  buildingDensity: isLowEnd ? 0.35 : (isMobile ? 0.55 : 0.75),
  enableWindows: !isLowEnd,
  enableFoliage: !isLowEnd || isMobile,
};

/* ============================================================
   الإعدادات العامة
   ============================================================ */
const CONFIG = {
  citySize: 1400,
  canalWidth: 25,
  roadWidth: 20,
  sidewalkWidth: 2.5,
  maxSpeed: 14,
  maxReverseSpeed: 4,
  acceleration: 6,
  braking: 12,
  friction: 0.7,
  steeringSpeed: 3,
  maxWheelAngle: 0.55,
  gameDuration: 300,        // 5 دقائق
  deliveryBonus: 30,        // 30 ثانية لكل توصيلة
  maxPassengers: 2,
};

const COLORS = {
  sky: 0x87CEEB,
  ground: 0x5a8a4a,
  road: 0x3a3a3a,
  sidewalk: 0xa0a0a0,
  canal: 0x1a4a6a,
};

/* ============================================================
   المشهد
   ============================================================ */
const scene = new THREE.Scene();
scene.background = new THREE.Color(COLORS.sky);
scene.fog = new THREE.Fog(COLORS.sky, 100, QUALITY.fogFar);

const camera = new THREE.PerspectiveCamera(
  65,
  window.innerWidth / window.innerHeight,
  0.3,
  QUALITY.drawDistance + 500
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
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
renderer.outputColorSpace = THREE.SRGBColorSpace;

/* ============================================================
   الإضاءة (خفيفة للموبايل)
   ============================================================ */
const sunLight = new THREE.DirectionalLight(0xfff5e0, 2.2);
sunLight.position.set(150, 200, 100);
sunLight.castShadow = QUALITY.shadows;
if (QUALITY.shadows) {
  sunLight.shadow.mapSize.width = QUALITY.shadowMapSize;
  sunLight.shadow.mapSize.height = QUALITY.shadowMapSize;
  sunLight.shadow.camera.near = 1;
  sunLight.shadow.camera.far = 300;
  sunLight.shadow.camera.left = -60;
  sunLight.shadow.camera.right = 60;
  sunLight.shadow.camera.top = 60;
  sunLight.shadow.camera.bottom = -60;
  sunLight.shadow.bias = -0.001;
}
scene.add(sunLight);
scene.add(sunLight.target);

scene.add(new THREE.AmbientLight(0x8899bb, 1.3));
scene.add(new THREE.HemisphereLight(0x87CEEB, 0x3a4a3a, 1.0));

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
    this._toastTimer = setTimeout(function() {
      self.toast.classList.remove('show');
    }, duration);
  },
  
  showHint: function(text, duration) {
    duration = duration || 5000;
    this.hint.textContent = text;
    this.hint.classList.remove('hidden');
    clearTimeout(this._hintTimer);
    var self = this;
    if (duration > 0) {
      this._hintTimer = setTimeout(function() {
        self.hint.classList.add('hidden');
      }, duration);
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
   المواد المشتركة (لتحسين الأداء)
   ============================================================ */
const MAT = {
  road: new THREE.MeshLambertMaterial({ color: 0x3a3a3a }),
  sidewalk: new THREE.MeshLambertMaterial({ color: 0x909090 }),
  roadMark: new THREE.MeshBasicMaterial({ color: 0xffcc00 }),
  treeTrunk: new THREE.MeshLambertMaterial({ color: 0x5a3a20 }),
  treeLeaf: new THREE.MeshLambertMaterial({ color: 0x2d5a2d }),
  palmTrunk: new THREE.MeshLambertMaterial({ color: 0x8b6a3a }),
  palmLeaf: new THREE.MeshLambertMaterial({ color: 0x3a7a3a, side: THREE.DoubleSide }),
  buildingWall: [
    new THREE.MeshLambertMaterial({ color: 0xc9b8a8 }),
    new THREE.MeshLambertMaterial({ color: 0xa8927a }),
    new THREE.MeshLambertMaterial({ color: 0x8b7355 }),
    new THREE.MeshLambertMaterial({ color: 0xb8a898 }),
  ],
  buildingRoof: new THREE.MeshLambertMaterial({ color: 0x5a4a3a }),
  streetLightPole: new THREE.MeshLambertMaterial({ color: 0xcccccc }),
  streetLightLamp: new THREE.MeshBasicMaterial({ color: 0xffffee }),
};

/* ============================================================
   الشوارع الحقيقية
   ============================================================ */
const ROADS_DATA = [
  { x: 0, z: -15, width: 20, length: 1400, rotation: 0, isMain: true },
  { x: 0, z: 25, width: 16, length: 1400, rotation: 0 },
  { x: 250, z: 100, width: 16, length: 600, rotation: Math.PI / 2 },
  { x: -300, z: 0, width: 15, length: 550, rotation: Math.PI / 2 },
  { x: -100, z: 400, width: 14, length: 500, rotation: Math.PI / 2 },
  { x: -500, z: 100, width: 15, length: 400, rotation: Math.PI / 2 },
  { x: 100, z: 300, width: 13, length: 450, rotation: Math.PI / 2 },
  { x: 450, z: 300, width: 13, length: 400, rotation: Math.PI / 2 },
  { x: -600, z: -300, width: 14, length: 300, rotation: 0 },
  { x: -200, z: -350, width: 14, length: 250, rotation: 0 },
  { x: 400, z: -200, width: 14, length: 300, rotation: 0 },
  { x: 700, z: -400, width: 14, length: 250, rotation: 0 },
  { x: -450, z: 500, width: 13, length: 300, rotation: Math.PI / 2 },
  { x: 150, z: 550, width: 13, length: 250, rotation: Math.PI / 2 },
  { x: 550, z: 450, width: 13, length: 300, rotation: Math.PI / 2 },
];

/* ============================================================
   الوجهات الحقيقية لكفر الدوار
   ============================================================ */
const DESTINATIONS_DATA = [
  { name: 'محطة قطار كفر الدوار', x: -250, z: -40, color: 0x8b4513 },
  { name: 'موقف عزيز المصري', x: 150, z: 60, color: 0xe74c3c },
  { name: 'مجمع الميزانة', x: -120, z: -50, color: 0xf39c12 },
  { name: 'مجمع السعرانية', x: 350, z: 80, color: 0xe67e22 },
  { name: 'مستشفى كفر الدوار العام', x: -500, z: 120, color: 0x3498db },
  { name: 'شركة مصر للغزل والنسيج', x: 400, z: -300, color: 0x95a5a6 },
  { name: 'المسجد الكبير', x: -150, z: 200, color: 0x16a085 },
  { name: 'سوق كفر الدوار التجاري', x: 80, z: 150, color: 0x9b59b6 },
  { name: 'كورنيش ترعة المحمودية', x: 500, z: -18, color: 0x2980b9 },
  { name: 'جامعة كفر الدوار', x: -400, z: -240, color: 0x8e44ad },
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
  
  init: function() {
    if (this.initialized) return;
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AC();
      this.initialized = true;
    } catch (e) {
      this.enabled = false;
    }
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
      this.engineOsc = null;
      this.engineGain = null;
      this.engineFilter = null;
    }
  },
  
  setEngine: function(on) {
    if (on) { this.resume(); this.startEngine(); }
    else { this.stopEngine(); }
  },
  
  updateEngine: function(speed, maxSpeed, isAccelerating) {
    if (!this.engineOsc || !this.engineGain || !this.ctx) return;
    var ratio = Math.min(Math.abs(speed) / maxSpeed, 1);
    this.engineOsc.frequency.setTargetAtTime(55 + ratio * 125, this.ctx.currentTime, 0.1);
    this.engineGain.gain.setTargetAtTime(0.03 + ratio * 0.1 + (isAccelerating ? 0.02 : 0), this.ctx.currentTime, 0.15);
  },
  
  playPickup: function() {
    if (!this.enabled || !this.ctx) return;
    this._tone(600, 900, 0.15, 0.15);
  },
  
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
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {}
  },
};

/* ============================================================
   الأرضية
   ============================================================ */
function createGround() {
  var geo = new THREE.PlaneGeometry(4000, 4000);
  var mat = new THREE.MeshLambertMaterial({ color: COLORS.ground });
  var ground = new THREE.Mesh(geo, mat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = QUALITY.shadows;
  scene.add(ground);
}

/* ============================================================
   ترعة المحمودية
   ============================================================ */
var canalRef = null;
function createCanal() {
  var group = new THREE.Group();
  
  // الماء
  var waterGeo = new THREE.PlaneGeometry(CONFIG.citySize * 1.2, CONFIG.canalWidth);
  var waterMat = new THREE.MeshLambertMaterial({ color: COLORS.canal, transparent: true, opacity: 0.85 });
  var water = new THREE.Mesh(waterGeo, waterMat);
  water.rotation.x = -Math.PI / 2;
  water.position.y = -0.3;
  group.add(water);
  
  // الضفاف
  var bankMat = new THREE.MeshLambertMaterial({ color: 0x8b7355 });
  var bankGeo = new THREE.BoxGeometry(CONFIG.citySize * 1.2, 1.5, 3);
  
  var northBank = new THREE.Mesh(bankGeo, bankMat);
  northBank.position.set(0, 0.7, -(CONFIG.canalWidth / 2 + 1.5));
  group.add(northBank);
  
  var southBank = new THREE.Mesh(bankGeo, bankMat);
  southBank.position.set(0, 0.7, (CONFIG.canalWidth / 2 + 1.5));
  group.add(southBank);
  
  // الجسر (شارع أحمد عرابي)
  var bridgeGeo = new THREE.BoxGeometry(26, 2.5, CONFIG.canalWidth + 16);
  var bridgeMat = new THREE.MeshLambertMaterial({ color: 0x555555 });
  var bridge = new THREE.Mesh(bridgeGeo, bridgeMat);
  bridge.position.set(0, 1.5, 0);
  bridge.receiveShadow = QUALITY.shadows;
  group.add(bridge);
  
  // درابزين الجسر
  var railMat = new THREE.MeshLambertMaterial({ color: 0xdddddd });
  for (var side = -1; side <= 1; side += 2) {
    var railGeo = new THREE.BoxGeometry(1.5, 1, CONFIG.canalWidth + 16);
    var rail = new THREE.Mesh(railGeo, railMat);
    rail.position.set(side * 12, 3.2, 0);
    group.add(rail);
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
    
    // الشارع
    var roadGeo = new THREE.BoxGeometry(rd.width, 0.15, rd.length);
    var road = new THREE.Mesh(roadGeo, MAT.road);
    road.position.set(rd.x, 0.08, rd.z);
    road.rotation.y = rd.rotation;
    road.receiveShadow = QUALITY.shadows;
    group.add(road);
    
    // الأرصفة
    var sideGeo = new THREE.BoxGeometry(CONFIG.sidewalkWidth, 0.3, rd.length);
    
    for (var side = -1; side <= 1; side += 2) {
      var sidewalk = new THREE.Mesh(sideGeo, MAT.sidewalk);
      var sideOffset = side * (rd.width / 2 + CONFIG.sidewalkWidth / 2);
      var dx = Math.cos(rd.rotation) * sideOffset;
      var dz = -Math.sin(rd.rotation) * sideOffset;
      sidewalk.position.set(rd.x + dx, 0.22, rd.z + dz);
      sidewalk.rotation.y = rd.rotation;
      sidewalk.receiveShadow = QUALITY.shadows;
      group.add(sidewalk);
    }
    
    // خطوط الطريق (للشوارع الكبيرة فقط)
    if (rd.width >= 18 && !isLowEnd) {
      var markCount = Math.floor(rd.length / 30);
      for (var j = 0; j < markCount; j++) {
        var offset = -rd.length / 2 + j * 30 + 15;
        var markGeo = new THREE.BoxGeometry(0.3, 0.05, 8);
        var mark = new THREE.Mesh(markGeo, MAT.roadMark);
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

/* ============================================================
   السكة الحديد
   ============================================================ */
function createRailway() {
  var group = new THREE.Group();
  var railMat = new THREE.MeshLambertMaterial({ color: 0x808080 });
  var railX = -250;
  
  for (var side = -1; side <= 1; side += 2) {
    var railGeo = new THREE.BoxGeometry(0.15, 0.3, CONFIG.citySize);
    var rail = new THREE.Mesh(railGeo, railMat);
    rail.position.set(railX + (side * 1.2), 0.4, 0);
    group.add(rail);
  }
  
  var sleeperMat = new THREE.MeshLambertMaterial({ color: 0x4a3a2a });
  var sleeperGeo = new THREE.BoxGeometry(3.5, 0.15, 0.3);
  for (var z = -CONFIG.citySize / 2; z < CONFIG.citySize / 2; z += 4) {
    var sleeper = new THREE.Mesh(sleeperGeo, sleeperMat);
    sleeper.position.set(railX, 0.28, z);
    group.add(sleeper);
  }
  
  scene.add(group);
}

/* ============================================================
   الأشجار والنخيل (كمية محدودة)
   ============================================================ */
function createTree(x, z, scale) {
  var tree = new THREE.Group();
  
  var trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15 * scale, 0.2 * scale, 2 * scale, 5),
    MAT.treeTrunk
  );
  trunk.position.y = 1 * scale;
  tree.add(trunk);
  
  var leaf = new THREE.Mesh(
    new THREE.SphereGeometry(1.1 * scale, 6, 5),
    MAT.treeLeaf
  );
  leaf.position.y = 2.5 * scale;
  tree.add(leaf);
  
  tree.position.set(x, 0, z);
  if (QUALITY.shadows) {
    leaf.castShadow = true;
  }
  return tree;
}

function createPalm(x, z, scale) {
  var palm = new THREE.Group();
  
  // الجذع
  var trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.13 * scale, 0.18 * scale, 5 * scale, 6),
    MAT.palmTrunk
  );
  trunk.position.y = 2.5 * scale;
  palm.add(trunk);
  
  // الأوراق (5 بس لتخفيف الأداء)
  for (var i = 0; i < 5; i++) {
    var angle = (i / 5) * Math.PI * 2;
    var leaf = new THREE.Mesh(
      new THREE.PlaneGeometry(0.7 * scale, 2.5 * scale),
      MAT.palmLeaf
    );
    leaf.position.set(
      Math.cos(angle) * 0.4 * scale,
      5 * scale,
      Math.sin(angle) * 0.4 * scale
    );
    leaf.rotation.z = Math.PI / 2.2;
    leaf.rotation.y = angle;
    palm.add(leaf);
  }
  
  palm.position.set(x, 0, z);
  return palm;
}

function createFoliage() {
  if (!QUALITY.enableFoliage) return;
  
  var group = new THREE.Group();
  
  // نخيل على ضفاف الترعة
  var palmStep = isLowEnd ? 60 : 40;
  for (var x = -CONFIG.citySize * 0.55; x < CONFIG.citySize * 0.55; x += palmStep) {
    if (Math.random() > 0.5) {
      group.add(createPalm(x + Utils.rand(-5, 5), -(CONFIG.canalWidth / 2 + 5), Utils.rand(0.9, 1.1)));
    }
    if (Math.random() > 0.5) {
      group.add(createPalm(x + Utils.rand(-5, 5), (CONFIG.canalWidth / 2 + 5), Utils.rand(0.9, 1.1)));
    }
  }
  
  // أشجار على الشوارع
  var treeCount = 0;
  for (var i = 0; i < ROADS_DATA.length && treeCount < QUALITY.treeCount; i++) {
    var road = ROADS_DATA[i];
    if (road.width < 14) continue;
    
    var count = Math.floor(road.length / 60);
    for (var j = 0; j < count && treeCount < QUALITY.treeCount; j++) {
      var offset = -road.length / 2 + j * 60 + 30;
      var side = Math.random() > 0.5 ? 1 : -1;
      var sideOffset = side * (road.width / 2 + CONFIG.sidewalkWidth + 2);
      var tx = road.x + Math.sin(road.rotation) * offset + Math.cos(road.rotation) * sideOffset;
      var tz = road.z + Math.cos(road.rotation) * offset - Math.sin(road.rotation) * sideOffset;
      
      if (Math.abs(tz) > CONFIG.canalWidth / 2 + 7) {
        group.add(createTree(tx, tz, Utils.rand(0.9, 1.2)));
        treeCount++;
      }
    }
  }
  
  scene.add(group);
}

/* ============================================================
   المباني (بسيطة وسريعة)
   ============================================================ */
function isOnRoad(x, z, padding) {
  padding = padding || 0;
  for (var i = 0; i < ROADS_DATA.length; i++) {
    var road = ROADS_DATA[i];
    var halfW = road.width / 2 + CONFIG.sidewalkWidth + padding;
    var halfL = road.length / 2 + padding;
    var dx = x - road.x;
    var dz = z - road.z;
    var cos = Math.cos(-road.rotation);
    var sin = Math.sin(-road.rotation);
    var localX = dx * cos - dz * sin;
    var localZ = dx * sin + dz * cos;
    if (Math.abs(localX) < halfW && Math.abs(localZ) < halfL) return true;
  }
  return false;
}

function createBuildings() {
  var group = new THREE.Group();
  var gridSize = 45;
  var halfCity = CONFIG.citySize / 2;
  
  // استخدم InstancedMesh لو الجهاز ضعيف
  var buildings = [];
  
  for (var gx = -halfCity; gx < halfCity; gx += gridSize) {
    for (var gz = -halfCity; gz < halfCity; gz += gridSize) {
      var x = gx + gridSize / 2;
      var z = gz + gridSize / 2;
      
      if (isOnRoad(x, z, 4)) continue;
      if (Math.abs(z) < CONFIG.canalWidth / 2 + 8) continue;
      if (Math.abs(x + 250) < 15) continue;
      if (Math.abs(x) < 18 && Math.abs(z) < 22) continue;
      if (Math.random() > QUALITY.buildingDensity) continue;
      
      var width = Utils.rand(10, 18);
      var depth = Utils.rand(10, 18);
      var height = Utils.rand(6, 18);
      
      buildings.push({ x: x, z: z, w: width, d: depth, h: height });
    }
  }
  
  // استخدم InstancedMesh للمباني
  var boxGeo = new THREE.BoxGeometry(1, 1, 1);
  
  // تجميع المباني حسب اللون
  for (var c = 0; c < MAT.buildingWall.length; c++) {
    var filtered = buildings.filter(function(b, idx) {
      return idx % MAT.buildingWall.length === c;
    });
    
    if (filtered.length === 0) continue;
    
    var instMesh = new THREE.InstancedMesh(boxGeo, MAT.buildingWall[c], filtered.length);
    var matrix = new THREE.Matrix4();
    
    for (var i = 0; i < filtered.length; i++) {
      var b = filtered[i];
      matrix.makeScale(b.w, b.h, b.d);
      matrix.setPosition(b.x, b.h / 2, b.z);
      instMesh.setMatrixAt(i, matrix);
    }
    
    instMesh.instanceMatrix.needsUpdate = true;
    if (QUALITY.shadows) {
      instMesh.castShadow = true;
      instMesh.receiveShadow = true;
    }
    group.add(instMesh);
  }
  
  scene.add(group);
}

/* ============================================================
   التوك توك (بسيط لكن جميل)
   ============================================================ */
function createTukTuk() {
  var tukTuk = new THREE.Group();
  
  var yellowBody = new THREE.MeshLambertMaterial({ color: 0xffc800 });
  var yellowDark = new THREE.MeshLambertMaterial({ color: 0xe6a800 });
  var blackPart = new THREE.MeshLambertMaterial({ color: 0x0a0a0a });
  var rubberMat = new THREE.MeshLambertMaterial({ color: 0x1a1a1a });
  var chromeMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.2, metalness: 0.9 });
  var headlightMat = new THREE.MeshBasicMaterial({ color: 0xffffcc });
  var taillightMat = new THREE.MeshBasicMaterial({ color: 0xff2222 });
  var seatMat = new THREE.MeshLambertMaterial({ color: 0x2a2a2a });
  var glassMat = new THREE.MeshLambertMaterial({
    color: 0xaaddff, transparent: true, opacity: 0.4,
  });
  
  // الهيكل السفلي
  var chassis = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.12, 2.4), blackPart);
  chassis.position.y = 0.42;
  if (QUALITY.shadows) chassis.castShadow = true;
  tukTuk.add(chassis);
  
  // المقدمة
  var frontBox = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.85, 1.1), yellowBody);
  frontBox.position.set(0, 0.95, 0.65);
  if (QUALITY.shadows) frontBox.castShadow = true;
  tukTuk.add(frontBox);
  
  // الكابينة الخلفية
  var rearBox = new THREE.Mesh(new THREE.BoxGeometry(1.35, 1.5, 1.4), yellowBody);
  rearBox.position.set(0, 1.25, -0.6);
  if (QUALITY.shadows) rearBox.castShadow = true;
  tukTuk.add(rearBox);
  
  // السقف
  var roof = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.1, 2.6), blackPart);
  roof.position.set(0, 2.1, 0);
  if (QUALITY.shadows) roof.castShadow = true;
  tukTuk.add(roof);
  
  // أعمدة السقف
  var pillarGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.8, 6);
  var pillarPositions = [
    [-0.65, 1.2, -1.25], [0.65, 1.2, -1.25],
    [-0.65, 1.2, -0.05], [0.65, 1.2, -0.05],
    [-0.65, 1.2, 1.1], [0.65, 1.2, 1.1],
  ];
  for (var i = 0; i < pillarPositions.length; i++) {
    var p = new THREE.Mesh(pillarGeo, blackPart);
    p.position.set(pillarPositions[i][0], pillarPositions[i][1], pillarPositions[i][2]);
    tukTuk.add(p);
  }
  
  // الزجاج الأمامي
  var windshield = new THREE.Mesh(new THREE.BoxGeometry(1.22, 0.85, 0.04), glassMat);
  windshield.position.set(0, 1.85, 1.2);
  windshield.rotation.x = -0.1;
  tukTuk.add(windshield);
  
  // الزجاج الجانبي
  for (var side = -1; side <= 1; side += 2) {
    var sideGlass = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.8, 0.95), glassMat);
    sideGlass.position.set(side * 0.66, 1.8, 0.65);
    tukTuk.add(sideGlass);
    
    var rearGlass = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.95, 1.25), glassMat);
    rearGlass.position.set(side * 0.68, 1.7, -0.6);
    tukTuk.add(rearGlass);
  }
  
  // الزجاج الخلفي
  var rearWindow = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1, 0.04), glassMat);
  rearWindow.position.set(0, 1.7, -1.32);
  tukTuk.add(rearWindow);
  
  // المصابيح الأمامية
  var headlightGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.08, 12);
  for (var side = -1; side <= 1; side += 2) {
    var hl = new THREE.Mesh(headlightGeo, chromeMat);
    hl.rotation.x = Math.PI / 2;
    hl.position.set(side * 0.45, 1.15, 1.28);
    tukTuk.add(hl);
    
    var hlg = new THREE.Mesh(headlightGeo, headlightMat);
    hlg.rotation.x = Math.PI / 2;
    hlg.position.set(side * 0.45, 1.15, 1.31);
    tukTuk.add(hlg);
  }
  
  // الفوانيس الخلفية
  var taillightGeo = new THREE.BoxGeometry(0.12, 0.2, 0.05);
  for (var side = -1; side <= 1; side += 2) {
    var tl = new THREE.Mesh(taillightGeo, taillightMat);
    tl.position.set(side * 0.5, 0.9, -1.33);
    tukTuk.add(tl);
  }
  
  // المقود
  var steeringGroup = new THREE.Group();
  var steeringRing = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.02, 6, 16), blackPart);
  steeringGroup.add(steeringRing);
  for (var i = 0; i < 3; i++) {
    var spoke = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.14, 0.015), blackPart);
    spoke.rotation.z = (i / 3) * Math.PI * 2;
    steeringGroup.add(spoke);
  }
  steeringGroup.position.set(0, 1.5, 0.85);
  steeringGroup.rotation.x = -0.35;
  tukTuk.add(steeringGroup);
  
  // لوحة القيادة
  var dashboard = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.2, 0.3), blackPart);
  dashboard.position.set(0, 1.3, 1.0);
  tukTuk.add(dashboard);
  
  // المقاعد
  var seatDriver = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.1, 0.45), seatMat);
  seatDriver.position.set(0, 0.78, 0.35);
  tukTuk.add(seatDriver);
  
  var rearSeat = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.1, 0.5), seatMat);
  rearSeat.position.set(0, 0.78, -0.7);
  tukTuk.add(rearSeat);
  
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
  makeWheel(-0.62, -0.8, false);
  makeWheel(0.62, -0.8, false);
  
  tukTuk.userData = {
    wheels: wheels,
    steeringWheel: steeringGroup,
  };
  
  return tukTuk;
}

var tukTuk = createTukTuk();
tukTuk.position.set(0, 0, 150);
scene.add(tukTuk);

/* ============================================================
   حالة اللاعب
   ============================================================ */
var player = {
  speed: 0,
  steering: 0,
  currentWheelAngle: 0,
  engineOn: true,
  handbrake: false,
  hasPassenger: false,
  currentPassenger: null,
  tripStartTime: 0,
};

/* ============================================================
   كاميرا الشخص الثالث (خلف التوك توك)
   ============================================================ */
var cameraOffset = {
  distance: 7,        // المسافة خلف التوك توك
  height: 3.5,        // الارتفاع
  lookAtHeight: 1.2,  // نقطة النظر
  currentPos: new THREE.Vector3(0, 3.5, 7),
};

function updateCamera(dt) {
  // حساب موقع الكاميرا المثالي (خلف التوك توك)
  var forward = new THREE.Vector3(
    Math.sin(tukTuk.rotation.y),
    0,
    Math.cos(tukTuk.rotation.y)
  );
  
  var targetPos = tukTuk.position.clone()
    .sub(forward.multiplyScalar(cameraOffset.distance))
    .add(new THREE.Vector3(0, cameraOffset.height, 0));
  
  // تحرك ناعم
  var smoothFactor = 1 - Math.pow(0.001, dt);
  camera.position.lerp(targetPos, smoothFactor);
  
  // نقطة النظر (فوق التوك توك)
  var lookTarget = tukTuk.position.clone();
  lookTarget.y += cameraOffset.lookAtHeight;
  
  camera.lookAt(lookTarget);
  
  // إمالة بسيطة عند الدوران
  var speedRatio = Math.min(Math.abs(player.speed) / CONFIG.maxSpeed, 1);
  camera.rotation.z = -player.steering * 0.03 * speedRatio;
}

/* ============================================================
   المدخلات
   ============================================================ */
var keys = {};

document.addEventListener('keydown', function(e) {
  keys[e.code] = true;
  if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].indexOf(e.code) !== -1) {
    e.preventDefault();
  }
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

/* ============================================================
   أزرار الموبايل
   ============================================================ */
var mobileInput = {
  accel: false,
  brake: false,
  left: false,
  right: false,
};

function setupMobileButtons() {
  var buttons = {
    btnAccel: 'accel',
    btnBrake: 'brake',
    btnSteerLeft: 'left',
    btnSteerRight: 'right',
  };
  
  Object.keys(buttons).forEach(function(id) {
    var el = document.getElementById(id);
    if (!el) return;
    var key = buttons[id];
    
    var press = function(e) {
      e.preventDefault();
      e.stopPropagation();
      mobileInput[key] = true;
      el.classList.add('pressed');
    };
    var release = function(e) {
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
  
  var hbBtn = document.getElementById('btnHandbrake');
  if (hbBtn) {
    var hbPress = function(e) {
      e.preventDefault();
      e.stopPropagation();
      player.handbrake = true;
      hbBtn.classList.add('pressed');
    };
    var hbRelease = function(e) {
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
      if (player.speed > 0.5) {
        player.speed -= CONFIG.braking * dt;
      } else {
        player.speed -= CONFIG.acceleration * 0.5 * dt;
      }
    } else {
      if (player.speed > 0) {
        player.speed -= CONFIG.friction * dt * 3;
        if (player.speed < 0.05) player.speed = 0;
      } else if (player.speed < 0) {
        player.speed += CONFIG.friction * dt * 3;
        if (player.speed > -0.05) player.speed = 0;
      }
    }
    player.speed = Utils.clamp(player.speed, -CONFIG.maxReverseSpeed, CONFIG.maxSpeed);
  }
  
  var leftInput = (keys['KeyA'] || keys['ArrowLeft'] || mobileInput.left) ? 1 : 0;
  var rightInput = (keys['KeyD'] || keys['ArrowRight'] || mobileInput.right) ? 1 : 0;
  var steerInput = rightInput - leftInput;
  
  var steerDiff = steerInput - player.steering;
  var steerStep = Math.sign(steerDiff) * Math.min(Math.abs(steerDiff), CONFIG.steeringSpeed * dt);
  player.steering += steerStep;
  player.steering = Utils.clamp(player.steering, -1, 1);
  if (steerInput === 0) player.steering *= (1 - 2 * dt);
  
  var speedRatio = Math.min(Math.abs(player.speed) / CONFIG.maxSpeed, 1);
  var maxAngle = CONFIG.maxWheelAngle * (1 - speedRatio * 0.55);
  player.currentWheelAngle = player.steering * maxAngle;
  
  if (Math.abs(player.speed) > 0.1) {
    var speedFactor = Math.min(Math.abs(player.speed) / 7, 1.2);
    var direction = player.speed >= 0 ? 1 : -1;
    var turnRate = player.currentWheelAngle * speedFactor * dt * 3 * direction;
    tukTuk.rotation.y -= turnRate;
  }
  
  var forward = new THREE.Vector3(
    Math.sin(tukTuk.rotation.y), 0, Math.cos(tukTuk.rotation.y)
  );
  var velocity = forward.multiplyScalar(player.speed * dt);
  var newPos = tukTuk.position.clone().add(velocity);
  
  // تصادم مع الترعة
  var inCanalX = !(newPos.x > -13 && newPos.x < 13);
  var nearCanal = Math.abs(newPos.z) < CONFIG.canalWidth / 2 + 1.5;
  
  if (nearCanal && inCanalX) {
    player.speed *= -0.25;
  } else if (Math.abs(newPos.x) < CONFIG.citySize / 2 - 3 && Math.abs(newPos.z) < CONFIG.citySize / 2 - 3) {
    tukTuk.position.copy(newPos);
  } else {
    player.speed *= -0.3;
  }
  
  // العجلات
  var wheelRoll = (player.speed * dt) / 0.24;
  for (var i = 0; i < tukTuk.userData.wheels.length; i++) {
    var w = tukTuk.userData.wheels[i];
    var tire = w.children[0];
    if (tire) tire.rotation.x += wheelRoll;
    if (w.userData.isFront) w.rotation.y = player.currentWheelAngle;
  }
  
  // المقود
  tukTuk.userData.steeringWheel.rotation.z = -player.steering * Math.PI * 0.85;
  
  // اهتزاز خفيف
  tukTuk.position.y = Math.max(0, Math.sin(performance.now() * 0.02) * 0.005 * (1 + speedRatio));
}

/* ============================================================
   حالة اللعبة
   ============================================================ */
var gameState = {
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
      var sideOffset = side * (road.width / 2 + CONFIG.sidewalkWidth / 2);
      var x = road.x + Math.sin(road.rotation) * offset + Math.cos(road.rotation) * sideOffset;
      var z = road.z + Math.cos(road.rotation) * offset - Math.sin(road.rotation) * sideOffset;
      
      if (Math.abs(z) < CONFIG.canalWidth / 2 + 4) continue;
      if (Math.abs(x + 250) < 8) continue;
      
      var dist = Math.hypot(x - tukTuk.position.x, z - tukTuk.position.z);
      if (dist < 60 || dist > 400) continue;
      
      candidates.push({ x: x, z: z });
    }
  }
  
  if (candidates.length === 0) return null;
  return Utils.pick(candidates);
}

function createPassengerMesh() {
  var group = new THREE.Group();
  
  var shirtColors = [0xe74c3c, 0x3498db, 0x2ecc71, 0xf39c12, 0x9b59b6, 0xe67e22];
  var skinColors = [0xf5d5b0, 0xe0b890, 0xc89870];
  
  var shirtColor = Utils.pick(shirtColors);
  var skinColor = Utils.pick(skinColors);
  
  var torsoMat = new THREE.MeshLambertMaterial({ color: shirtColor });
  var torso = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.65, 0.28), torsoMat);
  torso.position.y = 1.1;
  if (QUALITY.shadows) torso.castShadow = true;
  group.add(torso);
  
  var headMat = new THREE.MeshLambertMaterial({ color: skinColor });
  var head = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 8), headMat);
  head.position.y = 1.6;
  if (QUALITY.shadows) head.castShadow = true;
  group.add(head);
  
  var legsMat = new THREE.MeshLambertMaterial({ color: 0x2c3e50 });
  var legs = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.75, 0.28), legsMat);
  legs.position.y = 0.4;
  if (QUALITY.shadows) legs.castShadow = true;
  group.add(legs);
  
  // هالة
  var ringMat = new THREE.MeshBasicMaterial({
    color: 0x00ff88, transparent: true, opacity: 0.7, side: THREE.DoubleSide,
  });
  var ring = new THREE.Mesh(new THREE.RingGeometry(0.5, 0.75, 16), ringMat);
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.05;
  group.add(ring);
  group.userData.ring = ring;
  
  return group;
}

function spawnPassenger() {
  if (passengers.length >= CONFIG.maxPassengers) return;
  if (player.hasPassenger) return;
  
  var spawnPoint = getPassengerSpawnPoint();
  if (!spawnPoint) return;
  
  var destination;
  var attempts = 0;
  do {
    destination = Utils.pick(DESTINATIONS_DATA);
    attempts++;
  } while (attempts < 10 && passengers.some(function(p) { return p.destination.name === destination.name; }));
  
  var mesh = createPassengerMesh();
  mesh.position.set(spawnPoint.x, 0, spawnPoint.z);
  scene.add(mesh);
  
  passengers.push({
    mesh: mesh,
    x: spawnPoint.x,
    z: spawnPoint.z,
    destination: destination,
    bobPhase: Math.random() * Math.PI * 2,
  });
  
  updateMissionUI();
}

function createDestinationMarker(destination) {
  var group = new THREE.Group();
  
  var ringMat = new THREE.MeshBasicMaterial({
    color: destination.color, transparent: true, opacity: 0.7, side: THREE.DoubleSide,
  });
  var ring = new THREE.Mesh(new THREE.RingGeometry(2, 3, 24), ringMat);
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.1;
  group.add(ring);
  
  var beamMat = new THREE.MeshBasicMaterial({
    color: destination.color, transparent: true, opacity: 0.25, side: THREE.DoubleSide,
  });
  var beam = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 1.5, 8, 12, 1, true), beamMat);
  beam.position.y = 4;
  group.add(beam);
  
  var iconMat = new THREE.MeshBasicMaterial({ color: destination.color });
  var icon = new THREE.Mesh(new THREE.SphereGeometry(0.6, 12, 12), iconMat);
  icon.position.y = 6;
  group.add(icon);
  
  var pointLight = new THREE.PointLight(destination.color, 1.2, 12);
  pointLight.position.y = 3;
  group.add(pointLight);
  
  group.position.set(destination.x, 0, destination.z);
  group.userData = {
    destination: destination,
    startTime: performance.now(),
    icon: icon,
    beam: beam,
    ring: ring,
  };
  
  return group;
}

function checkPassengerPickup() {
  if (player.hasPassenger) return;
  
  for (var i = passengers.length - 1; i >= 0; i--) {
    var p = passengers[i];
    var dist = Math.hypot(p.x - tukTuk.position.x, p.z - tukTuk.position.z);
    
    if (dist < 3) {
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
      
      var riderMesh = createPassengerMesh();
      riderMesh.scale.set(0.8, 0.8, 0.8);
      riderMesh.position.set(0, 0.35, -0.7);
      riderMesh.userData.ring.visible = false;
      tukTuk.add(riderMesh);
      tukTuk.userData.passengerRider = riderMesh;
      
      updateMissionUI();
      break;
    }
  }
}

function checkDelivery() {
  if (!player.hasPassenger || !activeDestination) return;
  
  var dest = activeDestination.userData.destination;
  var dist = Math.hypot(dest.x - tukTuk.position.x, dest.z - tukTuk.position.z);
  
  if (dist < 5) {
    var tripTime = (performance.now() - player.tripStartTime) / 1000;
    var reward = 60;
    var rating = 3;
    
    if (tripTime < 30) { reward = 120; rating = 5; }
    else if (tripTime < 60) { reward = 100; rating = 4; }
    else if (tripTime < 90) { reward = 80; rating = 3; }
    else { reward = 60; rating = 2; }
    
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
  
  if (gameState.timeLeft < 30) {
    UI.timeValue.classList.add('warning');
  } else {
    UI.timeValue.classList.remove('warning');
  }
  
  var speedKmh = Math.abs(player.speed) * 3.6 * 3.5;
  UI.speedValue.textContent = Math.round(speedKmh);
}

function updateMissionUI() {
  if (player.hasPassenger && player.currentPassenger) {
    UI.missionPanel.textContent = '🎯 اوصل الراكب إلى: ' + player.currentPassenger.name;
    UI.missionPanel.style.borderRightColor = '#00ff88';
  } else if (passengers.length > 0) {
    UI.missionPanel.textContent = '👤 ' + passengers.length + ' راكب ينتظر — اقترب منهم';
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
      if (p.mesh.userData.ring) {
        p.mesh.userData.ring.rotation.z += dt * 0.5;
      }
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
    gameState.spawnTimer = 2 + Math.random() * 2;
  }
  
  updateTukTukPhysics(dt);
  checkPassengerPickup();
  checkDelivery();
  updateCamera(dt);
  updatePassengers(dt);
  
  var isAccelerating = !!(keys['KeyW'] || keys['ArrowUp'] || mobileInput.accel);
  AudioSystem.updateEngine(Math.abs(player.speed), CONFIG.maxSpeed, isAccelerating);
  
  // الشمس تتابع اللاعب
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
  console.log('🎬 بدء اللعبة...');
  
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
    
    if (isMobile) {
      UI.mobileControls.classList.add('visible');
      UI.showHint('استخدم الأزرار للقيادة', 5000);
    } else {
      UI.showHint('W/A/S/D للحركة — Space فرملة', 5000);
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
    isInitialized = true;
    
    resetGame();
    gameState.running = true;
    gameState.lastTime = performance.now();
    
    UI.startScreen.classList.add('hidden');
    UI.endScreen.classList.add('hidden');
    UI.hud.style.display = 'flex';
    UI.missionPanel.style.display = 'block';
    UI.pauseBtn.style.display = 'flex';
    
    if (isMobile) {
      UI.mobileControls.classList.add('visible');
      UI.showHint('استخدم الأزرار للقيادة — العربية بتتحرك لوحدها مع الأزرار', 5000);
    } else {
      UI.showHint('W/A/S/D للحركة — Space فرملة', 5000);
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
    console.error('❌ خطأ:', error);
    UI.showToast('حدث خطأ أثناء التحميل', 3000);
    UI.startBtn.disabled = false;
    UI.startBtn.textContent = '🚀 ابدأ الرحلة';
  }
}

/* ============================================================
   بناء المدينة
   ============================================================ */
async function buildCity(onProgress) {
  var steps = [
    { name: 'إنشاء الأرضية...', fn: createGround, weight: 5 },
    { name: 'بناء ترعة المحمودية...', fn: createCanal, weight: 15 },
    { name: 'رصف الشوارع...', fn: createRoads, weight: 20 },
    { name: 'مد السكة الحديد...', fn: createRailway, weight: 10 },
    { name: 'زراعة النخيل والأشجار...', fn: createFoliage, weight: 15 },
    { name: 'بناء المنازل والمحلات...', fn: createBuildings, weight: 25 },
  ];
  
  var accumulated = 0;
  var totalWeight = steps.reduce(function(sum, s) { return sum + s.weight; }, 0);
  
  for (var i = 0; i < steps.length; i++) {
    var step = steps[i];
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
   إعادة تعيين
   ============================================================ */
function resetGame() {
  gameState.money = 0;
  gameState.deliveries = 0;
  gameState.ratingSum = 0;
  gameState.timeLeft = CONFIG.gameDuration;
  gameState.spawnTimer = 1;
  gameState.elapsedTime = 0;
  gameState.paused = false;
  
  tukTuk.position.set(0, 0, 150);
  tukTuk.rotation.set(0, 0, 0);
  
  player.speed = 0;
  player.steering = 0;
  player.currentWheelAngle = 0;
  player.hasPassenger = false;
  player.currentPassenger = null;
  player.engineOn = true;
  player.handbrake = false;
  
  for (var i = 0; i < passengers.length; i++) {
    scene.remove(passengers[i].mesh);
  }
  passengers.length = 0;
  
  if (activeDestination) {
    scene.remove(activeDestination);
    activeDestination = null;
  }
  
  if (tukTuk.userData.passengerRider) {
    tukTuk.remove(tukTuk.userData.passengerRider);
    tukTuk.userData.passengerRider = null;
  }
  
  // ضبط الكاميرا
  var forward = new THREE.Vector3(0, 0, 1);
  camera.position.copy(tukTuk.position).sub(forward.multiplyScalar(cameraOffset.distance));
  camera.position.y = cameraOffset.height;
  camera.lookAt(tukTuk.position.x, cameraOffset.lookAtHeight, tukTuk.position.z);
  
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
  
  var avgRating = gameState.deliveries > 0
    ? (gameState.ratingSum / gameState.deliveries).toFixed(1)
    : '0';
  
  UI.endTitle.textContent = gameState.deliveries > 0 ? '🎉 رحلة رائعة!' : '⏰ انتهى الوقت!';
  UI.endMoney.textContent = gameState.money + ' جنيه';
  UI.endDeliveries.textContent = gameState.deliveries;
  UI.endRating.textContent = avgRating + ' ⭐';
  
  UI.endScreen.classList.remove('hidden');
  UI.mobileControls.classList.remove('visible');
  UI.pauseBtn.style.display = 'none';
  
  console.log('🏁 انتهت اللعبة');
}

/* ============================================================
   ربط الأزرار
   ============================================================ */
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

UI.pauseBtn.addEventListener('click', togglePause);

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

console.log('🎮 اللعبة جاهزة!');

})();
