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

/* ============================================================
   🛺 الجزء 2: التوك توك + الناس + القهاوي + السيارات
   ============================================================ */

/* ============================================================
   المباني الاحترافية
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

function isNearLandmark(x, z, radius) {
  radius = radius || 45;
  for (var i = 0; i < DESTINATIONS_DATA.length; i++) {
    var d = DESTINATIONS_DATA[i];
    if (Math.abs(x - d.x) < radius && Math.abs(z - d.z) < radius) return true;
  }
  return false;
}

/* ============================================================
   مبنى احترافي واحد
   ============================================================ */
function createDetailedBuilding(x, z, w, d, h) {
  var g = new THREE.Group();
  var style = Math.floor(Math.random() * 4);
  var wallMat, roofMat, trimMat;
  
  // اختيار النمط
  if (style === 0) {
    // سكني عادي - بيج
    wallMat = Utils.pick([MAT.plaster, MAT.plasterPink, MAT.concrete, MAT.plasterYellow]);
    roofMat = MAT.tiles;
    trimMat = MAT.concrete;
  } else if (style === 1) {
    // تجاري - ألوان فاتحة + محل
    wallMat = Utils.pick([MAT.plasterYellow, MAT.plasterBlue, MAT.plasterGreen]);
    roofMat = MAT.tilesRed;
    trimMat = MAT.plaster;
  } else if (style === 2) {
    // عمارة كبيرة - بلكونات
    wallMat = Utils.pick([MAT.plasterGreen, MAT.plasterYellow, MAT.plasterPink]);
    roofMat = MAT.tilesRed;
    trimMat = MAT.plaster;
  } else {
    // طوب
    wallMat = Utils.pick([MAT.brick, MAT.brickDark, MAT.plaster]);
    roofMat = MAT.tiles;
    trimMat = MAT.concrete;
  }
  
  // الدور الأرضي (أغمق)
  var groundFloorH = 3.5;
  var groundMat = style === 3 ? MAT.brickDark : MAT.concrete;
  
  var groundFloor = new THREE.Mesh(
    new THREE.BoxGeometry(w + 0.2, groundFloorH, d + 0.2),
    groundMat
  );
  groundFloor.position.y = groundFloorH / 2;
  g.add(groundFloor);
  
  // باقي الأدوار
  var upperH = h - groundFloorH;
  if (upperH > 0) {
    var upperFloors = new THREE.Mesh(
      new THREE.BoxGeometry(w, upperH, d),
      wallMat
    );
    upperFloors.position.y = groundFloorH + upperH / 2;
    g.add(upperFloors);
  }
  
  // السقف
  var roofBase = new THREE.Mesh(
    new THREE.BoxGeometry(w + 0.5, 0.4, d + 0.5),
    roofMat
  );
  roofBase.position.y = h + 0.2;
  g.add(roofBase);
  
  // سور السطح (بارابيت)
  var parapetH = 0.7;
  for (var s = -1; s <= 1; s += 2) {
    var p1 = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, parapetH, d + 0.5),
      trimMat
    );
    p1.position.set(s * (w / 2 + 0.15), h + 0.6, 0);
    g.add(p1);
    
    var p2 = new THREE.Mesh(
      new THREE.BoxGeometry(w + 0.5, parapetH, 0.2),
      trimMat
    );
    p2.position.set(0, h + 0.6, s * (d / 2 + 0.15));
    g.add(p2);
  }
  
  // واجهة المحل أو الباب
  if (style === 1 || Math.random() > 0.5) {
    // واجهة محل زجاجية
    var shopWin = new THREE.Mesh(
      new THREE.BoxGeometry(w * 0.75, 2.2, 0.15),
      MAT.glass
    );
    shopWin.position.set(0, 1.7, d / 2 + 0.12);
    g.add(shopWin);
    
    // إطار المحل
    var shopFrame = new THREE.Mesh(
      new THREE.BoxGeometry(w * 0.8, 2.5, 0.1),
      MAT.metalDoor
    );
    shopFrame.position.set(0, 1.7, d / 2 + 0.05);
    g.add(shopFrame);
    
    // مظلة المحل
    var awningColor = Utils.pick(MAT.shopAwning);
    var awning = new THREE.Mesh(
      new THREE.BoxGeometry(w * 0.85, 0.15, 1.6),
      awningColor
    );
    awning.position.set(0, 3.1, d / 2 + 0.8);
    awning.rotation.x = -0.25;
    g.add(awning);
    
    // لافتة المحل
    var signColor = Utils.pick([0xe74c3c, 0x3498db, 0xf39c12, 0x2ecc71, 0x9b59b6]);
    var shopSign = new THREE.Mesh(
      new THREE.BoxGeometry(w * 0.65, 0.9, 0.15),
      new THREE.MeshLambertMaterial({ color: signColor })
    );
    shopSign.position.set(0, 3.7, d / 2 + 0.1);
    g.add(shopSign);
  } else {
    // باب عادي
    var door = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 2.5, 0.15),
      style === 3 ? MAT.metalDoor : MAT.woodDoor
    );
    door.position.set(0, 1.25, d / 2 + 0.12);
    g.add(door);
    
    // إطار الباب
    var doorFrame = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 2.8, 0.08),
      trimMat
    );
    doorFrame.position.set(0, 1.4, d / 2 + 0.06);
    g.add(doorFrame);
    
    // مظلة صغيرة فوق الباب
    var smallAwning = new THREE.Mesh(
      new THREE.BoxGeometry(2.5, 0.1, 1),
      trimMat
    );
    smallAwning.position.set(0, 2.8, d / 2 + 0.5);
    smallAwning.rotation.x = -0.2;
    g.add(smallAwning);
  }
  
  // نوافذ الأدوار العلوية
  var floors = Math.max(1, Math.floor((h - groundFloorH) / 3));
  var winCols = Math.max(2, Math.floor(w / 3));
  
  for (var f = 0; f < floors; f++) {
    var winY = groundFloorH + 1.5 + f * 3;
    
    for (var c = 0; c < winCols; c++) {
      var winX = -w / 2 + 1.5 + c * (w / winCols);
      
      // نافذة أمامية + إطار
      var winFrame = new THREE.Mesh(
        new THREE.BoxGeometry(1.3, 1.6, 0.15),
        trimMat
      );
      winFrame.position.set(winX, winY, d / 2 + 0.05);
      g.add(winFrame);
      
      var winGlass = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1.3, 0.05),
        MAT.window
      );
      winGlass.position.set(winX, winY, d / 2 + 0.12);
      g.add(winGlass);
      
      // شرفة في بعض النوافذ
      if (f > 0 && Math.random() > 0.6) {
        var balcony = new THREE.Mesh(
          new THREE.BoxGeometry(1.8, 0.15, 1),
          MAT.concrete
        );
        balcony.position.set(winX, winY - 0.9, d / 2 + 0.5);
        g.add(balcony);
        
        var rail = new THREE.Mesh(
          new THREE.BoxGeometry(1.8, 0.7, 0.08),
          MAT.balconyRail
        );
        rail.position.set(winX, winY - 0.5, d / 2 + 0.95);
        g.add(rail);
        
        // وحدة تكييف على الشرفة
        if (Math.random() > 0.5) {
          var ac = new THREE.Mesh(
            new THREE.BoxGeometry(0.7, 0.5, 0.3),
            MAT.acUnit
          );
          ac.position.set(winX - 0.6, winY - 1, d / 2 + 0.7);
          g.add(ac);
        }
      }
    }
  }
  
  // طبق دش
  if (Math.random() > 0.5) {
    var dish = new THREE.Mesh(
      new THREE.CylinderGeometry(0.5, 0.5, 0.1, 12),
      MAT.satellite
    );
    dish.position.set(Utils.rand(-w / 3, w / 3), h + 0.9, Utils.rand(-d / 3, d / 3));
    dish.rotation.z = Utils.rand(-0.3, 0.3);
    g.add(dish);
  }
  
  g.position.set(x, 0, z);
  return g;
}

