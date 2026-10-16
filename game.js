/* ============================================================
   🛺 توك توك كفر الدوار - النسخة الشعبية الاحترافية
   منظور الشخص الثالث + محسّنة للموبايل
   ============================================================ */

(function() {
'use strict';

console.log('🚀 بدء تحميل لعبة توك توك كفر الدوار...');

if (typeof THREE === 'undefined') {
  alert('فشل تحميل Three.js. تأكد من الاتصال بالإنترنت.');
  return;
}

/* ============================================================
   كشف الجهاز
   ============================================================ */
var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  || (navigator.maxTouchPoints && navigator.maxTouchPoints > 2);
var isLowEnd = isMobile && (navigator.hardwareConcurrency || 2) <= 4;

console.log('📱 الجهاز:', isMobile ? 'موبايل' : 'كمبيوتر');

/* ============================================================
   إعدادات الجودة
   ============================================================ */
var QUALITY = {
  pixelRatio: isLowEnd ? 1 : (isMobile ? 1.3 : 1.8),
  shadows: !isLowEnd,
  shadowMapSize: isLowEnd ? 512 : (isMobile ? 1024 : 2048),
  fogFar: isLowEnd ? 350 : (isMobile ? 550 : 900),
  treeCount: isLowEnd ? 25 : (isMobile ? 50 : 100),
  buildingDensity: isLowEnd ? 0.4 : (isMobile ? 0.6 : 0.8),
  peopleCount: isLowEnd ? 8 : (isMobile ? 15 : 30),
  carsCount: isLowEnd ? 4 : (isMobile ? 8 : 15),
};

/* ============================================================
   الإعدادات العامة
   ============================================================ */
var CONFIG = {
  citySize: 1500,
  canalWidth: 22,
  roadWidth: 20,
  sidewalkWidth: 3,
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

var COLORS = {
  sky: 0x87CEEB,
  ground: 0x6a9a5a,
  road: 0x2a2a2a,
  sidewalk: 0xa8a8a8,
  canal: 0x1a6a9a,
};

/* ============================================================
   المشهد والكاميرا
   ============================================================ */
var scene = new THREE.Scene();
scene.background = new THREE.Color(COLORS.sky);
scene.fog = new THREE.Fog(COLORS.sky, 80, QUALITY.fogFar);

var camera = new THREE.PerspectiveCamera(
  62,
  window.innerWidth / window.innerHeight,
  0.3,
  QUALITY.fogFar + 800
);

var renderer = new THREE.WebGLRenderer({
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
renderer.toneMappingExposure = 1.15;
renderer.outputColorSpace = THREE.SRGBColorSpace;

/* حل مشكلة الشاشة المقلوبة */
function handleResize() {
  var w = window.innerWidth;
  var h = window.innerHeight;
  
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h, false);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, QUALITY.pixelRatio));
}

window.addEventListener('resize', handleResize);
window.addEventListener('orientationchange', function() {
  setTimeout(handleResize, 150);
  setTimeout(handleResize, 400);
});

/* ============================================================
   الإضاءة
   ============================================================ */
var sunLight = new THREE.DirectionalLight(0xfff5e0, 2.6);
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
scene.add(new THREE.HemisphereLight(0x87CEEB, 0x4a5a3a, 1.15));

/* ============================================================
   واجهة المستخدم
   ============================================================ */
var UI = {
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
  dialogBox: document.getElementById('dialogBox'),
  dialogText: document.getElementById('dialogText'),
  moneyValue: document.getElementById('moneyValue'),
  deliveriesValue: document.getElementById('deliveriesValue'),
  timeValue: document.getElementById('timeValue'),
  speedValue: document.getElementById('speedValue'),
  endTitle: document.getElementById('endTitle'),
  endMoney: document.getElementById('endMoney'),
  endDeliveries: document.getElementById('endDeliveries'),
  endRating: document.getElementById('endRating'),
  minimapCanvas: document.getElementById('minimapCanvas'),
  
  updateLoading: function(pct, text) {
    if (this.loadingFill) this.loadingFill.style.width = pct + '%';
    if (text && this.loadingText) this.loadingText.textContent = text;
  },
  
  showToast: function(msg, dur) {
    dur = dur || 1800;
    if (!this.toast) return;
    this.toast.textContent = msg;
    this.toast.classList.add('show');
    clearTimeout(this._toastTimer);
    var self = this;
    this._toastTimer = setTimeout(function() { self.toast.classList.remove('show'); }, dur);
  },
  
  showHint: function(text, dur) {
    dur = dur || 5000;
    if (!this.hint) return;
    this.hint.textContent = text;
    this.hint.classList.remove('hidden');
    clearTimeout(this._hintTimer);
    var self = this;
    if (dur > 0) {
      this._hintTimer = setTimeout(function() { self.hint.classList.add('hidden'); }, dur);
    }
  },
  
  showDialog: function(text, dur) {
    dur = dur || 3000;
    if (!this.dialogBox) return;
    this.dialogText.textContent = text;
    this.dialogBox.classList.add('visible');
    clearTimeout(this._dialogTimer);
    var self = this;
    this._dialogTimer = setTimeout(function() { self.dialogBox.classList.remove('visible'); }, dur);
  }
};

/* ============================================================
   أدوات
   ============================================================ */
var Utils = {
  rand: function(a, b) { return Math.random() * (b - a) + a; },
  pick: function(arr) { return arr[Math.floor(Math.random() * arr.length)]; },
  formatTime: function(s) {
    var m = Math.floor(Math.max(0, s) / 60);
    var ss = Math.floor(Math.max(0, s) % 60);
    return String(m).padStart(2, '0') + ':' + String(ss).padStart(2, '0');
  },
  clamp: function(v, a, b) { return Math.max(a, Math.min(b, v)); }
};

/* ============================================================
   جمل السواق المصري الشعبي
   ============================================================ */
var DIALOGS = {
  pickup: [
    'أهلاً وسهلاً يا باشا، اتفضل اركب',
    'يلا بينا يا معلم، المكان قريب',
    'تحت أمرك يا فندم، هنمشي حالاً',
    'اتفضل يا باشا، اركب من هنا',
    'أهلاً بيك، التوك توك تحت أمرك',
    'يالا يا معلم، نوّرت التوك توك'
  ],
  driving: [
    'هنلف من شارع أحمد عرابي',
    'الطريق زحمة النهاردة والله',
    'تحب نعدي على الترعة؟',
    'كفر الدوار زحمة النهاردة',
    'الحق عليّا يا باشا، هنجيلك في الوقت',
    'هنا السوق، كل حاجة موجودة',
    'خد بالك، فيه مطب قدام',
    'الطريق سالك إن شاء الله',
    'إحنا في شارع بورسعيد دلوقتي',
    'قربنا نوصل يا باشا'
  ],
  arrived: [
    'وصلنا يا باشا، اتفضل',
    'الحمد لله، كنا في الموعد',
    'أيوه كده، المكان ده هو',
    'يلا يا معلم، نوّرت',
    'وصلنا بألف سلامة'
  ]
};

/* ============================================================
   المواد
   ============================================================ */
function createMaterials() {
  return {
    road: new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.95 }),
    roadLine: new THREE.MeshBasicMaterial({ color: 0xffcc00 }),
    sidewalk: new THREE.MeshStandardMaterial({ color: 0xa8a8a8, roughness: 0.85 }),
    ground: new THREE.MeshStandardMaterial({ color: COLORS.ground, roughness: 1 }),
    canal: new THREE.MeshStandardMaterial({ 
      color: COLORS.canal, roughness: 0.1, metalness: 0.5, 
      transparent: true, opacity: 0.88 
    }),
    
    buildingWalls: [
      new THREE.MeshStandardMaterial({ color: 0xd4a574, roughness: 0.85 }),
      new THREE.MeshStandardMaterial({ color: 0xc9a878, roughness: 0.85 }),
      new THREE.MeshStandardMaterial({ color: 0xb89878, roughness: 0.85 }),
      new THREE.MeshStandardMaterial({ color: 0xa88868, roughness: 0.85 }),
      new THREE.MeshStandardMaterial({ color: 0xe8c8a0, roughness: 0.85 }),
      new THREE.MeshStandardMaterial({ color: 0xd4b890, roughness: 0.85 }),
      new THREE.MeshStandardMaterial({ color: 0xc0a070, roughness: 0.85 }),
      new THREE.MeshStandardMaterial({ color: 0xb08860, roughness: 0.85 }),
    ],
    buildingRoofs: [
      new THREE.MeshStandardMaterial({ color: 0x8b6a4a, roughness: 0.9 }),
      new THREE.MeshStandardMaterial({ color: 0x6a5a4a, roughness: 0.9 }),
      new THREE.MeshStandardMaterial({ color: 0x7a6a5a, roughness: 0.9 }),
    ],
    
    window: new THREE.MeshStandardMaterial({ 
      color: 0x88ccff, emissive: 0x4477aa, emissiveIntensity: 0.35, 
      roughness: 0.1, metalness: 0.5 
    }),
    windowFrame: new THREE.MeshStandardMaterial({ color: 0x3a3a3a, roughness: 0.85 }),
    door: new THREE.MeshStandardMaterial({ color: 0x5a3a1a, roughness: 0.8 }),
    
    treeTrunk: new THREE.MeshStandardMaterial({ color: 0x5a3a20, roughness: 0.95 }),
    treeLeaf: new THREE.MeshStandardMaterial({ color: 0x3a7a3a, roughness: 0.9 }),
    treeLeafDark: new THREE.MeshStandardMaterial({ color: 0x2a5a2a, roughness: 0.9 }),
    palmTrunk: new THREE.MeshStandardMaterial({ color: 0x8b6a3a, roughness: 0.95 }),
    palmLeaf: new THREE.MeshStandardMaterial({ color: 0x3a8a3a, roughness: 0.85, side: THREE.DoubleSide }),
    
    carBody: [
      new THREE.MeshStandardMaterial({ color: 0xcc3333, roughness: 0.3, metalness: 0.6 }),
      new THREE.MeshStandardMaterial({ color: 0x3366cc, roughness: 0.3, metalness: 0.6 }),
      new THREE.MeshStandardMaterial({ color: 0x33cc66, roughness: 0.3, metalness: 0.6 }),
      new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.3, metalness: 0.6 }),
      new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.3, metalness: 0.6 }),
      new THREE.MeshStandardMaterial({ color: 0xf39c12, roughness: 0.3, metalness: 0.6 }),
    ],
    carGlass: new THREE.MeshStandardMaterial({ color: 0x88ccff, transparent: true, opacity: 0.55, roughness: 0.1 }),
    carTire: new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.95 }),
    
    peopleShirt: [
      new THREE.MeshStandardMaterial({ color: 0xe74c3c, roughness: 0.85 }),
      new THREE.MeshStandardMaterial({ color: 0x3498db, roughness: 0.85 }),
      new THREE.MeshStandardMaterial({ color: 0x2ecc71, roughness: 0.85 }),
      new THREE.MeshStandardMaterial({ color: 0xf39c12, roughness: 0.85 }),
      new THREE.MeshStandardMaterial({ color: 0x9b59b6, roughness: 0.85 }),
      new THREE.MeshStandardMaterial({ color: 0x1abc9c, roughness: 0.85 }),
      new THREE.MeshStandardMaterial({ color: 0xe67e22, roughness: 0.85 }),
      new THREE.MeshStandardMaterial({ color: 0xecf0f1, roughness: 0.85 }),
      new THREE.MeshStandardMaterial({ color: 0x2c3e50, roughness: 0.85 }),
      new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.85 }),
    ],
    peoplePants: [
      new THREE.MeshStandardMaterial({ color: 0x2c3e50, roughness: 0.9 }),
      new THREE.MeshStandardMaterial({ color: 0x34495e, roughness: 0.9 }),
      new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.9 }),
      new THREE.MeshStandardMaterial({ color: 0x5a3a2a, roughness: 0.9 }),
      new THREE.MeshStandardMaterial({ color: 0x4a4a4a, roughness: 0.9 }),
    ],
    peopleSkin: [
      new THREE.MeshStandardMaterial({ color: 0xf5d5b0, roughness: 0.9 }),
      new THREE.MeshStandardMaterial({ color: 0xe0b890, roughness: 0.9 }),
      new THREE.MeshStandardMaterial({ color: 0xc89870, roughness: 0.9 }),
      new THREE.MeshStandardMaterial({ color: 0xa87850, roughness: 0.9 }),
      new THREE.MeshStandardMaterial({ color: 0x8d5524, roughness: 0.9 }),
    ],
    peopleHair: [
      new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.95 }),
      new THREE.MeshStandardMaterial({ color: 0x3a2a1a, roughness: 0.95 }),
      new THREE.MeshStandardMaterial({ color: 0x5a4a3a, roughness: 0.95 }),
      new THREE.MeshStandardMaterial({ color: 0x808080, roughness: 0.95 }),
    ],
    
    mosqueWall: new THREE.MeshStandardMaterial({ color: 0xf0e8d0, roughness: 0.7 }),
    mosqueDome: new THREE.MeshStandardMaterial({ color: 0x16a085, roughness: 0.4, metalness: 0.3 }),
    mosqueGold: new THREE.MeshStandardMaterial({ color: 0xffcc00, roughness: 0.3, metalness: 0.8 }),
    stationWall: new THREE.MeshStandardMaterial({ color: 0xe8dcc0, roughness: 0.75 }),
    stationRoof: new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.7 }),
    factoryWall: new THREE.MeshStandardMaterial({ color: 0x95a5a6, roughness: 0.85 }),
    factoryChimney: new THREE.MeshStandardMaterial({ color: 0x7f8c8d, roughness: 0.9 }),
    hospitalWall: new THREE.MeshStandardMaterial({ color: 0xf5f5f5, roughness: 0.8 }),
    hospitalRed: new THREE.MeshBasicMaterial({ color: 0xcc0000 }),
    schoolWall: new THREE.MeshStandardMaterial({ color: 0xf0c880, roughness: 0.8 }),
  };
}

