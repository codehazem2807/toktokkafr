/* ============================================================
   🛺 توك توك كفر الدوار - الجزء 1
   الإعدادات + المواد + الشوارع + المباني + الناس
   النسخة الاحترافية - بدون تهنيج
   ============================================================ */

console.log('🚀 تحميل اللعبة...');

if (typeof THREE === 'undefined') {
  alert('فشل تحميل Three.js');
  throw new Error('Three.js not loaded');
}

console.log('✅ Three.js v' + THREE.REVISION);

/* ═══════════════════════════════════════════════════════════
   كشف الجهاز
   ═══════════════════════════════════════════════════════════ */
var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  || (navigator.maxTouchPoints && navigator.maxTouchPoints > 2);

console.log('📱 الجهاز:', isMobile ? 'موبايل' : 'كمبيوتر');

/* ═══════════════════════════════════════════════════════════
   الجودة - محسّنة للأداء العالي
   ═══════════════════════════════════════════════════════════ */
var QUALITY = {
  pixelRatio: isMobile ? 1.0 : 1.5,
  fogFar: isMobile ? 350 : 500,
  treeCount: isMobile ? 30 : 60,
  buildingDensity: isMobile ? 0.5 : 0.7,
  peopleCount: isMobile ? 20 : 40,
  carsCount: isMobile ? 6 : 12,
  maxBuildings: isMobile ? 180 : 350
};

var CONFIG = {
  citySize: 1400,
  canalWidth: 22,
  maxSpeed: 16,
  maxReverseSpeed: 5,
  acceleration: 8,
  braking: 18,
  friction: 0.9,
  steeringSpeed: 3.5,
  maxWheelAngle: 0.6,
  gameDuration: 300,
  deliveryBonus: 30,
  maxPassengers: 4
};

/* ═══════════════════════════════════════════════════════════
   الألوان - نمط Stylish زاهي
   ═══════════════════════════════════════════════════════════ */
var COLORS = {
  sky: 0x87CEEB,
  skyTop: 0x4a90e2,
  ground: 0x7ab648,
  groundDark: 0x5a8a30,
  road: 0x3a3a42,
  roadLine: 0xffdd44,
  sidewalk: 0xd4c8b0,
  canal: 0x2a8ac4,
  canalBank: 0xa08868
};

/* ═══════════════════════════════════════════════════════════
   المشهد والكاميرا
   ═══════════════════════════════════════════════════════════ */
var scene = new THREE.Scene();
scene.background = new THREE.Color(COLORS.sky);
scene.fog = new THREE.Fog(COLORS.sky, 120, QUALITY.fogFar);

var camera = new THREE.PerspectiveCamera(
  62,
  window.innerWidth / window.innerHeight,
  0.5,
  1200
);

var renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById('gameCanvas'),
  antialias: !isMobile,
  powerPreference: 'high-performance',
  stencil: false,
  alpha: false
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, QUALITY.pixelRatio));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;

function updateSize() {
  var w = window.innerWidth;
  var h = window.innerHeight;
  
  if (window.visualViewport) {
    w = window.visualViewport.width;
    h = window.visualViewport.height;
  }
  
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h, false);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, QUALITY.pixelRatio));
}

window.addEventListener('resize', updateSize);
window.addEventListener('orientationchange', function() {
  setTimeout(updateSize, 150);
  setTimeout(updateSize, 400);
});

if (window.visualViewport) {
  window.visualViewport.addEventListener('resize', updateSize);
}

/* ═══════════════════════════════════════════════════════════
   الإضاءة
   ═══════════════════════════════════════════════════════════ */
var sunLight = new THREE.DirectionalLight(0xfff8e8, 2.5);
sunLight.position.set(200, 300, 150);
scene.add(sunLight);
scene.add(sunLight.target);

scene.add(new THREE.AmbientLight(0xffffff, 1.4));
scene.add(new THREE.HemisphereLight(0xa8d8ff, 0x8a7a5a, 1.2));

/* ═══════════════════════════════════════════════════════════
   واجهة المستخدم
   ═══════════════════════════════════════════════════════════ */
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
  ratingValue: document.getElementById('ratingValue'),
  timeValue: document.getElementById('timeValue'),
  speedValue: document.getElementById('speedValue'),
  endTitle: document.getElementById('endTitle'),
  endSubtitle: document.getElementById('endSubtitle'),
  endMoney: document.getElementById('endMoney'),
  endDeliveries: document.getElementById('endDeliveries'),
  endRating: document.getElementById('endRating'),
  radioPanel: document.getElementById('radioPanel'),
  radioTrack: document.getElementById('radioTrack'),
  radioPrev: document.getElementById('radioPrev'),
  radioPlay: document.getElementById('radioPlay'),
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

/* ═══════════════════════════════════════════════════════════
   أدوات
   ═══════════════════════════════════════════════════════════ */
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

/* ═══════════════════════════════════════════════════════════
   كلام مشرط
   ═══════════════════════════════════════════════════════════ */
var DIALOGS = {
  pickup: [
    'اتفضل يا باشا، مشرط تحت أمرك',
    'يلا يا معلم، اركب بسرعة',
    'أهلاً يا زعيم، هنمشي حالاً',
    'طيب يا باشا، اركب وربنا يكرم',
    'اركب يا معلم، ده مشرط اللي معاك',
    'أهلاً وسهلاً، اتفضل ورا',
    'صباح الفل يا باشا',
    'على راسي يا معلم، اركب',
    'من عزبة بولضو، للشغل في شارع الجيش',
    'أيوه كده، اركب يسطا'
  ],
  driving: [
    'شارع الجيش ده بيتي',
    'الطريق زحمة النهاردة',
    'أنا مشرط، مفيش حد يقدر عليّا',
    'يلا نلف من أحمد عرابي',
    'على فكرة، أنا من عزبة بولضو',
    'بص على اليمين، ده سوق الأربعاء',
    'في مطب قدام يسطا، اقفش',
    'كفر الدوار دي بلدي يا معلم',
    'قربنا نوصل يا باشا',
    'دي شارع بورسعيد يسطا',
    'الجو النهاردة حلو والله',
    'ربنا يكرمك يا معلم'
  ],
  arrived: [
    'وصلنا يا باشا، اتفضل',
    'الحمد لله، كنا في الموعد',
    'أيوه كده، المكان ده هو',
    'يلا يا معلم، نوّرت',
    'وصلنا بألف سلامة يسطا'
  ],
  angry: [
    '⚠️ خد بالك يا معلم!',
    '⚠️ إنت مش شايف؟!',
    '⚠️ الراجل كان هيموت!',
    '⚠️ خد بالك من الناس!',
    '⚠️ أنا محترم، بس إنت غلط!'
  ]
};

/* ═══════════════════════════════════════════════════════════
   الراديو
   ═══════════════════════════════════════════════════════════ */
