/* ============================================================
   🛺 توك توك كفر الدوار مع مشرط - الجزء 1: الإعداد والمدينة
   النسخة الاحترافية - مُحسّنة للموبايل بدون تهنيج
   ============================================================ */

console.log('🚀 بدء تحميل اللعبة...');

if (typeof THREE === 'undefined') {
  alert('فشل تحميل Three.js');
  throw new Error('Three.js not loaded');
}

console.log('✅ Three.js v' + THREE.REVISION);

/* ============================================================
   كشف الجهاز - تحسينات الأداء
   ============================================================ */
var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  || (navigator.maxTouchPoints && navigator.maxTouchPoints > 2);
var isLowEnd = isMobile;

console.log('📱 الجهاز:', isMobile ? 'موبايل' : 'كمبيوتر');

/* ═══ إعدادات الجودة - مُخفّضة جداً لمنع التهنيج ═══ */
var QUALITY = {
  pixelRatio: 0.7,        // منخفض جداً لمنع التهنيج
  fogFar: 280,
  treeCount: 12,
  buildingDensity: 0.3,
  peopleCount: 15,
  carsCount: 4,
  maxBuildings: 130,
  detailedBuildings: 25
};

var CONFIG = {
  citySize: 1100,
  canalWidth: 22,
  roadWidth: 20,
  sidewalkWidth: 2.8,
  maxSpeed: 14,
  maxReverseSpeed: 4,
  acceleration: 6,
  braking: 12,
  friction: 0.7,
  steeringSpeed: 3.2,
  maxWheelAngle: 0.55,
  gameDuration: 300,
  deliveryBonus: 30,
  maxPassengers: 3
};

var COLORS = {
  sky: 0x87CEEB,
  ground: 0x6a8a4a,
  road: 0x2a2a2a,
  sidewalk: 0xb0a890,
  canal: 0x1a5a8a
};

/* ============================================================
   المشهد والكاميرا
   ============================================================ */
var scene = new THREE.Scene();
scene.background = new THREE.Color(COLORS.sky);
scene.fog = new THREE.Fog(COLORS.sky, 80, QUALITY.fogFar);

var camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.5,
  1000
);

var canvas = document.getElementById('gameCanvas');
var renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: false,
  powerPreference: 'high-performance',
  stencil: false,
  alpha: false,
  depth: true
});

/* ═══ ضبط الحجم بشكل صحيح 100% (حل مشكلة ملء الشاشة) ═══ */
function updateSize() {
  var w = window.innerWidth;
  var h = window.innerHeight;
  
  // استخدام dvw/dvh لو متاح
  if (window.visualViewport) {
    w = window.visualViewport.width;
    h = window.visualViewport.height;
  }
  
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h, false);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, QUALITY.pixelRatio));
  
  canvas.style.width = w + 'px';
  canvas.style.height = h + 'px';
}

updateSize();
window.addEventListener('resize', updateSize);
window.addEventListener('orientationchange', function() {
  setTimeout(updateSize, 100);
  setTimeout(updateSize, 300);
  setTimeout(updateSize, 600);
});

if (window.visualViewport) {
  window.visualViewport.addEventListener('resize', updateSize);
}

renderer.shadowMap.enabled = false;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;

/* ============================================================
   الإضاءة
   ============================================================ */
var sunLight = new THREE.DirectionalLight(0xfff5e0, 2.2);
sunLight.position.set(180, 250, 120);
scene.add(sunLight);
scene.add(sunLight.target);

scene.add(new THREE.AmbientLight(0xffffff, 1.3));
scene.add(new THREE.HemisphereLight(0x87CEEB, 0x4a5a3a, 1.0));

/* ============================================================
   واجهة المستخدم
   ============================================================ */
var UI = {
  loadingScreen: document.getElementById('loadingScreen'),
  startScreen: document.getElementById('startScreen'),
  endScreen: document.getElementById('endScreen'),
  startBtn: document.getElementById('startBtn'),
  restartBtn: document.getElementById('restartBtn'),
  loadingFill: document.getElementById('loadingFill'),
  loadingText: document.getElementById('loadingText'),
  hud: document.getElementById('hud'),
  missionPanel: document.getElementById('missionPanel'),
  pauseBtn: document.getElementById('pauseBtn'),
  radioBtn: document.getElementById('radioBtn'),
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
  radioPanel: document.getElementById('radioPanel'),
  radioToggle: document.getElementById('radioToggle'),
  radioTrack: document.getElementById('radioTrack'),
  radioPrev: document.getElementById('radioPrev'),
  radioNext: document.getElementById('radioNext'),
  
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
   كلام مشرط المصري
   ============================================================ */
var DIALOGS = {
  pickup: [
    'يلا يا معلم، اركب بسرعة',
    'اتفضل يسطا، مشرط تحت أمرك',
    'أهلاً يا زعيم، هنمشي حالاً',
    'طيب يا باشا، اركب وربنا يكرم',
    'يلا بينا يسطا، الوقت بيجري',
    'اركب يا معلم، ده مشرط اللي معاك',
    'أهلاً وسهلاً، اتفضل ورا',
    'صباح الفل يا باشا، اركب معايا',
    'على راسي يا معلم، اركب',
    'أيوه كده، اركب يسطا مع مشرط'
  ],
  driving: [
    'الطريق زحمة النهاردة والله',
    'يلا نلف من شارع أحمد عرابي',
    'أنا مشرط، مفيش حد يقدر عليّا',
    'الترعة على شمالنا يسطا',
    'هنا سوق الأربعاء، الدنيا زحمة',
    'كفر الدوار دي بلدي يا معلم',
    'عدينا على مسجد الثورة',
    'ده شارع بورسعيد يسطا',
    'ربنا يكرمك يا معلم',
    'على فكرة، عماد هارون صاحبي',
    'البيضا دي بلدي، متربي فيها',
    'قربنا نوصل يا باشا'
  ],
  arrived: [
    'وصلنا يا باشا، اتفضل',
    'الحمد لله، كنا في الموعد',
    'أيوه كده، المكان ده هو',
    'يلا يا معلم، نوّرت',
    'وصلنا بألف سلامة يسطا'
  ],
  idle: [
    'مشرط قاعد على قهوة عماد هارون',
    'قهوة عماد هارون دي أحلى قهوة في البيضا',
    'يلا ناخد شيشة قبل الشغل'
  ]
};

/* ============================================================
   الراديو
   ============================================================ */
var RADIO_TRACKS = [
  { file: '1.mp3', name: 'الطريق الزراعي' },
  { file: '2.mp3', name: 'شوارع كفر الدوار' },
  { file: '3.mp3', name: 'ترعة المحمودية' },
  { file: '4.mp3', name: 'أغاني شعبية' },
  { file: '5.mp3', name: 'كورنيش الإسكندرية' }
];

var radio = {
  audio: null,
  currentTrack: 0,
  isPlaying: false,
  init: function() {
    if (this.audio) return;
    this.audio = new Audio();
    this.audio.volume = 0.35;
    var self = this;
    this.audio.addEventListener('ended', function() { self.next(); });
  },
  play: function() {
    if (!this.audio) this.init();
    if (!this.audio) return;
    var track = RADIO_TRACKS[this.currentTrack];
    this.audio.src = track.file;
    this.audio.volume = 0.35;
    var self = this;
    this.audio.play().then(function() {
      console.log('🎵 راديو: ' + track.name);
    }).catch(function(e) {
      console.warn('⚠️ الراديو:', e.message);
      self.isPlaying = false;
      if (UI.radioToggle) UI.radioToggle.textContent = '▶️';
    });
    this.isPlaying = true;
    if (UI.radioTrack) UI.radioTrack.textContent = track.name;
    if (UI.radioToggle) UI.radioToggle.textContent = '⏸️';
  },
  pause: function() {
    if (this.audio) this.audio.pause();
    this.isPlaying = false;
    if (UI.radioToggle) UI.radioToggle.textContent = '▶️';
  },
  toggle: function() {
    if (this.isPlaying) this.pause();
    else this.play();
  },
  next: function() {
    this.currentTrack = (this.currentTrack + 1) % RADIO_TRACKS.length;
    if (this.isPlaying) this.play();
    else if (UI.radioTrack) UI.radioTrack.textContent = RADIO_TRACKS[this.currentTrack].name;
  },
  prev: function() {
    this.currentTrack = (this.currentTrack - 1 + RADIO_TRACKS.length) % RADIO_TRACKS.length;
    if (this.isPlaying) this.play();
    else if (UI.radioTrack) UI.radioTrack.textContent = RADIO_TRACKS[this.currentTrack].name;
  }
};

/* ============================================================
   المواد - كلها Lambert للأداء
   ============================================================ */
var MAT = {
  ground: new THREE.MeshLambertMaterial({ color: 0x6a8a4a }),
  groundDark: new THREE.MeshLambertMaterial({ color: 0x5a7a3a }),
  road: new THREE.MeshLambertMaterial({ color: 0x2a2a2a }),
  roadLine: new THREE.MeshBasicMaterial({ color: 0xffcc00 }),
  sidewalk: new THREE.MeshLambertMaterial({ color: 0xb0a890 }),
  sidewalkCurb: new THREE.MeshLambertMaterial({ color: 0x808080 }),
  
  // ترعة المحمودية
  canal: new THREE.MeshLambertMaterial({ color: 0x1a5a8a }),
  canalBank: new THREE.MeshLambertMaterial({ color: 0x8b7355 }),
  bridge: new THREE.MeshLambertMaterial({ color: 0x555555 }),
  
  // مباني
  plaster: new THREE.MeshLambertMaterial({ color: 0xf0e8d8 }),
  plasterPink: new THREE.MeshLambertMaterial({ color: 0xe8d0c0 }),
  plasterYellow: new THREE.MeshLambertMaterial({ color: 0xf0d898 }),
  plasterBlue: new THREE.MeshLambertMaterial({ color: 0xc8d8e8 }),
  plasterGreen: new THREE.MeshLambertMaterial({ color: 0xc8e0c0 }),
  brick: new THREE.MeshLambertMaterial({ color: 0xb85c38 }),
  brickDark: new THREE.MeshLambertMaterial({ color: 0x8b3a1f }),
  concrete: new THREE.MeshLambertMaterial({ color: 0xd8d0c0 }),
  tiles: new THREE.MeshLambertMaterial({ color: 0x8b6a4a }),
  tilesRed: new THREE.MeshLambertMaterial({ color: 0xa85040 }),
  metalDoor: new THREE.MeshLambertMaterial({ color: 0x4a4a4a }),
  woodDoor: new THREE.MeshLambertMaterial({ color: 0x6a3a1a }),
  balconyRail: new THREE.MeshLambertMaterial({ color: 0x4a4a4a }),
  acUnit: new THREE.MeshLambertMaterial({ color: 0xd0d0d0 }),
  glass: new THREE.MeshLambertMaterial({ color: 0x88ccff, transparent: true, opacity: 0.5 }),
  window: new THREE.MeshLambertMaterial({ color: 0x88ccff }),
  
  shopAwning: [
    new THREE.MeshLambertMaterial({ color: 0xe74c3c }),
    new THREE.MeshLambertMaterial({ color: 0x3498db }),
    new THREE.MeshLambertMaterial({ color: 0x2ecc71 }),
    new THREE.MeshLambertMaterial({ color: 0xf39c12 })
  ],
  
  treeTrunk: new THREE.MeshLambertMaterial({ color: 0x5a3a20 }),
  treeLeaf: new THREE.MeshLambertMaterial({ color: 0x3a7a3a }),
  palmTrunk: new THREE.MeshLambertMaterial({ color: 0x8b6a3a }),
  palmLeaf: new THREE.MeshLambertMaterial({ color: 0x3a8a3a, side: THREE.DoubleSide }),
  
  carBody: [
    new THREE.MeshLambertMaterial({ color: 0xcc3333 }),
    new THREE.MeshLambertMaterial({ color: 0x3366cc }),
    new THREE.MeshLambertMaterial({ color: 0xcccccc }),
    new THREE.MeshLambertMaterial({ color: 0x333333 }),
    new THREE.MeshLambertMaterial({ color: 0xf39c12 })
  ],
  carTire: new THREE.MeshLambertMaterial({ color: 0x1a1a1a }),
  
  peopleShirt: [
    new THREE.MeshLambertMaterial({ color: 0xe74c3c }),
    new THREE.MeshLambertMaterial({ color: 0x3498db }),
    new THREE.MeshLambertMaterial({ color: 0x2ecc71 }),
    new THREE.MeshLambertMaterial({ color: 0xf39c12 }),
    new THREE.MeshLambertMaterial({ color: 0x9b59b6 }),
    new THREE.MeshLambertMaterial({ color: 0x1abc9c }),
    new THREE.MeshLambertMaterial({ color: 0xffffff }),
    new THREE.MeshLambertMaterial({ color: 0x2c3e50 })
  ],
  peoplePants: [
    new THREE.MeshLambertMaterial({ color: 0x2c3e50 }),
    new THREE.MeshLambertMaterial({ color: 0x1a1a1a }),
    new THREE.MeshLambertMaterial({ color: 0x34495e }),
    new THREE.MeshLambertMaterial({ color: 0x4a4a4a })
  ],
  peopleSkin: [
    new THREE.MeshLambertMaterial({ color: 0xf5d5b0 }),
    new THREE.MeshLambertMaterial({ color: 0xe0b890 }),
    new THREE.MeshLambertMaterial({ color: 0xc89870 }),
    new THREE.MeshLambertMaterial({ color: 0x8d5524 })
  ],
  peopleHair: [
    new THREE.MeshLambertMaterial({ color: 0x1a1a1a }),
    new THREE.MeshLambertMaterial({ color: 0x3a2a1a }),
    new THREE.MeshLambertMaterial({ color: 0x808080 })
  ],
  
  mosqueWall: new THREE.MeshLambertMaterial({ color: 0xf0e8d0 }),
  mosqueDome: new THREE.MeshLambertMaterial({ color: 0x16a085 }),
  mosqueGold: new THREE.MeshLambertMaterial({ color: 0xffcc00 }),
  stationWall: new THREE.MeshLambertMaterial({ color: 0xe8dcc0 }),
  stationRoof: new THREE.MeshLambertMaterial({ color: 0x8b4513 }),
  factoryWall: new THREE.MeshLambertMaterial({ color: 0x95a5a6 }),
  hospitalWall: new THREE.MeshLambertMaterial({ color: 0xf5f5f5 }),
  hospitalRed: new THREE.MeshBasicMaterial({ color: 0xcc0000 }),
  
  black: new THREE.MeshLambertMaterial({ color: 0x0a0a0a }),
  yellow: new THREE.MeshLambertMaterial({ color: 0xffc800 }),
  yellowDark: new THREE.MeshLambertMaterial({ color: 0xe6a800 }),
  chrome: new THREE.MeshLambertMaterial({ color: 0xcccccc }),
  glassTint: new THREE.MeshLambertMaterial({ color: 0xaaddff, transparent: true, opacity: 0.4 }),
  headlight: new THREE.MeshBasicMaterial({ color: 0xffffcc }),
  taillight: new THREE.MeshBasicMaterial({ color: 0xff2222 }),
  
  cafeTable: new THREE.MeshLambertMaterial({ color: 0x8b6a3a }),
  cafeChair: new THREE.MeshLambertMaterial({ color: 0x5a3a1a }),
  cafeShisha: new THREE.MeshLambertMaterial({ color: 0xc8a878 })
};

/* ============================================================
   نصوص Canvas
   ============================================================ */
function makeTextTexture(text, bgColor, textColor, w, h) {
  w = w || 640;
  h = h || 160;
  
  var canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  var ctx = canvas.getContext('2d');
  
  ctx.fillStyle = bgColor || '#1a5a9a';
  ctx.fillRect(0, 0, w, h);
  
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 6;
  ctx.strokeRect(6, 6, w - 12, h - 12);
  
  ctx.fillStyle = textColor || '#ffffff';
  ctx.font = 'bold ' + Math.floor(h * 0.4) + 'px Tahoma';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, w / 2, h / 2);
  
  var tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 2;
  return tex;
}