var MAT = createMaterials();

/* ============================================================
   عمل Texture للنصوص (لأسماء الشوارع)
   ============================================================ */
function makeTextTexture(text, bgColor, textColor, width, height) {
  width = width || 512;
  height = height || 128;
  bgColor = bgColor || '#1a5a9a';
  textColor = textColor || '#ffffff';
  
  var canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  var ctx = canvas.getContext('2d');
  
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, height);
  
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 6;
  ctx.strokeRect(6, 6, width - 12, height - 12);
  
  ctx.fillStyle = textColor;
  ctx.font = 'bold 60px "Segoe UI", Tahoma, Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, width / 2, height / 2);
  
  var tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 4;
  return tex;
}

/* ============================================================
   بيانات الشوارع الحقيقية
   ============================================================ */
var ROADS_DATA = [
  { name: 'شارع أحمد عرابي', x: 0, z: -15, width: 20, length: 1500, rotation: 0, isMain: true, signColor: '#1a5a9a' },
  { name: 'شارع بورسعيد', x: 0, z: 25, width: 17, length: 1500, rotation: 0, signColor: '#8b1a1a' },
  { name: 'شارع الجيش', x: 280, z: 100, width: 17, length: 700, rotation: Math.PI / 2, signColor: '#1a8a3a' },
  { name: 'شارع الجمهورية', x: -350, z: 0, width: 15, length: 600, rotation: Math.PI / 2, signColor: '#8a1a8a' },
  { name: 'شارع جلال الدسوقي', x: -120, z: 400, width: 14, length: 500, rotation: Math.PI / 2, signColor: '#8a6a1a' },
  { name: 'شارع سيدي عبد القادر', x: -550, z: 100, width: 15, length: 450, rotation: Math.PI / 2, signColor: '#1a8a8a' },
  { name: 'شارع الحدائق', x: 100, z: 350, width: 13, length: 450, rotation: Math.PI / 2, signColor: '#3a8a1a' },
  { name: 'شارع المحور', x: 500, z: 300, width: 13, length: 400, rotation: Math.PI / 2, signColor: '#8a3a1a' },
  { name: 'شارع الجلاء', x: -450, z: -250, width: 14, length: 500, rotation: 0, signColor: '#1a3a8a' },
  { name: 'شارع النصر', x: 400, z: -250, width: 14, length: 500, rotation: 0, signColor: '#8a1a1a' },
  { name: 'شارع المحكمة', x: -250, z: -300, width: 13, length: 400, rotation: Math.PI / 2, signColor: '#5a5a5a' },
  { name: 'شارع الموقف', x: 700, z: 0, width: 13, length: 500, rotation: Math.PI / 2, signColor: '#8a5a1a' },
];