var RADIO_TRACKS = [
  { file: '1.mp3', name: 'الطريق الزراعي' },
  { file: '2.mp3', name: 'شارع الجيش' },
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
    this.audio.volume = 0.4;
    var self = this;
    this.audio.addEventListener('ended', function() { self.next(); });
  },
  
  play: function() {
    if (!this.audio) this.init();
    if (!this.audio) return;
    
    var track = RADIO_TRACKS[this.currentTrack];
    this.audio.src = track.file;
    var self = this;
    
    this.audio.play().then(function() {
      console.log('🎵 ' + track.name);
    }).catch(function(e) {
      console.warn('⚠️ الراديو:', e.message);
      self.isPlaying = false;
      if (UI.radioPlay) UI.radioPlay.textContent = '▶️';
    });
    
    this.isPlaying = true;
    if (UI.radioTrack) UI.radioTrack.textContent = track.name;
    if (UI.radioPlay) UI.radioPlay.textContent = '⏸️';
  },
  
  pause: function() {
    if (this.audio) this.audio.pause();
    this.isPlaying = false;
    if (UI.radioPlay) UI.radioPlay.textContent = '▶️';
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

/* ═══════════════════════════════════════════════════════════
   المواد - كلها Lambert للأداء
   ═══════════════════════════════════════════════════════════ */
var MAT = {
  // أرضية
  ground: new THREE.MeshLambertMaterial({ color: COLORS.ground }),
  groundDark: new THREE.MeshLambertMaterial({ color: COLORS.groundDark }),
  
  // طرق
  road: new THREE.MeshLambertMaterial({ color: COLORS.road }),
  roadLine: new THREE.MeshBasicMaterial({ color: COLORS.roadLine }),
  sidewalk: new THREE.MeshLambertMaterial({ color: COLORS.sidewalk }),
  curb: new THREE.MeshLambertMaterial({ color: 0x888888 }),
  
  // ترعة
  canal: new THREE.MeshLambertMaterial({ color: COLORS.canal }),
  canalBank: new THREE.MeshLambertMaterial({ color: COLORS.canalBank }),
  bridge: new THREE.MeshLambertMaterial({ color: 0x666666 }),
  
  // مباني - ألوان زاهية Stylish
  buildingWall: [
    new THREE.MeshLambertMaterial({ color: 0xf5e8d0 }),  // كريمي
    new THREE.MeshLambertMaterial({ color: 0xe8d0b0 }),  // بيج
    new THREE.MeshLambertMaterial({ color: 0xffd8b0 }),  // مشمشي
    new THREE.MeshLambertMaterial({ color: 0xd8e8d0 }),  // أخضر فاتح
    new THREE.MeshLambertMaterial({ color: 0xd0d8e8 }),  // أزرق فاتح
    new THREE.MeshLambertMaterial({ color: 0xf5d0c0 }),  // وردي فاتح
    new THREE.MeshLambertMaterial({ color: 0xe0c8a0 })   // عسلي
  ],
  buildingRoof: [
    new THREE.MeshLambertMaterial({ color: 0x8b5030 }),  // بني محروق
    new THREE.MeshLambertMaterial({ color: 0xa06040 }),  // بني فاتح
    new THREE.MeshLambertMaterial({ color: 0x6b4030 }),  // بني غامق
    new THREE.MeshLambertMaterial({ color: 0xc08060 })   // تراكوتا
  ],
  
  // مواد البناء
  door: new THREE.MeshLambertMaterial({ color: 0x6a3a1a }),
  doorMetal: new THREE.MeshLambertMaterial({ color: 0x4a4a4a }),
  window: new THREE.MeshLambertMaterial({ color: 0x88ccff, transparent: true, opacity: 0.7 }),
  windowFrame: new THREE.MeshLambertMaterial({ color: 0x4a4a4a }),
  
  // محلات
  shopAwning: [
    new THREE.MeshLambertMaterial({ color: 0xe74c3c }),
    new THREE.MeshLambertMaterial({ color: 0x3498db }),
    new THREE.MeshLambertMaterial({ color: 0x2ecc71 }),
    new THREE.MeshLambertMaterial({ color: 0xf39c12 }),
    new THREE.MeshLambertMaterial({ color: 0x9b59b6 }),
    new THREE.MeshLambertMaterial({ color: 0x1abc9c })
  ],
  shopSign: [
    new THREE.MeshLambertMaterial({ color: 0xff5733 }),
    new THREE.MeshLambertMaterial({ color: 0x33aaff }),
    new THREE.MeshLambertMaterial({ color: 0x33cc55 })
  ],
  
  // زرع
  treeTrunk: new THREE.MeshLambertMaterial({ color: 0x6a4a28 }),
  treeLeaf: new THREE.MeshLambertMaterial({ color: 0x4a8a3a }),
  treeLeafLight: new THREE.MeshLambertMaterial({ color: 0x5aa845 }),
  palmTrunk: new THREE.MeshLambertMaterial({ color: 0x9a7a4a }),
  palmLeaf: new THREE.MeshLambertMaterial({ color: 0x4a9a3a, side: THREE.DoubleSide }),
  
  // عربيات
  carBody: [
    new THREE.MeshLambertMaterial({ color: 0xdd3344 }),
    new THREE.MeshLambertMaterial({ color: 0x3366dd }),
    new THREE.MeshLambertMaterial({ color: 0xddeeee }),
    new THREE.MeshLambertMaterial({ color: 0x333340 }),
    new THREE.MeshLambertMaterial({ color: 0xee8822 }),
    new THREE.MeshLambertMaterial({ color: 0x44dd88 }),
    new THREE.MeshLambertMaterial({ color: 0xddaa44 })
  ],
  carTire: new THREE.MeshLambertMaterial({ color: 0x1a1a1a }),
  carGlass: new THREE.MeshLambertMaterial({ color: 0x88ccff, transparent: true, opacity: 0.5 }),
  
  // ناس
  peopleShirt: [
    new THREE.MeshLambertMaterial({ color: 0xe74c3c }),
    new THREE.MeshLambertMaterial({ color: 0x3498db }),
    new THREE.MeshLambertMaterial({ color: 0x2ecc71 }),
    new THREE.MeshLambertMaterial({ color: 0xf39c12 }),
    new THREE.MeshLambertMaterial({ color: 0x9b59b6 }),
    new THREE.MeshLambertMaterial({ color: 0x1abc9c }),
    new THREE.MeshLambertMaterial({ color: 0xf0f0f0 }),
    new THREE.MeshLambertMaterial({ color: 0x2c3e50 }),
    new THREE.MeshLambertMaterial({ color: 0xe67e22 }),
    new THREE.MeshLambertMaterial({ color: 0xff6b81 })
  ],
  peoplePants: [
    new THREE.MeshLambertMaterial({ color: 0x2c3e50 }),
    new THREE.MeshLambertMaterial({ color: 0x1a1a1a }),
    new THREE.MeshLambertMaterial({ color: 0x34495e }),
    new THREE.MeshLambertMaterial({ color: 0x4a4a4a }),
    new THREE.MeshLambertMaterial({ color: 0x5a3a2a })
  ],
  peopleSkin: [
    new THREE.MeshLambertMaterial({ color: 0xfadcba }),
    new THREE.MeshLambertMaterial({ color: 0xe8c8a0 }),
    new THREE.MeshLambertMaterial({ color: 0xd0aa80 }),
    new THREE.MeshLambertMaterial({ color: 0xa87850 }),
    new THREE.MeshLambertMaterial({ color: 0x8a5a30 })
  ],
  peopleHair: [
    new THREE.MeshLambertMaterial({ color: 0x1a1a1a }),
    new THREE.MeshLambertMaterial({ color: 0x3a2a1a }),
    new THREE.MeshLambertMaterial({ color: 0x5a4a3a }),
    new THREE.MeshLambertMaterial({ color: 0x909090 })
  ],
  
  // معالم
  mosqueWall: new THREE.MeshLambertMaterial({ color: 0xf8f0e0 }),
  mosqueDome: new THREE.MeshLambertMaterial({ color: 0x16a085 }),
  mosqueGold: new THREE.MeshLambertMaterial({ color: 0xffcc00 }),
  stationWall: new THREE.MeshLambertMaterial({ color: 0xf0e0c0 }),
  stationRoof: new THREE.MeshLambertMaterial({ color: 0xa05030 }),
  factoryWall: new THREE.MeshLambertMaterial({ color: 0xb0b8c0 }),
  factoryChimney: new THREE.MeshLambertMaterial({ color: 0x909090 }),
  hospitalWall: new THREE.MeshLambertMaterial({ color: 0xffffff }),
  hospitalRed: new THREE.MeshBasicMaterial({ color: 0xdd2222 }),
  
  // توك توك
  tukYellow: new THREE.MeshLambertMaterial({ color: 0xffd11a }),
  tukYellowDark: new THREE.MeshLambertMaterial({ color: 0xe6b800 }),
  tukBlack: new THREE.MeshLambertMaterial({ color: 0x1a1a1a }),
  tukGlass: new THREE.MeshLambertMaterial({ color: 0x88ddff, transparent: true, opacity: 0.4 }),
  tukChrome: new THREE.MeshLambertMaterial({ color: 0xd0d0d0 }),
  tukHeadlight: new THREE.MeshBasicMaterial({ color: 0xffffcc }),
  tukTaillight: new THREE.MeshBasicMaterial({ color: 0xff2222 }),
  
  // قهاوي
  cafeTable: new THREE.MeshLambertMaterial({ color: 0x8a6a3a }),
  cafeChair: new THREE.MeshLambertMaterial({ color: 0x6a4a1a }),
  cafeShisha: new THREE.MeshLambertMaterial({ color: 0xd0b090 }),
  
  // حقول عزبة بولضو
  field1: new THREE.MeshLambertMaterial({ color: 0x8ab84a }),
  field2: new THREE.MeshLambertMaterial({ color: 0x6aa83a }),
  field3: new THREE.MeshLambertMaterial({ color: 0xa0c860 }),
  mudWall: new THREE.MeshLambertMaterial({ color: 0xb09070 }),
  hayStack: new THREE.MeshLambertMaterial({ color: 0xd4b878 })
};

/* ═══════════════════════════════════════════════════════════
   Canvas Texture - للنصوص
   ═══════════════════════════════════════════════════════════ */
function makeTextTexture(text, bgColor, textColor, w, h) {
  w = w || 512;
  h = h || 128;
  
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
  ctx.font = 'bold ' + Math.floor(h * 0.45) + 'px Tahoma, Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, w / 2, h / 2);
  
  var tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 2;
  return tex;
}

/* ═══════════════════════════════════════════════════════════
   🗺️ الشوارع - بناءً على كفر الدوار الحقيقية
   المحور الرئيسي: شارع الجيش (شمال-جنوب)
   ═══════════════════════════════════════════════════════════ */
var ROADS_DATA = [
  // ═══ شارع الجيش - الشارع الرئيسي (المحور) ═══
  {
    name: 'شارع الجيش',
    x: 0, z: 0,
    width: 22,
    length: 1400,
    rotation: 0,
    isMain: true,
    signColor: '#2a5a9a',
    lanes: 2
  },
  
  // ═══ الشوارع العرضية (من الشرق للغرب) ═══
  {
    name: 'شارع أحمد عرابي',
    x: -350, z: 0,
    width: 18,
    length: 700,
    rotation: Math.PI / 2,
    signColor: '#8b3a3a'
  },
  {
    name: 'شارع بورسعيد',
    x: -150, z: 0,
    width: 16,
    length: 500,
    rotation: Math.PI / 2,
    signColor: '#3a5a8b'
  },
  {
    name: 'شارع الجمهورية',
    x: 100, z: 0,
    width: 16,
    length: 500,
    rotation: Math.PI / 2,
    signColor: '#3a8b3a'
  },
  {
    name: 'شارع سعد زغلول',
    x: 300, z: 0,
    width: 14,
    length: 400,
    rotation: Math.PI / 2,
    signColor: '#8b5a2a'
  },
  {
    name: 'شارع المحكمة',
    x: 450, z: 0,
    width: 14,
    length: 400,
    rotation: Math.PI / 2,
    signColor: '#5a5a5a'
  },
  
  // ═══ شوارع متوازية مع شارع الجيش ═══
  {
    name: 'شارع النصر',
    x: -250, z: 300,
    width: 14,
    length: 500,
    rotation: 0,
    signColor: '#8b3a3a'
  },
  {
    name: 'شارع المحور',
    x: 200, z: 250,
    width: 14,
    length: 500,
    rotation: 0,
    signColor: '#3a8b5a'
  },
  {
    name: 'شارع التحرير',
    x: -150, z: -350,
    width: 14,
    length: 400,
    rotation: 0,
    signColor: '#5a3a8b'
  },
  {
    name: 'شارع الموقف',
    x: 250, z: -300,
    width: 13,
    length: 400,
    rotation: 0,
    signColor: '#8b6a2a'
  }
];

/* ═══════════════════════════════════════════════════════════
   📍 الوجهات الحقيقية
   ═══════════════════════════════════════════════════════════ */
var DESTINATIONS_DATA = [
  { name: 'محطة قطار كفر الدوار', x: -250, z: -100, color: 0xa05030, emoji: '🚂' },
  { name: 'مسجد الثورة', x: -120, z: 180, color: 0x16a085, emoji: '🕌' },
  { name: 'شركة مصر للغزل والنسيج', x: 400, z: -250, color: 0x7a8890, emoji: '🏭' },
  { name: 'موقف عزيز المصري', x: 180, z: 80, color: 0xdd3322, emoji: '🚌' },
  { name: 'مجمع الميزانة', x: -180, z: -80, color: 0xf39c12, emoji: '🚐' },
  { name: 'مستشفى كفر الدوار العام', x: -400, z: 120, color: 0x2980b9, emoji: '🏥' },
  { name: 'سوق الأربعاء', x: 100, z: 200, color: 0x9b59b6, emoji: '🛒' },
  { name: 'كورنيش ترعة المحمودية', x: 450, z: -30, color: 0x2980b9, emoji: '🌊' },
  { name: 'جامعة كفر الدوار', x: -350, z: -280, color: 0x8e44ad, emoji: '🎓' },
  { name: 'مدرسة صلاح سالم', x: -200, z: 350, color: 0xf39c12, emoji: '🏫' },
  { name: 'عزبة بولضو', x: 500, z: 100, color: 0x8ab84a, emoji: '🌾' }
];

/* ═══════════════════════════════════════════════════════════
   نظام الأصوات
   ═══════════════════════════════════════════════════════════ */
var AudioSystem = {
  ctx: null,
  engineOsc: null,
  engineGain: null,
  hornTimer: null,
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
        this.engineOsc.frequency.value = 60;
        this.engineGain = this.ctx.createGain();
        this.engineGain.gain.value = 0.025;
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
    this.engineOsc.frequency.setTargetAtTime(60 + r * 100, this.ctx.currentTime, 0.1);
    this.engineGain.gain.setTargetAtTime(0.015 + r * 0.05 + (isAcc ? 0.01 : 0), this.ctx.currentTime, 0.15);
  },
  
  playHorn: function() {
    if (!this.ctx) return;
    var s = this;
    // كلاكس قوي
    s._tone(500, 500, 0.15, 0.15, 'square');
    setTimeout(function() { s._tone(600, 600, 0.2, 0.15, 'square'); }, 150);
    setTimeout(function() { s._tone(700, 700, 0.15, 0.12, 'square'); }, 350);
  },
  
  playPickup: function() {
    if (!this.ctx) return;
    this._tone(700, 1200, 0.25, 0.12, 'sine');
  },
  
  playDelivery: function() {
    if (!this.ctx) return;
    var s = this;
    s._tone(523, 523, 0.12, 0.12, 'sine');
    setTimeout(function() { s._tone(659, 659, 0.12, 0.12, 'sine'); }, 120);
    setTimeout(function() { s._tone(784, 784, 0.25, 0.12, 'sine'); }, 240);
  },
  
  playAngry: function() {
    if (!this.ctx) return;
    this._tone(200, 100, 0.3, 0.12, 'sawtooth');
  },
  
  _tone: function(f1, f2, dur, vol, type) {
    try {
      var o = this.ctx.createOscillator();
      var g = this.ctx.createGain();
      o.type = type || 'sine';
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

/* ═══════════════════════════════════════════════════════════
   الأرضية
   ═══════════════════════════════════════════════════════════ */
function createGround() {
  // أرضية خضراء رئيسية
  var ground = new THREE.Mesh(
    new THREE.PlaneGeometry(4000, 4000),
    MAT.ground
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.1;
  scene.add(ground);
  
  // طبقة تحتانية داكنة (لمنع الفراغات)
  var darkLayer = new THREE.Mesh(
    new THREE.PlaneGeometry(4000, 4000),
    MAT.groundDark
  );
  darkLayer.rotation.x = -Math.PI / 2;
  darkLayer.position.y = -0.15;
  scene.add(darkLayer);
}

/* ═══════════════════════════════════════════════════════════
   🌊 ترعة المحمودية
   ═══════════════════════════════════════════════════════════ */
function createCanal() {
  var group = new THREE.Group();
  group.name = 'canal';
  
  // الماء
  var waterGeo = new THREE.PlaneGeometry(CONFIG.citySize * 1.4, CONFIG.canalWidth);
  var water = new THREE.Mesh(waterGeo, MAT.canal);
  water.rotation.x = -Math.PI / 2;
  water.position.y = -0.35;
  group.add(water);
  
  // ضفتين
  for (var s = -1; s <= 1; s += 2) {
    // رصيف الضفة
    var bank = new THREE.Mesh(
      new THREE.BoxGeometry(CONFIG.citySize * 1.4, 0.8, 4),
      MAT.canalBank
    );
    bank.position.set(0, 0.4, s * (CONFIG.canalWidth / 2 + 2));
    group.add(bank);
    
    // سور حماية
    var rail = new THREE.Mesh(
      new THREE.BoxGeometry(CONFIG.citySize * 1.4, 0.8, 0.2),
      MAT.curb
    );
    rail.position.set(0, 1.5, s * (CONFIG.canalWidth / 2 + 3.7));
    group.add(rail);
  }
  
  // كوبري على شارع الجمهورية
  var bridge = new THREE.Mesh(
    new THREE.BoxGeometry(22, 2, CONFIG.canalWidth + 18),
    MAT.bridge
  );
  bridge.position.set(100, 1, 0);
  group.add(bridge);
  
  scene.add(group);
}

/* ═══════════════════════════════════════════════════════════
   الشوارع
   ═══════════════════════════════════════════════════════════ */
function createRoads() {
  var group = new THREE.Group();
  
  for (var i = 0; i < ROADS_DATA.length; i++) {
    var rd = ROADS_DATA[i];
    
    // جسم الشارع
    var road = new THREE.Mesh(
      new THREE.BoxGeometry(rd.width, 0.15, rd.length),
      MAT.road
    );
    road.position.set(rd.x, 0.05, rd.z);
    road.rotation.y = rd.rotation;
    group.add(road);
    
    // الأرصفة
    for (var s = -1; s <= 1; s += 2) {
      var so = s * (rd.width / 2 + 1.5);
      var dx = Math.cos(rd.rotation) * so;
      var dz = -Math.sin(rd.rotation) * so;
      
      var sidewalk = new THREE.Mesh(
        new THREE.BoxGeometry(2.5, 0.25, rd.length),
        MAT.sidewalk
      );
      sidewalk.position.set(rd.x + dx, 0.2, rd.z + dz);
      sidewalk.rotation.y = rd.rotation;
      group.add(sidewalk);
      
      // حافة الرصيف
      var curbOffset = s * (rd.width / 2 + 0.1);
      var cdx = Math.cos(rd.rotation) * curbOffset;
      var cdz = -Math.sin(rd.rotation) * curbOffset;
      
      var curb = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 0.3, rd.length),
        MAT.curb
      );
      curb.position.set(rd.x + cdx, 0.15, rd.z + cdz);
      curb.rotation.y = rd.rotation;
      group.add(curb);
    }
    
    // خطوط الشارع
    if (rd.width >= 14) {
      var lineCount = Math.floor(rd.length / 25);
      for (var j = 0; j < lineCount; j++) {
        var off = -rd.length / 2 + j * 25 + 12.5;
        var mark = new THREE.Mesh(
          new THREE.BoxGeometry(0.4, 0.05, 8),
          MAT.roadLine
        );
        var mx = rd.x + Math.sin(rd.rotation) * off;
        var mz = rd.z + Math.cos(rd.rotation) * off;
        mark.position.set(mx, 0.14, mz);
        mark.rotation.y = rd.rotation;
        group.add(mark);
      }
    }
    
    // لوحة اسم الشارع
    if (rd.isMain || rd.width >= 14) {
      var signTex = makeTextTexture(rd.name, rd.signColor || '#2a5a9a', '#ffffff', 640, 160);
      var signMat = new THREE.MeshBasicMaterial({ map: signTex, side: THREE.DoubleSide });
      var signGeo = new THREE.PlaneGeometry(7, 1.75);
      
      var signOffset = rd.width / 2 + 2;
      var signX = rd.x + Math.cos(rd.rotation) * signOffset;
      var signZ = rd.z - Math.sin(rd.rotation) * signOffset;
      var posAlong = rd.length / 4;
      signX += Math.sin(rd.rotation) * posAlong;
      signZ += Math.cos(rd.rotation) * posAlong;
      
      var pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.08, 6),
        MAT.curb
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

/* ═══════════════════════════════════════════════════════════
   🌾 عزبة بولضو - شرق شارع الجيش
   ═══════════════════════════════════════════════════════════ */
function createEzbetBoldu() {
  console.log('🌾 بناء عزبة بولضو...');
  var group = new THREE.Group();
  group.name = 'ezbetBoldu';
  
  // ═══ الحقول الزراعية ═══
  for (var i = 0; i < 6; i++) {
    var field = new THREE.Mesh(
      new THREE.BoxGeometry(Utils.rand(30, 60), 0.3, Utils.rand(40, 80)),
      Utils.pick([MAT.field1, MAT.field2, MAT.field3])
    );
    field.position.set(
      500 + Utils.rand(-100, 150),
      0.15,
      Utils.rand(-250, 250)
    );
    field.rotation.y = Utils.rand(-0.2, 0.2);
    group.add(field);
  }
  
  // ═══ البيوت الطينية ═══
  for (var i = 0; i < 8; i++) {
    var house = new THREE.Group();
    
    // جدران طينية
    var walls = new THREE.Mesh(
      new THREE.BoxGeometry(Utils.rand(6, 9), Utils.rand(3, 4), Utils.rand(6, 9)),
      MAT.mudWall
    );
    walls.position.y = 1.75;
    house.add(walls);
    
    // سقف خشبي
    var roof = new THREE.Mesh(
      new THREE.BoxGeometry(walls.geometry.parameters.width + 1, 0.3, walls.geometry.parameters.depth + 1),
      MAT.tiles || MAT.buildingRoof[0]
    );
    roof.position.y = 3.65;
    house.add(roof);
    
    // باب
    var door = new THREE.Mesh(
      new THREE.BoxGeometry(1, 2, 0.1),
      MAT.door
    );
    door.position.set(0, 1, walls.geometry.parameters.depth / 2 + 0.05);
    house.add(door);
    
    // نوافذ
    for (var w = -1; w <= 1; w += 2) {
      var window = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 0.8, 0.1),
        MAT.window
      );
      window.position.set(w * 2, 2, walls.geometry.parameters.depth / 2 + 0.05);
      house.add(window);
    }
    
    house.position.set(
      480 + Utils.rand(-80, 120),
      0,
      Utils.rand(-200, 200)
    );
    house.rotation.y = Utils.rand(0, Math.PI * 2);
    group.add(house);
  }
  
  // ═══ أكوام القش ═══
  for (var i = 0; i < 5; i++) {
    var hay = new THREE.Mesh(
      new THREE.ConeGeometry(1.5, 2, 8),
      MAT.hayStack
    );
    hay.position.set(
      500 + Utils.rand(-60, 100),
      1,
      Utils.rand(-180, 180)
    );
    group.add(hay);
  }
  
  // ═══ نخيل على الحدود ═══
  for (var i = 0; i < 10; i++) {
    var palm = createPalm(
      460 + Utils.rand(-20, 100),
      -250 + i * 50 + Utils.rand(-10, 10),
      Utils.rand(0.9, 1.1)
    );
    group.add(palm);
  }
  
  // ═══ لوحة "عزبة بولضو" ═══
  var signTex = makeTextTexture('عزبة بولضو', '#8ab84a', '#ffffff', 512, 128);
  var signMat = new THREE.MeshBasicMaterial({ map: signTex, side: THREE.DoubleSide });
  var sign = new THREE.Mesh(new THREE.PlaneGeometry(8, 2), signMat);
  sign.position.set(460, 4.5, 0);
  sign.rotation.y = Math.PI / 2;
  group.add(sign);
  
  var pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.1, 5),
    MAT.curb
  );
  pole.position.set(460, 2.5, 0);
  group.add(pole);
  
  scene.add(group);
}