/* ============================================================
   🗺️ الشوارع الحقيقية لكفر الدوار
   (بناءً على الخريطة الحقيقية)
   ============================================================ */
var ROADS_DATA = [
  // الشوارع الرئيسية (شمال-جنوب) - على محور ترعة المحمودية
  { name: 'شارع أحمد عرابي', x: 0, z: -12, width: 20, length: 1100, rotation: 0, isMain: true, signColor: '#1a5a9a' },
  { name: 'شارع بورسعيد', x: 0, z: 28, width: 16, length: 1100, rotation: 0, signColor: '#8b1a1a' },
  
  // الشوارع العرضية (شرق-غرب)
  { name: 'شارع الجيش', x: 240, z: 100, width: 16, length: 550, rotation: Math.PI / 2, signColor: '#1a8a3a' },
  { name: 'شارع الجمهورية', x: -280, z: 0, width: 14, length: 500, rotation: Math.PI / 2, signColor: '#8a1a8a' },
  { name: 'شارع جلال الدسوقي', x: -80, z: 320, width: 13, length: 420, rotation: Math.PI / 2, signColor: '#8a6a1a' },
  { name: 'شارع سيدي عبد القادر', x: -440, z: 100, width: 14, length: 380, rotation: Math.PI / 2, signColor: '#1a8a8a' },
  { name: 'شارع الحدائق', x: 100, z: 280, width: 12, length: 380, rotation: Math.PI / 2, signColor: '#3a8a1a' },
  { name: 'شارع المحور', x: 400, z: 240, width: 12, length: 380, rotation: Math.PI / 2, signColor: '#8a3a1a' },
  { name: 'شارع الجلاء', x: -360, z: -200, width: 12, length: 420, rotation: 0, signColor: '#1a3a8a' },
  { name: 'شارع النصر', x: 320, z: -200, width: 12, length: 420, rotation: 0, signColor: '#8a1a1a' },
  { name: 'شارع المحكمة', x: -200, z: -240, width: 11, length: 340, rotation: Math.PI / 2, signColor: '#5a5a5a' },
  { name: 'شارع الموقف', x: 550, z: 0, width: 11, length: 420, rotation: Math.PI / 2, signColor: '#8a5a1a' }
];

/* ============================================================
   📍 المعالم الحقيقية لكفر الدوار
   ============================================================ */
var DESTINATIONS_DATA = [
  { name: 'محطة قطار كفر الدوار', x: -200, z: -60, color: 0x8b4513 },
  { name: 'مسجد الثورة', x: -100, z: 180, color: 0x16a085 },
  { name: 'شركة مصر للغزل والنسيج', x: 340, z: -260, color: 0x95a5a6 },
  { name: 'موقف عزيز المصري', x: 150, z: 60, color: 0xe74c3c },
  { name: 'مجمع الميزانة', x: -120, z: -90, color: 0xf39c12 },
  { name: 'مستشفى كفر الدوار العام', x: -440, z: 130, color: 0x3498db },
  { name: 'سوق الأربعاء', x: 90, z: 160, color: 0x9b59b6 },
  { name: 'كورنيش ترعة المحمودية', x: 440, z: -15, color: 0x2980b9 },
  { name: 'جامعة كفر الدوار', x: -360, z: -240, color: 0x8e44ad },
  { name: 'شارع الجيش التجاري', x: 260, z: 180, color: 0xe74c3c }
];

/* ============================================================
   نظام الأصوات
   ============================================================ */
var AudioSystem = {
  ctx: null,
  engineOsc: null,
  engineGain: null,
  initialized: false,
  
  init: function() {
    if (this.initialized) return;
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AC();
      this.initialized = true;
    } catch (e) {}
  },
  
  resume: function() {
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  },
  
  setEngine: function(on) {
    if (!this.ctx) return;
    if (on && !this.engineOsc) {
      try {
        this.engineOsc = this.ctx.createOscillator();
        this.engineOsc.type = 'sawtooth';
        this.engineOsc.frequency.value = 55;
        this.engineGain = this.ctx.createGain();
        this.engineGain.gain.value = 0.02;
        this.engineOsc.connect(this.engineGain);
        this.engineGain.connect(this.ctx.destination);
        this.engineOsc.start();
      } catch (e) {}
    } else if (!on && this.engineOsc) {
      try { this.engineOsc.stop(); } catch (e) {}
      this.engineOsc = null;
      this.engineGain = null;
    }
  },
  
  updateEngine: function(speed, maxSpeed, isAcc) {
    if (!this.engineOsc || !this.engineGain || !this.ctx) return;
    var r = Math.min(Math.abs(speed) / maxSpeed, 1);
    this.engineOsc.frequency.setTargetAtTime(55 + r * 90, this.ctx.currentTime, 0.1);
    this.engineGain.gain.setTargetAtTime(0.01 + r * 0.04 + (isAcc ? 0.01 : 0), this.ctx.currentTime, 0.15);
  },
  
  playPickup: function() {
    if (this.ctx) this._tone(700, 1000, 0.2, 0.1);
  },
  
  playDelivery: function() {
    if (!this.ctx) return;
    var s = this;
    this._tone(523, 523, 0.1, 0.1);
    setTimeout(function() { s._tone(659, 659, 0.1, 0.1); }, 100);
    setTimeout(function() { s._tone(784, 784, 0.2, 0.1); }, 200);
  },
  
  playHorn: function() {
    if (!this.ctx) return;
    this._tone(440, 550, 0.15, 0.08);
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
      o.connect(g);
      g.connect(this.ctx.destination);
      o.start();
      o.stop(this.ctx.currentTime + dur);
    } catch (e) {}
  }
};

/* ============================================================
   الأرضية
   ============================================================ */
function createGround() {
  // أرضية خضراء (زراعة)
  var ground = new THREE.Mesh(
    new THREE.PlaneGeometry(3000, 3000),
    MAT.ground
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.05;
  scene.add(ground);
  
  // أرضية داكنة (للشوارع عشان محدش يشوف الفجوات)
  var darkGround = new THREE.Mesh(
    new THREE.PlaneGeometry(3000, 3000),
    MAT.groundDark
  );
  darkGround.rotation.x = -Math.PI / 2;
  darkGround.position.y = -0.1;
  scene.add(darkGround);
}

/* ============================================================
   🌊 ترعة المحمودية - واقعية وواضحة
   ============================================================ */
function createCanal() {
  var group = new THREE.Group();
  group.name = 'canal';
  
  // ═══ الماء ═══
  var waterGeo = new THREE.PlaneGeometry(CONFIG.citySize * 1.4, CONFIG.canalWidth);
  var waterMat = new THREE.MeshLambertMaterial({ 
    color: 0x1a5a8a,
    transparent: true,
    opacity: 0.9
  });
  var water = new THREE.Mesh(waterGeo, waterMat);
  water.rotation.x = -Math.PI / 2;
  water.position.y = -0.3;
  group.add(water);
  
  // ═══ ضفة شمالية (جنب شارع أحمد عرابي) ═══
  var northBank = new THREE.Mesh(
    new THREE.BoxGeometry(CONFIG.citySize * 1.4, 1.5, 3.5),
    MAT.canalBank
  );
  northBank.position.set(0, 0.4, -(CONFIG.canalWidth / 2 + 1.75));
  group.add(northBank);
  
  // ═══ ضفة جنوبية (جنب شارع بورسعيد) ═══
  var southBank = new THREE.Mesh(
    new THREE.BoxGeometry(CONFIG.citySize * 1.4, 1.5, 3.5),
    MAT.canalBank
  );
  southBank.position.set(0, 0.4, (CONFIG.canalWidth / 2 + 1.75));
  group.add(southBank);
  
  // ═══ سور حماية على الضفتين ═══
  for (var s = -1; s <= 1; s += 2) {
    var rail = new THREE.Mesh(
      new THREE.BoxGeometry(CONFIG.citySize * 1.4, 0.7, 0.15),
      MAT.chrome
    );
    rail.position.set(0, 1.7, s * (CONFIG.canalWidth / 2 + 3.4));
    group.add(rail);
  }
  
  // ═══ الكوبري (شارع أحمد عرابي بيعبر الترعة) ═══
  var bridge = new THREE.Mesh(
    new THREE.BoxGeometry(24, 2, CONFIG.canalWidth + 20),
    MAT.bridge
  );
  bridge.position.set(0, 1.2, 0);
  group.add(bridge);
  
  // درابزين الكوبري
  for (var s = -1; s <= 1; s += 2) {
    var brail = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 0.8, CONFIG.canalWidth + 20),
      MAT.chrome
    );
    brail.position.set(s * 11, 2.9, 0);
    group.add(brail);
  }
  
  scene.add(group);
  return group;
}

/* ============================================================
   الشوارع
   ============================================================ */