/* ============================================================
   الوجهات الحقيقية
   ============================================================ */
var DESTINATIONS_DATA = [
  { name: 'محطة قطار كفر الدوار', short: 'محطة القطار', x: -250, z: -60, color: 0x8b4513 },
  { name: 'مسجد الثورة', short: 'المسجد', x: -120, z: 200, color: 0x16a085 },
  { name: 'شركة مصر للغزل والنسيج', short: 'شركة الغزل', x: 400, z: -300, color: 0x95a5a6 },
  { name: 'موقف عزيز المصري', short: 'الموقف', x: 180, z: 70, color: 0xe74c3c },
  { name: 'مجمع الميزانة', short: 'الميزانة', x: -150, z: -80, color: 0xf39c12 },
  { name: 'مجمع السعرانية', short: 'السعرانية', x: 400, z: 100, color: 0xe67e22 },
  { name: 'مستشفى كفر الدوار العام', short: 'المستشفى', x: -550, z: 140, color: 0x3498db },
  { name: 'سوق الأربعاء', short: 'السوق', x: 100, z: 180, color: 0x9b59b6 },
  { name: 'كورنيش ترعة المحمودية', short: 'الكورنيش', x: 550, z: -20, color: 0x2980b9 },
  { name: 'جامعة كفر الدوار', short: 'الجامعة', x: -450, z: -280, color: 0x8e44ad },
  { name: 'مدرسة صلاح سالم', short: 'المدرسة', x: -280, z: 350, color: 0xf39c12 },
  { name: 'شارع الجيش التجاري', short: 'الجيش', x: 300, z: 200, color: 0xe74c3c },
];

/* ============================================================
   نظام الأصوات
   ============================================================ */
var AudioSystem = {
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
      this.engineGain.gain.value = 0.025;
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
  
  setEngine: function(on) { 
    if (on) { this.resume(); this.startEngine(); } 
    else { this.stopEngine(); } 
  },
  
  updateEngine: function(speed, maxSpeed, isAcc) {
    if (!this.engineOsc || !this.engineGain || !this.ctx) return;
    var r = Math.min(Math.abs(speed) / maxSpeed, 1);
    this.engineOsc.frequency.setTargetAtTime(55 + r * 125, this.ctx.currentTime, 0.1);
    this.engineGain.gain.setTargetAtTime(0.02 + r * 0.07 + (isAcc ? 0.02 : 0), this.ctx.currentTime, 0.15);
  },
  
  playPickup: function() { 
    if (this.enabled && this.ctx) this._tone(700, 1000, 0.2, 0.12); 
  },
  
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
  
  var waterGeo = new THREE.PlaneGeometry(CONFIG.citySize * 1.4, CONFIG.canalWidth, 20, 3);
  var water = new THREE.Mesh(waterGeo, MAT.canal);
  water.rotation.x = -Math.PI / 2;
  water.position.y = -0.4;
  water.receiveShadow = QUALITY.shadows;
  group.add(water);
  group.userData.water = water;
  group.userData.basePositions = waterGeo.attributes.position.array.slice();
  
  var bankMat = new THREE.MeshStandardMaterial({ color: 0x8b7355, roughness: 0.95 });
  for (var s = -1; s <= 1; s += 2) {
    var bank = new THREE.Mesh(new THREE.BoxGeometry(CONFIG.citySize * 1.4, 2, 3), bankMat);
    bank.position.set(0, 0.8, s * (CONFIG.canalWidth / 2 + 1.5));
    if (QUALITY.shadows) { bank.castShadow = true; bank.receiveShadow = true; }
    group.add(bank);
    
    var railMat = new THREE.MeshStandardMaterial({ color: 0xdddddd, roughness: 0.5, metalness: 0.4 });
    var rail = new THREE.Mesh(new THREE.BoxGeometry(CONFIG.citySize * 1.4, 0.8, 0.15), railMat);
    rail.position.set(0, 2.2, s * (CONFIG.canalWidth / 2 + 3.2));
    if (QUALITY.shadows) rail.castShadow = true;
    group.add(rail);
  }
  
  // الجسر
  var bridge = new THREE.Mesh(
    new THREE.BoxGeometry(26, 2.5, CONFIG.canalWidth + 16),
    new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.9 })
  );
  bridge.position.set(0, 1.5, 0);
  if (QUALITY.shadows) { bridge.castShadow = true; bridge.receiveShadow = true; }
  group.add(bridge);
  
  for (var s = -1; s <= 1; s += 2) {
    var brail = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 1, CONFIG.canalWidth + 16),
      new THREE.MeshStandardMaterial({ color: 0xdddddd, roughness: 0.5, metalness: 0.4 })
    );
    brail.position.set(s * 12, 3.2, 0);
    if (QUALITY.shadows) brail.castShadow = true;
    group.add(brail);
  }
  
  scene.add(group);
  canalRef = group;
}