/* ═══════════════════════════════════════════════════════════
   الأشجار
   ═══════════════════════════════════════════════════════════ */
function createTree(x, z, scale) {
  scale = scale || 1;
  var t = new THREE.Group();
  
  var trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15 * scale, 0.22 * scale, 2.5 * scale, 6),
    MAT.treeTrunk
  );
  trunk.position.y = 1.25 * scale;
  t.add(trunk);
  
  var leafMat = Math.random() > 0.5 ? MAT.treeLeaf : MAT.treeLeafLight;
  var leaf1 = new THREE.Mesh(
    new THREE.SphereGeometry(1.4 * scale, 6, 5),
    leafMat
  );
  leaf1.position.y = 3.2 * scale;
  t.add(leaf1);
  
  t.position.set(x, 0, z);
  return t;
}

function createPalm(x, z, scale) {
  scale = scale || 1;
  var p = new THREE.Group();
  
  var trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15 * scale, 0.22 * scale, 6 * scale, 6),
    MAT.palmTrunk
  );
  trunk.position.y = 3 * scale;
  p.add(trunk);
  
  for (var i = 0; i < 7; i++) {
    var angle = (i / 7) * Math.PI * 2;
    var leaf = new THREE.Mesh(
      new THREE.PlaneGeometry(1 * scale, 3.5 * scale),
      MAT.palmLeaf
    );
    leaf.position.set(
      Math.cos(angle) * 0.6 * scale,
      6 * scale,
      Math.sin(angle) * 0.6 * scale
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
  
  // نخيل على ضفتين الترعة
  var step = 40;
  for (var x = -CONFIG.citySize * 0.5; x < CONFIG.citySize * 0.5; x += step) {
    if (Math.random() > 0.3) {
      group.add(createPalm(x + Utils.rand(-3, 3), -(CONFIG.canalWidth / 2 + 6), Utils.rand(0.9, 1.15)));
    }
    if (Math.random() > 0.3) {
      group.add(createPalm(x + Utils.rand(-3, 3), (CONFIG.canalWidth / 2 + 6), Utils.rand(0.9, 1.15)));
    }
  }
  
  // أشجار على الشوارع
  var treeCount = 0;
  for (var i = 0; i < ROADS_DATA.length && treeCount < QUALITY.treeCount; i++) {
    var rd = ROADS_DATA[i];
    var trees = Math.floor(rd.length / 60);
    
    for (var j = 0; j < trees && treeCount < QUALITY.treeCount; j++) {
      var off = -rd.length / 2 + j * 60 + 30;
      var s = Math.random() > 0.5 ? 1 : -1;
      var so = s * (rd.width / 2 + 3.5);
      var tx = rd.x + Math.sin(rd.rotation) * off + Math.cos(rd.rotation) * so;
      var tz = rd.z + Math.cos(rd.rotation) * off - Math.sin(rd.rotation) * so;
      
      // نتخطى منطقة الترعة
      if (Math.abs(tz) < CONFIG.canalWidth / 2 + 8) continue;
      
      group.add(createTree(tx, tz, Utils.rand(0.85, 1.1)));
      treeCount++;
    }
  }
  
  scene.add(group);
}

/* ═══════════════════════════════════════════════════════════
   المباني
   ═══════════════════════════════════════════════════════════ */
function isOnRoad(x, z, pad) {
  pad = pad || 0;
  for (var i = 0; i < ROADS_DATA.length; i++) {
    var r = ROADS_DATA[i];
    var hw = r.width / 2 + 2.5 + pad;
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

function isInEzbetBoldu(x, z) {
  return x > 420;
}

function createBuilding(x, z, w, d, h) {
  var g = new THREE.Group();
  
  // اختيار ألوان عشوائية
  var wallMat = Utils.pick(MAT.buildingWall);
  var roofMat = Utils.pick(MAT.buildingRoof);
  
  // الدور الأرضي
  var groundFloor = new THREE.Mesh(
    new THREE.BoxGeometry(w + 0.3, 3.5, d + 0.3),
    wallMat
  );
  groundFloor.position.y = 1.75;
  g.add(groundFloor);
  
  // باقي الأدوار
  var floors = Math.max(0, Math.floor((h - 3.5) / 3));
  if (floors > 0) {
    var upperFloors = new THREE.Mesh(
      new THREE.BoxGeometry(w, h - 3.5, d),
      wallMat
    );
    upperFloors.position.y = 3.5 + (h - 3.5) / 2;
    g.add(upperFloors);
  }
  
  // السقف
  var roof = new THREE.Mesh(
    new THREE.BoxGeometry(w + 0.6, 0.4, d + 0.6),
    roofMat
  );
  roof.position.y = h + 0.2;
  g.add(roof);
  
  // ═══ واجهة المحل ═══
  if (Math.random() > 0.4) {
    // محل تجاري
    var shopWindow = new THREE.Mesh(
      new THREE.BoxGeometry(w * 0.7, 2.2, 0.15),
      MAT.window
    );
    shopWindow.position.set(0, 1.5, d / 2 + 0.15);
    g.add(shopWindow);
    
    // مظلة ملونة
    var awningColor = Utils.pick(MAT.shopAwning);
    var awning = new THREE.Mesh(
      new THREE.BoxGeometry(w * 0.85, 0.15, 1.2),
      awningColor
    );
    awning.position.set(0, 2.9, d / 2 + 0.7);
    awning.rotation.x = -0.2;
    g.add(awning);
    
    // لافتة
    var signMat = Utils.pick(MAT.shopSign);
    var sign = new THREE.Mesh(
      new THREE.BoxGeometry(w * 0.7, 0.6, 0.1),
      signMat
    );
    sign.position.set(0, 3.4, d / 2 + 0.15);
    g.add(sign);
  } else {
    // باب عادي
    var door = new THREE.Mesh(
      new THREE.BoxGeometry(1.3, 2.4, 0.15),
      MAT.door
    );
    door.position.set(0, 1.2, d / 2 + 0.15);
    g.add(door);
    
    // إطار الباب
    var doorFrame = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 2.7, 0.1),
      MAT.doorMetal
    );
    doorFrame.position.set(0, 1.35, d / 2 + 0.1);
    g.add(doorFrame);
  }
  
  // ═══ نوافذ الأدوار العلوية ═══
  for (var f = 0; f < floors; f++) {
    var winY = 3.5 + 1.8 + f * 3;
    var winCols = Math.max(2, Math.floor(w / 3));
    
    for (var c = 0; c < winCols; c++) {
      var winX = -w / 2 + 1.5 + c * (w / winCols);
      
      // نافذة أمامية
      var winFrame = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 1.5, 0.15),
        MAT.windowFrame
      );
      winFrame.position.set(winX, winY, d / 2 + 0.1);
      g.add(winFrame);
      
      var winGlass = new THREE.Mesh(
        new THREE.BoxGeometry(0.95, 1.2, 0.05),
        MAT.window
      );
      winGlass.position.set(winX, winY, d / 2 + 0.18);
      g.add(winGlass);
      
      // شرفة
      if (f > 0 && Math.random() > 0.6) {
        var balcony = new THREE.Mesh(
          new THREE.BoxGeometry(1.8, 0.15, 1),
          MAT.sidewalk
        );
        balcony.position.set(winX, winY - 0.9, d / 2 + 0.5);
        g.add(balcony);
        
        var balconyRail = new THREE.Mesh(
          new THREE.BoxGeometry(1.8, 0.6, 0.08),
          MAT.curb
        );
        balconyRail.position.set(winX, winY - 0.5, d / 2 + 0.95);
        g.add(balconyRail);
      }
    }
  }
  
  g.position.set(x, 0, z);
  return g;
}