function createBuildings() {
  var group = new THREE.Group();
  var grid = 44;
  var half = CONFIG.citySize / 2;
  var buildingList = [];
  
  for (var gx = -half; gx < half; gx += grid) {
    for (var gz = -half; gz < half; gz += grid) {
      var x = gx + grid / 2 + Utils.rand(-2, 2);
      var z = gz + grid / 2 + Utils.rand(-2, 2);
      
      if (isOnRoad(x, z, 5)) continue;
      if (Math.abs(z) < CONFIG.canalWidth / 2 + 10) continue;
      if (Math.abs(x + 260) < 18) continue;
      if (Math.abs(x) < 22 && Math.abs(z) < 25) continue;
      if (isNearLandmark(x, z, 45)) continue;
      
      // منطقة القهاوي (شارع أحمد عرابي)
      if (Math.abs(z + 15) < 30 && Math.abs(x) < 200 && Math.random() > 0.5) continue;
      
      if (Math.random() > QUALITY.buildingDensity) continue;
      if (buildingList.length >= QUALITY.maxBuildings) break;
      
      buildingList.push({
        x: x, z: z,
        w: Utils.rand(10, 17),
        d: Utils.rand(10, 17),
        h: Utils.rand(6, 20)
      });
    }
  }
  
  console.log('🏢 بناء', buildingList.length, 'مبنى');
  
  // المباني المفصلة (القريبة من المركز)
  var detailedCount = Math.min(QUALITY.detailedBuildings, buildingList.length);
  var detailed = [];
  var simple = [];
  
  // نختار الأقرب للمركز للتفصيل
  buildingList.sort(function(a, b) {
    return (a.x * a.x + a.z * a.z) - (b.x * b.x + b.z * b.z);
  });
  
  for (var i = 0; i < buildingList.length; i++) {
    if (i < detailedCount) detailed.push(buildingList[i]);
    else simple.push(buildingList[i]);
  }
  
  // المباني المفصلة
  for (var i = 0; i < detailed.length; i++) {
    var b = detailed[i];
    group.add(createDetailedBuilding(b.x, b.z, b.w, b.d, b.h));
  }
  
  // الباقي - InstancedMesh
  if (simple.length > 0) {
    var boxGeo = new THREE.BoxGeometry(1, 1, 1);
    var wallMats = [MAT.plaster, MAT.plasterPink, MAT.plasterYellow, 
                    MAT.plasterBlue, MAT.plasterGreen, MAT.concrete];
    
    for (var c = 0; c < wallMats.length; c++) {
      var filtered = [];
      for (var i = 0; i < simple.length; i++) {
        if (i % wallMats.length === c) filtered.push(simple[i]);
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
  }
  
  scene.add(group);
}

/* ============================================================
   المعالم الحقيقية المفصلة
   ============================================================ */
function createMosque(x, z) {
  var g = new THREE.Group();
  
  // القاعدة
  var base = new THREE.Mesh(new THREE.BoxGeometry(20, 10, 20), MAT.mosqueWall);
  base.position.y = 5;
  g.add(base);
  
  // القبة
  var dome = new THREE.Mesh(
    new THREE.SphereGeometry(6, 20, 14, 0, Math.PI * 2, 0, Math.PI / 2),
    MAT.mosqueDome
  );
  dome.position.y = 10;
  g.add(dome);
  
  // الطبلة تحت القبة
  var drum = new THREE.Mesh(
    new THREE.CylinderGeometry(6, 6, 1.5, 20),
    MAT.mosqueWall
  );
  drum.position.y = 10;
  g.add(drum);
  
  // الرأس الذهبي
  var finial = new THREE.Mesh(new THREE.ConeGeometry(0.8, 3, 8), MAT.mosqueGold);
  finial.position.y = 17;
  g.add(finial);
  
  var ball = new THREE.Mesh(new THREE.SphereGeometry(0.5, 12, 12), MAT.mosqueGold);
  ball.position.y = 15.5;
  g.add(ball);
  
  // مآذن
  for (var s = -1; s <= 1; s += 2) {
    var minaret = new THREE.Mesh(
      new THREE.CylinderGeometry(1, 1, 22, 10),
      MAT.mosqueWall
    );
    minaret.position.set(s * 11, 11, 0);
    g.add(minaret);
    
    // شرفة المأذنة
    var balcony = new THREE.Mesh(
      new THREE.CylinderGeometry(1.4, 1.4, 0.6, 10),
      MAT.mosqueWall
    );
    balcony.position.set(s * 11, 18, 0);
    g.add(balcony);
    
    // قمة المأذنة
    var mTop = new THREE.Mesh(new THREE.ConeGeometry(1.5, 4, 10), MAT.mosqueDome);
    mTop.position.set(s * 11, 24, 0);
    g.add(mTop);
    
    var mFinial = new THREE.Mesh(new THREE.ConeGeometry(0.5, 2, 8), MAT.mosqueGold);
    mFinial.position.set(s * 11, 27, 0);
    g.add(mFinial);
  }
  
  // أبواب
  for (var i = -1; i <= 1; i++) {
    var door = new THREE.Mesh(
      new THREE.BoxGeometry(2.5, 5, 0.4),
      new THREE.MeshLambertMaterial({ color: 0x5a3a1a })
    );
    door.position.set(i * 5, 2.5, 10.1);
    g.add(door);
  }
  
  // نوافذ مقوسة
  for (var i = -2; i <= 2; i++) {
    if (i === 0) continue;
    var win = new THREE.Mesh(new THREE.BoxGeometry(1.8, 3, 0.15), MAT.window);
    win.position.set(i * 3, 6, 10.05);
    g.add(win);
  }
  
  g.position.set(x, 0, z);
  return g;
}

function createStation(x, z) {
  var g = new THREE.Group();
  
  var main = new THREE.Mesh(new THREE.BoxGeometry(32, 9, 14), MAT.stationWall);
  main.position.y = 4.5;
  g.add(main);
  
  var roof = new THREE.Mesh(new THREE.BoxGeometry(34, 0.8, 16), MAT.stationRoof);
  roof.position.y = 9.4;
  g.add(roof);
  
  // برج الساعة
  var tower = new THREE.Mesh(new THREE.BoxGeometry(5, 16, 5), MAT.stationWall);
  tower.position.set(11, 12, 0);
  g.add(tower);
  
  var towerRoof = new THREE.Mesh(new THREE.ConeGeometry(3.5, 4, 4), MAT.stationRoof);
  towerRoof.position.set(11, 22, 0);
  towerRoof.rotation.y = Math.PI / 4;
  g.add(towerRoof);
  
  // الساعة
  var clockFace = new THREE.Mesh(
    new THREE.CircleGeometry(1.8, 24),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  );
  clockFace.position.set(11, 16, 2.55);
  g.add(clockFace);
  
  var clockRing = new THREE.Mesh(
    new THREE.TorusGeometry(1.8, 0.15, 8, 24),
    new THREE.MeshBasicMaterial({ color: 0x333333 })
  );
  clockRing.position.set(11, 16, 2.56);
  g.add(clockRing);
  
  // عقارب
  var hand1 = new THREE.Mesh(
    new THREE.BoxGeometry(0.15, 1.2, 0.05),
    new THREE.MeshBasicMaterial({ color: 0x000000 })
  );
  hand1.position.set(11, 16.6, 2.6);
  g.add(hand1);
  
  var hand2 = new THREE.Mesh(
    new THREE.BoxGeometry(0.9, 0.15, 0.05),
    new THREE.MeshBasicMaterial({ color: 0x000000 })
  );
  hand2.position.set(11.45, 16, 2.6);
  g.add(hand2);
  
  // نوافذ
  for (var i = -12; i <= 12; i += 4) {
    var win = new THREE.Mesh(new THREE.BoxGeometry(2.8, 4, 0.15), MAT.window);
    win.position.set(i, 5, 7.05);
    g.add(win);
    
    var frame = new THREE.Mesh(
      new THREE.BoxGeometry(3.1, 4.3, 0.1),
      MAT.metalDoor
    );
    frame.position.set(i, 5, 7.0);
    g.add(frame);
  }
  
  g.position.set(x, 0, z);
  return g;
}

function createFactory(x, z) {
  var g = new THREE.Group();
  
  var main = new THREE.Mesh(new THREE.BoxGeometry(48, 16, 36), MAT.factoryWall);
  main.position.y = 8;
  g.add(main);
  
  var roof = new THREE.Mesh(
    new THREE.BoxGeometry(49, 0.5, 37),
    new THREE.MeshLambertMaterial({ color: 0x6a6a6a })
  );
  roof.position.y = 16.25;
  g.add(roof);
  
  // 3 مداخن
  for (var i = 0; i < 3; i++) {
    var chimney = new THREE.Mesh(
      new THREE.CylinderGeometry(1.8, 2.2, 32, 12),
      MAT.factoryChimney
    );
    chimney.position.set(-15 + i * 15, 24, -14);
    g.add(chimney);
    
    var band1 = new THREE.Mesh(
      new THREE.CylinderGeometry(1.9, 1.9, 1.5),
      new THREE.MeshLambertMaterial({ color: 0xcc0000 })
    );
    band1.position.set(-15 + i * 15, 32, -14);
    g.add(band1);
    
    var band2 = new THREE.Mesh(
      new THREE.CylinderGeometry(1.9, 1.9, 1.5),
      new THREE.MeshLambertMaterial({ color: 0xcc0000 })
    );
    band2.position.set(-15 + i * 15, 38, -14);
    g.add(band2);
  }
  
  // نوافذ صناعية
  for (var i = 0; i < 12; i++) {
    var w1 = new THREE.Mesh(new THREE.BoxGeometry(2.5, 3, 0.15), MAT.window);
    w1.position.set(-20 + i * 3.7, 5, 18.05);
    g.add(w1);
    
    var w2 = new THREE.Mesh(new THREE.BoxGeometry(2.5, 3, 0.15), MAT.window);
    w2.position.set(-20 + i * 3.7, 11, 18.05);
    g.add(w2);
  }
  
  g.position.set(x, 0, z);
  return g;
}

function createHospital(x, z) {
  var g = new THREE.Group();
  
  var main = new THREE.Mesh(new THREE.BoxGeometry(30, 16, 22), MAT.hospitalWall);
  main.position.y = 8;
  g.add(main);
  
  var tower = new THREE.Mesh(new THREE.BoxGeometry(14, 22, 14), MAT.hospitalWall);
  tower.position.set(-6, 11, 0);
  g.add(tower);
  
  // شريط أحمر
  var stripe = new THREE.Mesh(
    new THREE.BoxGeometry(30.5, 1, 22.5),
    new THREE.MeshLambertMaterial({ color: 0xcc0000 })
  );
  stripe.position.y = 3;
  g.add(stripe);
  
  // الهلال الأحمر
  var crescent = new THREE.Mesh(
    new THREE.TorusGeometry(3, 0.8, 8, 20, Math.PI * 1.6),
    MAT.hospitalRed
  );
  crescent.position.set(8, 12, 11.1);
  crescent.rotation.z = -Math.PI / 2;
  g.add(crescent);
  
  // صليب أحمر
  var crossV = new THREE.Mesh(new THREE.BoxGeometry(1, 4, 0.3), MAT.hospitalRed);
  crossV.position.set(-6, 24, 7.1);
  g.add(crossV);
  
  var crossH = new THREE.Mesh(new THREE.BoxGeometry(4, 1, 0.3), MAT.hospitalRed);
  crossH.position.set(-6, 24, 7.1);
  g.add(crossH);
  
  g.position.set(x, 0, z);
  return g;
}

function createSouk(x, z) {
  var g = new THREE.Group();
  var colors = [0xe74c3c, 0x3498db, 0xf39c12, 0x2ecc71, 0x9b59b6, 0xe67e22, 0x1abc9c];
  
  for (var i = 0; i < 14; i++) {
    var angle = (i / 14) * Math.PI * 2;
    var cx = Math.cos(angle) * 11;
    var cz = Math.sin(angle) * 11;
    
    var stall = new THREE.Mesh(
      new THREE.BoxGeometry(3, 2.5, 3),
      new THREE.MeshLambertMaterial({ color: colors[i % colors.length] })
    );
    stall.position.set(cx, 1.25, cz);
    g.add(stall);
    
    var awning = new THREE.Mesh(
      new THREE.ConeGeometry(2.8, 1.8, 4),
      new THREE.MeshLambertMaterial({ color: 0xf5f5f5 })
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
    new THREE.MeshLambertMaterial({ color: color })
  );
  sign.position.y = 3;
  g.add(sign);
  
  for (var s = -1; s <= 1; s += 2) {
    var pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.1, 4),
      MAT.metalDoor
    );
    pole.position.set(s * 1.5, 2, 0);
    g.add(pole);
  }
  
  var roof = new THREE.Mesh(
    new THREE.BoxGeometry(6, 0.2, 4),
    MAT.metalDoor
  );
  roof.position.y = 4.2;
  g.add(roof);
  
  g.position.set(x, 0, z);
  return g;
}

function createLandmarks() {
  console.log('🏛️ بناء المعالم...');
  var group = new THREE.Group();
  
  group.add(createStation(-230, -80));
  group.add(createMosque(-120, 200));
  group.add(createFactory(380, -280));
  group.add(createHospital(-520, 150));
  group.add(createSouk(100, 180));
  group.add(createBusStop(170, 70, 0xe74c3c));
  group.add(createBusStop(-140, -100, 0xf39c12));
  group.add(createBusStop(380, 100, 0xe67e22));
  group.add(createBusStop(520, -20, 0x2980b9));
  
  scene.add(group);
}

/* ============================================================
   ☕ القهاوي الشعبية المصرية
   ============================================================ */
var cafes = [];

function createCafe(x, z, rotation) {
  var g = new THREE.Group();
  
  // ===== قاعدة القهوة (بلاط) =====
  var base = new THREE.Mesh(
    new THREE.BoxGeometry(10, 0.15, 8),
    new THREE.MeshLambertMaterial({ color: 0x8a7a6a })
  );
  base.position.y = 0.15;
  g.add(base);
  
  // ===== المبنى الأساسي =====
  var wall = new THREE.Mesh(
    new THREE.BoxGeometry(10, 4, 6),
    Utils.pick([MAT.plaster, MAT.plasterYellow, MAT.plasterPink])
  );
  wall.position.set(0, 2, -1);
  g.add(wall);
  
  // سقف المبنى
  var roof = new THREE.Mesh(
    new THREE.BoxGeometry(10.5, 0.3, 6.5),
    MAT.tiles
  );
  roof.position.set(0, 4.15, -1);
  g.add(roof);
  
  // ===== مظلة القهوة =====
  var awningMat = new THREE.MeshLambertMaterial({ color: 0x5a3a1a });
  for (var s = -1; s <= 1; s += 2) {
    var pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.1, 4),
      MAT.woodDoor
    );
    pole.position.set(s * 4.8, 2, 3);
    g.add(pole);
  }
  
  var awning = new THREE.Mesh(
    new THREE.BoxGeometry(10, 0.1, 3),
    awningMat
  );
  awning.position.set(0, 4, 2);
  awning.rotation.x = -0.15;
  g.add(awning);
  
  // ===== الطاولات والكراسي =====
  for (var i = 0; i < 4; i++) {
    var tx = -3 + i * 2;
    var tz = 2.5;
    
    // الطاولة
    var table = new THREE.Mesh(
      new THREE.CylinderGeometry(0.6, 0.6, 0.08, 12),
      MAT.cafeTable
    );
    table.position.set(tx, 0.85, tz);
    g.add(table);
    
    var tableLeg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 0.8, 8),
      MAT.cafeTable
    );
    tableLeg.position.set(tx, 0.4, tz);
    g.add(tableLeg);
    
    // كرسيان
    for (var c = -1; c <= 1; c += 2) {
      var chair = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.08, 0.5),
        MAT.cafeChair
      );
      chair.position.set(tx + c * 0.9, 0.55, tz);
      g.add(chair);
      
      var chairBack = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.7, 0.08),
        MAT.cafeChair
      );
      chairBack.position.set(tx + c * 0.9, 0.9, tz - 0.2);
      g.add(chairBack);
      
      // أرجل الكرسي
      for (var lgx = -1; lgx <= 1; lgx += 2) {
        for (var lgz = -1; lgz <= 1; lgz += 2) {
          var leg = new THREE.Mesh(
            new THREE.BoxGeometry(0.05, 0.5, 0.05),
            MAT.cafeChair
          );
          leg.position.set(
            tx + c * 0.9 + lgx * 0.2,
            0.25,
            tz + lgz * 0.2
          );
          g.add(leg);
        }
      }
    }
    
    // شيشة على الطاولة
    if (Math.random() > 0.3) {
      var shishaBase = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.1, 0.3, 8),
        MAT.cafeShisha
      );
      shishaBase.position.set(tx + 0.3, 1, tz + 0.2);
      g.add(shishaBase);
      
      var shishaPole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03, 0.03, 0.6, 8),
        MAT.cafeShisha
      );
      shishaPole.position.set(tx + 0.3, 1.45, tz + 0.2);
      g.add(shishaPole);
      
      var shishaTop = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.08, 0.08, 8),
        MAT.cafeShishaTop
      );
      shishaTop.position.set(tx + 0.3, 1.75, tz + 0.2);
      g.add(shishaTop);
    }
    
    // كوباية شاي
    if (Math.random() > 0.4) {
      var glass = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.04, 0.15, 8),
        MAT.cafeGlass
      );
      glass.position.set(tx - 0.3, 0.95, tz + 0.1);
      g.add(glass);
    }
  }
  
  // ===== شيشة إضافية أرضية =====
  if (Math.random() > 0.5) {
    var groundShisha = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.15, 0.4, 8),
      MAT.cafeShisha
    );
    groundShisha.position.set(Utils.rand(-4, 4), 0.35, 1);
    g.add(groundShisha);
    
    var pole2 = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 0.8, 8),
      MAT.cafeShisha
    );
    pole2.position.set(groundShisha.position.x, 0.9, 1);
    g.add(pole2);
  }
  
  // ===== لوحة القهوة =====
  var signTex = makeTextTexture(
    Utils.pick(['قهوة الأصدقاء', 'قهوة النصر', 'قهوة الحرية', 'قهوة الترعة', 'قهوة شعبية']),
    '#5a3a1a',
    '#ffcc00',
    512,
    128
  );
  var signMat = new THREE.MeshBasicMaterial({ map: signTex, side: THREE.DoubleSide });
  var sign = new THREE.Mesh(new THREE.PlaneGeometry(6, 1.5), signMat);
  sign.position.set(0, 4.8, 0.1);
  g.add(sign);
  
  // ===== ناس قاعدة على الكراسي =====
  for (var i = 0; i < 3; i++) {
    var person = createSimpleSittingPerson();
    person.position.set(Utils.rand(-3, 3), 0.55, 2.5);
    person.rotation.y = Utils.rand(-0.5, 0.5);
    g.add(person);
  }
  
  g.position.set(x, 0, z);
  g.rotation.y = rotation;
  g.userData = { type: 'cafe' };
  
  return g;
}