/* ============================================================
   الشوارع مع لافتات الأسماء
   ============================================================ */
function createRoads() {
  var group = new THREE.Group();
  
  for (var i = 0; i < ROADS_DATA.length; i++) {
    var rd = ROADS_DATA[i];
    
    // جسم الشارع
    var road = new THREE.Mesh(new THREE.BoxGeometry(rd.width, 0.15, rd.length), MAT.road);
    road.position.set(rd.x, 0.08, rd.z);
    road.rotation.y = rd.rotation;
    road.receiveShadow = QUALITY.shadows;
    group.add(road);
    
    // أرصفة
    for (var s = -1; s <= 1; s += 2) {
      var sidewalk = new THREE.Mesh(
        new THREE.BoxGeometry(CONFIG.sidewalkWidth, 0.35, rd.length),
        MAT.sidewalk
      );
      var so = s * (rd.width / 2 + CONFIG.sidewalkWidth / 2);
      var dx = Math.cos(rd.rotation) * so;
      var dz = -Math.sin(rd.rotation) * so;
      sidewalk.position.set(rd.x + dx, 0.25, rd.z + dz);
      sidewalk.rotation.y = rd.rotation;
      sidewalk.receiveShadow = QUALITY.shadows;
      group.add(sidewalk);
    }
    
    // خطوط الطريق
    if (rd.width >= 15) {
      var mc = Math.floor(rd.length / 25);
      for (var j = 0; j < mc; j++) {
        var off = -rd.length / 2 + j * 25 + 12.5;
        var mark = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.05, 7), MAT.roadLine);
        var mx = rd.x + Math.sin(rd.rotation) * off;
        var mz = rd.z + Math.cos(rd.rotation) * off;
        mark.position.set(mx, 0.18, mz);
        mark.rotation.y = rd.rotation;
        group.add(mark);
      }
    }
    
    // لوحة اسم الشارع
    if (rd.isMain || rd.width >= 15) {
      var signTex = makeTextTexture(rd.name, rd.signColor || '#1a5a9a', '#ffffff', 700, 140);
      var signMat = new THREE.MeshBasicMaterial({ map: signTex, side: THREE.DoubleSide });
      var signGeo = new THREE.PlaneGeometry(7, 1.4);
      var sign = new THREE.Mesh(signGeo, signMat);
      
      var signX = rd.x + Math.cos(rd.rotation) * (rd.width / 2 + 1);
      var signZ = rd.z - Math.sin(rd.rotation) * (rd.width / 2 + 1);
      var signY = 5.5;
      
      var poleMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.5, metalness: 0.5 });
      var pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 6), poleMat);
      pole.position.set(signX, 3, signZ);
      if (QUALITY.shadows) pole.castShadow = true;
      group.add(pole);
      
      sign.position.set(signX, signY, signZ);
      sign.rotation.y = 0;
      group.add(sign);
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
  
  var trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15 * scale, 0.22 * scale, 2.2 * scale, 6),
    MAT.treeTrunk
  );
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
  
  var trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.14 * scale, 0.2 * scale, 5.5 * scale, 7),
    MAT.palmTrunk
  );
  trunk.position.y = 2.75 * scale;
  if (QUALITY.shadows) trunk.castShadow = true;
  p.add(trunk);
  
  for (var i = 0; i < 7; i++) {
    var angle = (i / 7) * Math.PI * 2;
    var leaf = new THREE.Mesh(
      new THREE.PlaneGeometry(0.85 * scale, 3.2 * scale),
      MAT.palmLeaf
    );
    leaf.position.set(
      Math.cos(angle) * 0.5 * scale,
      5.5 * scale,
      Math.sin(angle) * 0.5 * scale
    );
    leaf.rotation.z = Math.PI / 2.2;
    leaf.rotation.y = angle;
    p.add(leaf);
  }
  
  p.position.set(x, 0, z);
  return p;
}

function createFoliage() {
  var group = new THREE.Group();
  
  var step = isLowEnd ? 50 : 30;
  for (var x = -CONFIG.citySize * 0.55; x < CONFIG.citySize * 0.55; x += step) {
    if (Math.random() > 0.4) {
      group.add(createPalm(x + Utils.rand(-4, 4), -(CONFIG.canalWidth / 2 + 5), Utils.rand(0.85, 1.15)));
    }
    if (Math.random() > 0.4) {
      group.add(createPalm(x + Utils.rand(-4, 4), (CONFIG.canalWidth / 2 + 5), Utils.rand(0.85, 1.15)));
    }
  }
  
  var count = 0;
  for (var i = 0; i < ROADS_DATA.length && count < QUALITY.treeCount; i++) {
    var rd = ROADS_DATA[i];
    if (rd.width < 13) continue;
    var trees = Math.floor(rd.length / 55);
    for (var j = 0; j < trees && count < QUALITY.treeCount; j++) {
      var off = -rd.length / 2 + j * 55 + 27;
      var s = Math.random() > 0.5 ? 1 : -1;
      var so = s * (rd.width / 2 + CONFIG.sidewalkWidth + 1.5);
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
   المباني الواقعية
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
    if (Math.abs(x - d.x) < 32 && Math.abs(z - d.z) < 32) return true;
  }
  return false;
}

function createDetailedBuilding(x, z, w, d, h) {
  var group = new THREE.Group();
  
  var wallMat = Utils.pick(MAT.buildingWalls);
  var roofMat = Utils.pick(MAT.buildingRoofs);
  
  // المبنى الرئيسي
  var building = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wallMat);
  building.position.y = h / 2;
  if (QUALITY.shadows) {
    building.castShadow = true;
    building.receiveShadow = true;
  }
  group.add(building);
  
  // سقف
  var roof = new THREE.Mesh(new THREE.BoxGeometry(w + 0.4, 0.3, d + 0.4), roofMat);
  roof.position.y = h + 0.15;
  if (QUALITY.shadows) roof.castShadow = true;
  group.add(roof);
  
  // نوافذ
  if (!isLowEnd) {
    var floors = Math.max(1, Math.floor(h / 3));
    var winCols = Math.max(1, Math.floor(w / 3));
    
    for (var f = 0; f < floors; f++) {
      for (var c = 0; c < winCols; c++) {
        var winX = -w / 2 + 1.5 + c * (w / winCols);
        var winY = 1.5 + f * 3;
        
        // نافذة أمامية
        var frame1 = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.7, 0.15), MAT.windowFrame);
        frame1.position.set(winX, winY, d / 2 + 0.05);
        group.add(frame1);
        
        var glass1 = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.4, 0.05), MAT.window);
        glass1.position.set(winX, winY, d / 2 + 0.12);
        group.add(glass1);
        
        // نافذة خلفية
        var frame2 = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.7, 0.15), MAT.windowFrame);
        frame2.position.set(winX, winY, -d / 2 - 0.05);
        group.add(frame2);
      }
    }
  }
  
  // باب المدخل
  var door = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.6, 0.15), MAT.door);
  door.position.set(0, 1.3, d / 2 + 0.08);
  group.add(door);
  
  // مظلة فوق الباب
  var awning = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.1, 1.2), roofMat);
  awning.position.set(0, 2.8, d / 2 + 0.5);
  awning.rotation.x = -0.2;
  group.add(awning);
  
  group.position.set(x, 0, z);
  return group;
}