function createRoads() {
  var group = new THREE.Group();
  
  for (var i = 0; i < ROADS_DATA.length; i++) {
    var rd = ROADS_DATA[i];
    
    // ═══ جسم الشارع ═══
    var road = new THREE.Mesh(
      new THREE.BoxGeometry(rd.width, 0.15, rd.length),
      MAT.road
    );
    road.position.set(rd.x, 0.05, rd.z);
    road.rotation.y = rd.rotation;
    group.add(road);
    
    // ═══ الأرصفة ═══
    for (var s = -1; s <= 1; s += 2) {
      var so = s * (rd.width / 2 + CONFIG.sidewalkWidth / 2);
      var dx = Math.cos(rd.rotation) * so;
      var dz = -Math.sin(rd.rotation) * so;
      
      var sidewalk = new THREE.Mesh(
        new THREE.BoxGeometry(CONFIG.sidewalkWidth, 0.25, rd.length),
        MAT.sidewalk
      );
      sidewalk.position.set(rd.x + dx, 0.15, rd.z + dz);
      sidewalk.rotation.y = rd.rotation;
      group.add(sidewalk);
    }
    
    // ═══ خطوط الطريق ═══
    if (rd.width >= 14) {
      var lineCount = Math.floor(rd.length / 40);
      for (var j = 0; j < lineCount; j++) {
        var off = -rd.length / 2 + j * 40 + 20;
        var mark = new THREE.Mesh(
          new THREE.BoxGeometry(0.3, 0.05, 8),
          MAT.roadLine
        );
        var mx = rd.x + Math.sin(rd.rotation) * off;
        var mz = rd.z + Math.cos(rd.rotation) * off;
        mark.position.set(mx, 0.13, mz);
        mark.rotation.y = rd.rotation;
        group.add(mark);
      }
    }
    
    // ═══ لوحة اسم الشارع ═══
    if (rd.isMain || rd.width >= 14) {
      var signTex = makeTextTexture(rd.name, rd.signColor, '#ffffff', 640, 140);
      var signMat = new THREE.MeshBasicMaterial({ map: signTex, side: THREE.DoubleSide });
      var signGeo = new THREE.PlaneGeometry(8, 1.8);
      
      var signOffset = rd.width / 2 + 1.5;
      var signX = rd.x + Math.cos(rd.rotation) * signOffset;
      var signZ = rd.z - Math.sin(rd.rotation) * signOffset;
      var posAlong = rd.length / 4;
      signX += Math.sin(rd.rotation) * posAlong;
      signZ += Math.cos(rd.rotation) * posAlong;
      
      var pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.08, 6),
        MAT.chrome
      );
      pole.position.set(signX, 3, signZ);
      group.add(pole);
      
      var sign = new THREE.Mesh(signGeo, signMat);
      sign.position.set(signX, 5.8, signZ);
      group.add(sign);
    }
  }
  
  scene.add(group);
}

/* ============================================================
   الأشجار والنخيل
   ============================================================ */
function createTree(x, z, scale) {
  scale = scale || 1;
  var t = new THREE.Group();
  
  var trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15 * scale, 0.2 * scale, 2 * scale, 5),
    MAT.treeTrunk
  );
  trunk.position.y = 1 * scale;
  t.add(trunk);
  
  var leaf = new THREE.Mesh(
    new THREE.SphereGeometry(1.2 * scale, 6, 5),
    MAT.treeLeaf
  );
  leaf.position.y = 2.7 * scale;
  t.add(leaf);
  
  t.position.set(x, 0, z);
  return t;
}

function createPalm(x, z, scale) {
  scale = scale || 1;
  var p = new THREE.Group();
  
  var trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.13 * scale, 0.18 * scale, 5 * scale, 6),
    MAT.palmTrunk
  );
  trunk.position.y = 2.5 * scale;
  p.add(trunk);
  
  for (var i = 0; i < 6; i++) {
    var angle = (i / 6) * Math.PI * 2;
    var leaf = new THREE.Mesh(
      new THREE.PlaneGeometry(0.8 * scale, 2.8 * scale),
      MAT.palmLeaf
    );
    leaf.position.set(
      Math.cos(angle) * 0.5 * scale,
      5 * scale,
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
  
  // نخيل على ضفاف ترعة المحمودية
  var step = 50;
  for (var x = -CONFIG.citySize * 0.5; x < CONFIG.citySize * 0.5; x += step) {
    if (Math.random() > 0.4) {
      group.add(createPalm(x + Utils.rand(-3, 3), -(CONFIG.canalWidth / 2 + 6), Utils.rand(0.9, 1.1)));
    }
    if (Math.random() > 0.4) {
      group.add(createPalm(x + Utils.rand(-3, 3), (CONFIG.canalWidth / 2 + 6), Utils.rand(0.9, 1.1)));
    }
  }
  
  // أشجار على الشوارع
  var treeCount = 0;
  for (var i = 0; i < ROADS_DATA.length && treeCount < QUALITY.treeCount; i++) {
    var rd = ROADS_DATA[i];
    if (rd.width < 12) continue;
    var trees = Math.floor(rd.length / 80);
    for (var j = 0; j < trees && treeCount < QUALITY.treeCount; j++) {
      var off = -rd.length / 2 + j * 80 + 40;
      var s = Math.random() > 0.5 ? 1 : -1;
      var so = s * (rd.width / 2 + CONFIG.sidewalkWidth + 2);
      var tx = rd.x + Math.sin(rd.rotation) * off + Math.cos(rd.rotation) * so;
      var tz = rd.z + Math.cos(rd.rotation) * off - Math.sin(rd.rotation) * so;
      
      // نتأكد إن الشجرة مش على الترعة
      if (Math.abs(tz) < CONFIG.canalWidth / 2 + 8) continue;
      
      group.add(createTree(tx, tz, Utils.rand(0.85, 1.1)));
      treeCount++;
    }
  }
  
  scene.add(group);
}

/* ============================================================
   المباني - InstancedMesh للأداء
   ============================================================ */
function isOnRoad(x, z, pad) {
  pad = pad || 0;
  for (var i = 0; i < ROADS_DATA.length; i++) {
    var r = ROADS_DATA[i];
    var hw = r.width / 2 + CONFIG.sidewalkWidth + pad;
    var hl = r.length / 2 + pad;
    var dx = x - r.x;
    var dz = z - r.z;
    var c = Math.cos(-r.rotation);
    var s = Math.sin(-r.rotation);
    var lx = dx * c - dz * s;
    var lz = dx * s + dz * c;
    if (Math.abs(lx) < hw && Math.abs(lz) < hl) return true;
  }
  return false;
}

function isNearLandmark(x, z, radius) {
  radius = radius || 40;
  for (var i = 0; i < DESTINATIONS_DATA.length; i++) {
    var d = DESTINATIONS_DATA[i];
    if (Math.abs(x - d.x) < radius && Math.abs(z - d.z) < radius) return true;
  }
  return false;
}

function createBuildings() {
  var group = new THREE.Group();
  var buildingList = [];
  var half = CONFIG.citySize / 2;
  
  // نولّد مواقع المباني
  for (var gx = -half; gx < half; gx += 40) {
    for (var gz = -half; gz < half; gz += 40) {
      var x = gx + 20 + Utils.rand(-2, 2);
      var z = gz + 20 + Utils.rand(-2, 2);
      
      if (isOnRoad(x, z, 4)) continue;
      if (Math.abs(z) < CONFIG.canalWidth / 2 + 10) continue;
      if (Math.abs(x) < 20 && Math.abs(z) < 25) continue;
      if (isNearLandmark(x, z, 40)) continue;
      if (Math.random() > QUALITY.buildingDensity) continue;
      if (buildingList.length >= QUALITY.maxBuildings) break;
      
      buildingList.push({
        x: x,
        z: z,
        w: Utils.rand(9, 15),
        d: Utils.rand(9, 15),
        h: Utils.rand(6, 16)
      });
    }
  }
  
  console.log('🏢 بناء', buildingList.length, 'مبنى');
  
  // ═══ نستخدم InstancedMesh لكل لون (بدل مبنى-مبنى) ═══
  var boxGeo = new THREE.BoxGeometry(1, 1, 1);
  var wallMats = [
    MAT.plaster,
    MAT.plasterPink,
    MAT.plasterYellow,
    MAT.plasterBlue,
    MAT.plasterGreen,
    MAT.concrete
  ];
  
  for (var c = 0; c < wallMats.length; c++) {
    var filtered = [];
    for (var i = 0; i < buildingList.length; i++) {
      if (i % wallMats.length === c) filtered.push(buildingList[i]);
    }
    if (filtered.length === 0) continue;
    
    var instMesh = new THREE.InstancedMesh(boxGeo, wallMats[c], filtered.length);
    var matrix = new THREE.Matrix4();
    
    for (var i = 0; i < filtered.length; i++) {
      var b = filtered[i];
      matrix.makeScale(b.w, b.h, b.d);
      matrix.setPosition(b.x, b.h / 2, b.z);
      instMesh.setMatrixAt(i, matrix);
    }
    instMesh.instanceMatrix.needsUpdate = true;
    group.add(instMesh);
  }
  
  // ═══ أسطح المباني (بلون مختلف) ═══
  var roofGeo = new THREE.BoxGeometry(1, 0.5, 1);
  var roofMat = MAT.tiles;
  
  var roofMesh = new THREE.InstancedMesh(roofGeo, roofMat, buildingList.length);
  var matrix = new THREE.Matrix4();
  for (var i = 0; i < buildingList.length; i++) {
    var b = buildingList[i];
    matrix.makeScale(b.w + 0.3, 1, b.d + 0.3);
    matrix.setPosition(b.x, b.h + 0.25, b.z);
    roofMesh.setMatrixAt(i, matrix);
  }
  roofMesh.instanceMatrix.needsUpdate = true;
  group.add(roofMesh);
  
  scene.add(group);
}

/* ============================================================
   المعالم - مُبسطة للأداء
   ============================================================ */
function createMosque(x, z) {
  var g = new THREE.Group();
  
  var base = new THREE.Mesh(new THREE.BoxGeometry(18, 9, 18), MAT.mosqueWall);
  base.position.y = 4.5;
  g.add(base);
  
  var dome = new THREE.Mesh(
    new THREE.SphereGeometry(5.5, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2),
    MAT.mosqueDome
  );
  dome.position.y = 9;
  g.add(dome);
  
  var finial = new THREE.Mesh(new THREE.ConeGeometry(0.7, 2.5, 6), MAT.mosqueGold);
  finial.position.y = 15;
  g.add(finial);
  
  for (var s = -1; s <= 1; s += 2) {
    var minaret = new THREE.Mesh(
      new THREE.CylinderGeometry(0.9, 0.9, 20, 8),
      MAT.mosqueWall
    );
    minaret.position.set(s * 10, 10, 0);
    g.add(minaret);
    
    var mTop = new THREE.Mesh(new THREE.ConeGeometry(1.3, 3.5, 8), MAT.mosqueDome);
    mTop.position.set(s * 10, 22, 0);
    g.add(mTop);
  }
  
  g.position.set(x, 0, z);
  return g;
}

function createStation(x, z) {
  var g = new THREE.Group();
  
  var main = new THREE.Mesh(new THREE.BoxGeometry(28, 8, 12), MAT.stationWall);
  main.position.y = 4;
  g.add(main);
  
  var roof = new THREE.Mesh(new THREE.BoxGeometry(30, 0.7, 14), MAT.stationRoof);
  roof.position.y = 8.35;
  g.add(roof);
  
  var tower = new THREE.Mesh(new THREE.BoxGeometry(4.5, 14, 4.5), MAT.stationWall);
  tower.position.set(9, 11, 0);
  g.add(tower);
  
  var towerRoof = new THREE.Mesh(new THREE.ConeGeometry(3.2, 4, 4), MAT.stationRoof);
  towerRoof.position.set(9, 20, 0);
  towerRoof.rotation.y = Math.PI / 4;
  g.add(towerRoof);
  
  g.position.set(x, 0, z);
  return g;
}

function createFactory(x, z) {
  var g = new THREE.Group();
  
  var main = new THREE.Mesh(new THREE.BoxGeometry(42, 14, 30), MAT.factoryWall);
  main.position.y = 7;
  g.add(main);
  
  for (var i = 0; i < 3; i++) {
    var chimney = new THREE.Mesh(
      new THREE.CylinderGeometry(1.5, 1.8, 26, 8),
      new THREE.MeshLambertMaterial({ color: 0x7f8c8d })
    );
    chimney.position.set(-12 + i * 12, 20, -12);
    g.add(chimney);
  }
  
  g.position.set(x, 0, z);
  return g;
}

function createHospital(x, z) {
  var g = new THREE.Group();
  
  var main = new THREE.Mesh(new THREE.BoxGeometry(26, 14, 18), MAT.hospitalWall);
  main.position.y = 7;
  g.add(main);
  
  var crossV = new THREE.Mesh(new THREE.BoxGeometry(0.8, 3.5, 0.3), MAT.hospitalRed);
  crossV.position.set(0, 17, 9.1);
  g.add(crossV);
  
  var crossH = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.8, 0.3), MAT.hospitalRed);
  crossH.position.set(0, 17, 9.1);
  g.add(crossH);
  
  g.position.set(x, 0, z);
  return g;
}