function createBuildings() {
  var group = new THREE.Group();
  var buildingList = [];
  var half = CONFIG.citySize / 2;
  
  // نولّد المباني
  for (var gx = -half; gx < half; gx += 36) {
    for (var gz = -half; gz < half; gz += 36) {
      var x = gx + 18 + Utils.rand(-3, 3);
      var z = gz + 18 + Utils.rand(-3, 3);
      
      if (isOnRoad(x, z, 4)) continue;
      if (Math.abs(z) < CONFIG.canalWidth / 2 + 12) continue;
      if (isNearLandmark(x, z, 40)) continue;
      if (isInEzbetBoldu(x, z)) continue; // عزبة بولضو لها مبانيها الخاصة
      if (Math.abs(x) < 25 && Math.abs(z) < 25) continue;
      if (Math.random() > QUALITY.buildingDensity) continue;
      if (buildingList.length >= QUALITY.maxBuildings) break;
      
      buildingList.push({
        x: x,
        z: z,
        w: Utils.rand(8, 14),
        d: Utils.rand(8, 14),
        h: Utils.rand(6, 16)
      });
    }
  }
  
  console.log('🏢 بناء', buildingList.length, 'مبنى');
  
  // ═══ نستخدم InstancedMesh للأداء العالي ═══
  var boxGeo = new THREE.BoxGeometry(1, 1, 1);
  
  for (var matIdx = 0; matIdx < MAT.buildingWall.length; matIdx++) {
    var filtered = [];
    for (var i = 0; i < buildingList.length; i++) {
      if (i % MAT.buildingWall.length === matIdx) filtered.push(buildingList[i]);
    }
    if (filtered.length === 0) continue;
    
    var instMesh = new THREE.InstancedMesh(boxGeo, MAT.buildingWall[matIdx], filtered.length);
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
  
  // أسطح
  for (var matIdx = 0; matIdx < MAT.buildingRoof.length; matIdx++) {
    var filtered = [];
    for (var i = 0; i < buildingList.length; i++) {
      if (i % MAT.buildingRoof.length === matIdx) filtered.push(buildingList[i]);
    }
    if (filtered.length === 0) continue;
    
    var roofGeo = new THREE.BoxGeometry(1, 0.4, 1);
    var roofMesh = new THREE.InstancedMesh(roofGeo, MAT.buildingRoof[matIdx], filtered.length);
    var matrix = new THREE.Matrix4();
    
    for (var i = 0; i < filtered.length; i++) {
      var b = filtered[i];
      matrix.makeScale(b.w + 0.4, 1, b.d + 0.4);
      matrix.setPosition(b.x, b.h + 0.2, b.z);
      roofMesh.setMatrixAt(i, matrix);
    }
    roofMesh.instanceMatrix.needsUpdate = true;
    group.add(roofMesh);
  }
  
  scene.add(group);
}

/* ═══════════════════════════════════════════════════════════
   المعالم
   ═══════════════════════════════════════════════════════════ */
function createMosque(x, z) {
  var g = new THREE.Group();
  
  var base = new THREE.Mesh(new THREE.BoxGeometry(20, 9, 20), MAT.mosqueWall);
  base.position.y = 4.5;
  g.add(base);
  
  var dome = new THREE.Mesh(
    new THREE.SphereGeometry(6, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2),
    MAT.mosqueDome
  );
  dome.position.y = 9;
  g.add(dome);
  
  var finial = new THREE.Mesh(new THREE.ConeGeometry(0.8, 2.5, 6), MAT.mosqueGold);
  finial.position.y = 15;
  g.add(finial);
  
  for (var s = -1; s <= 1; s += 2) {
    var minaret = new THREE.Mesh(
      new THREE.CylinderGeometry(1, 1, 20, 8),
      MAT.mosqueWall
    );
    minaret.position.set(s * 11, 10, 0);
    g.add(minaret);
    
    var mTop = new THREE.Mesh(new THREE.ConeGeometry(1.3, 3.5, 8), MAT.mosqueDome);
    mTop.position.set(s * 11, 22, 0);
    g.add(mTop);
  }
  
  g.position.set(x, 0, z);
  return g;
}

function createStation(x, z) {
  var g = new THREE.Group();
  
  var main = new THREE.Mesh(new THREE.BoxGeometry(30, 8, 14), MAT.stationWall);
  main.position.y = 4;
  g.add(main);
  
  var roof = new THREE.Mesh(new THREE.BoxGeometry(32, 0.7, 16), MAT.stationRoof);
  roof.position.y = 8.35;
  g.add(roof);
  
  var tower = new THREE.Mesh(new THREE.BoxGeometry(4.5, 14, 4.5), MAT.stationWall);
  tower.position.set(10, 11, 0);
  g.add(tower);
  
  var towerRoof = new THREE.Mesh(new THREE.ConeGeometry(3.2, 4, 4), MAT.stationRoof);
  towerRoof.position.set(10, 20, 0);
  towerRoof.rotation.y = Math.PI / 4;
  g.add(towerRoof);
  
  g.position.set(x, 0, z);
  return g;
}

function createFactory(x, z) {
  var g = new THREE.Group();
  
  var main = new THREE.Mesh(new THREE.BoxGeometry(40, 12, 28), MAT.factoryWall);
  main.position.y = 6;
  g.add(main);
  
  for (var i = 0; i < 3; i++) {
    var chimney = new THREE.Mesh(
      new THREE.CylinderGeometry(1.5, 1.8, 24, 8),
      MAT.factoryChimney
    );
    chimney.position.set(-12 + i * 12, 18, -10);
    g.add(chimney);
  }
  
  g.position.set(x, 0, z);
  return g;
}

function createHospital(x, z) {
  var g = new THREE.Group();
  
  var main = new THREE.Mesh(new THREE.BoxGeometry(28, 14, 20), MAT.hospitalWall);
  main.position.y = 7;
  g.add(main);
  
  // شريط أحمر
  var stripe = new THREE.Mesh(
    new THREE.BoxGeometry(28.5, 1, 20.5),
    MAT.hospitalRed
  );
  stripe.position.y = 3;
  g.add(stripe);
  
  // صليب أحمر على السطح
  var crossV = new THREE.Mesh(new THREE.BoxGeometry(1, 4, 0.3), MAT.hospitalRed);
  crossV.position.set(0, 18, 10.1);
  g.add(crossV);
  
  var crossH = new THREE.Mesh(new THREE.BoxGeometry(4, 1, 0.3), MAT.hospitalRed);
  crossH.position.set(0, 18, 10.1);
  g.add(crossH);
  
  g.position.set(x, 0, z);
  return g;
}

function createSouk(x, z) {
  var g = new THREE.Group();
  var colors = [
    new THREE.MeshLambertMaterial({ color: 0xe74c3c }),
    new THREE.MeshLambertMaterial({ color: 0x3498db }),
    new THREE.MeshLambertMaterial({ color: 0xf39c12 }),
    new THREE.MeshLambertMaterial({ color: 0x2ecc71 }),
    new THREE.MeshLambertMaterial({ color: 0x9b59b6 })
  ];
  
  for (var i = 0; i < 12; i++) {
    var angle = (i / 12) * Math.PI * 2;
    var cx = Math.cos(angle) * 12;
    var cz = Math.sin(angle) * 12;
    
    var stall = new THREE.Mesh(
      new THREE.BoxGeometry(3, 2.5, 3),
      colors[i % colors.length]
    );
    stall.position.set(cx, 1.25, cz);
    g.add(stall);
    
    var awning = new THREE.Mesh(
      new THREE.ConeGeometry(2.8, 1.8, 4),
      new THREE.MeshLambertMaterial({ color: 0xfafafa })
    );
    awning.position.set(cx, 3.7, cz);
    awning.rotation.y = Math.PI / 4;
    g.add(awning);
  }
  
  g.position.set(x, 0, z);
  return g;
}

function createLandmarks() {
  console.log('🏛️ بناء المعالم...');
  var group = new THREE.Group();
  
  group.add(createStation(-250, -100));
  group.add(createMosque(-120, 180));
  group.add(createFactory(400, -250));
  group.add(createHospital(-400, 120));
  group.add(createSouk(100, 200));
  
  scene.add(group);
}

/* ═══════════════════════════════════════════════════════════
   السيارات
   ═══════════════════════════════════════════════════════════ */
var cars = [];

function createCar(x, z, rotation) {
  var car = new THREE.Group();
  var bodyMat = Utils.pick(MAT.carBody);
  
  var body = new THREE.Mesh(
    new THREE.BoxGeometry(1.9, 0.7, 4.2),
    bodyMat
  );
  body.position.y = 0.55;
  car.add(body);
  
  var cabin = new THREE.Mesh(
    new THREE.BoxGeometry(1.7, 0.6, 2),
    bodyMat
  );
  cabin.position.set(0, 1.2, -0.2);
  car.add(cabin);
  
  // زجاج أمامي
  var windshield = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, 0.5, 0.1),
    MAT.carGlass
  );
  windshield.position.set(0, 1.2, 0.85);
  car.add(windshield);
  
  // زجاج خلفي
  var rearGlass = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, 0.5, 0.1),
    MAT.carGlass
  );
  rearGlass.position.set(0, 1.2, -1.25);
  car.add(rearGlass);
  
  // مصابيح
  for (var s = -1; s <= 1; s += 2) {
    var headlight = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 0.15, 0.1),
      new THREE.MeshBasicMaterial({ color: 0xffffaa })
    );
    headlight.position.set(s * 0.65, 0.55, 2.15);
    car.add(headlight);
    
    var taillight = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 0.15, 0.1),
      new THREE.MeshBasicMaterial({ color: 0xff3333 })
    );
    taillight.position.set(s * 0.65, 0.55, -2.15);
    car.add(taillight);
  }
  
  // عجلات
  var tireGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.28, 12);
  for (var wx = -1; wx <= 1; wx += 2) {
    for (var wz = -1; wz <= 1; wz += 2) {
      var tire = new THREE.Mesh(tireGeo, MAT.carTire);
      tire.rotation.z = Math.PI / 2;
      tire.position.set(wx * 1, 0.38, wz * 1.4);
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
    var off = Utils.rand(-rd.length / 2 + 50, rd.length / 2 - 50);
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
      speed: Utils.rand(4, 8),
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
    
    if (ud.offset > ud.road.length / 2 - 40) {
      ud.direction = -1;
      c.rotation.y = ud.road.rotation + Math.PI;
    }
    if (ud.offset < -ud.road.length / 2 + 40) {
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

/* ═══════════════════════════════════════════════════════════
   الناس
   ═══════════════════════════════════════════════════════════ */
var people = [];

function createPerson(x, z) {
  var p = new THREE.Group();
  
  var shirtMat = Utils.pick(MAT.peopleShirt);
  var pantsMat = Utils.pick(MAT.peoplePants);
  var skinMat = Utils.pick(MAT.peopleSkin);
  var hairMat = Utils.pick(MAT.peopleHair);
  
  // الجسم
  var torso = new THREE.Mesh(
    new THREE.BoxGeometry(0.45, 0.7, 0.28),
    shirtMat
  );
  torso.position.y = 1.15;
  p.add(torso);
  
  // الرأس
  var head = new THREE.Mesh(
    new THREE.SphereGeometry(0.18, 8, 8),
    skinMat
  );
  head.position.y = 1.7;
  p.add(head);
  
  // العيون
  var eyeMat = new THREE.MeshBasicMaterial({ color: 0x1a1a1a });
  for (var s = -1; s <= 1; s += 2) {
    var eye = new THREE.Mesh(new THREE.SphereGeometry(0.025, 6, 6), eyeMat);
    eye.position.set(s * 0.06, 1.72, 0.16);
    p.add(eye);
  }
  
  // الشعر
  var hair = new THREE.Mesh(
    new THREE.SphereGeometry(0.19, 8, 8, 0, Math.PI * 2, 0, Math.PI / 1.8),
    hairMat
  );
  hair.position.y = 1.72;
  p.add(hair);
  
  // الأرجل
  var legs = new THREE.Mesh(
    new THREE.BoxGeometry(0.45, 0.8, 0.28),
    pantsMat
  );
  legs.position.y = 0.4;
  p.add(legs);
  
  // الذراعين
  var armGeo = new THREE.BoxGeometry(0.13, 0.6, 0.13);
  var armL = new THREE.Mesh(armGeo, shirtMat);
  armL.position.set(-0.29, 1.15, 0);
  p.add(armL);
  
  var armR = new THREE.Mesh(armGeo, shirtMat);
  armR.position.set(0.29, 1.15, 0);
  p.add(armR);
  
  p.position.set(x, 0, z);
  p.rotation.y = Utils.rand(0, Math.PI * 2);
  p.userData = {
    direction: Utils.rand(0, Math.PI * 2),
    speed: Utils.rand(0.8, 1.5),
    walkPhase: Math.random() * Math.PI * 2,
    armL: armL,
    armR: armR,
    homeX: x,
    homeZ: z,
    wanderTimer: Utils.rand(1, 3),
    // خصائص الاصطدام
    isScared: false,
    scaredTimer: 0
  };
  
  return p;
}

function createPeople() {
  console.log('👥 إنشاء', QUALITY.peopleCount, 'شخص...');
  var group = new THREE.Group();
  
  for (var i = 0; i < QUALITY.peopleCount; i++) {
    var rd = Utils.pick(ROADS_DATA);
    var off = Utils.rand(-rd.length / 2 + 50, rd.length / 2 - 50);
    var side = Math.random() > 0.5 ? 1 : -1;
    var so = side * (rd.width / 2 + 2);
    
    var x = rd.x + Math.sin(rd.rotation) * off + Math.cos(rd.rotation) * so;
    var z = rd.z + Math.cos(rd.rotation) * off - Math.sin(rd.rotation) * so;
    
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
    
    ud.walkPhase += dt * 5;
    p.position.y = Math.abs(Math.sin(ud.walkPhase)) * 0.05;
    
    // لو خايف من الاصطدام، يهرب
    if (ud.isScared) {
      ud.scaredTimer -= dt;
      if (ud.scaredTimer <= 0) {
        ud.isScared = false;
      } else {
        // يهرب بسرعة
        p.position.x += Math.cos(ud.direction) * ud.speed * 3 * dt;
        p.position.z += Math.sin(ud.direction) * ud.speed * 3 * dt;
        p.rotation.y = -ud.direction + Math.PI / 2;
        continue;
      }
    }
    
    // الحركة الطبيعية
    ud.wanderTimer -= dt;
    if (ud.wanderTimer <= 0) {
      ud.direction += Utils.rand(-0.5, 0.5);
      ud.wanderTimer = Utils.rand(2, 4);
    }
    
    // الرجوع للمنزل
    var dx = ud.homeX - p.position.x;
    var dz = ud.homeZ - p.position.z;
    if (Math.hypot(dx, dz) > 10) {
      ud.direction = Math.atan2(dz, dx);
    }
    
    p.position.x += Math.cos(ud.direction) * ud.speed * dt;
    p.position.z += Math.sin(ud.direction) * ud.speed * dt;
    p.rotation.y = -ud.direction + Math.PI / 2;
    
    if (ud.armL) ud.armL.rotation.x = Math.sin(ud.walkPhase) * 0.5;
    if (ud.armR) ud.armR.rotation.x = -Math.sin(ud.walkPhase) * 0.5;
  }
}

// دالة تفزيع الناس عند الاصطدام
function scarePerson(person) {
  var ud = person.userData;
  if (ud.isScared) return false;
  
  ud.isScared = true;
  ud.scaredTimer = 3;
  
  // يهرب في الاتجاه المعاكس
  ud.direction = Math.random() * Math.PI * 2;
  
  return true;
}

console.log('✅ الجزء 1 تم تحميله - المدينة والشوارع وعزبة بولضو');

/* ============================================================
   🚕 الجزء 2: التوك توك + مشرط + الركاب + الخريطة + الحلقة الرئيسية
   ============================================================ */

/* ═══════════════════════════════════════════════════════════
   🛺 التوك توك الواقعي مع مشرط
   ═══════════════════════════════════════════════════════════ */
function createTukTuk() {
  var t = new THREE.Group();
  t.name = 'tukTuk';
  
  // ═══ الشاسيه السفلي ═══
  var chassis = new THREE.Mesh(
    new THREE.BoxGeometry(1.4, 0.15, 2.6),
    MAT.tukBlack
  );
  chassis.position.y = 0.42;
  t.add(chassis);
  
  var floorF = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.1, 1.05), MAT.tukBlack);
  floorF.position.set(0, 0.52, 0.75);
  t.add(floorF);
  
  var floorR = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.1, 1.4), MAT.tukBlack);
  floorR.position.set(0, 0.52, -0.6);
  t.add(floorR);
  
  // ═══ المقدمة ═══
  var frontPanel = new THREE.Mesh(
    new THREE.BoxGeometry(1.36, 0.9, 0.2),
    MAT.tukYellow
  );
  frontPanel.position.set(0, 1.05, 1.2);
  t.add(frontPanel);
  
  var frontCabin = new THREE.Mesh(
    new THREE.BoxGeometry(1.36, 0.9, 1.05),
    MAT.tukYellow
  );
  frontCabin.position.set(0, 1.05, 0.65);
  t.add(frontCabin);
  
  // ═══ غطاء المقدمة ═══
  var hood = new THREE.Mesh(
    new THREE.BoxGeometry(1.36, 0.1, 0.55),
    MAT.tukYellowDark
  );
  hood.position.set(0, 1.52, 1.05);
  hood.rotation.x = -0.08;
  t.add(hood);
  
  // ═══ خط أحمر عريض على الجانبين ═══
  for (var s = -1; s <= 1; s += 2) {
    var redStripe = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, 0.4, 2.3),
      new THREE.MeshLambertMaterial({ color: 0xdd2222 })
    );
    redStripe.position.set(s * 0.69, 1.1, 0.05);
    t.add(redStripe);
  }
  
  // ═══ الكابينة الخلفية ═══
  var rearCabin = new THREE.Mesh(
    new THREE.BoxGeometry(1.4, 1.6, 1.5),
    MAT.tukYellow
  );
  rearCabin.position.set(0, 1.35, -0.6);
  t.add(rearCabin);
  
  // خط أسود فاصل
  var stripe = new THREE.Mesh(
    new THREE.BoxGeometry(1.42, 0.12, 1.52),
    MAT.tukBlack
  );
  stripe.position.set(0, 1.5, -0.6);
  t.add(stripe);
  
  // ═══ السقف ═══
  var roof = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, 0.15, 2.7),
    MAT.tukBlack
  );
  roof.position.set(0, 2.25, 0);
  t.add(roof);
  
  // حافة كروم
  var roofTrim = new THREE.Mesh(
    new THREE.BoxGeometry(1.52, 0.06, 2.72),
    MAT.tukChrome
  );
  roofTrim.position.set(0, 2.16, 0);
  t.add(roofTrim);
  
  // ═══ أعمدة السقف (6) ═══
  var pillarGeo = new THREE.CylinderGeometry(0.05, 0.05, 1.85, 6);
  var pillarPositions = [
    [-0.68, 1.35, -1.3], [0.68, 1.35, -1.3],
    [-0.68, 1.35, -0.05], [0.68, 1.35, -0.05],
    [-0.68, 1.35, 1.15], [0.68, 1.35, 1.15]
  ];
  
  for (var i = 0; i < pillarPositions.length; i++) {
    var pillar = new THREE.Mesh(pillarGeo, MAT.tukBlack);
    pillar.position.set(pillarPositions[i][0], pillarPositions[i][1], pillarPositions[i][2]);
    t.add(pillar);
  }
  
  // ═══ الزجاج الأمامي ═══
  var windshield = new THREE.Mesh(
    new THREE.BoxGeometry(1.3, 0.9, 0.05),
    MAT.tukGlass
  );
  windshield.position.set(0, 1.95, 1.18);
  t.add(windshield);
  
  // ═══ الزجاج الجانبي الأمامي ═══
  for (var s = -1; s <= 1; s += 2) {
    var sideGlassF = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, 0.85, 0.95),
      MAT.tukGlass
    );
    sideGlassF.position.set(s * 0.69, 1.9, 0.65);
    t.add(sideGlassF);
  }
  
  // ═══ الزجاج الجانبي الخلفي ═══
  for (var s = -1; s <= 1; s += 2) {
    var sideGlassR = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, 1.05, 1.3),
      MAT.tukGlass
    );
    sideGlassR.position.set(s * 0.71, 1.85, -0.6);
    t.add(sideGlassR);
  }
  
  // ═══ الزجاج الخلفي ═══
  var rearGlass = new THREE.Mesh(
    new THREE.BoxGeometry(1.36, 1.1, 0.05),
    MAT.tukGlass
  );
  rearGlass.position.set(0, 1.85, -1.36);
  t.add(rearGlass);
  
  // ═══ الشبكة الأمامية ═══
  var grillFrame = new THREE.Mesh(
    new THREE.BoxGeometry(0.95, 0.4, 0.08),
    MAT.tukChrome
  );
  grillFrame.position.set(0, 1.05, 1.29);
  t.add(grillFrame);
  
  for (var i = 0; i < 5; i++) {
    var slat = new THREE.Mesh(
      new THREE.BoxGeometry(0.88, 0.04, 0.05),
      MAT.tukBlack
    );
    slat.position.set(0, 0.9 + i * 0.07, 1.33);
    t.add(slat);
  }
  
  // ═══ المصابيح الأمامية ═══
  var headlightGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.12, 16);
  for (var s = -1; s <= 1; s += 2) {
    var hlFrame = new THREE.Mesh(headlightGeo, MAT.tukChrome);
    hlFrame.rotation.x = Math.PI / 2;
    hlFrame.position.set(s * 0.48, 1.25, 1.26);
    t.add(hlFrame);
    
    var hlGlass = new THREE.Mesh(headlightGeo, MAT.tukHeadlight);
    hlGlass.rotation.x = Math.PI / 2;
    hlGlass.position.set(s * 0.48, 1.25, 1.3);
    t.add(hlGlass);
  }
  
  // ═══ الفوانيس الخلفية ═══
  var taillightGeo = new THREE.BoxGeometry(0.15, 0.28, 0.08);
  for (var s = -1; s <= 1; s += 2) {
    var tl = new THREE.Mesh(taillightGeo, MAT.tukTaillight);
    tl.position.set(s * 0.52, 1, -1.39);
    t.add(tl);
  }
  
  // ═══ لوحة الأرقام ═══
  var plate = new THREE.Mesh(
    new THREE.BoxGeometry(0.65, 0.2, 0.04),
    new THREE.MeshLambertMaterial({ color: 0xffffff })
  );
  plate.position.set(0, 0.75, -1.42);
  t.add(plate);
  
  // ═══ المقود ═══
  var steerGroup = new THREE.Group();
  
  var steerRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.17, 0.028, 8, 20),
    MAT.tukBlack
  );
  steerGroup.add(steerRing);
  
  for (var i = 0; i < 3; i++) {
    var spoke = new THREE.Mesh(
      new THREE.BoxGeometry(0.03, 0.16, 0.02),
      MAT.tukBlack
    );
    spoke.rotation.z = (i / 3) * Math.PI * 2;
    steerGroup.add(spoke);
  }
  
  var column = new THREE.Mesh(
    new THREE.CylinderGeometry(0.03, 0.03, 0.4, 8),
    MAT.tukBlack
  );
  column.rotation.x = -0.5;
  column.position.set(0, -0.15, 0.15);
  steerGroup.add(column);
  
  steerGroup.position.set(0, 1.65, 0.9);
  steerGroup.rotation.x = -0.4;
  t.add(steerGroup);
  
  // ═══ لوحة القيادة ═══
  var dash = new THREE.Mesh(
    new THREE.BoxGeometry(1.3, 0.25, 0.35),
    MAT.tukBlack
  );
  dash.position.set(0, 1.42, 1.05);
  t.add(dash);
  
  // عدادات
  for (var i = 0; i < 3; i++) {
    var gauge = new THREE.Mesh(
      new THREE.CircleGeometry(0.07, 16),
      new THREE.MeshLambertMaterial({ color: 0x111111 })
    );
    gauge.position.set(-0.3 + i * 0.3, 1.48, 1.25);
    t.add(gauge);
  }
  
  // ═══ المقاعد ═══
  var seatDriver = new THREE.Mesh(
    new THREE.BoxGeometry(0.65, 0.15, 0.6),
    new THREE.MeshLambertMaterial({ color: 0x2a2a2a })
  );
  seatDriver.position.set(0, 0.85, 0.45);
  t.add(seatDriver);
  
  var backDriver = new THREE.Mesh(
    new THREE.BoxGeometry(0.65, 0.65, 0.1),
    new THREE.MeshLambertMaterial({ color: 0x2a2a2a })
  );
  backDriver.position.set(0, 1.2, 0.18);
  t.add(backDriver);
  
  var rearSeat = new THREE.Mesh(
    new THREE.BoxGeometry(1.3, 0.15, 0.65),
    new THREE.MeshLambertMaterial({ color: 0x2a2a2a })
  );
  rearSeat.position.set(0, 0.85, -0.75);
  t.add(rearSeat);
  
  var rearBack = new THREE.Mesh(
    new THREE.BoxGeometry(1.3, 0.75, 0.1),
    new THREE.MeshLambertMaterial({ color: 0x2a2a2a })
  );
  rearBack.position.set(0, 1.25, -1.08);
  t.add(rearBack);
  
  // ═══ العجلات الثلاث ═══
  var wheels = [];
  
  function makeWheel(wx, wz, isFront) {
    var wg = new THREE.Group();
    wg.userData.isFront = isFront;
    
    var tire = new THREE.Mesh(
      new THREE.TorusGeometry(0.3, 0.13, 10, 16),
      MAT.carTire
    );
    tire.rotation.y = Math.PI / 2;
    wg.add(tire);
    
    var rim = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.2, 0.16, 10),
      MAT.tukChrome
    );
    rim.rotation.z = Math.PI / 2;
    wg.add(rim);
    
    for (var i = 0; i < 5; i++) {
      var bolt = new THREE.Mesh(
        new THREE.SphereGeometry(0.028, 6, 6),
        MAT.tukBlack
      );
      var angle = (i / 5) * Math.PI * 2;
      bolt.position.set(0, Math.cos(angle) * 0.09, Math.sin(angle) * 0.09);
      wg.add(bolt);
    }
    
    wg.position.set(wx, 0.3, wz);
    t.add(wg);
    wheels.push(wg);
    return wg;
  }
  
  makeWheel(0, 1.2, true);
  makeWheel(-0.68, -0.85, false);
  makeWheel(0.68, -0.85, false);
  
  // ═══════════════════════════════════════════════════════
  // 👳 مشرط جوه التوك توك
  // ═══════════════════════════════════════════════════════
  var driver = new THREE.Group();
  
  var galabeyaMat = new THREE.MeshLambertMaterial({ color: 0xf5f0e8 });
  
  // الجسم
  var driverTorso = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.65, 0.35),
    galabeyaMat
  );
  driverTorso.position.y = 1.15;
  driver.add(driverTorso);
  
  // الرقبة
  var driverNeck = new THREE.Mesh(
    new THREE.CylinderGeometry(0.09, 0.09, 0.1),
    MAT.peopleSkin[2]
  );
  driverNeck.position.y = 1.53;
  driver.add(driverNeck);
  
  // الرأس
  var driverHead = new THREE.Mesh(
    new THREE.SphereGeometry(0.2, 10, 10),
    MAT.peopleSkin[2]
  );
  driverHead.position.y = 1.72;
  driver.add(driverHead);
  
  // العيون
  var eyeBlackMat = new THREE.MeshBasicMaterial({ color: 0x1a1a1a });
  var eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  
  for (var s = -1; s <= 1; s += 2) {
    var eyeWhite = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), eyeWhiteMat);
    eyeWhite.position.set(s * 0.07, 1.74, 0.17);
    driver.add(eyeWhite);
    
    var eyeBlack = new THREE.Mesh(new THREE.SphereGeometry(0.025, 6, 6), eyeBlackMat);
    eyeBlack.position.set(s * 0.075, 1.74, 0.2);
    driver.add(eyeBlack);
  }
  
  // الشنب (علامة مميزة)
  var mustache = new THREE.Mesh(
    new THREE.BoxGeometry(0.18, 0.04, 0.05),
    new THREE.MeshLambertMaterial({ color: 0x1a1a1a })
  );
  mustache.position.set(0, 1.66, 0.19);
  driver.add(mustache);
  
  // العمة البيضاء (علامة مميزة)
  var turban = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 12, 12, 0, Math.PI * 2, 0, Math.PI / 1.7),
    new THREE.MeshLambertMaterial({ color: 0xf0f0e8 })
  );
  turban.position.y = 1.75;
  driver.add(turban);
  
  // الذراع اليمنى (على المقود)
  var driverArmR = new THREE.Mesh(
    new THREE.BoxGeometry(0.14, 0.6, 0.14),
    galabeyaMat
  );
  driverArmR.position.set(0.32, 1.15, 0.2);
  driverArmR.rotation.x = -0.7;
  driver.add(driverArmR);
  
  // إيد على المقود
  var driverHand = new THREE.Mesh(
    new THREE.SphereGeometry(0.08, 6, 6),
    MAT.peopleSkin[2]
  );
  driverHand.position.set(0.32, 0.9, 0.42);
  driver.add(driverHand);
  
  // الذراع اليسرى
  var driverArmL = new THREE.Mesh(
    new THREE.BoxGeometry(0.14, 0.6, 0.14),
    galabeyaMat
  );
  driverArmL.position.set(-0.32, 1.15, 0.05);
  driverArmL.rotation.x = -0.4;
  driver.add(driverArmL);
  
  // الأرجل (شكل بسيط)
  var driverLegs = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.4, 0.35),
    new THREE.MeshLambertMaterial({ color: 0x2c3e50 })
  );
  driverLegs.position.set(0, 0.7, 0.2);
  driver.add(driverLegs);
  
  driver.position.set(0, 0, 0.45);
  driver.rotation.y = Math.PI;
  driver.scale.set(1.05, 1.05, 1.05);
  t.add(driver);
  
  // ═══ الإضاءة الأمامية ═══
  var headlight = new THREE.SpotLight(0xfff5cc, 2, 25, Math.PI / 5, 0.5, 1.5);
  headlight.position.set(0, 1.3, 1.3);
  headlight.target.position.set(0, 0.3, 15);
  t.add(headlight);
  t.add(headlight.target);
  
  t.userData = {
    wheels: wheels,
    steeringWheel: steerGroup,
    headlight: headlight
  };
  
  return t;
}