function createBuildings() {
  var group = new THREE.Group();
  var grid = 40;
  var half = CONFIG.citySize / 2;
  
  for (var gx = -half; gx < half; gx += grid) {
    for (var gz = -half; gz < half; gz += grid) {
      var x = gx + grid / 2 + Utils.rand(-2, 2);
      var z = gz + grid / 2 + Utils.rand(-2, 2);
      
      if (isOnRoad(x, z, 4)) continue;
      if (Math.abs(z) < CONFIG.canalWidth / 2 + 8) continue;
      if (Math.abs(x + 280) < 15) continue;
      if (Math.abs(x) < 18 && Math.abs(z) < 20) continue;
      if (isNearLandmark(x, z)) continue;
      if (Math.random() > QUALITY.buildingDensity) continue;
      
      var w = Utils.rand(10, 18);
      var d = Utils.rand(10, 18);
      var h = Utils.rand(6, 22);
      
      group.add(createDetailedBuilding(x, z, w, d, h));
    }
  }
  
  scene.add(group);
}

/* ============================================================
   المعالم الحقيقية
   ============================================================ */
function createMosque(x, z) {
  var g = new THREE.Group();
  
  var base = new THREE.Mesh(new THREE.BoxGeometry(20, 10, 20), MAT.mosqueWall);
  base.position.y = 5;
  if (QUALITY.shadows) base.castShadow = true;
  g.add(base);
  
  var dome = new THREE.Mesh(
    new THREE.SphereGeometry(6, 20, 14, 0, Math.PI * 2, 0, Math.PI / 2),
    MAT.mosqueDome
  );
  dome.position.y = 10;
  if (QUALITY.shadows) dome.castShadow = true;
  g.add(dome);
  
  var finial = new THREE.Mesh(new THREE.ConeGeometry(0.8, 3, 8), MAT.mosqueGold);
  finial.position.y = 17;
  g.add(finial);
  
  for (var s = -1; s <= 1; s += 2) {
    var minaret = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 22, 10), MAT.mosqueWall);
    minaret.position.set(s * 11, 11, 0);
    if (QUALITY.shadows) minaret.castShadow = true;
    g.add(minaret);
    
    var mTop = new THREE.Mesh(new THREE.ConeGeometry(1.5, 4, 10), MAT.mosqueDome);
    mTop.position.set(s * 11, 24, 0);
    g.add(mTop);
  }
  
  g.position.set(x, 0, z);
  return g;
}

function createStation(x, z) {
  var g = new THREE.Group();
  
  var main = new THREE.Mesh(new THREE.BoxGeometry(32, 9, 14), MAT.stationWall);
  main.position.y = 4.5;
  if (QUALITY.shadows) main.castShadow = true;
  g.add(main);
  
  var roof = new THREE.Mesh(new THREE.BoxGeometry(34, 0.8, 16), MAT.stationRoof);
  roof.position.y = 9.4;
  g.add(roof);
  
  var tower = new THREE.Mesh(new THREE.BoxGeometry(5, 16, 5), MAT.stationWall);
  tower.position.set(11, 12, 0);
  g.add(tower);
  
  var towerRoof = new THREE.Mesh(new THREE.ConeGeometry(3.5, 4, 4), MAT.stationRoof);
  towerRoof.position.set(11, 22, 0);
  towerRoof.rotation.y = Math.PI / 4;
  g.add(towerRoof);
  
  var clockFace = new THREE.Mesh(
    new THREE.CircleGeometry(1.8, 24),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  );
  clockFace.position.set(11, 16, 2.55);
  g.add(clockFace);
  
  g.position.set(x, 0, z);
  return g;
}

function createFactory(x, z) {
  var g = new THREE.Group();
  
  var main = new THREE.Mesh(new THREE.BoxGeometry(48, 16, 36), MAT.factoryWall);
  main.position.y = 8;
  if (QUALITY.shadows) main.castShadow = true;
  g.add(main);
  
  for (var i = 0; i < 3; i++) {
    var chimney = new THREE.Mesh(
      new THREE.CylinderGeometry(1.8, 2.2, 32, 12),
      MAT.factoryChimney
    );
    chimney.position.set(-15 + i * 15, 24, -14);
    if (QUALITY.shadows) chimney.castShadow = true;
    g.add(chimney);
  }
  
  g.position.set(x, 0, z);
  return g;
}

function createHospital(x, z) {
  var g = new THREE.Group();
  
  var main = new THREE.Mesh(new THREE.BoxGeometry(30, 16, 22), MAT.hospitalWall);
  main.position.y = 8;
  if (QUALITY.shadows) main.castShadow = true;
  g.add(main);
  
  var stripe = new THREE.Mesh(
    new THREE.BoxGeometry(30.5, 1, 22.5),
    new THREE.MeshStandardMaterial({ color: 0xcc0000, roughness: 0.6 })
  );
  stripe.position.y = 3;
  g.add(stripe);
  
  var crossV = new THREE.Mesh(new THREE.BoxGeometry(1, 4, 0.3), MAT.hospitalRed);
  crossV.position.set(0, 20, 11.1);
  g.add(crossV);
  
  var crossH = new THREE.Mesh(new THREE.BoxGeometry(4, 1, 0.3), MAT.hospitalRed);
  crossH.position.set(0, 20, 11.1);
  g.add(crossH);
  
  g.position.set(x, 0, z);
  return g;
}