function createSouk(x, z) {
  var g = new THREE.Group();
  var colors = [0xe74c3c, 0x3498db, 0xf39c12, 0x2ecc71, 0x9b59b6];
  
  for (var i = 0; i < 10; i++) {
    var angle = (i / 10) * Math.PI * 2;
    var cx = Math.cos(angle) * 10;
    var cz = Math.sin(angle) * 10;
    
    var stall = new THREE.Mesh(
      new THREE.BoxGeometry(2.8, 2.2, 2.8),
      new THREE.MeshLambertMaterial({ color: colors[i % colors.length] })
    );
    stall.position.set(cx, 1.1, cz);
    g.add(stall);
    
    var awning = new THREE.Mesh(
      new THREE.ConeGeometry(2.5, 1.5, 4),
      new THREE.MeshLambertMaterial({ color: 0xf5f5f5 })
    );
    awning.position.set(cx, 3.2, cz);
    awning.rotation.y = Math.PI / 4;
    g.add(awning);
  }
  
  g.position.set(x, 0, z);
  return g;
}

function createLandmarks() {
  console.log('🏛️ بناء المعالم...');
  var group = new THREE.Group();
  
  group.add(createStation(-200, -60));
  group.add(createMosque(-100, 180));
  group.add(createFactory(340, -260));
  group.add(createHospital(-440, 130));
  group.add(createSouk(90, 160));
  
  scene.add(group);
}

/* ============================================================
   السيارات
   ============================================================ */
var cars = [];

function createCar(x, z, rotation) {
  var car = new THREE.Group();
  var bodyMat = Utils.pick(MAT.carBody);
  
  var body = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.55, 3.5), bodyMat);
  body.position.y = 0.45;
  car.add(body);
  
  var cabin = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.45, 1.7), bodyMat);
  cabin.position.set(0, 0.95, -0.2);
  car.add(cabin);
  
  var windshield = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.35, 0.1), MAT.glass);
  windshield.position.set(0, 0.95, 0.65);
  car.add(windshield);
  
  var tireGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 8);
  for (var wx = -1; wx <= 1; wx += 2) {
    for (var wz = -1; wz <= 1; wz += 2) {
      var tire = new THREE.Mesh(tireGeo, MAT.carTire);
      tire.rotation.z = Math.PI / 2;
      tire.position.set(wx * 0.85, 0.3, wz * 1.15);
      car.add(tire);
    }
  }
  
  car.position.set(x, 0, z);
  car.rotation.y = rotation;
  return car;
}

function createCars() {
  var group = new THREE.Group();
  
  for (var i = 0; i < QUALITY.carsCount; i++) {
    var rd = Utils.pick(ROADS_DATA);
    var off = Utils.rand(-rd.length / 2 + 40, rd.length / 2 - 40);
    var x = rd.x + Math.sin(rd.rotation) * off;
    var z = rd.z + Math.cos(rd.rotation) * off;
    
    var sideOffset = (Math.random() > 0.5 ? 1 : -1) * (rd.width / 4);
    var dx = Math.cos(rd.rotation) * sideOffset;
    var dz = -Math.sin(rd.rotation) * sideOffset;
    
    var car = createCar(x + dx, z + dz, rd.rotation + (Math.random() > 0.5 ? 0 : Math.PI));
    car.userData = {
      road: rd,
      offset: off,
      sideOffset: sideOffset,
      speed: Utils.rand(3, 5),
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
    
    if (ud.offset > ud.road.length / 2 - 30) {
      ud.direction = -1;
      c.rotation.y = ud.road.rotation + Math.PI;
    }
    if (ud.offset < -ud.road.length / 2 + 30) {
      ud.direction = 1;
      c.rotation.y = ud.road.rotation;
    }
    
    var x = ud.road.x + Math.sin(ud.road.rotation) * ud.offset;
    var z = ud.road.z + Math.cos(ud.road.rotation) * ud.offset;
    
    var dx = Math.cos(ud.road.rotation) * ud.sideOffset;
    var dz = -Math.sin(ud.road.rotation) * ud.sideOffset;
    
    c.position.x = x + dx;
    c.position.z = z + dz;
  }
}

/* ============================================================
   الناس
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
  p.add(torso);
  
  var head = new THREE.Mesh(new THREE.SphereGeometry(0.17, 8, 8), skinMat);
  head.position.y = 1.62;
  p.add(head);
  
  var hair = new THREE.Mesh(
    new THREE.SphereGeometry(0.18, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2),
    hairMat
  );
  hair.position.y = 1.65;
  p.add(hair);
  
  var legs = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.8, 0.26), pantsMat);
  legs.position.y = 0.35;
  p.add(legs);
  
  var armGeo = new THREE.BoxGeometry(0.12, 0.58, 0.12);
  var armL = new THREE.Mesh(armGeo, shirtMat);
  armL.position.set(-0.27, 1.08, 0);
  p.add(armL);
  
  var armR = new THREE.Mesh(armGeo, shirtMat);
  armR.position.set(0.27, 1.08, 0);
  p.add(armR);
  
  p.position.set(x, 0, z);
  p.rotation.y = Utils.rand(0, Math.PI * 2);
  p.userData = {
    direction: Utils.rand(0, Math.PI * 2),
    speed: Utils.rand(0.6, 1.4),
    walkPhase: Math.random() * Math.PI * 2,
    armL: armL,
    armR: armR,
    homeX: x,
    homeZ: z,
    wanderTimer: Utils.rand(1, 3)
  };
  
  return p;
}

function createPeople() {
  console.log('👥 إنشاء', QUALITY.peopleCount, 'شخص...');
  var group = new THREE.Group();
  
  for (var i = 0; i < QUALITY.peopleCount; i++) {
    var rd = Utils.pick(ROADS_DATA);
    var off = Utils.rand(-rd.length / 2 + 40, rd.length / 2 - 40);
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
    p.position.y = Math.abs(Math.sin(ud.walkPhase)) * 0.04;
    
    ud.wanderTimer -= dt;
    if (ud.wanderTimer <= 0) {
      ud.direction += Utils.rand(-0.5, 0.5);
      ud.wanderTimer = Utils.rand(2, 4);
    }
    
    var dx = ud.homeX - p.position.x;
    var dz = ud.homeZ - p.position.z;
    if (Math.hypot(dx, dz) > 8) {
      ud.direction = Math.atan2(dz, dx);
    }
    
    p.position.x += Math.cos(ud.direction) * ud.speed * dt;
    p.position.z += Math.sin(ud.direction) * ud.speed * dt;
    p.rotation.y = -ud.direction + Math.PI / 2;
    
    if (ud.armL) ud.armL.rotation.x = Math.sin(ud.walkPhase) * 0.5;
    if (ud.armR) ud.armR.rotation.x = -Math.sin(ud.walkPhase) * 0.5;
  }
}

console.log('✅ الجزء 2 تم تحميله - المدينة والطرق والترعة والمباني');

/* ============================================================
   🚕 الجزء 3: التوك توك + مشرط + الركاب + الخريطة + الحلقة الرئيسية
   ============================================================ */

/* ============================================================
   ⚠️ مشهد مشرط قاعد على قهوة عماد هارون في البيضا
   (بيظهر قبل ما اللعبة تبدأ)
   ============================================================ */
var meshratScene = null;

function createMeshratCafeScene() {
  var sceneGroup = new THREE.Group();
  sceneGroup.name = 'meshratCafe';
  
  // ═════════════════════════════════════════
  // أرضية القهوة
  // ═════════════════════════════════════════
  var cafeGround = new THREE.Mesh(
    new THREE.BoxGeometry(12, 0.1, 10),
    new THREE.MeshLambertMaterial({ color: 0x8a7a6a })
  );
  cafeGround.position.y = 0.05;
  sceneGroup.add(cafeGround);
  
  // ═════════════════════════════════════════
  // مبنى القهوة (في الخلف)
  // ═════════════════════════════════════════
  var cafeBuilding = new THREE.Mesh(
    new THREE.BoxGeometry(10, 4, 5),
    new THREE.MeshLambertMaterial({ color: 0xe8d0c0 })
  );
  cafeBuilding.position.set(0, 2, -4);
  sceneGroup.add(cafeBuilding);
  
  var cafeRoof = new THREE.Mesh(
    new THREE.BoxGeometry(10.5, 0.3, 5.5),
    MAT.tiles
  );
  cafeRoof.position.set(0, 4.15, -4);
  sceneGroup.add(cafeRoof);
  
  // ═════════════════════════════════════════
  // مظلة القهوة (قدام)
  // ═════════════════════════════════════════
  for (var s = -1; s <= 1; s += 2) {
    var pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.1, 4),
      new THREE.MeshLambertMaterial({ color: 0x5a3a1a })
    );
    pole.position.set(s * 5, 2, 3);
    sceneGroup.add(pole);
  }
  
  var awning = new THREE.Mesh(
    new THREE.BoxGeometry(11, 0.15, 5),
    new THREE.MeshLambertMaterial({ color: 0xd4a574 })
  );
  awning.position.set(0, 4, 1);
  awning.rotation.x = -0.1;
  sceneGroup.add(awning);
  
  // ═════════════════════════════════════════
  // الطاولة
  // ═════════════════════════════════════════
  var table = new THREE.Mesh(
    new THREE.CylinderGeometry(0.7, 0.7, 0.1, 16),
    MAT.cafeTable
  );
  table.position.set(0, 0.85, 0);
  sceneGroup.add(table);
  
  var tableLeg = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.08, 0.8, 8),
    MAT.cafeTable
  );
  tableLeg.position.set(0, 0.4, 0);
  sceneGroup.add(tableLeg);
  
  // ═════════════════════════════════════════
  // كرسي مشرط
  // ═════════════════════════════════════════
  var chair = new THREE.Mesh(
    new THREE.BoxGeometry(0.7, 0.1, 0.7),
    MAT.cafeChair
  );
  chair.position.set(0, 0.5, 1.3);
  sceneGroup.add(chair);
  
  var chairBack = new THREE.Mesh(
    new THREE.BoxGeometry(0.7, 0.9, 0.1),
    MAT.cafeChair
  );
  chairBack.position.set(0, 1, 1);
  sceneGroup.add(chairBack);
  
  // ═════════════════════════════════════════
  // مشرط (بجلابية صعيدية وعمة وشنب)
  // ═════════════════════════════════════════
  var meshrat = new THREE.Group();
  
  // ═ الجلابية البيضاء ═
  var galabeyaMat = new THREE.MeshLambertMaterial({ color: 0xf5f0e8 });
  var galabeya = new THREE.Mesh(
    new THREE.BoxGeometry(0.55, 0.8, 0.4),
    galabeyaMat
  );
  galabeya.position.y = 0.9;
  meshrat.add(galabeya);
  
  // ═ الرقبة ═
  var neck = new THREE.Mesh(
    new THREE.CylinderGeometry(0.09, 0.09, 0.1),
    MAT.peopleSkin[2]
  );
  neck.position.y = 1.35;
  meshrat.add(neck);
  
  // ═ الرأس ═
  var head = new THREE.Mesh(
    new THREE.SphereGeometry(0.2, 12, 12),
    MAT.peopleSkin[2]
  );
  head.position.y = 1.55;
  meshrat.add(head);
  
  // ═ العيون ═
  var eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  var eyeBlackMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
  for (var s = -1; s <= 1; s += 2) {
    var eyeWhite = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), eyeWhiteMat);
    eyeWhite.position.set(s * 0.075, 1.58, 0.17);
    meshrat.add(eyeWhite);
    
    var eyeBlack = new THREE.Mesh(new THREE.SphereGeometry(0.028, 6, 6), eyeBlackMat);
    eyeBlack.position.set(s * 0.08, 1.58, 0.20);
    meshrat.add(eyeBlack);
  }
  
  // ═ الشنب ═
  var mustache = new THREE.Mesh(
    new THREE.BoxGeometry(0.18, 0.04, 0.05),
    new THREE.MeshLambertMaterial({ color: 0x1a1a1a })
  );
  mustache.position.set(0, 1.5, 0.19);
  meshrat.add(mustache);
  
  // ═ العمة (غطاء رأس صعيدي) ═
  var turban = new THREE.Mesh(
    new THREE.SphereGeometry(0.23, 12, 12, 0, Math.PI * 2, 0, Math.PI / 1.7),
    new THREE.MeshLambertMaterial({ color: 0xf0f0e8 })
  );
  turban.position.y = 1.58;
  meshrat.add(turban);
  
  // ═ الأرجل ═
  var legs = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.55, 0.4),
    new THREE.MeshLambertMaterial({ color: 0x2c3e50 })
  );
  legs.position.set(0, 0.35, 0.15);
  meshrat.add(legs);
  
  // ═ الشبشب ═
  var shoes = new THREE.Mesh(
    new THREE.BoxGeometry(0.55, 0.08, 0.5),
    new THREE.MeshLambertMaterial({ color: 0x5a3a20 })
  );
  shoes.position.set(0, 0.04, 0.2);
  meshrat.add(shoes);
  
  // ═ الذراع اليمنى (بتمسك الشيشة) ═
  var armGeo = new THREE.BoxGeometry(0.15, 0.6, 0.15);
  var armR = new THREE.Mesh(armGeo, galabeyaMat);
  armR.position.set(0.35, 0.9, 0.15);
  armR.rotation.x = -0.7;
  meshrat.add(armR);
  
  var handR = new THREE.Mesh(
    new THREE.SphereGeometry(0.08, 6, 6),
    MAT.peopleSkin[2]
  );
  handR.position.set(0.35, 0.65, 0.35);
  meshrat.add(handR);
  
  // ═ الذراع اليسرى (مرتاحة على الكرسي) ═
  var armL = new THREE.Mesh(armGeo, galabeyaMat);
  armL.position.set(-0.35, 0.9, 0);
  armL.rotation.x = -0.3;
  meshrat.add(armL);
  
  var handL = new THREE.Mesh(
    new THREE.SphereGeometry(0.08, 6, 6),
    MAT.peopleSkin[2]
  );
  handL.position.set(-0.35, 0.65, 0.15);
  meshrat.add(handL);
  
  // موضع مشرط على الكرسي
  meshrat.position.set(0, 0.55, 1.3);
  meshrat.rotation.y = Math.PI;
  meshrat.scale.set(1.15, 1.15, 1.15);
  sceneGroup.add(meshrat);
  
  // ═════════════════════════════════════════
  // الشيشة
  // ═════════════════════════════════════════
  var shishaGroup = new THREE.Group();
  
  var shishaBase = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15, 0.18, 0.35, 12),
    MAT.cafeShisha
  );
  shishaBase.position.y = 0.17;
  shishaGroup.add(shishaBase);
  
  var shishaGlass = new THREE.Mesh(
    new THREE.CylinderGeometry(0.13, 0.15, 0.35, 12),
    new THREE.MeshLambertMaterial({ color: 0x2980b9, transparent: true, opacity: 0.85 })
  );
  shishaGlass.position.y = 0.5;
  shishaGroup.add(shishaGlass);
  
  var shishaStem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.04, 0.8, 8),
    new THREE.MeshLambertMaterial({ color: 0xd4a574 })
  );
  shishaStem.position.y = 1.05;
  shishaGroup.add(shishaStem);
  
  var shishaTop = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.12, 0.15, 12),
    new THREE.MeshLambertMaterial({ color: 0x8b6a3a })
  );
  shishaTop.position.y = 1.5;
  shishaGroup.add(shishaTop);
  
  var hose = new THREE.Mesh(
    new THREE.CylinderGeometry(0.025, 0.025, 0.8, 8),
    new THREE.MeshLambertMaterial({ color: 0x8b3a1a })
  );
  hose.position.set(0.35, 0.9, 0.4);
  hose.rotation.z = Math.PI / 3;
  hose.rotation.y = -Math.PI / 4;
  shishaGroup.add(hose);
  
  var hoseTip = new THREE.Mesh(
    new THREE.SphereGeometry(0.055, 8, 8),
    new THREE.MeshLambertMaterial({ color: 0xffcc00 })
  );
  hoseTip.position.set(0.55, 0.7, 0.6);
  shishaGroup.add(hoseTip);
  
  shishaGroup.position.set(0.8, 0, 0.2);
  sceneGroup.add(shishaGroup);
  
  // ═════════════════════════════════════════
  // كوباية شاي
  // ═════════════════════════════════════════
  var teaGlass = new THREE.Mesh(
    new THREE.CylinderGeometry(0.07, 0.06, 0.16, 12),
    new THREE.MeshLambertMaterial({ color: 0xc8a878, transparent: true, opacity: 0.85 })
  );
  teaGlass.position.set(-0.35, 0.95, 0);
  sceneGroup.add(teaGlass);
  
  // ═════════════════════════════════════════
  // إبريق الشاي
  // ═════════════════════════════════════════
  var teapot = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15, 0.12, 0.25, 10),
    new THREE.MeshLambertMaterial({ color: 0x8b6a3a })
  );
  teapot.position.set(-0.9, 1, -0.2);
  sceneGroup.add(teapot);
  
  // ═════════════════════════════════════════
  // لافتة "قهوة عماد هارون"
  // ═════════════════════════════════════════
  var signTex = makeTextTexture('قهوة عماد هارون', '#5a3a1a', '#ffcc00', 512, 128);
  var signMat = new THREE.MeshBasicMaterial({ map: signTex, side: THREE.DoubleSide });
  var sign = new THREE.Mesh(new THREE.PlaneGeometry(6, 1.5), signMat);
  sign.position.set(0, 4.5, -1.4);
  sceneGroup.add(sign);
  
  // ═════════════════════════════════════════
  // إضاءة دافئة على القهوة
  // ═════════════════════════════════════════
  var warmLight = new THREE.PointLight(0xffaa66, 1.5, 20);
  warmLight.position.set(0, 3.5, 1);
  sceneGroup.add(warmLight);
  
  // ═════════════════════════════════════════
  // راكبان قاعدان مع مشرط
  // ═════════════════════════════════════════
  for (var i = 0; i < 2; i++) {
    var otherPerson = new THREE.Group();
    
    var otherShirt = Utils.pick(MAT.peopleShirt);
    var otherPants = Utils.pick(MAT.peoplePants);
    var otherSkin = Utils.pick(MAT.peopleSkin);
    var otherHair = Utils.pick(MAT.peopleHair);
    
    var torso = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.6, 0.3), otherShirt);
    torso.position.y = 0.4;
    otherPerson.add(torso);
    
    var head2 = new THREE.Mesh(new THREE.SphereGeometry(0.17, 10, 10), otherSkin);
    head2.position.y = 0.85;
    otherPerson.add(head2);
    
    var hair2 = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 10, 10, 0, Math.PI * 2, 0, Math.PI / 2),
      otherHair
    );
    hair2.position.y = 0.87;
    otherPerson.add(hair2);
    
    var legs2 = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.3, 0.5), otherPants);
    legs2.position.set(0, 0.15, 0.2);
    otherPerson.add(legs2);
    
    var tableOffsetX = i === 0 ? 1.2 : -1.2;
    otherPerson.position.set(tableOffsetX, 0.55, 1.3);
    otherPerson.rotation.y = Math.PI + (i === 0 ? -0.3 : 0.3);
    sceneGroup.add(otherPerson);
  }
  
  // ═════════════════════════════════════════
  // نخيل وقهاوي في الخلفية
  // ═════════════════════════════════════════
  for (var i = 0; i < 3; i++) {
    var palm = createPalm(Utils.rand(-8, 8), Utils.rand(-8, -6), 1);
    sceneGroup.add(palm);
  }
  
  return sceneGroup;
}