var tukTuk = createTukTuk();
tukTuk.position.set(0, 0, 100);
scene.add(tukTuk);

/* ═══════════════════════════════════════════════════════════
   حالة اللاعب واللعبة
   ═══════════════════════════════════════════════════════════ */
var player = {
  speed: 0,
  steering: 0,
  currentWheelAngle: 0,
  engineOn: true,
  handbrake: false,
  hasPassenger: false,
  currentPassenger: null,
  tripStartTime: 0,
  lastHornTime: 0,
  bumpCount: 0
};

var gameState = {
  running: false,
  paused: false,
  money: 0,
  deliveries: 0,
  ratingSum: 0,
  ratingCount: 0,
  timeLeft: CONFIG.gameDuration,
  lastTime: 0,
  spawnTimer: 0,
  elapsedTime: 0,
  dialogTimer: 5,
  cafeSceneTimer: 4,
  showingCafeScene: false
};

/* ═══════════════════════════════════════════════════════════
   🎥 كاميرا الشخص الثالث
   ═══════════════════════════════════════════════════════════ */
var CAMERA_DISTANCE = 8.5;
var CAMERA_HEIGHT = 4.5;
var CAMERA_LOOK_HEIGHT = 1.5;

function updateCamera(dt) {
  if (gameState.showingCafeScene) return;
  
  // الموقع المثالي للكاميرا (خلف التوك توك)
  var forwardX = Math.sin(tukTuk.rotation.y);
  var forwardZ = Math.cos(tukTuk.rotation.y);
  
  var targetX = tukTuk.position.x - forwardX * CAMERA_DISTANCE;
  var targetY = CAMERA_HEIGHT;
  var targetZ = tukTuk.position.z - forwardZ * CAMERA_DISTANCE;
  
  // Smooth movement
  var smoothFactor = 1 - Math.pow(0.0001, dt);
  camera.position.x += (targetX - camera.position.x) * smoothFactor;
  camera.position.y += (targetY - camera.position.y) * smoothFactor;
  camera.position.z += (targetZ - camera.position.z) * smoothFactor;
  
  // ناظر عند نقطة أعلى التوك توك
  camera.lookAt(
    tukTuk.position.x,
    tukTuk.position.y + CAMERA_LOOK_HEIGHT,
    tukTuk.position.z
  );
}