function createSouk(x, z) {
  var g = new THREE.Group();
  var colors = [0xe74c3c, 0x3498db, 0xf39c12, 0x2ecc71, 0x9b59b6, 0xe67e22, 0x1abc9c, 0xcc3333];
  
  for (var i = 0; i < 12; i++) {
    var angle = (i / 12) * Math.PI * 2;
    var cx = Math.cos(angle) * 10;
    var cz = Math.sin(angle) * 10;
    
    var stall = new THREE.Mesh(
      new THREE.BoxGeometry(3, 2.5, 3),
      new THREE.MeshStandardMaterial({ color: colors[i % colors.length], roughness: 0.85 })
    );
    stall.position.set(cx, 1.25, cz);
    if (QUALITY.shadows) stall.castShadow = true;
    g.add(stall);
    
    var awning = new THREE.Mesh(
      new THREE.ConeGeometry(2.8, 1.8, 4),
      new THREE.MeshStandardMaterial({ color: 0xf5f5f5, roughness: 0.85 })
    );
    awning.position.set(cx, 3.6, cz);
    awning.rotation.y = Math.PI / 4;
    g.add(awning);
  }
  
  g.position.set(x, 0, z);
  return g;
}

function createBusStop(x, z, color) {
  var g = new THREE.Group();
  
  var sign = new THREE.Mesh(
    new THREE.BoxGeometry(4, 2.5, 0.2),
    new THREE.MeshStandardMaterial({ color: color })
  );
  sign.position.y = 3;
  g.add(sign);
  
  for (var s = -1; s <= 1; s += 2) {
    var pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.1, 4),
      new THREE.MeshStandardMaterial({ color: 0x666666, metalness: 0.6 })
    );
    pole.position.set(s * 1.5, 2, 0);
    g.add(pole);
  }
  
  var roof = new THREE.Mesh(
    new THREE.BoxGeometry(6, 0.2, 4),
    new THREE.MeshStandardMaterial({ color: 0x333333 })
  );
  roof.position.y = 4.2;
  g.add(roof);
  
  g.position.set(x, 0, z);
  return g;
}

function createLandmarks() {
  var group = new THREE.Group();
  
  group.add(createStation(-250, -60));
  group.add(createMosque(-120, 200));
  group.add(createFactory(400, -300));
  group.add(createHospital(-550, 140));
  group.add(createSouk(100, 180));
  group.add(createBusStop(180, 70, 0xe74c3c));
  group.add(createBusStop(-150, -80, 0xf39c12));
  group.add(createBusStop(400, 100, 0xe67e22));
  group.add(createBusStop(550, -20, 0x2980b9));
  
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
  
  var tireGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.22, 12);
  var rimGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.24, 8);
  var rimMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.3, metalness: 0.8 });
  
  for (var wx = -1; wx <= 1; wx += 2) {
    for (var wz = -1; wz <= 1; wz += 2) {
      var tire = new THREE.Mesh(tireGeo, MAT.carTire);
      tire.rotation.z = Math.PI / 2;
      tire.position.set(wx * 0.9, 0.32, wz * 1.2);
      if (QUALITY.shadows) tire.castShadow = true;
      car.add(tire);
      
      var rim = new THREE.Mesh(rimGeo, rimMat);
      rim.rotation.z = Math.PI / 2;
      rim.position.set(wx * 0.9, 0.32, wz * 1.2);
      car.add(rim);
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
    car.userData = { 
      road: rd, offset: off, 
      speed: Utils.rand(2, 5), 
      direction: Math.random() > 0.5 ? 1 : -1 
    };
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
    
    if (ud.offset > ud.road.length / 2 - 20) { 
      ud.direction = -1; 
      c.rotation.y = ud.road.rotation + Math.PI; 
    }
    if (ud.offset < -ud.road.length / 2 + 20) { 
      ud.direction = 1; 
      c.rotation.y = ud.road.rotation; 
    }
    
    c.position.x = ud.road.x + Math.sin(ud.road.rotation) * ud.offset;
    c.position.z = ud.road.z + Math.cos(ud.road.rotation) * ud.offset;
  }
}

/* ============================================================
   الناس الواقعيين
   ============================================================ */