/* ============================================================
   إنشاء مشهد القهوة وإضافته للمشهد
   ============================================================ */
function showMeshratScene() {
  if (!meshratScene) {
    meshratScene = createMeshratCafeScene();
    meshratScene.position.set(0, 0, -50);  // بعيد عن نقطة البداية
    scene.add(meshratScene);
  }
  
  // خلي الكاميرا تبص على مشهد القهوة
  var cameraTarget = meshratScene.position.clone();
  cameraTarget.y = 2;
  camera.position.set(cameraTarget.x, 3.5, cameraTarget.z + 10);
  camera.lookAt(cameraTarget);
  
  console.log('☕ مشهد مشرط على قهوة عماد هارون في البيضا');
}

/* ============================================================
   🛺 التوك توك الواقعي مع مشرط جواه
   ============================================================ */
function createTukTuk() {
  var t = new THREE.Group();
  t.name = 'tukTuk';
  
  // ═════ الهيكل السفلي ═════
  var chassis = new THREE.Mesh(
    new THREE.BoxGeometry(1.35, 0.15, 2.5),
    MAT.black
  );
  chassis.position.y = 0.42;
  t.add(chassis);
  
  var floorF = new THREE.Mesh(
    new THREE.BoxGeometry(1.3, 0.1, 1.0),
    MAT.black
  );
  floorF.position.set(0, 0.52, 0.7);
  t.add(floorF);
  
  var floorR = new THREE.Mesh(
    new THREE.BoxGeometry(1.3, 0.1, 1.3),
    MAT.black
  );
  floorR.position.set(0, 0.52, -0.6);
  t.add(floorR);
  
  // ═════ المقدمة (مع رفرف واضح) ═════
  var frontPanel = new THREE.Mesh(
    new THREE.BoxGeometry(1.32, 0.9, 0.2),
    MAT.yellow
  );
  frontPanel.position.set(0, 1, 1.15);
  t.add(frontPanel);
  
  var frontCabin = new THREE.Mesh(
    new THREE.BoxGeometry(1.32, 0.9, 1.05),
    MAT.yellow
  );
  frontCabin.position.set(0, 1, 0.6);
  t.add(frontCabin);
  
  // ═════ الرفرف الأمامي (خط أحمر) ═════
  var fender = new THREE.Mesh(
    new THREE.BoxGeometry(1.36, 0.12, 2.3),
    new THREE.MeshLambertMaterial({ color: 0xcc0000 })
  );
  fender.position.set(0, 0.68, 0.05);
  t.add(fender);
  
  // ═════ الكابينة الخلفية ═════
  var rearCabin = new THREE.Mesh(
    new THREE.BoxGeometry(1.36, 1.55, 1.45),
    MAT.yellow
  );
  rearCabin.position.set(0, 1.28, -0.6);
  t.add(rearCabin);
  
  // خط أسود فاصل
  var stripe = new THREE.Mesh(
    new THREE.BoxGeometry(1.38, 0.1, 1.47),
    MAT.black
  );
  stripe.position.set(0, 1.4, -0.6);
  t.add(stripe);
  
  // ═════ السقف ═════
  var roof = new THREE.Mesh(
    new THREE.BoxGeometry(1.46, 0.12, 2.55),
    MAT.black
  );
  roof.position.set(0, 2.15, 0);
  t.add(roof);
  
  // حافة السقف (كروم)
  var roofTrim = new THREE.Mesh(
    new THREE.BoxGeometry(1.48, 0.05, 2.57),
    MAT.chrome
  );
  roofTrim.position.set(0, 2.09, 0);
  t.add(roofTrim);
  
  // ═════ أعمدة السقف ═════
  var pillarGeo = new THREE.CylinderGeometry(0.045, 0.045, 1.8, 6);
  var pillarPos = [
    [-0.65, 1.25, -1.25], [0.65, 1.25, -1.25],
    [-0.65, 1.25, -0.05], [0.65, 1.25, -0.05],
    [-0.65, 1.25, 1.1], [0.65, 1.25, 1.1]
  ];
  for (var i = 0; i < pillarPos.length; i++) {
    var pillar = new THREE.Mesh(pillarGeo, MAT.black);
    pillar.position.set(pillarPos[i][0], pillarPos[i][1], pillarPos[i][2]);
    t.add(pillar);
  }
  
  // ═════ الزجاج الأمامي ═════
  var windshield = new THREE.Mesh(
    new THREE.BoxGeometry(1.25, 0.9, 0.05),
    MAT.glassTint
  );
  windshield.position.set(0, 1.9, 1.12);
  t.add(windshield);
  
  // ═════ الزجاج الجانبي الأمامي ═════
  for (var s = -1; s <= 1; s += 2) {
    var sg = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, 0.85, 0.95),
      MAT.glassTint
    );
    sg.position.set(s * 0.67, 1.85, 0.6);
    t.add(sg);
  }
  
  // ═════ الزجاج الجانبي الخلفي ═════
  for (var s = -1; s <= 1; s += 2) {
    var rg = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, 1, 1.25),
      MAT.glassTint
    );
    rg.position.set(s * 0.69, 1.75, -0.6);
    t.add(rg);
  }
  
  // ═════ الزجاج الخلفي ═════
  var rearGlass = new THREE.Mesh(
    new THREE.BoxGeometry(1.32, 1.05, 0.05),
    MAT.glassTint
  );
  rearGlass.position.set(0, 1.75, -1.31);
  t.add(rearGlass);
  
  // ═════ الشبكة الأمامية ═════
  var grillFrame = new THREE.Mesh(
    new THREE.BoxGeometry(0.95, 0.4, 0.08),
    MAT.chrome
  );
  grillFrame.position.set(0, 1, 1.24);
  t.add(grillFrame);
  
  for (var i = 0; i < 5; i++) {
    var slat = new THREE.Mesh(
      new THREE.BoxGeometry(0.88, 0.04, 0.05),
      MAT.black
    );
    slat.position.set(0, 0.85 + i * 0.07, 1.28);
    t.add(slat);
  }
  
  // ═════ المصابيح الأمامية ═════
  var headlightGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.1, 16);
  for (var s = -1; s <= 1; s += 2) {
    var hlFrame = new THREE.Mesh(headlightGeo, MAT.chrome);
    hlFrame.rotation.x = Math.PI / 2;
    hlFrame.position.set(s * 0.46, 1.2, 1.22);
    t.add(hlFrame);
    
    var hlGlass = new THREE.Mesh(headlightGeo, MAT.headlight);
    hlGlass.rotation.x = Math.PI / 2;
    hlGlass.position.set(s * 0.46, 1.2, 1.26);
    t.add(hlGlass);
  }
  
  // ═════ الفوانيس الخلفية ═════
  var taillightGeo = new THREE.BoxGeometry(0.14, 0.25, 0.06);
  for (var s = -1; s <= 1; s += 2) {
    var tl = new THREE.Mesh(taillightGeo, MAT.taillight);
    tl.position.set(s * 0.5, 0.95, -1.34);
    t.add(tl);
  }
  
  // ═════ لوحة الأرقام ═════
  var plate = new THREE.Mesh(
    new THREE.BoxGeometry(0.6, 0.18, 0.03),
    new THREE.MeshLambertMaterial({ color: 0xffffff })
  );
  plate.position.set(0, 0.7, -1.36);
  t.add(plate);
  
  // ═════ المقود ═════
  var steerGroup = new THREE.Group();
  
  var steerRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.16, 0.025, 8, 20),
    MAT.black
  );
  steerGroup.add(steerRing);
  
  for (var i = 0; i < 3; i++) {
    var spoke = new THREE.Mesh(
      new THREE.BoxGeometry(0.028, 0.15, 0.018),
      MAT.black
    );
    spoke.rotation.z = (i / 3) * Math.PI * 2;
    steerGroup.add(spoke);
  }
  
  var column = new THREE.Mesh(
    new THREE.CylinderGeometry(0.028, 0.028, 0.4, 8),
    MAT.black
  );
  column.rotation.x = -0.5;
  column.position.set(0, -0.15, 0.15);
  steerGroup.add(column);
  
  steerGroup.position.set(0, 1.55, 0.85);
  steerGroup.rotation.x = -0.4;
  t.add(steerGroup);
  
  // ═════ لوحة القيادة ═════
  var dash = new THREE.Mesh(
    new THREE.BoxGeometry(1.25, 0.22, 0.35),
    MAT.black
  );
  dash.position.set(0, 1.35, 1.0);
  t.add(dash);
  
  // العدادات
  var gaugeMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
  for (var i = 0; i < 3; i++) {
    var gauge = new THREE.Mesh(new THREE.CircleGeometry(0.06, 16), gaugeMat);
    gauge.position.set(-0.3 + i * 0.3, 1.4, 1.19);
    t.add(gauge);
  }
  
  // ═════ المقاعد ═════
  var seatMat = new THREE.MeshLambertMaterial({ color: 0x2a2a2a });
  
  var seatDriver = new THREE.Mesh(
    new THREE.BoxGeometry(0.6, 0.13, 0.55),
    seatMat
  );
  seatDriver.position.set(0, 0.8, 0.4);
  t.add(seatDriver);
  
  var backDriver = new THREE.Mesh(
    new THREE.BoxGeometry(0.6, 0.6, 0.1),
    seatMat
  );
  backDriver.position.set(0, 1.15, 0.15);
  t.add(backDriver);
  
  var rearSeat = new THREE.Mesh(
    new THREE.BoxGeometry(1.25, 0.13, 0.6),
    seatMat
  );
  rearSeat.position.set(0, 0.8, -0.75);
  t.add(rearSeat);
  
  var rearBack = new THREE.Mesh(
    new THREE.BoxGeometry(1.25, 0.7, 0.1),
    seatMat
  );
  rearBack.position.set(0, 1.2, -1.05);
  t.add(rearBack);
  
  // ═════ العجلات الثلاث ═════
  var wheels = [];
  
  function makeWheel(wx, wz, isFront) {
    var wg = new THREE.Group();
    wg.userData.isFront = isFront;
    
    // الإطار
    var tire = new THREE.Mesh(
      new THREE.TorusGeometry(0.28, 0.12, 12, 20),
      MAT.carTire
    );
    tire.rotation.y = Math.PI / 2;
    wg.add(tire);
    
    // الجنط
    var rim = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.18, 0.15, 12),
      MAT.chrome
    );
    rim.rotation.z = Math.PI / 2;
    wg.add(rim);
    
    // البراغي
    for (var i = 0; i < 5; i++) {
      var bolt = new THREE.Mesh(
        new THREE.SphereGeometry(0.025, 6, 6),
        MAT.black
      );
      var angle = (i / 5) * Math.PI * 2;
      bolt.position.set(0, Math.cos(angle) * 0.08, Math.sin(angle) * 0.08);
      wg.add(bolt);
    }
    
    wg.position.set(wx, 0.28, wz);
    t.add(wg);
    wheels.push(wg);
    return wg;
  }
  
  makeWheel(0, 1.15, true);
  makeWheel(-0.65, -0.8, false);
  makeWheel(0.65, -0.8, false);
  
  // ═════════════════════════════════════════
  // مشرط جوه التوك توك (السواق)
  // ═════════════════════════════════════════
  var driver = new THREE.Group();
  
  var galabeyaMat = new THREE.MeshLambertMaterial({ color: 0xf5f0e8 });
  
  var driverTorso = new THREE.Mesh(
    new THREE.BoxGeometry(0.45, 0.6, 0.3),
    galabeyaMat
  );
  driverTorso.position.y = 1.15;
  driver.add(driverTorso);
  
  var driverNeck = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.08, 0.08),
    MAT.peopleSkin[2]
  );
  driverNeck.position.y = 1.48;
  driver.add(driverNeck);
  
  var driverHead = new THREE.Mesh(
    new THREE.SphereGeometry(0.19, 10, 10),
    MAT.peopleSkin[2]
  );
  driverHead.position.y = 1.65;
  driver.add(driverHead);
  
  // عيون
  var driverEyeMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
  for (var s = -1; s <= 1; s += 2) {
    var dEye = new THREE.Mesh(new THREE.SphereGeometry(0.025, 6, 6), driverEyeMat);
    dEye.position.set(s * 0.06, 1.67, 0.16);
    driver.add(dEye);
  }
  
  // شنب
  var driverMustache = new THREE.Mesh(
    new THREE.BoxGeometry(0.15, 0.03, 0.03),
    new THREE.MeshLambertMaterial({ color: 0x1a1a1a })
  );
  driverMustache.position.set(0, 1.6, 0.18);
  driver.add(driverMustache);
  
  // عمة
  var driverTurban = new THREE.Mesh(
    new THREE.SphereGeometry(0.21, 12, 12, 0, Math.PI * 2, 0, Math.PI / 1.7),
    new THREE.MeshLambertMaterial({ color: 0xf0f0e8 })
  );
  driverTurban.position.y = 1.68;
  driver.add(driverTurban);
  
  // ذراع على المقود
  var driverArm = new THREE.Mesh(
    new THREE.BoxGeometry(0.13, 0.55, 0.13),
    galabeyaMat
  );
  driverArm.position.set(0.3, 1.15, 0.15);
  driverArm.rotation.x = -0.6;
  driver.add(driverArm);
  
  driver.position.set(0, 0, 0.4);
  driver.rotation.y = Math.PI;
  t.add(driver);
  
  // ═════ إضاءة أمامية فعلية ═════
  var headlight = new THREE.SpotLight(0xfff5cc, 2.5, 25, Math.PI / 5, 0.5, 1.5);
  headlight.position.set(0, 1.2, 1.2);
  headlight.target.position.set(0, 0.3, 15);
  t.add(headlight);
  t.add(headlight.target);
  
  // ═════ تخزين المراجع ═════
  t.userData = {
    wheels: wheels,
    steeringWheel: steerGroup
  };
  
  return t;
}