/* ═══════════════════════════════════════════════════════════
   المدخلات - كيبورد
   ═══════════════════════════════════════════════════════════ */
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
    UI.showToast(player.engineOn ? '🔊 المحرك شغّال' : '🔇 المحرك مطفأ', 1200);
  }
  if (e.code === 'KeyH') {
    AudioSystem.playHorn();
    UI.showToast('📢 كلاكس', 800);
  }
  if (e.code === 'KeyR') {
    radio.toggle();
    UI.showToast(radio.isPlaying ? '📻 الراديو شغال' : '📻 الراديو وقف', 1200);
  }
});

document.addEventListener('keyup', function(e) {
  keys[e.code] = false;
  if (e.code === 'Space') player.handbrake = false;
});

/* ═══════════════════════════════════════════════════════════
   أزرار الموبايل
   ═══════════════════════════════════════════════════════════ */
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
    hbBtn.addEventListener('mousedown', hbPress);
    hbBtn.addEventListener('mouseup', hbRelease);
  }
  
  var hornBtn = document.getElementById('btnHorn');
  if (hornBtn) {
    var hornPress = function(e) {
      e.preventDefault();
      var now = performance.now();
      if (now - player.lastHornTime < 500) return;
      player.lastHornTime = now;
      
      AudioSystem.playHorn();
      UI.showToast('📢 كلاكس', 800);
      hornBtn.classList.add('pressed');
    };
    var hornRelease = function(e) {
      e.preventDefault();
      hornBtn.classList.remove('pressed');
    };
    hornBtn.addEventListener('touchstart', hornPress, { passive: false });
    hornBtn.addEventListener('touchend', hornRelease, { passive: false });
    hornBtn.addEventListener('mousedown', hornPress);
    hornBtn.addEventListener('mouseup', hornRelease);
  }
}

/* ═══════════════════════════════════════════════════════════
   🚗 فيزياء التوك توك - محسّنة
   ═══════════════════════════════════════════════════════════ */
function updateTukTukPhysics(dt) {
  if (!gameState.running || gameState.paused) return;
  
  var throttle = (keys.KeyW || keys.ArrowUp || mobileInput.accel) ? 1 : 0;
  var brake = (keys.KeyS || keys.ArrowDown || mobileInput.brake) ? 1 : 0;
  
  // ═══ الفرملة القوية والتحكم ═══
  if (!player.engineOn) {
    player.speed *= (1 - 4 * dt);
    if (Math.abs(player.speed) < 0.1) player.speed = 0;
  } else if (player.handbrake) {
    // فرملة يد قوية
    player.speed *= (1 - 15 * dt);
    if (Math.abs(player.speed) < 0.1) player.speed = 0;
  } else {
    if (throttle && !brake) {
      // تسريع تدريجي
      var currentAccel = CONFIG.acceleration * (1 - Math.abs(player.speed) / CONFIG.maxSpeed * 0.5);
      player.speed += currentAccel * dt;
    } else if (brake && !throttle) {
      // فرملة قوية عند السرعة العالية
      if (player.speed > 1) {
        player.speed -= CONFIG.braking * dt;
      } else if (player.speed > 0.3) {
        player.speed -= 8 * dt;
      } else {
        // الرجوع للخلف
        player.speed -= CONFIG.acceleration * 0.6 * dt;
      }
    } else {
      // احتكاك طبيعي
      if (player.speed > 0) {
        player.speed -= CONFIG.friction * dt * 2;
        if (player.speed < 0.05) player.speed = 0;
      } else if (player.speed < 0) {
        player.speed += CONFIG.friction * dt * 2;
        if (player.speed > -0.05) player.speed = 0;
      }
    }
    
    player.speed = Utils.clamp(player.speed, -CONFIG.maxReverseSpeed, CONFIG.maxSpeed);
  }
  
  // ═══ المقود - تحكم سلس ═══
  var leftInput = (keys.KeyA || keys.ArrowLeft || mobileInput.left) ? 1 : 0;
  var rightInput = (keys.KeyD || keys.ArrowRight || mobileInput.right) ? 1 : 0;
  var steerInput = rightInput - leftInput;
  
  var steerDiff = steerInput - player.steering;
  var steerStep = Math.sign(steerDiff) * Math.min(Math.abs(steerDiff), CONFIG.steeringSpeed * dt);
  player.steering += steerStep;
  player.steering = Utils.clamp(player.steering, -1, 1);
  
  // الرجوع للمركز تلقائي
  if (steerInput === 0) player.steering *= (1 - 3 * dt);
  
  var speedRatio = Math.min(Math.abs(player.speed) / CONFIG.maxSpeed, 1);
  var maxAngle = CONFIG.maxWheelAngle * (1 - speedRatio * 0.5);
  player.currentWheelAngle = player.steering * maxAngle;
  
  // ═══ دوران التوك توك ═══
  if (Math.abs(player.speed) > 0.1) {
    var speedFactor = Math.min(Math.abs(player.speed) / 6, 1.4);
    var direction = player.speed >= 0 ? 1 : -1;
    var turnRate = player.currentWheelAngle * speedFactor * dt * 3.5 * direction;
    tukTuk.rotation.y -= turnRate;
  }
  
  // ═══ الحركة ═══
  var forward = new THREE.Vector3(
    Math.sin(tukTuk.rotation.y), 0, Math.cos(tukTuk.rotation.y)
  );
  var velocity = forward.multiplyScalar(player.speed * dt);
  var newPos = tukTuk.position.clone().add(velocity);
  
  // تصادم مع الترعة
  var inCanalX = !(newPos.x > 90 && newPos.x < 110);
  var nearCanal = Math.abs(newPos.z) < CONFIG.canalWidth / 2 + 1.5;
  
  if (nearCanal && inCanalX) {
    if (Math.abs(player.speed) > 3) {
      AudioSystem.playAngry();
      UI.showToast('⚠️ الترعة! خد بالك', 1500);
    }
    player.speed *= -0.3;
  } else if (Math.abs(newPos.x) < CONFIG.citySize / 2 - 3 && Math.abs(newPos.z) < CONFIG.citySize / 2 - 3) {
    tukTuk.position.copy(newPos);
  } else {
    player.speed *= -0.3;
  }
  
  // ═══ العجلات ═══
  var wheelRoll = (player.speed * dt) / 0.3;
  for (var i = 0; i < tukTuk.userData.wheels.length; i++) {
    var w = tukTuk.userData.wheels[i];
    var tire = w.children[0];
    if (tire) tire.rotation.x += wheelRoll;
    if (w.userData.isFront) w.rotation.y = player.currentWheelAngle;
  }
  
  // ═══ المقود ═══
  tukTuk.userData.steeringWheel.rotation.z = -player.steering * Math.PI * 0.85;
  
  // ═══ الاهتزاز ═══
  tukTuk.position.y = Math.max(0, Math.sin(performance.now() * 0.02) * 0.006 * (1 + speedRatio));
  
  // ═══ اصطدام بالناس ═══
  checkPeopleCollision();
}

/* ═══════════════════════════════════════════════════════════
   💥 فحص اصطدام التوك توك بالناس
   ═══════════════════════════════════════════════════════════ */
function checkPeopleCollision() {
  if (Math.abs(player.speed) < 1) return;
  
  var tukRadius = 1.2;
  
  for (var i = 0; i < people.length; i++) {
    var p = people[i];
    var dist = Math.hypot(p.position.x - tukTuk.position.x, p.position.z - tukTuk.position.z);
    
    if (dist < tukRadius + 0.4) {
      if (scarePerson(p)) {
        // خصم من التقييم
        gameState.ratingSum -= 1;
        gameState.ratingCount += 1;
        player.bumpCount++;
        
        AudioSystem.playAngry();
        UI.showToast('⚠️ ' + Utils.pick(DIALOGS.angry), 2000);
        UI.showDialog('مشرط: ' + Utils.pick(DIALOGS.angry), 2500);
        
        // اهتزاز بسيط
        tukTuk.position.y = 0.1;
      }
    }
  }
}

/* ═══════════════════════════════════════════════════════════
   🎯 الركاب - مع مؤشرات كبيرة جداً وواضحة
   ═══════════════════════════════════════════════════════════ */
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
      var so = side * (rd.width / 2 + 2);
      var x = rd.x + Math.sin(rd.rotation) * off + Math.cos(rd.rotation) * so;
      var z = rd.z + Math.cos(rd.rotation) * off - Math.sin(rd.rotation) * so;
      
      if (Math.abs(z) < CONFIG.canalWidth / 2 + 6) continue;
      if (isInEzbetBoldu(x, z) && Math.random() > 0.3) continue; // قليل في عزبة
      
      var dist = Math.hypot(x - tukTuk.position.x, z - tukTuk.position.z);
      if (dist < 50 || dist > 300) continue;
      
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
  
  // الجسم
  var torso = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.7, 0.32), shirtMat);
  torso.position.y = 1.15;
  group.add(torso);
  
  // الرأس
  var head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 10), skinMat);
  head.position.y = 1.7;
  group.add(head);
  
  // العيون
  var eyeMat = new THREE.MeshBasicMaterial({ color: 0x1a1a1a });
  for (var s = -1; s <= 1; s += 2) {
    var eye = new THREE.Mesh(new THREE.SphereGeometry(0.028, 6, 6), eyeMat);
    eye.position.set(s * 0.07, 1.72, 0.17);
    group.add(eye);
  }
  
  // الشعر
  var hair = new THREE.Mesh(
    new THREE.SphereGeometry(0.21, 10, 10, 0, Math.PI * 2, 0, Math.PI / 1.8),
    hairMat
  );
  hair.position.y = 1.72;
  group.add(hair);
  
  // الأرجل
  var legs = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.85, 0.32), pantsMat);
  legs.position.y = 0.42;
  group.add(legs);
  
  // الذراعين
  var armGeo = new THREE.BoxGeometry(0.14, 0.62, 0.14);
  var armL = new THREE.Mesh(armGeo, shirtMat);
  armL.position.set(-0.32, 1.15, 0);
  group.add(armL);
  
  var armR = new THREE.Mesh(armGeo, shirtMat);
  armR.position.set(0.32, 1.15, 0);
  group.add(armR);
  
  // ═════════════════════════════════════════════
  // 🟢 هالة أرضية نابضة (كبيرة جداً)
  // ═════════════════════════════════════════════
  var ringMat = new THREE.MeshBasicMaterial({
    color: 0x00ff88,
    transparent: true,
    opacity: 0.7,
    side: THREE.DoubleSide,
    depthWrite: false
  });
  var ring = new THREE.Mesh(new THREE.RingGeometry(1.2, 1.7, 24), ringMat);
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.05;
  group.add(ring);
  group.userData.ring = ring;
  
  // ═════════════════════════════════════════════
  // 🟢 سهم عملاق فوق الرأس
  // ═════════════════════════════════════════════
  var arrowMat = new THREE.MeshBasicMaterial({
    color: 0x00ff88,
    depthWrite: false
  });
  var arrow = new THREE.Mesh(new THREE.ConeGeometry(0.6, 1.2, 5), arrowMat);
  arrow.position.y = 3.2;
  arrow.rotation.x = Math.PI;
  group.add(arrow);
  group.userData.arrow = arrow;
  
  // ═════════════════════════════════════════════
  // 🟢 عمود ضوء عملاق للسماء
  // ═════════════════════════════════════════════
  var beamMat = new THREE.MeshBasicMaterial({
    color: 0x00ff88,
    transparent: true,
    opacity: 0.5,
    side: THREE.DoubleSide,
    depthWrite: false
  });
  var beam = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15, 0.4, 8, 10, 1, true),
    beamMat
  );
  beam.position.y = 6;
  group.add(beam);
  group.userData.beam = beam;
  
  // ═════════════════════════════════════════════
  // 💡 إضاءة خضراء
  // ═════════════════════════════════════════════
  var pointLight = new THREE.PointLight(0x00ff88, 2.5, 15);
  pointLight.position.y = 1.5;
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
  
  console.log('👤 راكب جديد ينتظر → ' + destination.name);
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
  var ring = new THREE.Mesh(new THREE.RingGeometry(3.5, 5, 32), ringMat);
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.15;
  group.add(ring);
  
  // عمود ضوء عملاق
  var beamMat = new THREE.MeshBasicMaterial({
    color: destination.color,
    transparent: true,
    opacity: 0.4,
    side: THREE.DoubleSide,
    depthWrite: false
  });
  var beam = new THREE.Mesh(
    new THREE.CylinderGeometry(1.2, 3, 16, 12, 1, true),
    beamMat
  );
  beam.position.y = 8;
  group.add(beam);
  
  // أيقونة
  var icon = new THREE.Mesh(
    new THREE.SphereGeometry(1.2, 12, 12),
    new THREE.MeshBasicMaterial({ color: destination.color })
  );
  icon.position.y = 13;
  group.add(icon);
  
  // إضاءة
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
      
      // إضافة الراكب في التوك توك
      var riderMesh = createPassengerMesh();
      riderMesh.scale.set(0.75, 0.75, 0.75);
      riderMesh.position.set(0, 0.4, -0.75);
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
    gameState.ratingCount++;
    
    AudioSystem.playDelivery();
    UI.showDialog('مشرط: ' + Utils.pick(DIALOGS.arrived), 2500);
    UI.showToast('🎉 توصيل! +' + reward + ' جنيه +30 ثانية', 2500);
    
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

/* ═══════════════════════════════════════════════════════════
   واجهة المستخدم
   ═══════════════════════════════════════════════════════════ */