var people = [];
function createPerson(x, z) {
  var p = new THREE.Group();
  
  var shirtMat = Utils.pick(MAT.peopleShirt);
  var pantsMat = Utils.pick(MAT.peoplePants);
  var skinMat = Utils.pick(MAT.peopleSkin);
  var hairMat = Utils.pick(MAT.peopleHair);
  
  var torso = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.65, 0.26), shirtMat);
  torso.position.y = 1.08;
  if (QUALITY.shadows) torso.castShadow = true;
  p.add(torso);
  
  var neck = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.1), skinMat);
  neck.position.y = 1.43;
  p.add(neck);
  
  var head = new THREE.Mesh(new THREE.SphereGeometry(0.17, 10, 10), skinMat);
  head.position.y = 1.62;
  if (QUALITY.shadows) head.castShadow = true;
  p.add(head);
  
  var hair = new THREE.Mesh(
    new THREE.SphereGeometry(0.18, 10, 10, 0, Math.PI * 2, 0, Math.PI / 2),
    hairMat
  );
  hair.position.y = 1.65;
  p.add(hair);
  
  var legs = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.8, 0.26), pantsMat);
  legs.position.y = 0.35;
  if (QUALITY.shadows) legs.castShadow = true;
  p.add(legs);
  
  var shoes = new THREE.Mesh(
    new THREE.BoxGeometry(0.44, 0.08, 0.32),
    new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.9 })
  );
  shoes.position.y = -0.03;
  p.add(shoes);
  
  var armGeo = new THREE.BoxGeometry(0.12, 0.58, 0.12);
  var armL = new THREE.Mesh(armGeo, shirtMat);
  armL.position.set(-0.27, 1.08, 0);
  p.add(armL);
  
  var armR = new THREE.Mesh(armGeo, shirtMat);
  armR.position.set(0.27, 1.08, 0);
  p.add(armR);
  
  p.position.set(x, 0, z);
  p.userData = {
    direction: Math.random() * Math.PI * 2,
    speed: Utils.rand(0.8, 1.6),
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
    
    ud.walkPhase += dt * 5;
    p.position.y = Math.abs(Math.sin(ud.walkPhase)) * 0.05;
    
    ud.wanderTimer -= dt;
    if (ud.wanderTimer <= 0) {
      ud.direction += Utils.rand(-0.8, 0.8);
      ud.wanderTimer = Utils.rand(1, 3);
    }
    
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
  t.name = 'tukTuk';
  
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
  
  // هيكل
  var chassis = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.12, 2.4), black);
  chassis.position.y = 0.42;
  if (QUALITY.shadows) chassis.castShadow = true;
  t.add(chassis);
  
  // أرضية
  var floorF = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.08, 1.0), black);
  floorF.position.set(0, 0.52, 0.65);
  t.add(floorF);
  
  var floorR = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.08, 1.3), black);
  floorR.position.set(0, 0.52, -0.6);
  t.add(floorR);
  
  // مقدمة
  var front = new THREE.Mesh(new THREE.BoxGeometry(1.28, 0.85, 1.0), yellow);
  front.position.set(0, 0.95, 0.6);
  if (QUALITY.shadows) front.castShadow = true;
  t.add(front);
  
  // كابينة خلفية
  var rear = new THREE.Mesh(new THREE.BoxGeometry(1.32, 1.5, 1.4), yellow);
  rear.position.set(0, 1.25, -0.6);
  if (QUALITY.shadows) rear.castShadow = true;
  t.add(rear);
  
  // سقف
  var roof = new THREE.Mesh(new THREE.BoxGeometry(1.42, 0.1, 2.5), black);
  roof.position.set(0, 2.1, 0);
  if (QUALITY.shadows) roof.castShadow = true;
  t.add(roof);
  
  // أعمدة السقف
  var pillarGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.75, 6);
  var positions = [
    [-0.62, 1.2, -1.2], [0.62, 1.2, -1.2],
    [-0.62, 1.2, -0.05], [0.62, 1.2, -0.05],
    [-0.62, 1.2, 1.05], [0.62, 1.2, 1.05],
  ];
  for (var i = 0; i < positions.length; i++) {
    var p = new THREE.Mesh(pillarGeo, black);
    p.position.set(positions[i][0], positions[i][1], positions[i][2]);
    t.add(p);
  }
  
  // زجاج أمامي
  var windshield = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.85, 0.04), glassMat);
  windshield.position.set(0, 1.85, 1.1);
  windshield.rotation.x = -0.1;
  t.add(windshield);
  
  // زجاج جانبي
  for (var s = -1; s <= 1; s += 2) {
    var sg = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.8, 0.9), glassMat);
    sg.position.set(s * 0.64, 1.8, 0.6);
    t.add(sg);
    
    var rg = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.95, 1.2), glassMat);
    rg.position.set(s * 0.66, 1.7, -0.6);
    t.add(rg);
  }
  
  // زجاج خلفي
  var rearGlass = new THREE.Mesh(new THREE.BoxGeometry(1.28, 1, 0.04), glassMat);
  rearGlass.position.set(0, 1.7, -1.28);
  t.add(rearGlass);
  
  // مصابيح أمامية
  var hlGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.08, 12);
  for (var s = -1; s <= 1; s += 2) {
    var hl = new THREE.Mesh(hlGeo, chrome);
    hl.rotation.x = Math.PI / 2;
    hl.position.set(s * 0.44, 1.15, 1.12);
    t.add(hl);
    
    var hlg = new THREE.Mesh(hlGeo, hlMat);
    hlg.rotation.x = Math.PI / 2;
    hlg.position.set(s * 0.44, 1.15, 1.15);
    t.add(hlg);
  }
  
  // فوانيس خلفية
  var tlGeo = new THREE.BoxGeometry(0.12, 0.2, 0.05);
  for (var s = -1; s <= 1; s += 2) {
    var tl = new THREE.Mesh(tlGeo, tlMat);
    tl.position.set(s * 0.48, 0.9, -1.3);
    t.add(tl);
  }
  
  // شبكة أمامية
  var grill = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.3, 0.06), chrome);
  grill.position.set(0, 0.95, 1.13);
  t.add(grill);
  
  // مقود
  var steerG = new THREE.Group();
  var steerRing = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.02, 6, 16), black);
  steerG.add(steerRing);
  for (var i = 0; i < 3; i++) {
    var spoke = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.14, 0.015), black);
    spoke.rotation.z = (i / 3) * Math.PI * 2;
    steerG.add(spoke);
  }
  steerG.position.set(0, 1.5, 0.8);
  steerG.rotation.x = -0.35;
  t.add(steerG);
  
  // لوحة قيادة
  var dash = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.2, 0.3), black);
  dash.position.set(0, 1.3, 0.95);
  t.add(dash);
  
  // مقاعد
  var seat1 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.1, 0.45), seatMat);
  seat1.position.set(0, 0.78, 0.3);
  if (QUALITY.shadows) seat1.castShadow = true;
  t.add(seat1);
  
  var back1 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.08), seatMat);
  back1.position.set(0, 1.05, 0.1);
  t.add(back1);
  
  var seat2 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.1, 0.5), seatMat);
  seat2.position.set(0, 0.78, -0.7);
  if (QUALITY.shadows) seat2.castShadow = true;
  t.add(seat2);
  
  var back2 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.6, 0.08), seatMat);
  back2.position.set(0, 1.1, -0.95);
  t.add(back2);
  
  // عجلات
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
  
  makeWheel(0, 1.1, true);
  makeWheel(-0.6, -0.75, false);
  makeWheel(0.6, -0.75, false);
  
  // إضاءة
  var headlight = new THREE.SpotLight(0xfff5cc, 2, 25, Math.PI / 5, 0.4, 1.5);
  headlight.position.set(0, 1.15, 1.1);
  headlight.target.position.set(0, 0.2, 15);
  t.add(headlight);
  t.add(headlight.target);
  
  t.userData = {
    wheels: wheels,
    steeringWheel: steerG,
    headlight: headlight,
  };
  
  return t;
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
  dialogTimer: 0,
};

/* ============================================================
   كاميرا الشخص الثالث
   ============================================================ */
var cameraOffset = {
  distance: 7.5,
  height: 3.8,
  lookAtHeight: 1.3,
};