var tukTuk = createTukTuk();
tukTuk.position.set(0, 0, 100);
scene.add(tukTuk);

/* ============================================================
   حالة اللاعب واللعبة
   ============================================================ */
var player = {
  speed: 0,
  steering: 0,
  currentWheelAngle: 0,
  engineOn: true,
  handbrake: false,
  hasPassenger: false,
  currentPassenger: null,
  tripStartTime: 0
};

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
  dialogTimer: 5,
  showingCafeScene: false
};

/* ============================================================
   كاميرا الشخص الثالث
   ============================================================ */
var CAMERA_DISTANCE = 8;
var CAMERA_HEIGHT = 4;
var CAMERA_LOOK_HEIGHT = 1.4;

function updateCamera(dt) {
  if (gameState.showingCafeScene) return;
  
  var forwardX = Math.sin(tukTuk.rotation.y);
  var forwardZ = Math.cos(tukTuk.rotation.y);
  
  var targetX = tukTuk.position.x - forwardX * CAMERA_DISTANCE;
  var targetY = CAMERA_HEIGHT;
  var targetZ = tukTuk.position.z - forwardZ * CAMERA_DISTANCE;
  
  var smoothFactor = 1 - Math.pow(0.0001, dt);
  camera.position.x += (targetX - camera.position.x) * smoothFactor;
  camera.position.y += (targetY - camera.position.y) * smoothFactor;
  camera.position.z += (targetZ - camera.position.z) * smoothFactor;
  
  camera.lookAt(
    tukTuk.position.x,
    tukTuk.position.y + CAMERA_LOOK_HEIGHT,
    tukTuk.position.z
  );
}

/* ============================================================
   المدخلات - كيبورد
   ============================================================ */
var keys = {};

document.addEventListener('keydown', function(e) {
  keys[e.code] = true;
  if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'ArrowDown' ||
      e.code === 'ArrowLeft' || e.code === 'ArrowRight') {
    e.preventDefault();
  }
  if (e.code === 'Space') player.handbrake = true;
  if (e.code === 'KeyE') {
    player.engineOn = !player.engineOn;
    AudioSystem.setEngine(player.engineOn);
  }
  if (e.code === 'KeyH') AudioSystem.playHorn();
  if (e.code === 'KeyR') radio.toggle();
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
  right: false
};

function setupMobileButtons() {
  var buttons = {
    btnAccel: 'accel',
    btnBrake: 'brake',
    btnLeft: 'left',
    btnRight: 'right'
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
      player.handbrake = true;
      hbBtn.classList.add('pressed');
    };
    var hbRelease = function(e) {
      e.preventDefault();
      player.handbrake = false;
      hbBtn.classList.remove('pressed');
    };
    hbBtn.addEventListener('touchstart', hbPress, { passive: false });
    hbBtn.addEventListener('touchend', hbRelease, { passive: false });
  }
  
  var hornBtn = document.getElementById('btnHorn');
  if (hornBtn) {
    var hornPress = function(e) {
      e.preventDefault();
      AudioSystem.playHorn();
      hornBtn.classList.add('pressed');
    };
    var hornRelease = function(e) {
      e.preventDefault();
      hornBtn.classList.remove('pressed');
    };
    hornBtn.addEventListener('touchstart', hornPress, { passive: false });
    hornBtn.addEventListener('touchend', hornRelease, { passive: false });
  }
}

/* ============================================================
   فيزياء التوك توك
   ============================================================ */
function updateTukTukPhysics(dt) {
  if (!gameState.running || gameState.paused) return;
  
  var throttle = (keys.KeyW || keys.ArrowUp || mobileInput.accel) ? 1 : 0;
  var brake = (keys.KeyS || keys.ArrowDown || mobileInput.brake) ? 1 : 0;
  
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
  
  var leftInput = (keys.KeyA || keys.ArrowLeft || mobileInput.left) ? 1 : 0;
  var rightInput = (keys.KeyD || keys.ArrowRight || mobileInput.right) ? 1 : 0;
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
  
  // منع الدخول في الترعة
  var inCanalX = !(newPos.x > -13 && newPos.x < 13);
  var nearCanal = Math.abs(newPos.z) < CONFIG.canalWidth / 2 + 1.5;
  
  if (nearCanal && inCanalX) {
    player.speed *= -0.25;
  } else if (Math.abs(newPos.x) < CONFIG.citySize / 2 - 3 && Math.abs(newPos.z) < CONFIG.citySize / 2 - 3) {
    tukTuk.position.copy(newPos);
  } else {
    player.speed *= -0.3;
  }
  
  var wheelRoll = (player.speed * dt) / 0.28;
  for (var i = 0; i < tukTuk.userData.wheels.length; i++) {
    var w = tukTuk.userData.wheels[i];
    var tire = w.children[0];
    if (tire) tire.rotation.x += wheelRoll;
    if (w.userData.isFront) w.rotation.y = player.currentWheelAngle;
  }
  
  tukTuk.userData.steeringWheel.rotation.z = -player.steering * Math.PI * 0.85;
  tukTuk.position.y = Math.max(0, Math.sin(performance.now() * 0.02) * 0.004 * (1 + speedRatio));
}