// شخص قاعد بسيط للقهوة
function createSimpleSittingPerson() {
  var p = new THREE.Group();
  
  var shirtMat = Utils.pick(MAT.peopleShirt);
  var skinMat = Utils.pick(MAT.peopleSkin);
  var pantsMat = Utils.pick(MAT.peoplePants);
  
  // الجسم
  var torso = new THREE.Mesh(
    new THREE.BoxGeometry(0.42, 0.55, 0.3),
    shirtMat
  );
  torso.position.y = 0.4;
  p.add(torso);
  
  // الرأس
  var head = new THREE.Mesh(
    new THREE.SphereGeometry(0.16, 8, 8),
    skinMat
  );
  head.position.y = 0.85;
  p.add(head);
  
  // كاب أو غطاء رأس (اختياري)
  if (Math.random() > 0.5) {
    var cap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.17, 0.17, 0.06, 8),
      Utils.pick(MAT.peopleShirt)
    );
    cap.position.y = 0.95;
    p.add(cap);
  }
  
  // الرجلين (مقعدين)
  var legs = new THREE.Mesh(
    new THREE.BoxGeometry(0.42, 0.3, 0.5),
    pantsMat
  );
  legs.position.set(0, 0.15, 0.2);
  p.add(legs);
  
  return p;
}