function updateHUD() {
  if (UI.moneyValue) UI.moneyValue.textContent = gameState.money;
  if (UI.deliveriesValue) UI.deliveriesValue.textContent = gameState.deliveries;
  
  var avgRating = gameState.ratingCount > 0
    ? (gameState.ratingSum / gameState.ratingCount).toFixed(1)
    : '5.0';
  if (UI.ratingValue) {
    UI.ratingValue.textContent = avgRating;
    if (parseFloat(avgRating) < 3) UI.ratingValue.style.color = '#ff4444';
    else UI.ratingValue.style.color = '#fff';
  }
  
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
        var pulse = 1 + Math.sin(now * 0.006) * 0.25;
        p.mesh.userData.ring.scale.set(pulse, pulse, 1);
        p.mesh.userData.ring.rotation.z += dt * 2;
      }
      
      if (p.mesh.userData.arrow) {
        p.mesh.userData.arrow.position.y = 3.2 + Math.sin(now * 0.005) * 0.4;
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
    ud.icon.position.y = 13 + Math.sin(time * 2) * 0.8;
  }
  
  // كلام مشرط العشوائي
  if (player.hasPassenger) {
    gameState.dialogTimer -= dt;
    if (gameState.dialogTimer <= 0) {
      UI.showDialog('مشرط: ' + Utils.pick(DIALOGS.driving), 2500);
      gameState.dialogTimer = Utils.rand(8, 15);
    }
  }
}

/* ═══════════════════════════════════════════════════════════
   🗺️ الخريطة التفاعلية - بالاتجاه الصح
   ═══════════════════════════════════════════════════════════ */
var minimapCanvas = document.createElement('canvas');
var minimapCtx = null;
var minimapContainer = null;

function initMinimap() {
  minimapContainer = document.getElementById('minimapContainer');
  if (!minimapContainer) {
    // ننشئ حاوية الخريطة لو مش موجودة
    minimapContainer = document.createElement('div');
    minimapContainer.id = 'minimapContainer';
    minimapContainer.style.cssText = `
      position: fixed;
      bottom: max(15px, env(safe-area-inset-bottom));
      right: max(15px, env(safe-area-inset-right));
      width: 150px;
      height: 150px;
      background: rgba(10, 20, 30, 0.92);
      border: 3px solid #ffc800;
      border-radius: 14px;
      overflow: hidden;
      z-index: 100;
      box-shadow: 0 6px 25px rgba(0,0,0,0.7), 0 0 20px rgba(255,200,0,0.4);
      pointer-events: none;
    `;
    
    minimapCanvas.width = 300;
    minimapCanvas.height = 300;
    minimapCanvas.style.cssText = 'display:block; width:100%; height:100%;';
    minimapContainer.appendChild(minimapCanvas);
    
    var label = document.createElement('div');
    label.textContent = 'كفر الدوار';
    label.style.cssText = `
      position: absolute;
      bottom: 4px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 10px;
      color: #ffc800;
      background: rgba(0,0,0,0.75);
      padding: 2px 10px;
      border-radius: 10px;
      font-weight: 700;
      pointer-events: none;
      font-family: Tahoma, Arial;
    `;
    minimapContainer.appendChild(label);
    
    document.body.appendChild(minimapContainer);
  } else {
    minimapCanvas = document.getElementById('minimapCanvas') || minimapCanvas;
    minimapCanvas.width = 300;
    minimapCanvas.height = 300;
  }
  
  minimapCtx = minimapCanvas.getContext('2d');
}

function drawMinimap() {
  if (!minimapCtx) return;
  
  var ctx = minimapCtx;
  var w = minimapCanvas.width;
  var h = minimapCanvas.height;
  var scale = 0.13;
  var cx = w / 2;
  var cy = h / 2;
  
  // خلفية
  ctx.fillStyle = '#0a1828';
  ctx.fillRect(0, 0, w, h);
  
  // ═════ دالة التحويل مع الدوران ═════
  // السهم بيبقى لفوق دايماً، والخريطة بتلف حواليه
  var rot = tukTuk.rotation.y;
  var cos = Math.cos(-rot);
  var sin = Math.sin(-rot);
  
  function toMap(x, z) {
    var dx = x - tukTuk.position.x;
    var dz = z - tukTuk.position.z;
    
    // تدوير عكسي عشان نخلي اللاعب في النص والسهم لفوق
    var rx = dx * cos - dz * sin;
    var rz = dx * sin + dz * cos;
    
    return {
      x: cx + rx * scale,
      y: cy + rz * scale
    };
  }
  
  // ═════ الترعة ═════
  ctx.fillStyle = '#1a6a9a';
  var canalPos1 = toMap(-CONFIG.citySize, -CONFIG.canalWidth / 2);
  var canalPos2 = toMap(CONFIG.citySize, CONFIG.canalWidth / 2);
  ctx.save();
  ctx.translate(canalPos1.x, canalPos1.y);
  ctx.rotate(-rot);
  var canalW = Math.abs(canalPos2.y - canalPos1.y);
  var canalL = Math.abs(canalPos2.x - canalPos1.x);
  ctx.fillRect(-canalW / 2, 0, canalW, canalL);
  ctx.restore();
  
  // ═════ الشوارع ═════
  for (var i = 0; i < ROADS_DATA.length; i++) {
    var rd = ROADS_DATA[i];
    ctx.fillStyle = rd.isMain ? '#4a7aaa' : '#2a4a6a';
    
    var p1 = toMap(rd.x, rd.z);
    
    ctx.save();
    ctx.translate(p1.x, p1.y);
    ctx.rotate(-rd.rotation - rot);
    var roadW = Math.max(3, rd.width * scale);
    var roadL = Math.max(3, rd.length * scale);
    ctx.fillRect(-roadW / 2, -roadL / 2, roadW, roadL);
    ctx.restore();
  }
  
  // ═════ الوجهات ═════
  for (var i = 0; i < DESTINATIONS_DATA.length; i++) {
    var dest = DESTINATIONS_DATA[i];
    var p = toMap(dest.x, dest.z);
    if (p.x < -20 || p.x > w + 20 || p.y < -20 || p.y > h + 20) continue;
    
    ctx.beginPath();
    ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#' + dest.color.toString(16).padStart(6, '0');
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    
    // الوجهة النشطة
    if (activeDestination && activeDestination.userData.destination.name === dest.name) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 11 + Math.sin(performance.now() * 0.005) * 3, 0, Math.PI * 2);
      ctx.strokeStyle = '#00ff88';
      ctx.lineWidth = 3;
      ctx.stroke();
    }
  }
  
  // ═════ الركاب - دوائر خضراء كبيرة ═════
  for (var i = 0; i < passengers.length; i++) {
    var p = toMap(passengers[i].x, passengers[i].z);
    if (p.x < -20 || p.x > w + 20 || p.y < -20 || p.y > h + 20) continue;
    
    var pulse = 1 + Math.sin(performance.now() * 0.008) * 0.4;
    
    ctx.beginPath();
    ctx.arc(p.x, p.y, 7 * pulse, 0, Math.PI * 2);
    ctx.fillStyle = '#00ff88';
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(p.x, p.y, 12 * pulse, 0, Math.PI * 2);
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  
  // ═════ السيارات ═════
  for (var i = 0; i < cars.length; i++) {
    var p = toMap(cars[i].position.x, cars[i].position.z);
    if (p.x < -10 || p.x > w + 10 || p.y < -10 || p.y > h + 10) continue;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#ffcc00';
    ctx.fill();
  }
  
  // ═════ اللاعب في النص - سهم لفوق ═════
  ctx.save();
  ctx.translate(cx, cy);
  
  // دائرة خلفية
  ctx.beginPath();
  ctx.arc(0, 0, 14, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 200, 0, 0.3)';
  ctx.fill();
  
  // سهم ثابت لفوق
  ctx.beginPath();
  ctx.moveTo(0, -12);
  ctx.lineTo(-8, 8);
  ctx.lineTo(0, 5);
  ctx.lineTo(8, 8);
  ctx.closePath();
  ctx.fillStyle = '#ffc800';
  ctx.fill();
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2;
  ctx.stroke();
  
  ctx.restore();
  
  // ═════ حرف N للشمال ═════
  ctx.save();
  ctx.translate(20, 20);
  ctx.fillStyle = '#ffc800';
  ctx.font = 'bold 14px Tahoma';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('N', 0, 0);
  ctx.restore();
  
  // ═════ إطار ═════
  ctx.strokeStyle = '#ffc800';
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, w - 4, h - 4);
}

/* ═══════════════════════════════════════════════════════════
   ربط أزرار الراديو
   ═══════════════════════════════════════════════════════════ */
function setupRadio() {
  if (UI.radioPlay) UI.radioPlay.addEventListener('click', function() { radio.toggle(); });
  if (UI.radioPrev) UI.radioPrev.addEventListener('click', function() { radio.prev(); });
  if (UI.radioNext) UI.radioNext.addEventListener('click', function() { radio.next(); });
  if (UI.radioBtn) {
    UI.radioBtn.addEventListener('click', function() {
      UI.radioPanel.classList.toggle('visible');
      UI.radioBtn.classList.toggle('active');
    });
  }
}

/* ═══════════════════════════════════════════════════════════
   🎬 مشهد مشرط على قهوة عماد هارون في البيضا
   ═══════════════════════════════════════════════════════════ */
function createCafeScene() {
  var group = new THREE.Group();
  
  // أرضية القهوة
  var ground = new THREE.Mesh(
    new THREE.BoxGeometry(14, 0.2, 12),
    new THREE.MeshLambertMaterial({ color: 0x8a7a5a })
  );
  ground.position.y = 0.1;
  group.add(ground);
  
  // مبنى القهوة
  var building = new THREE.Mesh(
    new THREE.BoxGeometry(12, 4, 6),
    new THREE.MeshLambertMaterial({ color: 0xe8d0b0 })
  );
  building.position.set(0, 2, -5);
  group.add(building);
  
  // سقف
  var roof = new THREE.Mesh(
    new THREE.BoxGeometry(12.5, 0.4, 6.5),
    new THREE.MeshLambertMaterial({ color: 0x8b5030 })
  );
  roof.position.set(0, 4.2, -5);
  group.add(roof);
  
  // مظلة
  for (var s = -1; s <= 1; s += 2) {
    var pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.1, 4.5),
      new THREE.MeshLambertMaterial({ color: 0x6a4a1a })
    );
    pole.position.set(s * 5, 2.25, 3);
    group.add(pole);
  }
  
  var awning = new THREE.Mesh(
    new THREE.BoxGeometry(11, 0.15, 6),
    new THREE.MeshLambertMaterial({ color: 0xd4a574 })
  );
  awning.position.set(0, 4.5, 1.5);
  awning.rotation.x = -0.1;
  group.add(awning);
  
  // طاولة
  var table = new THREE.Mesh(
    new THREE.CylinderGeometry(0.8, 0.8, 0.1, 16),
    MAT.cafeTable
  );
  table.position.set(0, 0.9, 0);
  group.add(table);
  
  var tableLeg = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.08, 0.85),
    MAT.cafeTable
  );
  tableLeg.position.set(0, 0.45, 0);
  group.add(tableLeg);
  
  // كرسي
  var chair = new THREE.Mesh(
    new THREE.BoxGeometry(0.8, 0.12, 0.8),
    MAT.cafeChair
  );
  chair.position.set(0, 0.5, 1.6);
  group.add(chair);
  
  var chairBack = new THREE.Mesh(
    new THREE.BoxGeometry(0.8, 1, 0.12),
    MAT.cafeChair
  );
  chairBack.position.set(0, 1, 1.2);
  group.add(chairBack);
  
  // ═════ مشرط قاعد ═════
  var meshrat = new THREE.Group();
  
  var galabeyaMat = new THREE.MeshLambertMaterial({ color: 0xf5f0e8 });
  
  // جسم
  var torso = new THREE.Mesh(
    new THREE.BoxGeometry(0.6, 0.9, 0.45),
    galabeyaMat
  );
  torso.position.y = 1;
  meshrat.add(torso);
  
  // رأس
  var head = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 12, 12),
    MAT.peopleSkin[2]
  );
  head.position.y = 1.65;
  meshrat.add(head);
  
  // عيون
  var eyeBlackMat = new THREE.MeshBasicMaterial({ color: 0x1a1a1a });
  for (var s = -1; s <= 1; s += 2) {
    var eye = new THREE.Mesh(new THREE.SphereGeometry(0.028, 6, 6), eyeBlackMat);
    eye.position.set(s * 0.08, 1.68, 0.19);
    meshrat.add(eye);
  }
  
  // شنب
  var mustache = new THREE.Mesh(
    new THREE.BoxGeometry(0.2, 0.045, 0.05),
    new THREE.MeshLambertMaterial({ color: 0x1a1a1a })
  );
  mustache.position.set(0, 1.58, 0.21);
  meshrat.add(mustache);
  
  // عمة
  var turban = new THREE.Mesh(
    new THREE.SphereGeometry(0.24, 12, 12, 0, Math.PI * 2, 0, Math.PI / 1.7),
    new THREE.MeshLambertMaterial({ color: 0xf0f0e8 })
  );
  turban.position.y = 1.68;
  meshrat.add(turban);
  
  // ذراع يمين (بتمسك الشيشة)
  var armR = new THREE.Mesh(
    new THREE.BoxGeometry(0.16, 0.7, 0.16),
    galabeyaMat
  );
  armR.position.set(0.4, 1, 0.2);
  armR.rotation.x = -0.7;
  meshrat.add(armR);
  
  var handR = new THREE.Mesh(
    new THREE.SphereGeometry(0.09, 6, 6),
    MAT.peopleSkin[2]
  );
  handR.position.set(0.4, 0.75, 0.4);
  meshrat.add(handR);
  
  // ذراع يسار
  var armL = new THREE.Mesh(
    new THREE.BoxGeometry(0.16, 0.7, 0.16),
    galabeyaMat
  );
  armL.position.set(-0.4, 1, 0.05);
  armL.rotation.x = -0.3;
  meshrat.add(armL);
  
  // أرجل
  var legs = new THREE.Mesh(
    new THREE.BoxGeometry(0.6, 0.55, 0.5),
    new THREE.MeshLambertMaterial({ color: 0x2c3e50 })
  );
  legs.position.set(0, 0.4, 0.3);
  meshrat.add(legs);
  
  // شبشب
  var shoes = new THREE.Mesh(
    new THREE.BoxGeometry(0.65, 0.1, 0.55),
    new THREE.MeshLambertMaterial({ color: 0x5a3a20 })
  );
  shoes.position.set(0, 0.05, 0.35);
  meshrat.add(shoes);
  
  meshrat.position.set(0, 0.55, 1.6);
  meshrat.rotation.y = Math.PI;
  meshrat.scale.set(1.15, 1.15, 1.15);
  group.add(meshrat);
  
  // ═════ الشيشة ═════
  var shisha = new THREE.Group();
  
  var base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.22, 0.45, 12),
    MAT.cafeShisha
  );
  base.position.y = 0.22;
  shisha.add(base);
  
  var glass = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15, 0.18, 0.4, 12),
    new THREE.MeshLambertMaterial({ color: 0x2980b9, transparent: true, opacity: 0.85 })
  );
  glass.position.y = 0.65;
  shisha.add(glass);
  
  var stem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.05, 1, 8),
    new THREE.MeshLambertMaterial({ color: 0xd4a574 })
  );
  stem.position.y = 1.35;
  shisha.add(stem);
  
  var top = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.14, 0.2, 12),
    new THREE.MeshLambertMaterial({ color: 0x8b6a3a })
  );
  top.position.y = 1.9;
  shisha.add(top);
  
  // خرطوم
  var hose = new THREE.Mesh(
    new THREE.CylinderGeometry(0.03, 0.03, 0.9, 8),
    new THREE.MeshLambertMaterial({ color: 0x8b3a1a })
  );
  hose.position.set(0.4, 1.15, 0.4);
  hose.rotation.z = Math.PI / 3.5;
  hose.rotation.y = -Math.PI / 5;
  shisha.add(hose);
  
  var hoseTip = new THREE.Mesh(
    new THREE.SphereGeometry(0.06, 8, 8),
    new THREE.MeshLambertMaterial({ color: 0xffcc00 })
  );
  hoseTip.position.set(0.6, 0.9, 0.6);
  shisha.add(hoseTip);
  
  shisha.position.set(0.8, 0, 0.2);
  group.add(shisha);
  
  // كوباية شاي
  var teaGlass = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.07, 0.18, 12),
    new THREE.MeshLambertMaterial({ color: 0xc8a878, transparent: true, opacity: 0.9 })
  );
  teaGlass.position.set(-0.4, 1, 0.1);
  group.add(teaGlass);
  
  // ═════ راكبين قاعدين معاه ═════
  for (var i = 0; i < 2; i++) {
    var friend = new THREE.Group();
    
    var shirtMat = Utils.pick(MAT.peopleShirt);
    var pantsMat = Utils.pick(MAT.peoplePants);
    var skinMat = Utils.pick(MAT.peopleSkin);
    var hairMat = Utils.pick(MAT.peopleHair);
    
    var friendTorso = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 0.85, 0.4),
      shirtMat
    );
    friendTorso.position.y = 0.95;
    friend.add(friendTorso);
    
    var friendHead = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 10, 10),
      skinMat
    );
    friendHead.position.y = 1.55;
    friend.add(friendHead);
    
    var friendHair = new THREE.Mesh(
      new THREE.SphereGeometry(0.21, 10, 10, 0, Math.PI * 2, 0, Math.PI / 1.8),
      hairMat
    );
    friendHair.position.y = 1.55;
    friend.add(friendHair);
    
    var friendLegs = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 0.55, 0.5),
      pantsMat
    );
    friendLegs.position.set(0, 0.35, 0.25);
    friend.add(friendLegs);
    
    var offsetX = i === 0 ? 1.5 : -1.5;
    friend.position.set(offsetX, 0.55, 1.6);
    friend.rotation.y = Math.PI + (i === 0 ? -0.4 : 0.4);
    group.add(friend);
  }
  
  // ═════ لافتة "قهوة عماد هارون" ═════
  var signTex = makeTextTexture('قهوة عماد هارون', '#5a3a1a', '#ffcc00', 700, 160);
  var signMat = new THREE.MeshBasicMaterial({ map: signTex, side: THREE.DoubleSide });
  var sign = new THREE.Mesh(new THREE.PlaneGeometry(8, 2), signMat);
  sign.position.set(0, 5, -2);
  group.add(sign);
  
  // ═════ إضاءة دافئة ═════
  var warmLight = new THREE.PointLight(0xffaa66, 1.5, 25);
  warmLight.position.set(0, 4, 1);
  group.add(warmLight);
  
  // ═════ نخيل حوالين القهوة ═════
  for (var i = 0; i < 4; i++) {
    var palm = createPalm(
      Utils.rand(-8, 8),
      Utils.rand(-10, -6),
      Utils.rand(0.8, 1.1)
    );
    group.add(palm);
  }
  
  return group;
}