/* ============================================================
   الركاب - مع مؤشرات واضحة جداً
   ============================================================ */
var passengers = [];
var activeDestination = null;

function getPassengerSpawnPoint() {
  var candidates = [];
  
  for (var i = 0; i < ROADS_DATA.length; i++) {
    var rd = ROADS_DATA[i];
    if (rd.width < 12) continue;
    
    var steps = Math.floor(rd.length / 80);
    for (var j = 0; j < steps; j++) {
      var off = -rd.length / 2 + j * 80 + 40;
      var side = Math.random() > 0.5 ? 1 : -1;
      var so = side * (rd.width / 2 + CONFIG.sidewalkWidth / 2);
      var x = rd.x + Math.sin(rd.rotation) * off + Math.cos(rd.rotation) * so;
      var z = rd.z + Math.cos(rd.rotation) * off - Math.sin(rd.rotation) * so;
      
      if (Math.abs(z) < CONFIG.canalWidth / 2 + 5) continue;
      
      var dist = Math.hypot(x - tukTuk.position.x, z - tukTuk.position.z);
      if (dist < 40 || dist > 250) continue;
      
      candidates.push({ x: x, z: z });
    }
  }
  
  if (candidates.length === 0) return null;
  return Utils.pick(candidates);
}

function createPassengerMesh() {
  var group = new THREE.Group();
  
  var shirtMat = Utils.pick(MAT.peopleShirt);
  var pantsMat = Utils.pick(MAT.peoplePants);
  var skinMat = Utils.pick(MAT.peopleSkin);
  var hairMat = Utils.pick(MAT.peopleHair);
  
  var torso = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.65, 0.28), shirtMat);
  torso.position.y = 1.1;
  group.add(torso);
  
  var head = new THREE.Mesh(new THREE.SphereGeometry(0.17, 10, 10), skinMat);
  head.position.y = 1.62;
  group.add(head);
  
  var hair = new THREE.Mesh(
    new THREE.SphereGeometry(0.18, 10, 10, 0, Math.PI * 2, 0, Math.PI / 2),
    hairMat
  );
  hair.position.y = 1.64;
  group.add(hair);
  
  var legs = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.75, 0.28), pantsMat);
  legs.position.y = 0.4;
  group.add(legs);
  
  var armGeo = new THREE.BoxGeometry(0.12, 0.55, 0.12);
  var armL = new THREE.Mesh(armGeo, shirtMat);
  armL.position.set(-0.3, 1.1, 0);
  group.add(armL);
  
  var armR = new THREE.Mesh(armGeo, shirtMat);
  armR.position.set(0.3, 1.1, 0);
  group.add(armR);
  
  // ═════════════════════════════════════════
  // هالة أرضية كبيرة نابضة
  // ═════════════════════════════════════════
  var ringMat = new THREE.MeshBasicMaterial({
    color: 0x00ff88,
    transparent: true,
    opacity: 0.85,
    side: THREE.DoubleSide,
    depthWrite: false
  });
  var ring = new THREE.Mesh(new THREE.RingGeometry(1, 1.5, 20), ringMat);
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.05;
  group.add(ring);
  group.userData.ring = ring;
  
  // ═════════════════════════════════════════
  // سهم كبير جداً فوق الرأس
  // ═════════════════════════════════════════
  var arrowMat = new THREE.MeshBasicMaterial({ 
    color: 0x00ff88,
    depthWrite: false
  });
  var arrow = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1, 5), arrowMat);
  arrow.position.y = 2.8;
  arrow.rotation.x = Math.PI;
  group.add(arrow);
  group.userData.arrow = arrow;
  
  // ═════════════════════════════════════════
  // عمود ضوء أخضر يشاور للسماء
  // ═════════════════════════════════════════
  var beamMat = new THREE.MeshBasicMaterial({
    color: 0x00ff88,
    transparent: true,
    opacity: 0.6,
    side: THREE.DoubleSide,
    depthWrite: false
  });
  var beam = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15, 0.3, 6, 10, 1, true),
    beamMat
  );
  beam.position.y = 5;
  group.add(beam);
  group.userData.beam = beam;
  
  // ═════════════════════════════════════════
  // إضاءة نقطية خضراء قوية
  // ═════════════════════════════════════════
  var pointLight = new THREE.PointLight(0x00ff88, 2, 15);
  pointLight.position.y = 1;
  group.add(pointLight);
  
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
  mesh.rotation.y = Math.random() * Math.PI * 2;
  scene.add(mesh);
  
  passengers.push({
    mesh: mesh,
    x: spawnPoint.x,
    z: spawnPoint.z,
    destination: destination,
    bobPhase: Math.random() * Math.PI * 2
  });
  
  console.log('👤 راكب جديد ينتظر في الخريطة');
  UI.showToast('👤 راكب ينتظر — بص على الخريطة!', 2000);
  updateMissionUI();
}

function createDestinationMarker(destination) {
  var group = new THREE.Group();
  
  var ringMat = new THREE.MeshBasicMaterial({
    color: destination.color,
    transparent: true,
    opacity: 0.8,
    side: THREE.DoubleSide,
    depthWrite: false
  });
  var ring = new THREE.Mesh(new THREE.RingGeometry(3, 4.5, 24), ringMat);
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.15;
  group.add(ring);
  
  var beamMat = new THREE.MeshBasicMaterial({
    color: destination.color,
    transparent: true,
    opacity: 0.4,
    side: THREE.DoubleSide,
    depthWrite: false
  });
  var beam = new THREE.Mesh(new THREE.CylinderGeometry(1, 2.5, 14, 12, 1, true), beamMat);
  beam.position.y = 7;
  group.add(beam);
  
  var icon = new THREE.Mesh(
    new THREE.SphereGeometry(1, 12, 12),
    new THREE.MeshBasicMaterial({ color: destination.color })
  );
  icon.position.y = 11;
  group.add(icon);
  
  var pointLight = new THREE.PointLight(destination.color, 2, 25);
  pointLight.position.y = 6;
  group.add(pointLight);
  
  group.position.set(destination.x, 0, destination.z);
  group.userData = {
    destination: destination,
    startTime: performance.now(),
    icon: icon,
    ring: ring
  };
  
  return group;
}

