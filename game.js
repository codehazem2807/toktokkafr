/* ============================================================
   🛺 توك توك كفر الدوار - النسخة الاحترافية V2
   الجزء 1: الإعدادات + المدينة + الخريطة + المواد
   ============================================================ */

(function() {
'use strict';

console.log('🚀 بدء تحميل لعبة توك توك كفر الدوار V2...');

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

console.log('📱 الجهاز:', isMobile ? (isLowEnd ? 'موبايل ضعيف' : 'موبايل') : 'كمبيوتر');

/* ============================================================
   الجودة
   ============================================================ */
var QUALITY = {
  pixelRatio: isLowEnd ? 0.85 : (isMobile ? 1.2 : 1.6),
  fogFar: isLowEnd ? 320 : (isMobile ? 500 : 750),
  treeCount: isLowEnd ? 25 : (isMobile ? 50 : 90),
  buildingDensity: isLowEnd ? 0.45 : (isMobile ? 0.6 : 0.8),
  peopleCount: isLowEnd ? 15 : (isMobile ? 30 : 60),
  carsCount: isLowEnd ? 5 : (isMobile ? 10 : 20),
  maxBuildings: isLowEnd ? 200 : (isMobile ? 350 : 600),
  detailedBuildings: isLowEnd ? 50 : (isMobile ? 100 : 200),
};

/* ============================================================
   الإعدادات العامة
   ============================================================ */
var CONFIG = {
  citySize: 1300,
  canalWidth: 24,
  roadWidth: 22,
  sidewalkWidth: 3.2,
  maxSpeed: 15,
  maxReverseSpeed: 5,
  acceleration: 7,
  braking: 14,
  friction: 0.8,
  steeringSpeed: 3.2,
  maxWheelAngle: 0.58,
  gameDuration: 300,
  deliveryBonus: 30,
  maxPassengers: 3,
  minimapSize: 160,
};

var COLORS = {
  sky: 0x87CEEB,
  ground: 0x6a8a4a,
  road: 0x2a2a2a,
  sidewalk: 0xb0a890,
  canal: 0x2a6a9a,
};

/* ============================================================
   المشهد
   ============================================================ */
var scene = new THREE.Scene();
scene.background = new THREE.Color(COLORS.sky);
scene.fog = new THREE.Fog(COLORS.sky, 100, QUALITY.fogFar);

var camera = new THREE.PerspectiveCamera(
  62,
  window.innerWidth / window.innerHeight,
  0.5,
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
renderer.shadowMap.enabled = false;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;

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
var sunLight = new THREE.DirectionalLight(0xfff5e0, 2.0);
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
   🗣️ جمل السواق الشعبي المصري
   ============================================================ */
var DIALOGS = {
  pickup: [
    'يلا يا معلم، اركب بسرعة',
    'اتفضل يسطا، اركب من هنا',
    'أهلاً يا زعيم، هنمشي حالاً',
    'طيب يا باشا، اركب وربنا يكرم',
    'يلا بينا يسطا، الوقت بيجري',
    'اركب يا معلم، التوك توك تحت أمرك',
    'أهلاً وسهلاً، اتفضل ورا',
    'صباح الفل يا باشا، اركب',
    'على راسي يا معلم، اركب',
    'أيوه كده، اركب يسطا'
  ],
  driving: [
    'الطريق زحمة النهاردة والله',
    'يلا نلف من أحمد عرابي',
    'بص الشارع ده اسمه إيه؟',
    'يسطا في لجنة قدام خد بالك',
    'الإشارة حمرا، استنى شوي',
    'الترعة على شمالنا يسطا',
    'هنا السوق، الدنيا زحمة',
    'في مطب قدام يسطا، اقفش',
    'الراجل ده مشي قدامي فجأة',
    'كفر الدوار دي بلدي يا معلم',
    'الحق عليّا يسطا، هنجيلك في الوقت',
    'الشمس بتغيب بدري النهاردة',
    'قربنا نوصل يا باشا',
    'عدينا على مسجد الثورة',
    'ده شارع بورسعيد يسطا',
    'خد بالك من التوكتوك اللي جاي',
    'معلش يسطا، أصل الزحمة كتير',
    'ربنا يكرمك يا معلم',
    'الحمد لله على كل حال',
    'إحنا قربنا نخلص النهاردة'
  ],
  arrived: [
    'وصلنا يا باشا، اتفضل',
    'الحمد لله، كنا في الموعد',
    'أيوه كده، المكان ده هو',
    'يلا يا معلم، نوّرت',
    'وصلنا بألف سلامة يسطا',
    'دي الحساب يا باشا، ربنا يكرمك',
    'اتفضل يسطا، سلام عليكم'
  ],
  traffic: [
    '⚠️ في لجنة قدام يا معلم',
    '⚠️ الإشارة حمرا، استنى',
    '⚠️ خد بالك من المطب',
    '⚠️ في عربية واقفة قدام',
    '⚠️ الراجل ده بيعدي الشارع'
  ],
  police: [
    '🛑 لجنة يا معلم، هدّي شوية',
    '🛑 واقفين في اللجنة، خد بالك',
    '🛑 ظابط بيشاورلنا، هدّي'
  ],
  honk: [
    '📢 كلاكس يا معلم',
    '📢 هدّي الطريق يسطا',
    '📢 خد بالك، أنا جاي'
  ]
};

/* ============================================================
   🎵 الراديو الشعبي
   ============================================================ */
var RADIO_TRACKS = [
  { file: '1.mp3', name: 'الطريق الزراعي' },
  { file: '2.mp3', name: 'شوارع كفر الدوار' },
  { file: '3.mp3', name: 'ترعة المحمودية' },
  { file: '4.mp3', name: 'أغاني شعبية' },
  { file: '5.mp3', name: 'كورنيش الإسكندرية' },
];

var radio = {
  audio: null,
  currentTrack: 0,
  isPlaying: false,
  enabled: true,
  
  init: function() {
    this.audio = new Audio();
    this.audio.volume = 0.35;
    this.audio.loop = false;
    var self = this;
    this.audio.addEventListener('ended', function() {
      self.next();
    });
    this.audio.addEventListener('error', function() {
      console.warn('⚠️ ملف الراديو مش موجود: ' + self.audio.src);
    });
  },
  
  play: function() {
    if (!this.audio) return;
    var track = RADIO_TRACKS[this.currentTrack];
    this.audio.src = track.file;
    this.audio.play().then(function() {
      console.log('📻 شغال: ' + track.name);
    }).catch(function(e) {
      console.warn('⚠️ مش قادر أشغل الراديو:', e.message);
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
   المواد
   ============================================================ */
var MAT = {
  // أرضية وشوارع
  ground: new THREE.MeshLambertMaterial({ color: COLORS.ground }),
  road: new THREE.MeshLambertMaterial({ color: COLORS.road }),
  roadLine: new THREE.MeshBasicMaterial({ color: 0xffcc00 }),
  roadLineWhite: new THREE.MeshBasicMaterial({ color: 0xffffff }),
  sidewalk: new THREE.MeshLambertMaterial({ color: COLORS.sidewalk }),
  sidewalkCurb: new THREE.MeshLambertMaterial({ color: 0x808080 }),
  
  // ترعة
  canal: new THREE.MeshLambertMaterial({ color: COLORS.canal }),
  canalBank: new THREE.MeshLambertMaterial({ color: 0x8b7355 }),
  bridge: new THREE.MeshLambertMaterial({ color: 0x666666 }),
  
  // مباني - مواد احترافية
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
  satellite: new THREE.MeshLambertMaterial({ color: 0xc0c0c0 }),
  glass: new THREE.MeshLambertMaterial({ color: 0x88ccff, transparent: true, opacity: 0.5 }),
  window: new THREE.MeshLambertMaterial({ color: 0x88ccff }),
  
  // ألوان لافتات المحلات
  shopAwning: [
    new THREE.MeshLambertMaterial({ color: 0xe74c3c }),
    new THREE.MeshLambertMaterial({ color: 0x3498db }),
    new THREE.MeshLambertMaterial({ color: 0x2ecc71 }),
    new THREE.MeshLambertMaterial({ color: 0xf39c12 }),
    new THREE.MeshLambertMaterial({ color: 0x9b59b6 }),
    new THREE.MeshLambertMaterial({ color: 0x1abc9c }),
  ],
  buildingWalls: [
    new THREE.MeshLambertMaterial({ color: 0xd4a574 }),
    new THREE.MeshLambertMaterial({ color: 0xc9a878 }),
    new THREE.MeshLambertMaterial({ color: 0xb89878 }),
    new THREE.MeshLambertMaterial({ color: 0xa88868 }),
    new THREE.MeshLambertMaterial({ color: 0xe8c8a0 }),
  ],
  buildingRoofs: [
    new THREE.MeshLambertMaterial({ color: 0x8b6a4a }),
    new THREE.MeshLambertMaterial({ color: 0x6a5a4a }),
  ],
  
  // أشجار
  treeTrunk: new THREE.MeshLambertMaterial({ color: 0x5a3a20 }),
  treeLeaf: new THREE.MeshLambertMaterial({ color: 0x3a7a3a }),
  treeLeafDark: new THREE.MeshLambertMaterial({ color: 0x2a5a2a }),
  palmTrunk: new THREE.MeshLambertMaterial({ color: 0x8b6a3a }),
  palmLeaf: new THREE.MeshLambertMaterial({ color: 0x3a8a3a, side: THREE.DoubleSide }),
  
  // سيارات
  carBody: [
    new THREE.MeshLambertMaterial({ color: 0xcc3333 }),
    new THREE.MeshLambertMaterial({ color: 0x3366cc }),
    new THREE.MeshLambertMaterial({ color: 0xcccccc }),
    new THREE.MeshLambertMaterial({ color: 0x333333 }),
    new THREE.MeshLambertMaterial({ color: 0xf39c12 }),
    new THREE.MeshLambertMaterial({ color: 0x1abc9c }),
  ],
  carTire: new THREE.MeshLambertMaterial({ color: 0x1a1a1a }),
  
  // ناس واقعية - ألوان ملابس
  peopleShirt: [
    new THREE.MeshLambertMaterial({ color: 0xe74c3c }),
    new THREE.MeshLambertMaterial({ color: 0x3498db }),
    new THREE.MeshLambertMaterial({ color: 0x2ecc71 }),
    new THREE.MeshLambertMaterial({ color: 0xf39c12 }),
    new THREE.MeshLambertMaterial({ color: 0x9b59b6 }),
    new THREE.MeshLambertMaterial({ color: 0x1abc9c }),
    new THREE.MeshLambertMaterial({ color: 0xe67e22 }),
    new THREE.MeshLambertMaterial({ color: 0xffffff }),
    new THREE.MeshLambertMaterial({ color: 0x2c3e50 }),
    new THREE.MeshLambertMaterial({ color: 0xffd700 }),
    new THREE.MeshLambertMaterial({ color: 0x8e44ad }),
    new THREE.MeshLambertMaterial({ color: 0xd35400 }),
  ],
  peoplePants: [
    new THREE.MeshLambertMaterial({ color: 0x2c3e50 }),
    new THREE.MeshLambertMaterial({ color: 0x1a1a1a }),
    new THREE.MeshLambertMaterial({ color: 0x34495e }),
    new THREE.MeshLambertMaterial({ color: 0x4a4a4a }),
    new THREE.MeshLambertMaterial({ color: 0x5a3a2a }),
    new THREE.MeshLambertMaterial({ color: 0x1e3799 }),
  ],
  peopleSkin: [
    new THREE.MeshLambertMaterial({ color: 0xf5d5b0 }),
    new THREE.MeshLambertMaterial({ color: 0xe0b890 }),
    new THREE.MeshLambertMaterial({ color: 0xc89870 }),
    new THREE.MeshLambertMaterial({ color: 0xa87850 }),
    new THREE.MeshLambertMaterial({ color: 0x8d5524 }),
  ],
  peopleHair: [
    new THREE.MeshLambertMaterial({ color: 0x1a1a1a }),
    new THREE.MeshLambertMaterial({ color: 0x3a2a1a }),
    new THREE.MeshLambertMaterial({ color: 0x5a4a3a }),
    new THREE.MeshLambertMaterial({ color: 0x808080 }),
  ],
  
  // معالم
  mosqueWall: new THREE.MeshLambertMaterial({ color: 0xf0e8d0 }),
  mosqueDome: new THREE.MeshLambertMaterial({ color: 0x16a085 }),
  mosqueGold: new THREE.MeshLambertMaterial({ color: 0xffcc00 }),
  stationWall: new THREE.MeshLambertMaterial({ color: 0xe8dcc0 }),
  stationRoof: new THREE.MeshLambertMaterial({ color: 0x8b4513 }),
  factoryWall: new THREE.MeshLambertMaterial({ color: 0x95a5a6 }),
  factoryChimney: new THREE.MeshLambertMaterial({ color: 0x7f8c8d }),
  hospitalWall: new THREE.MeshLambertMaterial({ color: 0xf5f5f5 }),
  hospitalRed: new THREE.MeshBasicMaterial({ color: 0xcc0000 }),
  schoolWall: new THREE.MeshLambertMaterial({ color: 0xf0c880 }),
  
  // توك توك
  black: new THREE.MeshLambertMaterial({ color: 0x0a0a0a }),
  yellow: new THREE.MeshLambertMaterial({ color: 0xffc800 }),
  yellowDark: new THREE.MeshLambertMaterial({ color: 0xe6a800 }),
  chrome: new THREE.MeshLambertMaterial({ color: 0xcccccc }),
  glassTint: new THREE.MeshLambertMaterial({ color: 0xaaddff, transparent: true, opacity: 0.4 }),
  headlight: new THREE.MeshBasicMaterial({ color: 0xffffcc }),
  taillight: new THREE.MeshBasicMaterial({ color: 0xff2222 }),
  
  // إشارات
  trafficPole: new THREE.MeshLambertMaterial({ color: 0x333333 }),
  trafficRed: new THREE.MeshBasicMaterial({ color: 0xff0000 }),
  trafficYellow: new THREE.MeshBasicMaterial({ color: 0xffcc00 }),
  trafficGreen: new THREE.MeshBasicMaterial({ color: 0x00ff00 }),
  trafficOff: new THREE.MeshLambertMaterial({ color: 0x333333 }),
  
  // لجنة
  policeShirt: new THREE.MeshLambertMaterial({ color: 0x1a1a3a }),
  policePants: new THREE.MeshLambertMaterial({ color: 0x1a1a1a }),
  policeCap: new THREE.MeshLambertMaterial({ color: 0x1a1a3a }),
  policeBadge: new THREE.MeshBasicMaterial({ color: 0xffcc00 }),
  
  // قهاوي
  cafeTable: new THREE.MeshLambertMaterial({ color: 0x8b6a3a }),
  cafeChair: new THREE.MeshLambertMaterial({ color: 0x5a3a1a }),
  cafeShisha: new THREE.MeshLambertMaterial({ color: 0xc8a878 }),
  cafeShishaTop: new THREE.MeshLambertMaterial({ color: 0x8b6a3a }),
  cafeGlass: new THREE.MeshLambertMaterial({ color: 0xf0e8d0, transparent: true, opacity: 0.7 }),
  cafeAwning: new THREE.MeshLambertMaterial({ color: 0xd4a574 }),
};

/* ============================================================
   نصوص الشوارع (Canvas Texture)
   ============================================================ */
function makeTextTexture(text, bgColor, textColor, w, h) {
  w = w || 640;
  h = h || 160;
  bgColor = bgColor || '#1a5a9a';
  textColor = textColor || '#ffffff';
  
  var canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  var ctx = canvas.getContext('2d');
  
  // خلفية متدرجة
  var grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, bgColor);
  grad.addColorStop(1, '#000');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
  
  // حدود
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 8;
  ctx.strokeRect(8, 8, w - 16, h - 16);
  
  // نص
  ctx.fillStyle = textColor;
  ctx.font = 'bold 62px Tahoma, Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, w / 2, h / 2);
  
  var tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 4;
  return tex;
}

/* ============================================================
   📍 الشوارع الحقيقية لكفر الدوار
   ============================================================ */
var ROADS_DATA = [
  // الشوارع الرئيسية (طولية - شمال/جنوب)
  { name: 'شارع أحمد عرابي', x: 0, z: -15, width: 22, length: 1300, rotation: 0, isMain: true, signColor: '#1a5a9a' },
  { name: 'شارع بورسعيد', x: 0, z: 30, width: 18, length: 1300, rotation: 0, signColor: '#8b1a1a' },
  
  // الشوارع العرضية (شرق/غرب)
  { name: 'شارع الجيش', x: 280, z: 120, width: 18, length: 650, rotation: Math.PI / 2, signColor: '#1a8a3a' },
  { name: 'شارع الجمهورية', x: -320, z: 0, width: 16, length: 600, rotation: Math.PI / 2, signColor: '#8a1a8a' },
  { name: 'شارع جلال الدسوقي', x: -100, z: 380, width: 15, length: 500, rotation: Math.PI / 2, signColor: '#8a6a1a' },
  { name: 'شارع سيدي عبد القادر', x: -520, z: 120, width: 16, length: 450, rotation: Math.PI / 2, signColor: '#1a8a8a' },
  { name: 'شارع الحدائق', x: 120, z: 330, width: 14, length: 450, rotation: Math.PI / 2, signColor: '#3a8a1a' },
  { name: 'شارع المحور', x: 480, z: 280, width: 14, length: 450, rotation: Math.PI / 2, signColor: '#8a3a1a' },
  
  // شوارع فرعية
  { name: 'شارع الجلاء', x: -420, z: -240, width: 14, length: 500, rotation: 0, signColor: '#1a3a8a' },
  { name: 'شارع النصر', x: 380, z: -240, width: 14, length: 500, rotation: 0, signColor: '#8a1a1a' },
  { name: 'شارع المحكمة', x: -240, z: -280, width: 13, length: 400, rotation: Math.PI / 2, signColor: '#5a5a5a' },
  { name: 'شارع الموقف', x: 650, z: 0, width: 13, length: 500, rotation: Math.PI / 2, signColor: '#8a5a1a' },
  { name: 'شارع سعد زغلول', x: -650, z: -100, width: 13, length: 400, rotation: Math.PI / 2, signColor: '#6a3a8a' },
  { name: 'شارع التحرير', x: 250, z: 500, width: 13, length: 400, rotation: 0, signColor: '#3a6a8a' },
];

/* ============================================================
   📍 الوجهات الحقيقية
   ============================================================ */
var DESTINATIONS_DATA = [
  { name: 'محطة قطار كفر الدوار', short: 'محطة القطار', x: -230, z: -80, color: 0x8b4513 },
  { name: 'مسجد الثورة', short: 'المسجد', x: -120, z: 200, color: 0x16a085 },
  { name: 'شركة مصر للغزل والنسيج', short: 'شركة الغزل', x: 380, z: -280, color: 0x95a5a6 },
  { name: 'موقف عزيز المصري', short: 'الموقف', x: 170, z: 70, color: 0xe74c3c },
  { name: 'مجمع الميزانة', short: 'الميزانة', x: -140, z: -100, color: 0xf39c12 },
  { name: 'مجمع السعرانية', short: 'السعرانية', x: 380, z: 100, color: 0xe67e22 },
  { name: 'مستشفى كفر الدوار العام', short: 'المستشفى', x: -520, z: 150, color: 0x3498db },
  { name: 'سوق الأربعاء', short: 'السوق', x: 100, z: 180, color: 0x9b59b6 },
  { name: 'كورنيش ترعة المحمودية', short: 'الكورنيش', x: 520, z: -20, color: 0x2980b9 },
  { name: 'جامعة كفر الدوار', short: 'الجامعة', x: -420, z: -280, color: 0x8e44ad },
  { name: 'مدرسة صلاح سالم', short: 'المدرسة', x: -260, z: 340, color: 0xf39c12 },
  { name: 'شارع الجيش التجاري', short: 'الجيش', x: 300, z: 200, color: 0xe74c3c },
];

/* ============================================================
   نظام الأصوات
   ============================================================ */
var AudioSystem = {
  ctx: null, engineOsc: null, engineGain: null,
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
      this.engineGain = this.ctx.createGain();
      this.engineGain.gain.value = 0.02;
      this.engineOsc.connect(this.engineGain);
      this.engineGain.connect(this.ctx.destination);
      this.engineOsc.start();
    } catch (e) {}
  },
  
  stopEngine: function() {
    if (this.engineOsc) {
      try { this.engineOsc.stop(); } catch (e) {}
      this.engineOsc = null; this.engineGain = null;
    }
  },
  
  setEngine: function(on) { 
    if (on) { this.resume(); this.startEngine(); } 
    else { this.stopEngine(); } 
  },
  
  updateEngine: function(speed, maxSpeed, isAcc) {
    if (!this.engineOsc || !this.engineGain || !this.ctx) return;
    var r = Math.min(Math.abs(speed) / maxSpeed, 1);
    this.engineOsc.frequency.setTargetAtTime(55 + r * 100, this.ctx.currentTime, 0.1);
    this.engineGain.gain.setTargetAtTime(0.015 + r * 0.05 + (isAcc ? 0.015 : 0), this.ctx.currentTime, 0.15);
  },
  
  playPickup: function() { 
    if (this.enabled && this.ctx) this._tone(700, 1000, 0.2, 0.1); 
  },
  
  playDelivery: function() {
    if (!this.enabled || !this.ctx) return;
    var s = this;
    this._tone(523, 523, 0.1, 0.1);
    setTimeout(function() { s._tone(659, 659, 0.1, 0.1); }, 100);
    setTimeout(function() { s._tone(784, 784, 0.2, 0.1); }, 200);
  },
  
  playHorn: function() {
    if (!this.enabled || !this.ctx) return;
    var s = this;
    this._tone(440, 440, 0.15, 0.08);
    setTimeout(function() { s._tone(550, 550, 0.2, 0.08); }, 150);
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
   الأرضية
   ============================================================ */
function createGround() {
  var ground = new THREE.Mesh(new THREE.PlaneGeometry(4000, 4000), MAT.ground);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.05;
  scene.add(ground);
}

/* ============================================================
   ترعة المحمودية
   ============================================================ */
var canalRef = null;
function createCanal() {
  var group = new THREE.Group();
  group.name = 'canal';
  
  // الماء
  var water = new THREE.Mesh(
    new THREE.PlaneGeometry(CONFIG.citySize * 1.5, CONFIG.canalWidth),
    MAT.canal
  );
  water.rotation.x = -Math.PI / 2;
  water.position.y = -0.35;
  group.add(water);
  group.userData.water = water;
  
  // الضفاف
  for (var s = -1; s <= 1; s += 2) {
    var bank = new THREE.Mesh(
      new THREE.BoxGeometry(CONFIG.citySize * 1.5, 1.5, 3),
      MAT.canalBank
    );
    bank.position.set(0, 0.6, s * (CONFIG.canalWidth / 2 + 1.5));
    group.add(bank);
    
    // سور حماية
    var rail = new THREE.Mesh(
      new THREE.BoxGeometry(CONFIG.citySize * 1.5, 0.8, 0.15),
      MAT.chrome
    );
    rail.position.set(0, 2.0, s * (CONFIG.canalWidth / 2 + 3));
    group.add(rail);
  }
  
  // الجسر (شارع أحمد عرابي)
  var bridge = new THREE.Mesh(
    new THREE.BoxGeometry(26, 2.5, CONFIG.canalWidth + 16),
    MAT.bridge
  );
  bridge.position.set(0, 1.5, 0);
  group.add(bridge);
  
  // درابزين الجسر
  for (var s = -1; s <= 1; s += 2) {
    var brail = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 1, CONFIG.canalWidth + 16),
      MAT.chrome
    );
    brail.position.set(s * 12, 3.2, 0);
    group.add(brail);
  }
  
  scene.add(group);
  canalRef = group;
}

/* ============================================================
   الشوارع الاحترافية + لافتات الأسماء
   ============================================================ */
function createRoads() {
  var group = new THREE.Group();
  group.name = 'roads';
  
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
    
    // الأرصفة + حواف
    for (var s = -1; s <= 1; s += 2) {
      var so = s * (rd.width / 2 + CONFIG.sidewalkWidth / 2);
      var dx = Math.cos(rd.rotation) * so;
      var dz = -Math.sin(rd.rotation) * so;
      
      // الرصيف
      var sidewalk = new THREE.Mesh(
        new THREE.BoxGeometry(CONFIG.sidewalkWidth, 0.3, rd.length),
        MAT.sidewalk
      );
      sidewalk.position.set(rd.x + dx, 0.2, rd.z + dz);
      sidewalk.rotation.y = rd.rotation;
      group.add(sidewalk);
      
      // حاجز الرصيف
      var curbOffset = s * (rd.width / 2);
      var cdx = Math.cos(rd.rotation) * curbOffset;
      var cdz = -Math.sin(rd.rotation) * curbOffset;
      
      var curb = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 0.35, rd.length),
        MAT.sidewalkCurb
      );
      curb.position.set(rd.x + cdx, 0.18, rd.z + cdz);
      curb.rotation.y = rd.rotation;
      group.add(curb);
    }
    
    // خطوط الطريق
    if (rd.width >= 15) {
      var lineCount = Math.floor(rd.length / 30);
      for (var j = 0; j < lineCount; j++) {
        var off = -rd.length / 2 + j * 30 + 15;
        var mark = new THREE.Mesh(
          new THREE.BoxGeometry(0.4, 0.05, 10),
          MAT.roadLine
        );
        var mx = rd.x + Math.sin(rd.rotation) * off;
        var mz = rd.z + Math.cos(rd.rotation) * off;
        mark.position.set(mx, 0.15, mz);
        mark.rotation.y = rd.rotation;
        group.add(mark);
      }
    }
    
    // لوحة اسم الشارع (احترافية)
    if (rd.isMain || rd.width >= 15) {
      var signTex = makeTextTexture(rd.name, rd.signColor, '#ffffff', 700, 160);
      var signMat = new THREE.MeshBasicMaterial({ map: signTex, side: THREE.DoubleSide });
      var signGeo = new THREE.PlaneGeometry(9, 2.2);
      
      // اللوحة الأولى
      var signOffset = rd.width / 2 + 2;
      var signX = rd.x + Math.cos(rd.rotation) * signOffset;
      var signZ = rd.z - Math.sin(rd.rotation) * signOffset;
      var posAlong = rd.length / 4;
      signX += Math.sin(rd.rotation) * posAlong;
      signZ += Math.cos(rd.rotation) * posAlong;
      
      // عمود اللوحة
      var pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.1, 7),
        MAT.chrome
      );
      pole.position.set(signX, 3.5, signZ);
      group.add(pole);
      
      // اللوحة
      var sign = new THREE.Mesh(signGeo, signMat);
      sign.position.set(signX, 6.5, signZ);
      group.add(sign);
      
      // لوحة ثانية في النصف الآخر (للشوارع الطويلة)
      if (rd.length > 500) {
        var signX2 = rd.x - Math.cos(rd.rotation) * signOffset;
        var signZ2 = rd.z + Math.sin(rd.rotation) * signOffset;
        var posAlong2 = -rd.length / 4;
        signX2 += Math.sin(rd.rotation) * posAlong2;
        signZ2 += Math.cos(rd.rotation) * posAlong2;
        
        var pole2 = new THREE.Mesh(
          new THREE.CylinderGeometry(0.1, 0.1, 7),
          MAT.chrome
        );
        pole2.position.set(signX2, 3.5, signZ2);
        group.add(pole2);
        
        var sign2 = new THREE.Mesh(signGeo, signMat);
        sign2.position.set(signX2, 6.5, signZ2);
        group.add(sign2);
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
  var railX = -260;
  var railMat = new THREE.MeshLambertMaterial({ color: 0x808080 });
  
  for (var s = -1; s <= 1; s += 2) {
    var rail = new THREE.Mesh(
      new THREE.BoxGeometry(0.15, 0.3, CONFIG.citySize),
      railMat
    );
    rail.position.set(railX + s * 1.2, 0.35, 0);
    group.add(rail);
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
  t.add(trunk);
  
  var leafMat = Math.random() > 0.5 ? MAT.treeLeaf : MAT.treeLeafDark;
  var leaf1 = new THREE.Mesh(new THREE.SphereGeometry(1.3 * scale, 7, 6), leafMat);
  leaf1.position.y = 2.9 * scale;
  t.add(leaf1);
  
  var leaf2 = new THREE.Mesh(new THREE.SphereGeometry(0.9 * scale, 6, 5), leafMat);
  leaf2.position.set(0.5 * scale, 3.4 * scale, 0.3 * scale);
  t.add(leaf2);
  
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
  p.add(trunk);
  
  for (var i = 0; i < 7; i++) {
    var angle = (i / 7) * Math.PI * 2;
    var leaf = new THREE.Mesh(
      new THREE.PlaneGeometry(0.85 * scale, 3 * scale),
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
  
  // نخيل على ضفاف الترعة
  var step = 40;
  for (var x = -CONFIG.citySize * 0.55; x < CONFIG.citySize * 0.55; x += step) {
    if (Math.random() > 0.5) {
      group.add(createPalm(x + Utils.rand(-4, 4), -(CONFIG.canalWidth / 2 + 5), Utils.rand(0.9, 1.1)));
    }
    if (Math.random() > 0.5) {
      group.add(createPalm(x + Utils.rand(-4, 4), (CONFIG.canalWidth / 2 + 5), Utils.rand(0.9, 1.1)));
    }
  }
  
  // أشجار على الشوارع
  var count = 0;
  for (var i = 0; i < ROADS_DATA.length && count < QUALITY.treeCount; i++) {
    var rd = ROADS_DATA[i];
    if (rd.width < 14) continue;
    var treeSpacing = 65;
    var trees = Math.floor(rd.length / treeSpacing);
    for (var j = 0; j < trees && count < QUALITY.treeCount; j++) {
      var off = -rd.length / 2 + j * treeSpacing + treeSpacing / 2;
      var s = Math.random() > 0.5 ? 1 : -1;
      var so = s * (rd.width / 2 + CONFIG.sidewalkWidth + 2);
      var tx = rd.x + Math.sin(rd.rotation) * off + Math.cos(rd.rotation) * so;
      var tz = rd.z + Math.cos(rd.rotation) * off - Math.sin(rd.rotation) * so;
      if (Math.abs(tz) > CONFIG.canalWidth / 2 + 8) {
        group.add(createTree(tx, tz, Utils.rand(0.85, 1.15)));
        count++;
      }
    }
  }
  
  scene.add(group);
}

/* ============================================================
   ⚠️ سيتم استكمال باقي الدوال في الرد الجاي
   ============================================================ */

// تصدير للاستخدام الداخلي
window._GAME = {
  CONFIG: CONFIG,
  QUALITY: QUALITY,
  scene: scene,
  camera: camera,
  renderer: renderer,
  UI: UI,
  Utils: Utils,
  MAT: MAT,
  DIALOGS: DIALOGS,
  RADIO_TRACKS: RADIO_TRACKS,
  radio: radio,
  ROADS_DATA: ROADS_DATA,
  DESTINATIONS_DATA: DESTINATIONS_DATA,
  AudioSystem: AudioSystem,
  canalRef: canalRef,
  createGround: createGround,
  createCanal: createCanal,
  createRoads: createRoads,
  createRailway: createRailway,
  createTree: createTree,
  createPalm: createPalm,
  createFoliage: createFoliage,
  makeTextTexture: makeTextTexture,
  sunLight: sunLight,
};

console.log('✅ الجزء 1 من game.js جاهز - الإعدادات والمدينة');

})();