function createCafes() {
  console.log('☕ بناء القهاوي...');
  var group = new THREE.Group();
  
  // قهاوي على شارع أحمد عرابي
  var cafePositions = [
    { x: -80, z: 0, r: Math.PI },
    { x: 80, z: 0, r: Math.PI },
    { x: -160, z: 30, r: 0 },
    { x: 160, z: 30, r: 0 },
    { x: -240, z: 0, r: Math.PI },
    { x: 240, z: 0, r: Math.PI },
  ];
  
  for (var i = 0; i < cafePositions.length; i++) {
    var cp = cafePositions[i];
    var cafe = createCafe(cp.x, cp.z, cp.r);
    group.add(cafe);
    cafes.push(cafe);
  }
  
  scene.add(group);
}

/* ============================================================
   السيارات
   ============================================================ */
var cars = [];

function createCar(x, z, rotation) {
  var car = new THREE.Group();
  var bodyMat = Utils.pick(MAT.carBody);
  
  // الجسم
  var body = new THREE.Mesh(
    new THREE.BoxGeometry(1.8, 0.6, 3.8),
    bodyMat
  );
  body.position.y = 0.5;
  car.add(body);
  
  // الكابينة
  var cabin = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 0.5, 1.8),
    bodyMat
  );
  cabin.position.set(0, 1.05, -0.2);
  car.add(cabin);
  
  // زجاج أمامي
  var windshield = new THREE.Mesh(
    new THREE.BoxGeometry(1.4, 0.4, 0.1),
    MAT.glass
  );
  windshield.position.set(0, 1.05, 0.7);
  car.add(windshield);
  
  // زجاج خلفي
  var rearGlass = new THREE.Mesh(
    new THREE.BoxGeometry(1.4, 0.4, 0.1),
    MAT.glass
  );
  rearGlass.position.set(0, 1.05, -1.1);
  car.add(rearGlass);
  
  // عجلات
  var tireGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.22, 12);
  for (var wx = -1; wx <= 1; wx += 2) {
    for (var wz = -1; wz <= 1; wz += 2) {
      var tire = new THREE.Mesh(tireGeo, MAT.carTire);
      tire.rotation.z = Math.PI / 2;
      tire.position.set(wx * 0.9, 0.32, wz * 1.2);
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
    
    // نضعهم على جانب الشارع
    var sideOffset = (Math.random() > 0.5 ? 1 : -1) * (rd.width / 4);
    var dx = Math.cos(rd.rotation) * sideOffset;
    var dz = -Math.sin(rd.rotation) * sideOffset;
    
    var car = createCar(x + dx, z + dz, rd.rotation + (Math.random() > 0.5 ? 0 : Math.PI));
    car.userData = {
      road: rd,
      offset: off,
      sideOffset: sideOffset,
      speed: Utils.rand(3, 6),
      direction: Math.random() > 0.5 ? 1 : -1,
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
   الناس الواقعية
   ============================================================ */
var people = [];

function createPerson(x, z, type) {
  var p = new THREE.Group();
  type = type || 'walker';
  
  var shirtMat = Utils.pick(MAT.peopleShirt);
  var pantsMat = Utils.pick(MAT.peoplePants);
  var skinMat = Utils.pick(MAT.peopleSkin);
  var hairMat = Utils.pick(MAT.peopleHair);
  
  // ===== الجسم (قميص) =====
  var torso = new THREE.Mesh(
    new THREE.BoxGeometry(0.42, 0.65, 0.26),
    shirtMat
  );
  torso.position.y = 1.08;
  p.add(torso);
  
  // ===== الرقبة =====
  var neck = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.08, 0.1),
    skinMat
  );
  neck.position.y = 1.43;
  p.add(neck);
  
  // ===== الرأس =====
  var head = new THREE.Mesh(
    new THREE.SphereGeometry(0.17, 10, 10),
    skinMat
  );
  head.position.y = 1.62;
  p.add(head);
  
  // ===== العينان =====
  var eyeMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
  for (var s = -1; s <= 1; s += 2) {
    var eye = new THREE.Mesh(
      new THREE.SphereGeometry(0.025, 6, 6),
      eyeMat
    );
    eye.position.set(s * 0.06, 1.65, 0.15);
    p.add(eye);
  }
  
  // ===== الشعر =====
  var hair = new THREE.Mesh(
    new THREE.SphereGeometry(0.18, 10, 10, 0, Math.PI * 2, 0, Math.PI / 2),
    hairMat
  );
  hair.position.y = 1.65;
  p.add(hair);
  
  // ===== الأرجل =====
  var legs = new THREE.Mesh(
    new THREE.BoxGeometry(0.42, 0.8, 0.26),
    pantsMat
  );
  legs.position.y = 0.35;
  p.add(legs);
  
  // ===== الحذاء =====
  var shoes = new THREE.Mesh(
    new THREE.BoxGeometry(0.44, 0.08, 0.32),
    new THREE.MeshLambertMaterial({ color: 0x1a1a1a })
  );
  shoes.position.y = -0.03;
  p.add(shoes);
  
  // ===== الذراعين =====
  var armGeo = new THREE.BoxGeometry(0.12, 0.58, 0.12);
  var armL = new THREE.Mesh(armGeo, shirtMat);
  armL.position.set(-0.27, 1.08, 0);
  p.add(armL);
  
  var armR = new THREE.Mesh(armGeo, shirtMat);
  armR.position.set(0.27, 1.08, 0);
  p.add(armR);
  
  // ===== الأيدي =====
  var handGeo = new THREE.SphereGeometry(0.07, 6, 6);
  var handL = new THREE.Mesh(handGeo, skinMat);
  handL.position.set(-0.27, 0.78, 0);
  p.add(handL);
  
  var handR = new THREE.Mesh(handGeo, skinMat);
  handR.position.set(0.27, 0.78, 0);
  p.add(handR);
  
  p.position.set(x, 0, z);
  p.rotation.y = Utils.rand(0, Math.PI * 2);
  p.userData = {
    type: type,
    direction: Utils.rand(0, Math.PI * 2),
    speed: type === 'walker' ? Utils.rand(0.8, 1.8) : 0,
    walkPhase: Math.random() * Math.PI * 2,
    armL: armL,
    armR: armR,
    handL: handL,
    handR: handR,
    homeX: x,
    homeZ: z,
    wanderTimer: Utils.rand(1, 3),
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
    
    // نوع الشخص
    var type = Math.random() > 0.3 ? 'walker' : 'stander';
    
    var person = createPerson(x, z, type);
    group.add(person);
    people.push(person);
  }
  
  scene.add(group);
}

function updatePeople(dt) {
  for (var i = 0; i < people.length; i++) {
    var p = people[i];
    var ud = p.userData;
    
    if (ud.type === 'walker') {
      // حركة المشي
      ud.walkPhase += dt * 5;
      p.position.y = Math.abs(Math.sin(ud.walkPhase)) * 0.05;
      
      // تغيير الاتجاه عشوائياً
      ud.wanderTimer -= dt;
      if (ud.wanderTimer <= 0) {
        ud.direction += Utils.rand(-0.8, 0.8);
        ud.wanderTimer = Utils.rand(1, 3);
      }
      
      // الرجوع للمنزل إذا بعد كتير
      var dx = ud.homeX - p.position.x;
      var dz = ud.homeZ - p.position.z;
      var distFromHome = Math.hypot(dx, dz);
      if (distFromHome > 10) {
        ud.direction = Math.atan2(dz, dx);
      }
      
      // الحركة
      p.position.x += Math.cos(ud.direction) * ud.speed * dt;
      p.position.z += Math.sin(ud.direction) * ud.speed * dt;
      p.rotation.y = -ud.direction + Math.PI / 2;
      
      // حركة الذراعين
      if (ud.armL) ud.armL.rotation.x = Math.sin(ud.walkPhase) * 0.6;
      if (ud.armR) ud.armR.rotation.x = -Math.sin(ud.walkPhase) * 0.6;
    } else {
      // واقف - حركة خفيفة
      ud.walkPhase += dt * 2;
      p.position.y = Math.sin(ud.walkPhase) * 0.02;
      
      // يلف راسه أحياناً
      if (Math.random() > 0.99) {
        p.rotation.y += Utils.rand(-0.5, 0.5);
      }
    }
  }
}

/* ============================================================
   🛺 التوك توك - 50+ قطعة
   ============================================================ */
function createTukTuk() {
  var t = new THREE.Group();
  t.name = 'tukTuk';
  
  // ===== الهيكل السفلي =====
  var chassis = new THREE.Mesh(
    new THREE.BoxGeometry(1.3, 0.12, 2.4),
    MAT.black
  );
  chassis.position.y = 0.42;
  t.add(chassis);
  
  var floorF = new THREE.Mesh(
    new THREE.BoxGeometry(1.25, 0.08, 1.0),
    MAT.black
  );
  floorF.position.set(0, 0.52, 0.65);
  t.add(floorF);
  
  var floorR = new THREE.Mesh(
    new THREE.BoxGeometry(1.25, 0.08, 1.3),
    MAT.black
  );
  floorR.position.set(0, 0.52, -0.6);
  t.add(floorR);
  
  // ===== المقدمة =====
  var frontPanel = new THREE.Mesh(
    new THREE.BoxGeometry(1.28, 0.85, 0.15),
    MAT.yellow
  );
  frontPanel.position.set(0, 0.95, 1.15);
  t.add(frontPanel);
  
  var frontCabin = new THREE.Mesh(
    new THREE.BoxGeometry(1.28, 0.85, 1.0),
    MAT.yellow
  );
  frontCabin.position.set(0, 0.95, 0.6);
  t.add(frontCabin);
  
  // غطاء المقدمة
  var hood = new THREE.Mesh(
    new THREE.BoxGeometry(1.28, 0.08, 0.5),
    MAT.yellowDark
  );
  hood.position.set(0, 1.4, 1.0);
  hood.rotation.x = -0.08;
  t.add(hood);
  
  // رفرف أمامي
  var fender = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.25, 1.1),
    MAT.yellow
  );
  fender.position.set(0, 0.72, 1.05);
  t.add(fender);
  
  // ===== الكابينة الخلفية =====
  var rearCabin = new THREE.Mesh(
    new THREE.BoxGeometry(1.32, 1.5, 1.4),
    MAT.yellow
  );
  rearCabin.position.set(0, 1.25, -0.6);
  t.add(rearCabin);
  
  // خط أسود فاصل
  var stripe = new THREE.Mesh(
    new THREE.BoxGeometry(1.34, 0.08, 1.42),
    MAT.black
  );
  stripe.position.set(0, 1.35, -0.6);
  t.add(stripe);
  
  // ===== السقف =====
  var roof = new THREE.Mesh(
    new THREE.BoxGeometry(1.42, 0.1, 2.5),
    MAT.black
  );
  roof.position.set(0, 2.1, 0);
  t.add(roof);
  
  // حافة السقف (كروم)
  var roofTrim = new THREE.Mesh(
    new THREE.BoxGeometry(1.44, 0.04, 2.52),
    MAT.chrome
  );
  roofTrim.position.set(0, 2.04, 0);
  t.add(roofTrim);
  
  // ===== أعمدة السقف =====
  var pillarGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.75, 6);
  var pillarPos = [
    [-0.62, 1.2, -1.2], [0.62, 1.2, -1.2],
    [-0.62, 1.2, -0.05], [0.62, 1.2, -0.05],
    [-0.62, 1.2, 1.05], [0.62, 1.2, 1.05],
  ];
  for (var i = 0; i < pillarPos.length; i++) {
    var p = new THREE.Mesh(pillarGeo, MAT.black);
    p.position.set(pillarPos[i][0], pillarPos[i][1], pillarPos[i][2]);
    t.add(p);
  }
  
  // ===== الزجاج =====
  // الزجاج الأمامي
  var windshield = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 0.85, 0.04),
    MAT.glassTint
  );
  windshield.position.set(0, 1.85, 1.1);
  windshield.rotation.x = -0.1;
  t.add(windshield);
  
  // الزجاج الجانبي الأمامي
  for (var s = -1; s <= 1; s += 2) {
    var sg = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 0.8, 0.9),
      MAT.glassTint
    );
    sg.position.set(s * 0.64, 1.8, 0.6);
    t.add(sg);
  }
  
  // الزجاج الجانبي الخلفي
  for (var s = -1; s <= 1; s += 2) {
    var rg = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 0.95, 1.2),
      MAT.glassTint
    );
    rg.position.set(s * 0.66, 1.7, -0.6);
    t.add(rg);
  }
  
  // الزجاج الخلفي
  var rearGlass = new THREE.Mesh(
    new THREE.BoxGeometry(1.28, 1, 0.04),
    MAT.glassTint
  );
  rearGlass.position.set(0, 1.7, -1.28);
  t.add(rearGlass);
  
  // ===== الشبكة الأمامية =====
  var grillFrame = new THREE.Mesh(
    new THREE.BoxGeometry(0.9, 0.35, 0.06),
    MAT.chrome
  );
  grillFrame.position.set(0, 0.95, 1.19);
  t.add(grillFrame);
  
  for (var i = 0; i < 5; i++) {
    var slat = new THREE.Mesh(
      new THREE.BoxGeometry(0.85, 0.04, 0.04),
      MAT.black
    );
    slat.position.set(0, 0.82 + i * 0.06, 1.22);
    t.add(slat);
  }
  
  // ===== المصابيح الأمامية =====
  var headlightGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.1, 16);
  for (var s = -1; s <= 1; s += 2) {
    // الإطار
    var hlFrame = new THREE.Mesh(headlightGeo, MAT.chrome);
    hlFrame.rotation.x = Math.PI / 2;
    hlFrame.position.set(s * 0.44, 1.15, 1.18);
    t.add(hlFrame);
    
    // الزجاج
    var hlGlass = new THREE.Mesh(headlightGeo, MAT.headlight);
    hlGlass.rotation.x = Math.PI / 2;
    hlGlass.position.set(s * 0.44, 1.15, 1.21);
    t.add(hlGlass);
  }
  
  // ===== الفوانيس الخلفية =====
  var taillightGeo = new THREE.BoxGeometry(0.12, 0.22, 0.05);
  for (var s = -1; s <= 1; s += 2) {
    var tl = new THREE.Mesh(taillightGeo, MAT.taillight);
    tl.position.set(s * 0.48, 0.9, -1.31);
    t.add(tl);
  }
  
  // ===== لوحة الأرقام =====
  var plateMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
  var plate = new THREE.Mesh(
    new THREE.BoxGeometry(0.55, 0.16, 0.03),
    plateMat
  );
  plate.position.set(0, 0.68, -1.32);
  t.add(plate);
  
  var frontPlate = new THREE.Mesh(
    new THREE.BoxGeometry(0.55, 0.16, 0.03),
    plateMat
  );
  frontPlate.position.set(0, 0.68, 1.22);
  frontPlate.rotation.y = Math.PI;
  t.add(frontPlate);
  
  // ===== المقود =====
  var steerGroup = new THREE.Group();
  
  var steerRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.15, 0.02, 8, 20),
    MAT.black
  );
  steerGroup.add(steerRing);
  
  for (var i = 0; i < 3; i++) {
    var spoke = new THREE.Mesh(
      new THREE.BoxGeometry(0.025, 0.14, 0.015),
      MAT.black
    );
    spoke.rotation.z = (i / 3) * Math.PI * 2;
    steerGroup.add(spoke);
  }
  
  var hub = new THREE.Mesh(
    new THREE.CylinderGeometry(0.045, 0.045, 0.04, 10),
    MAT.black
  );
  hub.rotation.x = Math.PI / 2;
  steerGroup.add(hub);
  
  var column = new THREE.Mesh(
    new THREE.CylinderGeometry(0.025, 0.025, 0.35, 8),
    MAT.black
  );
  column.rotation.x = -0.55;
  column.position.set(0, -0.14, 0.12);
  steerGroup.add(column);
  
  steerGroup.position.set(0, 1.5, 0.8);
  steerGroup.rotation.x = -0.35;
  t.add(steerGroup);
  
  // ===== لوحة القيادة =====
  var dash = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 0.2, 0.3),
    MAT.black
  );
  dash.position.set(0, 1.3, 0.95);
  t.add(dash);
  
  // العدادات
  var gaugeMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
  var gaugeGeo = new THREE.CircleGeometry(0.06, 16);
  for (var i = 0; i < 3; i++) {
    var gauge = new THREE.Mesh(gaugeGeo, gaugeMat);
    gauge.position.set(-0.3 + i * 0.3, 1.35, 1.11);
    t.add(gauge);
  }
  
  // ===== المرايا الجانبية =====
  for (var s = -1; s <= 1; s += 2) {
    var mirrorStem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.015, 0.015, 0.25),
      MAT.black
    );
    mirrorStem.rotation.z = s * Math.PI / 3;
    mirrorStem.position.set(s * 0.75, 1.9, 1.0);
    t.add(mirrorStem);
    
    var mirrorCase = new THREE.Mesh(
      new THREE.BoxGeometry(0.14, 0.1, 0.03),
      MAT.metalDoor
    );
    mirrorCase.position.set(s * 0.85, 1.95, 1.0);
    t.add(mirrorCase);
    
    var mirrorGlass = new THREE.Mesh(
      new THREE.BoxGeometry(0.11, 0.08, 0.01),
      MAT.chrome
    );
    mirrorGlass.position.set(s * 0.85, 1.95, 1.02);
    t.add(mirrorGlass);
  }
  
  // ===== المقاعد =====
  var seatMat = new THREE.MeshLambertMaterial({ color: 0x2a2a2a });
  
  // مقعد السائق
  var seatDriver = new THREE.Mesh(
    new THREE.BoxGeometry(0.55, 0.12, 0.5),
    seatMat
  );
  seatDriver.position.set(0, 0.8, 0.4);
  t.add(seatDriver);
  
  var backDriver = new THREE.Mesh(
    new THREE.BoxGeometry(0.55, 0.55, 0.08),
    seatMat
  );
  backDriver.position.set(0, 1.12, 0.16);
  t.add(backDriver);
  
  // المقعد الخلفي
  var rearSeat = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 0.12, 0.55),
    seatMat
  );
  rearSeat.position.set(0, 0.8, -0.75);
  t.add(rearSeat);
  
  var rearBack = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 0.65, 0.08),
    seatMat
  );
  rearBack.position.set(0, 1.18, -1.05);
  t.add(rearBack);
  
  // ===== العجلات (3 عجلات) =====
  var wheels = [];
  
  function makeWheel(x, z, isFront) {
    var wg = new THREE.Group();
    wg.userData.isFront = isFront;
    
    // الإطار
    var tire = new THREE.Mesh(
      new THREE.TorusGeometry(0.26, 0.11, 12, 20),
      MAT.carTire
    );
    tire.rotation.y = Math.PI / 2;
    wg.add(tire);
    
    // الجنط
    var rim = new THREE.Mesh(
      new THREE.CylinderGeometry(0.17, 0.17, 0.13, 12),
      MAT.chrome
    );
    rim.rotation.z = Math.PI / 2;
    wg.add(rim);
    
    // براغي
    for (var i = 0; i < 5; i++) {
      var bolt = new THREE.Mesh(
        new THREE.SphereGeometry(0.025, 6, 6),
        MAT.black
      );
      var angle = (i / 5) * Math.PI * 2;
      bolt.position.set(0, Math.cos(angle) * 0.08, Math.sin(angle) * 0.08);
      wg.add(bolt);
    }
    
    // غطاء المركز
    var centerCap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 0.15, 12),
      MAT.chrome
    );
    centerCap.rotation.z = Math.PI / 2;
    wg.add(centerCap);
    
    wg.position.set(x, 0.26, z);
    t.add(wg);
    wheels.push(wg);
    return wg;
  }
  
  var frontWheel = makeWheel(0, 1.1, true);
  makeWheel(-0.6, -0.75, false);
  makeWheel(0.6, -0.75, false);
  
  // ===== إضاءة أمامية فعلية =====
  var headlight = new THREE.SpotLight(0xfff5cc, 2.5, 30, Math.PI / 5, 0.5, 1.5);
  headlight.position.set(0, 1.15, 1.15);
  headlight.target.position.set(0, 0.3, 15);
  t.add(headlight);
  t.add(headlight.target);
  
  // ===== التخزين =====
  t.userData = {
    wheels: wheels,
    frontWheel: frontWheel,
    steeringWheel: steerGroup,
    headlight: headlight,
  };
  
  return t;
}

// إنشاء التوك توك
var tukTuk = createTukTuk();
tukTuk.position.set(0, 0, 150);
scene.add(tukTuk);

/* ============================================================
   ⚠️ سيتم استكمال باقي الدوال في الرد الجاي
   ============================================================ */

// تحديث المراجع في كائن اللعبة
window._GAME.tukTuk = tukTuk;
window._GAME.cars = cars;
window._GAME.people = people;
window._GAME.cafes = cafes;
window._GAME.createCafe = createCafe;
window._GAME.createBuildings = createBuildings;
window._GAME.createLandmarks = createLandmarks;
window._GAME.createCafes = createCafes;
window._GAME.createCars = createCars;
window._GAME.createPeople = createPeople;
window._GAME.createPerson = createPerson;
window._GAME.createTukTuk = createTukTuk;
window._GAME.updateCars = updateCars;
window._GAME.updatePeople = updatePeople;
window._GAME.isOnRoad = isOnRoad;
window._GAME.isNearLandmark = isNearLandmark;

console.log('✅ الجزء 2 من game.js جاهز - التوك توك والناس والقهاوي');

})();