function checkPassengerPickup() {
  if (player.hasPassenger) return;
  
  for (var i = passengers.length - 1; i >= 0; i--) {
    var p = passengers[i];
    var dist = Math.hypot(p.x - tukTuk.position.x, p.z - tukTuk.position.z);
    
    if (dist < 3.5) {
      var dest = p.destination;
      
      scene.remove(p.mesh);
      passengers.splice(i, 1);
      
      player.hasPassenger = true;
      player.currentPassenger = dest;
      player.tripStartTime = performance.now();
      
      activeDestination = createDestinationMarker(dest);
      scene.add(activeDestination);
      
      AudioSystem.playPickup();
      UI.showDialog('مشرط: ' + Utils.pick(DIALOGS.pickup), 3000);
      UI.showToast('✅ راكب صعد! → ' + dest.name, 2500);
      
      var riderMesh = createPassengerMesh();
      riderMesh.scale.set(0.75, 0.75, 0.75);
      riderMesh.position.set(0, 0.35, -0.75);
      riderMesh.userData.ring.visible = false;
      riderMesh.userData.arrow.visible = false;
      riderMesh.userData.beam.visible = false;
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
  
  if (dist < 6) {
    var tripTime = (performance.now() - player.tripStartTime) / 1000;
    var reward = 60;
    var rating = 3;
    
    if (tripTime < 30) { reward = 120; rating = 5; }
    else if (tripTime < 60) { reward = 100; rating = 4; }
    else if (tripTime < 90) { reward = 80; rating = 3; }
    
    gameState.timeLeft = Math.min(gameState.timeLeft + CONFIG.deliveryBonus, CONFIG.gameDuration);
    gameState.money += reward;
    gameState.deliveries++;
    gameState.ratingSum += rating;
    
    AudioSystem.playDelivery();
    UI.showDialog('مشرط: ' + Utils.pick(DIALOGS.arrived), 2500);
    UI.showToast('🎉 توصيل! +' + reward + ' جنيه', 2500);
    
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

/* ============================================================
   واجهة المستخدم
   ============================================================ */
function updateHUD() {
  if (UI.moneyValue) UI.moneyValue.textContent = gameState.money;
  if (UI.deliveriesValue) UI.deliveriesValue.textContent = gameState.deliveries;
  if (UI.timeValue) {
    UI.timeValue.textContent = Utils.formatTime(gameState.timeLeft);
    if (gameState.timeLeft < 30) UI.timeValue.classList.add('warning');
    else UI.timeValue.classList.remove('warning');
  }
  
  var speedKmh = Math.abs(player.speed) * 3.6 * 3.5;
  if (UI.speedValue) UI.speedValue.textContent = Math.round(speedKmh);
}

function updateMissionUI() {
  if (!UI.missionPanel) return;
  
  if (player.hasPassenger && player.currentPassenger) {
    UI.missionPanel.textContent = '🎯 مشرط رايح لـ: ' + player.currentPassenger.name;
    UI.missionPanel.style.borderRightColor = '#00ff88';
  } else if (passengers.length > 0) {
    UI.missionPanel.textContent = '👤 ' + passengers.length + ' راكب ينتظر — بص على الخريطة!';
    UI.missionPanel.style.borderRightColor = '#00ff88';
  } else {
    UI.missionPanel.textContent = '🔍 مشرط بيدوّر على راكب...';
    UI.missionPanel.style.borderRightColor = '#ffc800';
  }
}

function updatePassengers(dt) {
  var now = performance.now();
  
  for (var i = 0; i < passengers.length; i++) {
    var p = passengers[i];
    p.bobPhase += dt * 3;
    if (p.mesh) {
      p.mesh.position.y = Math.sin(p.bobPhase) * 0.1;
      
      if (p.mesh.userData.ring) {
        var pulse = 1 + Math.sin(now * 0.006) * 0.2;
        p.mesh.userData.ring.scale.set(pulse, pulse, 1);
        p.mesh.userData.ring.rotation.z += dt * 1.5;
      }
      if (p.mesh.userData.arrow) {
        p.mesh.userData.arrow.position.y = 2.8 + Math.sin(now * 0.005) * 0.3;
        p.mesh.userData.arrow.rotation.y += dt * 3;
      }
    }
  }
  
  if (activeDestination) {
    var ud = activeDestination.userData;
    var time = (now - ud.startTime) / 1000;
    var pulse = 1 + Math.sin(time * 3) * 0.15;
    ud.ring.scale.set(pulse, pulse, 1);
    ud.icon.rotation.y += dt * 2;
    ud.icon.position.y = 11 + Math.sin(time * 2) * 0.6;
  }
  
  if (player.hasPassenger) {
    gameState.dialogTimer -= dt;
    if (gameState.dialogTimer <= 0) {
      UI.showDialog('مشرط: ' + Utils.pick(DIALOGS.driving), 2500);
      gameState.dialogTimer = Utils.rand(8, 15);
    }
  }
}

/* ============================================================
   🗺️ الخريطة - بالاتجاه الصح
   ============================================================ */
var minimapCtx = null;

function initMinimap() {
  if (!UI.minimapCanvas) return;
  minimapCtx = UI.minimapCanvas.getContext('2d');
}

function drawMinimap() {
  if (!minimapCtx) return;
  
  var ctx = minimapCtx;
  var w = UI.minimapCanvas.width;
  var h = UI.minimapCanvas.height;
  var scale = 0.1;
  var cx = w / 2;
  var cy = h / 2;
  
  ctx.fillStyle = '#0a1828';
  ctx.fillRect(0, 0, w, h);
  
  // دالة تحويل الإحداثيات - تصحيح الاتجاه
  function toMap(x, z) {
    var dx = x - tukTuk.position.x;
    var dz = z - tukTuk.position.z;
    
    // تدوير بنفس اتجاه التوك توك
    var cos = Math.cos(-tukTuk.rotation.y);
    var sin = Math.sin(-tukTuk.rotation.y);
    
    var rx = dx * cos - dz * sin;
    var rz = dx * sin + dz * cos;
    
    return {
      x: cx + rx * scale,
      y: cy + rz * scale
    };
  }
  
  // ═══ الترعة ═══
  ctx.fillStyle = '#1a6a9a';
  var c1 = toMap(-600, -CONFIG.canalWidth / 2);
  var c2 = toMap(600, CONFIG.canalWidth / 2);
  ctx.fillRect(Math.min(c1.x, c2.x), Math.min(c1.y, c2.y),
               Math.abs(c2.x - c1.x), Math.abs(c2.y - c1.y));
  
  // ═══ الشوارع ═══
  for (var i = 0; i < ROADS_DATA.length; i++) {
    var rd = ROADS_DATA[i];
    ctx.fillStyle = rd.isMain ? '#4a7aaa' : '#2a4a6a';
    
    var p1 = toMap(
      rd.x - Math.sin(rd.rotation) * rd.length / 2,
      rd.z - Math.cos(rd.rotation) * rd.length / 2
    );
    var p2 = toMap(
      rd.x + Math.sin(rd.rotation) * rd.length / 2,
      rd.z + Math.cos(rd.rotation) * rd.length / 2
    );
    
    ctx.save();
    ctx.translate(p1.x, p1.y);
    ctx.rotate(-rd.rotation - tukTuk.rotation.y);
    var roadW = Math.max(3, rd.width * scale);
    var roadL = Math.max(3, rd.length * scale);
    ctx.fillRect(-roadW / 2, 0, roadW, roadL);
    ctx.restore();
  }
  
  // ═══ الوجهات ═══
  for (var i = 0; i < DESTINATIONS_DATA.length; i++) {
    var dest = DESTINATIONS_DATA[i];
    var p = toMap(dest.x, dest.z);
    if (p.x < -20 || p.x > w + 20 || p.y < -20 || p.y > h + 20) continue;
    
    ctx.beginPath();
    ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#' + dest.color.toString(16).padStart(6, '0');
    ctx.fill();
    
    if (activeDestination && activeDestination.userData.destination.name === dest.name) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 10 + Math.sin(performance.now() * 0.005) * 3, 0, Math.PI * 2);
      ctx.strokeStyle = '#00ff88';
      ctx.lineWidth = 3;
      ctx.stroke();
    }
  }
  
  // ═══ الركاب - دائرة خضراء كبيرة ═══
  for (var i = 0; i < passengers.length; i++) {
    var p = toMap(passengers[i].x, passengers[i].z);
    if (p.x < -20 || p.x > w + 20 || p.y < -20 || p.y > h + 20) continue;
    
    var pulse = 1 + Math.sin(performance.now() * 0.008) * 0.5;
    
    ctx.beginPath();
    ctx.arc(p.x, p.y, 6 * pulse, 0, Math.PI * 2);
    ctx.fillStyle = '#00ff88';
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(p.x, p.y, 10 * pulse, 0, Math.PI * 2);
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  
  // ═══ السيارات ═══
  for (var i = 0; i < cars.length; i++) {
    var p = toMap(cars[i].position.x, cars[i].position.z);
    if (p.x < -10 || p.x > w + 10 || p.y < -10 || p.y > h + 10) continue;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = '#ffcc00';
    ctx.fill();
  }
  
  // ═══ التوك توك (في المنتصف دائماً) - سهم ثابت ═══
  ctx.save();
  ctx.translate(cx, cy);
  // السهم بيثبت لفوق دايماً لأن الخريطة بتلف معاه
  ctx.beginPath();
  ctx.moveTo(0, -10);
  ctx.lineTo(-7, 7);
  ctx.lineTo(0, 4);
  ctx.lineTo(7, 7);
  ctx.closePath();
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
  
  // إطار
  ctx.strokeStyle = '#ffc800';
  ctx.lineWidth = 3;
  ctx.strokeRect(2, 2, w - 4, h - 4);
  
  // حرف N في الأعلى (الشمال)
  ctx.save();
  ctx.translate(cx, 15);
  ctx.fillStyle = '#ffc800';
  ctx.font = 'bold 14px Tahoma';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('N', 0, 0);
  ctx.restore();
}

/* ============================================================
   ربط أزرار الراديو
   ============================================================ */
function setupRadio() {
  if (UI.radioToggle) UI.radioToggle.addEventListener('click', function() { radio.toggle(); });
  if (UI.radioPrev) UI.radioPrev.addEventListener('click', function() { radio.prev(); });
  if (UI.radioNext) UI.radioNext.addEventListener('click', function() { radio.next(); });
  if (UI.radioBtn) {
    UI.radioBtn.addEventListener('click', function() {
      UI.radioPanel.classList.toggle('visible');
      UI.radioBtn.classList.toggle('active');
    });
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
  
  // لو بنعرض مشهد القهوة
  if (gameState.showingCafeScene) {
    renderer.render(scene, camera);
    return;
  }
  
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
    gameState.spawnTimer = 3 + Math.random() * 2;
  }
  
  updateTukTukPhysics(dt);
  checkPassengerPickup();
  checkDelivery();
  updateCamera(dt);
  updatePassengers(dt);
  updatePeople(dt);
  updateCars(dt);
  
  var isAccelerating = !!(keys.KeyW || keys.ArrowUp || mobileInput.accel);
  AudioSystem.updateEngine(Math.abs(player.speed), CONFIG.maxSpeed, isAccelerating);
  
  sunLight.position.set(tukTuk.position.x + 100, 200, tukTuk.position.z + 80);
  sunLight.target.position.copy(tukTuk.position);
  sunLight.target.updateMatrixWorld();
  
  updateHUD();
  drawMinimap();
  
  renderer.render(scene, camera);
}

/* ============================================================
   بناء المدينة
   ============================================================ */
async function buildCity(onProgress) {
  var steps = [
    { name: 'إنشاء الأرضية...', fn: createGround, weight: 3 },
    { name: 'بناء ترعة المحمودية...', fn: createCanal, weight: 8 },
    { name: 'رصف الشوارع...', fn: createRoads, weight: 12 },
    { name: 'زراعة النخيل والأشجار...', fn: createFoliage, weight: 10 },
    { name: 'بناء المباني...', fn: createBuildings, weight: 18 },
    { name: 'بناء المعالم...', fn: createLandmarks, weight: 12 },
    { name: 'إضافة الناس...', fn: createPeople, weight: 10 },
    { name: 'إضافة السيارات...', fn: createCars, weight: 8 },
    { name: 'تركيب الخريطة...', fn: initMinimap, weight: 3 },
    { name: 'تشغيل الراديو...', fn: function() { radio.init(); setupRadio(); }, weight: 3 }
  ];
  
  var accumulated = 0;
  var totalWeight = steps.reduce(function(sum, s) { return sum + s.weight; }, 0);
  
  for (var i = 0; i < steps.length; i++) {
    var step = steps[i];
    if (onProgress) onProgress(Math.round((accumulated / totalWeight) * 100), step.name);
    
    await new Promise(function(resolve) {
      setTimeout(function() {
        try { step.fn(); } catch (e) { console.error('خطأ في', step.name, e); }
        resolve();
      }, 20);
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
    gameState.showingCafeScene = false;
    
    // إخفاء مشهد القهوة
    if (meshratScene) meshratScene.visible = false;
    
    UI.loadingScreen.classList.add('hidden');
    UI.startScreen.classList.remove('visible');
    UI.endScreen.classList.remove('visible');
    UI.hud.classList.add('visible');
    UI.missionPanel.classList.add('visible');
    UI.pauseBtn.style.display = 'flex';
    UI.radioBtn.style.display = 'flex';
    UI.fullscreenBtn.style.display = 'flex';
    
    if (isMobile) UI.controls.classList.add('visible');
    
    if (player.engineOn) AudioSystem.setEngine(true);
    
    // تشغيل الراديو
    setTimeout(function() {
      if (!radio.isPlaying) radio.play();
    }, 800);
    
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
    
    // ═════════════════════════════════════════
    // عرض مشهد مشرط على القهوة أولاً (3 ثواني)
    // ═════════════════════════════════════════
    showMeshratScene();
    gameState.showingCafeScene = true;
    gameState.running = true;
    gameState.lastTime = performance.now();
    
    UI.loadingScreen.classList.add('hidden');
    UI.startScreen.classList.remove('visible');
    UI.hud.classList.add('visible');
    
    // بعد 4 ثواني نبدأ اللعب الفعلي
    setTimeout(function() {
      gameState.showingCafeScene = false;
      if (meshratScene) meshratScene.visible = false;
      
      resetGame();
      UI.missionPanel.classList.add('visible');
      UI.pauseBtn.style.display = 'flex';
      UI.radioBtn.style.display = 'flex';
      UI.fullscreenBtn.style.display = 'flex';
      
      if (isMobile) UI.controls.classList.add('visible');
      
      if (player.engineOn) AudioSystem.setEngine(true);
      
      // تشغيل الراديو
      setTimeout(function() {
        if (!radio.isPlaying) radio.play();
      }, 500);
      
      setTimeout(function() { spawnPassenger(); }, 500);
      setTimeout(function() { spawnPassenger(); }, 1500);
      
      UI.showToast('🛺 يلا بينا مع مشرط!', 2500);
      UI.showDialog('مشرط: يلا بينا نشتغل بعد ما شربت الشيشة!', 3500);
      
    }, 4000);
    
    if (!animate.started) {
      animate.started = true;
      animate();
    }
    
    console.log('✅ اللعبة بدأت!');
    
  } catch (error) {
    console.error('❌ خطأ:', error);
    UI.showToast('حدث خطأ أثناء التحميل', 3000);
    UI.startBtn.disabled = false;
    UI.startBtn.textContent = '🚀 ابدأ الشغل مع مشرط';
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
  gameState.dialogTimer = 5;
  
  tukTuk.position.set(0, 0, 100);
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
  
  camera.position.set(
    tukTuk.position.x,
    CAMERA_HEIGHT,
    tukTuk.position.z - CAMERA_DISTANCE
  );
  camera.lookAt(tukTuk.position.x, CAMERA_LOOK_HEIGHT, tukTuk.position.z);
  
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
    if (radio.isPlaying) radio.pause();
  } else {
    UI.pauseBtn.textContent = '⏸️';
    UI.showToast('▶️ يلا بينا!', 1000);
    if (player.engineOn) AudioSystem.setEngine(true);
    gameState.lastTime = performance.now();
  }
}

function endGame() {
  gameState.running = false;
  AudioSystem.setEngine(false);
  if (radio.isPlaying) radio.pause();
  
  var avgRating = gameState.deliveries > 0
    ? (gameState.ratingSum / gameState.deliveries).toFixed(1)
    : '0';
  
  UI.endTitle.textContent = gameState.deliveries > 0 ? '🎉 مشرط: شغل جميل!' : '⏰ خلص الوقت!';
  UI.endMoney.textContent = gameState.money + ' جنيه';
  UI.endDeliveries.textContent = gameState.deliveries;
  UI.endRating.textContent = avgRating + ' ⭐';
  
  UI.endScreen.classList.add('visible');
  UI.controls.classList.remove('visible');
  UI.pauseBtn.style.display = 'none';
  UI.radioBtn.style.display = 'none';
  UI.fullscreenBtn.style.display = 'none';
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
    UI.endScreen.classList.remove('visible');
    startGame();
  });
}

if (UI.pauseBtn) {
  UI.pauseBtn.addEventListener('click', togglePause);
}

if (UI.fullscreenBtn) {
  UI.fullscreenBtn.addEventListener('click', function() {
    var doc = document.documentElement;
    if (!document.fullscreenElement) {
      if (doc.requestFullscreen) doc.requestFullscreen().catch(function() {});
      else if (doc.webkitRequestFullscreen) doc.webkitRequestFullscreen();
    } else {
      if (document.exitFullscreen) document.exitFullscreen().catch(function() {});
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    }
  });
}

document.addEventListener('keydown', function(e) {
  if (e.code === 'Escape' || e.code === 'KeyP') {
    if (gameState.running) togglePause();
  }
});

document.addEventListener('contextmenu', function(e) { e.preventDefault(); });

/* ============================================================
   📌 تصدير الدوال
   ============================================================ */
window.buildCity = buildCity;
window.startGame = startGame;
window.togglePause = togglePause;
window.gameState = gameState;
window.radio = radio;
window.gameStarted = true;
window.gameInitialized = true;

console.log('✅ الجزء 3 تم تحميله - التوك توك ومشرط والركاب');
console.log('🎮 اللعبة جاهزة! اضغط "🚀 ابدأ الشغل مع مشرط"');
console.log('☕ مشرط قاعد على قهوة عماد هارون في البيضا');
console.log('🎵 الراديو هشتغل تلقائي');