/* ═══════════════════════════════════════════════════════════
   📅 الحلقة الرئيسية
   ═══════════════════════════════════════════════════════════ */
function animate() {
  requestAnimationFrame(animate);
  
  var now = performance.now();
  var dt = (now - gameState.lastTime) / 1000;
  gameState.lastTime = now;
  dt = Math.min(dt, 0.05);
  
  // لو بنعرض مشهد القهوة
  if (gameState.showingCafeScene) {
    gameState.cafeSceneTimer -= dt;
    
    // كاميرا بتلف حول القهوة
    if (!window._cafeRot) window._cafeRot = 0;
    window._cafeRot += dt * 0.2;
    
    var radius = 12;
    var height = 4;
    
    if (window._cafeScene) {
      var target = window._cafeScene.position;
      camera.position.x = target.x + Math.sin(window._cafeRot) * radius;
      camera.position.y = height;
      camera.position.z = target.z + Math.cos(window._cafeRot) * radius;
      camera.lookAt(target.x, 1.5, target.z);
    }
    
    if (gameState.cafeSceneTimer <= 0) {
      gameState.showingCafeScene = false;
      if (window._cafeScene) window._cafeScene.visible = false;
      startPlayingGame();
    }
    
    renderer.render(scene, camera);
    return;
  }
  
  if (!gameState.running || gameState.paused) {
    renderer.render(scene, camera);
    return;
  }
  
  gameState.elapsedTime += dt;
  
  // الوقت
  gameState.timeLeft -= dt;
  if (gameState.timeLeft <= 0) {
    gameState.timeLeft = 0;
    endGame();
    return;
  }
  
  // توليد الركاب
  gameState.spawnTimer -= dt;
  if (gameState.spawnTimer <= 0) {
    if (passengers.length < CONFIG.maxPassengers && !player.hasPassenger) {
      spawnPassenger();
    }
    gameState.spawnTimer = 3 + Math.random() * 2;
  }
  
  // التحديثات
  updateTukTukPhysics(dt);
  checkPassengerPickup();
  checkDelivery();
  updateCamera(dt);
  updatePassengers(dt);
  updatePeople(dt);
  updateCars(dt);
  
  // الصوت
  var isAccelerating = !!(keys.KeyW || keys.ArrowUp || mobileInput.accel);
  AudioSystem.updateEngine(Math.abs(player.speed), CONFIG.maxSpeed, isAccelerating);
  
  // الشمس
  sunLight.position.set(tukTuk.position.x + 150, 250, tukTuk.position.z + 100);
  sunLight.target.position.copy(tukTuk.position);
  sunLight.target.updateMatrixWorld();
  
  // HUD + minimap
  updateHUD();
  drawMinimap();
  
  renderer.render(scene, camera);
}

/* ═══════════════════════════════════════════════════════════
   بناء المدينة
   ═══════════════════════════════════════════════════════════ */
async function buildCity(onProgress) {
  var steps = [
    { name: 'إنشاء الأرضية...', fn: createGround, weight: 3 },
    { name: 'بناء ترعة المحمودية...', fn: createCanal, weight: 8 },
    { name: 'رصف الشوارع...', fn: createRoads, weight: 12 },
    { name: 'زراعة النخيل والأشجار...', fn: createFoliage, weight: 10 },
    { name: 'بناء المباني...', fn: createBuildings, weight: 18 },
    { name: 'بناء المعالم...', fn: createLandmarks, weight: 12 },
    { name: 'بناء عزبة بولضو...', fn: createEzbetBoldu, weight: 10 },
    { name: 'إضافة الناس...', fn: createPeople, weight: 10 },
    { name: 'إضافة السيارات...', fn: createCars, weight: 8 },
    { name: 'تركيب الخريطة...', fn: initMinimap, weight: 4 },
    { name: 'تشغيل الراديو...', fn: function() { radio.init(); setupRadio(); }, weight: 5 }
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
  
  if (onProgress) onProgress(100, 'جاهز! 🚀');
}

/* ═══════════════════════════════════════════════════════════
   بدء اللعب الفعلي
   ═══════════════════════════════════════════════════════════ */
function startPlayingGame() {
  resetGame();
  gameState.running = true;
  gameState.paused = false;
  gameState.lastTime = performance.now();
  
  // إخفاء شاشات البداية
  UI.loadingScreen.classList.add('hidden');
  UI.startScreen.classList.remove('visible');
  UI.endScreen.classList.remove('visible');
  
  // إظهار HUD
  UI.hud.classList.add('visible');
  UI.missionPanel.classList.add('visible');
  UI.pauseBtn.style.display = 'flex';
  UI.radioBtn.style.display = 'flex';
  UI.fullscreenBtn.style.display = 'flex';
  
  if (isMobile) UI.controls.classList.add('visible');
  
  // تشغيل الأصوات
  if (player.engineOn) AudioSystem.setEngine(true);
  
  // تشغيل الراديو تلقائي
  setTimeout(function() {
    if (!radio.isPlaying) radio.play();
  }, 800);
  
  // توليد الركاب
  setTimeout(function() { spawnPassenger(); }, 500);
  setTimeout(function() { spawnPassenger(); }, 1500);
  
  UI.showToast('🛺 يلا بينا مع مشرط!', 2500);
  UI.showDialog('مشرط: يلا بينا نشتغل!', 3000);
}

/* ═══════════════════════════════════════════════════════════
   بدء اللعبة (من شاشة البداية)
   ═══════════════════════════════════════════════════════════ */
var isInitialized = false;

async function startGame() {
  console.log('🎬 بدء اللعبة...');
  
  AudioSystem.init();
  AudioSystem.resume();
  
  if (isInitialized) {
    // إعادة اللعب
    resetGame();
    gameState.running = true;
    gameState.paused = false;
    
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
    
    setTimeout(function() {
      if (!radio.isPlaying) radio.play();
    }, 800);
    
    setTimeout(function() { spawnPassenger(); }, 500);
    setTimeout(function() { spawnPassenger(); }, 1500);
    
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
    
    // ═════════════════════════════════════════════
    // إظهار مشهد مشرط على القهوة أول
    // ═════════════════════════════════════════════
    var cafeScene = createCafeScene();
    cafeScene.position.set(0, 0, -200); // بعيد عن نقطة البداية
    scene.add(cafeScene);
    window._cafeScene = cafeScene;
    
    gameState.showingCafeScene = true;
    gameState.cafeSceneTimer = 4;
    gameState.running = true;
    gameState.lastTime = performance.now();
    
    UI.loadingScreen.classList.add('hidden');
    UI.startScreen.classList.remove('visible');
    UI.hud.classList.add('visible');
    
    if (!animate.started) {
      animate.started = true;
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

/* ═══════════════════════════════════════════════════════════
   إعادة تعيين اللعبة
   ═══════════════════════════════════════════════════════════ */
function resetGame() {
  gameState.money = 0;
  gameState.deliveries = 0;
  gameState.ratingSum = 0;
  gameState.ratingCount = 0;
  gameState.timeLeft = CONFIG.gameDuration;
  gameState.spawnTimer = 1;
  gameState.elapsedTime = 0;
  gameState.paused = false;
  gameState.dialogTimer = 5;
  
  player.speed = 0;
  player.steering = 0;
  player.currentWheelAngle = 0;
  player.hasPassenger = false;
  player.currentPassenger = null;
  player.engineOn = true;
  player.handbrake = false;
  player.bumpCount = 0;
  
  // موقع البداية على شارع الجيش
  tukTuk.position.set(0, 0, 100);
  tukTuk.rotation.set(0, 0, 0);
  
  // مسح الركاب
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
  
  // كاميرا
  camera.position.set(tukTuk.position.x, CAMERA_HEIGHT, tukTuk.position.z - CAMERA_DISTANCE);
  camera.lookAt(tukTuk.position.x, CAMERA_LOOK_HEIGHT, tukTuk.position.z);
  
  updateHUD();
  updateMissionUI();
}

/* ═══════════════════════════════════════════════════════════
   إيقاف مؤقت
   ═══════════════════════════════════════════════════════════ */
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

/* ═══════════════════════════════════════════════════════════
   إنهاء اللعبة
   ═══════════════════════════════════════════════════════════ */
function endGame() {
  gameState.running = false;
  AudioSystem.setEngine(false);
  if (radio.isPlaying) radio.pause();
  
  var avgRating = gameState.ratingCount > 0
    ? (gameState.ratingSum / gameState.ratingCount).toFixed(1)
    : '5.0';
  
  if (parseFloat(avgRating) < 0) avgRating = '0.0';
  
  UI.endTitle.textContent = gameState.deliveries > 0 ? '🎉 شغل جميل!' : '⏰ خلص الوقت!';
  UI.endSubtitle.textContent = gameState.bumpCount > 0
    ? 'مشرط بيقول: خد بالك من الناس المرة الجاية'
    : 'مشرط بيقول: شغل تمام يا معلم';
  UI.endMoney.textContent = gameState.money + ' جنيه';
  UI.endDeliveries.textContent = gameState.deliveries;
  UI.endRating.textContent = avgRating + ' ⭐';
  
  UI.endScreen.classList.add('visible');
  UI.controls.classList.remove('visible');
  UI.pauseBtn.style.display = 'none';
  UI.radioBtn.style.display = 'none';
  UI.fullscreenBtn.style.display = 'none';
}

/* ═══════════════════════════════════════════════════════════
   ربط الأزرار العامة
   ═══════════════════════════════════════════════════════════ */
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

/* ═══════════════════════════════════════════════════════════
   📌 تصدير الدوال
   ═══════════════════════════════════════════════════════════ */
window.buildCity = buildCity;
window.startGame = startGame;
window.togglePause = togglePause;
window.gameState = gameState;
window.radio = radio;
window.gameStarted = true;
window.gameInitialized = true;

console.log('✅ الجزء 2 تم تحميله - التوك توك ومشرط والركاب');
console.log('🎮 اللعبة كاملة! اضغط "🚀 ابدأ الشغل"');