function updateCamera(dt) {
  var forward = new THREE.Vector3(
    Math.sin(tukTuk.rotation.y),
    0,
    Math.cos(tukTuk.rotation.y)
  );
  
  var targetPos = tukTuk.position.clone()
    .sub(forward.multiplyScalar(cameraOffset.distance))
    .add(new THREE.Vector3(0, cameraOffset.height, 0));
  
  var smoothFactor = 1 - Math.pow(0.001, dt);
  camera.position.lerp(targetPos, smoothFactor);
  
  var lookTarget = tukTuk.position.clone();
  lookTarget.y += cameraOffset.lookAtHeight;
  
  camera.lookAt(lookTarget);
  
  var sr = Math.min(Math.abs(player.speed) / CONFIG.maxSpeed, 1);
  camera.rotation.z = -player.steering * 0.03 * sr;
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
    btnLeft: 'left',
    btnRight: 'right',
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
  
  var inCanalX = !(newPos.x > -13 && newPos.x < 13);
  var nearCanal = Math.abs(newPos.z) < CONFIG.canalWidth / 2 + 1.5;
  
  if (nearCanal && inCanalX) {
    player.speed *= -0.25;
  } else if (Math.abs(newPos.x) < CONFIG.citySize / 2 - 3 && Math.abs(newPos.z) < CONFIG.citySize / 2 - 3) {
    tukTuk.position.copy(newPos);
  } else {
    player.speed *= -0.3;
  }
  
  var wheelRoll = (player.speed * dt) / 0.24;
  for (var i = 0; i < tukTuk.userData.wheels.length; i++) {
    var w = tukTuk.userData.wheels[i];
    var tire = w.children[0];
    if (tire) tire.rotation.x += wheelRoll;
    if (w.userData.isFront) w.rotation.y = player.currentWheelAngle;
  }
  
  tukTuk.userData.steeringWheel.rotation.z = -player.steering * Math.PI * 0.85;
  
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
  dialogTimer: 0,
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
    if (rd.width < 14) continue;
    
    var steps = Math.floor(rd.length / 80);
    for (var j = 0; j < steps; j++) {
      var off = -rd.length / 2 + j * 80 + 40;
      var side = Math.random() > 0.5 ? 1 : -1;
      var so = side * (rd.width / 2 + CONFIG.sidewalkWidth / 2);
      var x = rd.x + Math.sin(rd.rotation) * off + Math.cos(rd.rotation) * so;
      var z = rd.z + Math.cos(rd.rotation) * off - Math.sin(rd.rotation) * so;
      
      if (Math.abs(z) < CONFIG.canalWidth / 2 + 4) continue;
      if (Math.abs(x + 280) < 8) continue;
      
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
  
  var torsoMat = new THREE.MeshStandardMaterial({ color: shirtColor, roughness: 0.85 });
  var torso = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.65, 0.28), torsoMat);
  torso.position.y = 1.1;
  if (QUALITY.shadows) torso.castShadow = true;
  group.add(torso);
  
  var headMat = new THREE.MeshStandardMaterial({ color: skinColor, roughness: 0.9 });
  var head = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 8), headMat);
  head.position.y = 1.6;
  if (QUALITY.shadows) head.castShadow = true;
  group.add(head);
  
  var legsMat = new THREE.MeshStandardMaterial({ color: 0x2c3e50, roughness: 0.9 });
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
  } while (attempts < 10 && passengers.some(function(p) { 
    return p.destination.name === destination.name; 
  }));
  
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
      
      // جملة السواق
      UI.showDialog(Utils.pick(DIALOGS.pickup), 3000);
      UI.showToast('✅ راكب صعد! → ' + dest.name, 2500);
      
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
    UI.showDialog(Utils.pick(DIALOGS.arrived), 2500);
    UI.showToast('🎉 توصيل! +' + reward + ' جنيه +30 ثانية', 2500);
    
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
  if (UI.moneyValue) UI.moneyValue.textContent = gameState.money;
  if (UI.deliveriesValue) UI.deliveriesValue.textContent = gameState.deliveries;
  if (UI.timeValue) UI.timeValue.textContent = Utils.formatTime(gameState.timeLeft);
  
  if (UI.timeValue) {
    if (gameState.timeLeft < 30) {
      UI.timeValue.classList.add('warning');
    } else {
      UI.timeValue.classList.remove('warning');
    }
  }
  
  var speedKmh = Math.abs(player.speed) * 3.6 * 3.5;
  if (UI.speedValue) UI.speedValue.textContent = Math.round(speedKmh);
}

function updateMissionUI() {
  if (!UI.missionPanel) return;
  
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
  
  // جمل السواق العشوائية
  if (player.hasPassenger) {
    gameState.dialogTimer -= dt;
    if (gameState.dialogTimer <= 0) {
      UI.showDialog(Utils.pick(DIALOGS.driving), 2500);
      gameState.dialogTimer = Utils.rand(8, 15);
    }
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
  updatePeople(dt);
  updateCars(dt);
  
  var isAccelerating = !!(keys['KeyW'] || keys['ArrowUp'] || mobileInput.accel);
  AudioSystem.updateEngine(Math.abs(player.speed), CONFIG.maxSpeed, isAccelerating);
  
  sunLight.position.set(tukTuk.position.x + 100, 200, tukTuk.position.z + 80);
  sunLight.target.position.copy(tukTuk.position);
  sunLight.target.updateMatrixWorld();
  
  updateHUD();
  renderer.render(scene, camera);
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
    { name: 'بناء المباني...', fn: createBuildings, weight: 20 },
    { name: 'بناء المعالم...', fn: createLandmarks, weight: 10 },
    { name: 'إضافة الناس والسيارات...', fn: function() {
      createPeople();
      createCars();
    }, weight: 5 },
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
    UI.hud.classList.add('visible');
    UI.missionPanel.classList.add('visible');
    UI.pauseBtn.style.display = 'flex';
    UI.fullscreenBtn.style.display = 'flex';
    
    if (isMobile) {
      UI.controls.classList.add('visible');
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
    UI.hud.classList.add('visible');
    UI.missionPanel.classList.add('visible');
    UI.pauseBtn.style.display = 'flex';
    UI.fullscreenBtn.style.display = 'flex';
    
    if (isMobile) {
      UI.controls.classList.add('visible');
      UI.showHint('استخدم الأزرار للقيادة', 5000);
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
    UI.startBtn.textContent = '🚀 ابدأ الشغل';
  }
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
  gameState.dialogTimer = 5;
  
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
    gameState.lastTime = performance.now();
  }
}

function endGame() {
  gameState.running = false;
  AudioSystem.setEngine(false);
  
  var avgRating = gameState.deliveries > 0
    ? (gameState.ratingSum / gameState.deliveries).toFixed(1)
    : '0';
  
  UI.endTitle.textContent = gameState.deliveries > 0 ? '🎉 يوم شغل جميل!' : '⏰ خلص الوقت!';
  UI.endMoney.textContent = gameState.money + ' جنيه';
  UI.endDeliveries.textContent = gameState.deliveries;
  UI.endRating.textContent = avgRating + ' ⭐';
  
  UI.endScreen.classList.remove('hidden');
  UI.controls.classList.remove('visible');
  UI.pauseBtn.style.display = 'none';
  UI.fullscreenBtn.style.display = 'none';
  
  console.log('🏁 انتهت اللعبة');
}

/* ============================================================
   ملء الشاشة
   ============================================================ */
function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(function(e) {
      console.log('Fullscreen error:', e);
    });
  } else {
    document.exitFullscreen();
  }
}

/* ============================================================
   ربط الأزرار
   ============================================================ */
if (UI.startBtn) {
  UI.startBtn.addEventListener('click', function(e) {
    e.preventDefault();
    startGame();
  });
  
  UI.startBtn.addEventListener('touchstart', function(e) {
    e.preventDefault();
    startGame();
  }, { passive: false });
}

if (UI.restartBtn) {
  UI.restartBtn.addEventListener('click', function() {
    UI.endScreen.classList.add('hidden');
    startGame();
  });
}

if (UI.pauseBtn) {
  UI.pauseBtn.addEventListener('click', togglePause);
}

if (UI.fullscreenBtn) {
  UI.fullscreenBtn.addEventListener('click', toggleFullscreen);
}

document.addEventListener('keydown', function(e) {
  if (e.code === 'Escape' || e.code === 'KeyP') {
    if (gameState.running) togglePause();
  }
});

document.addEventListener('contextmenu', function(e) { e.preventDefault(); });

console.log('🎮 اللعبة جاهزة! اضغط "🚀 ابدأ الشغل"');

})();
