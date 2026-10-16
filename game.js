/* ============================================================
   🛺 توك توك كفر الدوار مع مشرط - النسخة الاحترافية الكاملة
   ============================================================ */

console.log('🚀 بدء تحميل لعبة توك توك كفر الدوار...');

if (typeof THREE === 'undefined') {
  alert('فشل تحميل Three.js. تأكد من الاتصال بالإنترنت.');
  throw new Error('Three.js not loaded');
}

console.log('✅ Three.js loaded (v' + THREE.REVISION + ')');

/* ============================================================
   كشف الجهاز + إعدادات الجودة للموبايل
   ============================================================ */
var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  || (navigator.maxTouchPoints && navigator.maxTouchPoints > 2);
var isLowEnd = isMobile && (navigator.hardwareConcurrency || 2) <= 4;

console.log('📱 الجهاز:', isMobile ? (isLowEnd ? 'موبايل ضعيف' : 'موبايل') : 'كمبيوتر');

var QUALITY = {
  pixelRatio: isLowEnd ? 0.75 : (isMobile ? 0.9 : 1.4),
  fogFar: isLowEnd ? 280 : (isMobile ? 450 : 700),
  treeCount: isLowEnd ? 15 : (isMobile ? 35 : 70),
  buildingDensity: isLowEnd ? 0.35 : (isMobile ? 0.5 : 0.7),
  peopleCount: isLowEnd ? 12 : (isMobile ? 25 : 45),
  carsCount: isLowEnd ? 3 : (isMobile ? 7 : 12),
  maxBuildings: isLowEnd ? 150 : (isMobile ? 280 : 450),
  detailedBuildings: isLowEnd ? 30 : (isMobile ? 70 : 130)
};

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
  maxPassengers: 4
};

var COLORS = {
  sky: 0x87CEEB,
  ground: 0x6a8a4a,
  road: 0x2a2a2a,
  sidewalk: 0xb0a890,
  canal: 0x2a6a9a
};

/* ============================================================
   المشهد والكاميرا
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
  alpha: false
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, QUALITY.pixelRatio));
renderer.shadowMap.enabled = false;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;

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
   كلام مشرط المصري الشعبي
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
    'يسطا في لجنة قدام خد بالك',
    'الإشارة حمرا، استنى شوي',
    'الترعة على شمالنا يسطا',
    'هنا سوق الأربعاء، الدنيا زحمة',
    'في مطب قدام يسطا، اقفش',
    'الراجل ده مشي قدامي فجأة',
    'كفر الدوار دي بلدي يا معلم',
    'الحق عليّا يسطا، مشرط بيجيبها في الوقت',
    'قربنا نوصل يا باشا',
    'عدينا على مسجد الثورة',
    'ده شارع بورسعيد يسطا',
    'خد بالك من التوكتوك اللي جاي',
    'معلش يسطا، أصل الزحمة كتير',
    'ربنا يكرمك يا معلم',
    'الحمد لله على كل حال',
    'مشرط هنا، كل حاجة تحت السيطرة',
    'استعد يا باشا، هنلف حالاً',
    'على فكرة، عماد هارون صاحبي',
    'البيضا دي بلدي، متربي فيها'
  ],
  arrived: [
    'وصلنا يا باشا، اتفضل',
    'الحمد لله، مشرط بيجيبها في الوقت',
    'أيوه كده، المكان ده هو',
    'يلا يا معلم، نوّرت',
    'وصلنا بألف سلامة يسطا',
    'دي الحساب يا باشا، ربنا يكرمك'
  ],
  police: [
    '🛑 لجنة يا معلم، هدّي شوية',
    '🛑 واقفين في اللجنة، خد بالك',
    '🛑 ظابط بيشاورلنا، هدّي'
  ],
  idle: [
    'مشرط قاعد على قهوة عماد هارون',
    'قهوة عماد هارون دي أحلى قهوة في البيضا',
    'يلا ناخد شيشة قبل الشغل',
    'عماد هارون صاحبي من زمان',
    'البيضا دي بلدي، وفيها كل حاجة حلوة'
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
    this.audio.volume = 0.4;
    this.audio.loop = false;
    var self = this;
    this.audio.addEventListener('ended', function() { self.next(); });
  },
  play: function() {
    if (!this.audio) this.init();
    if (!this.audio) return;
    var track = RADIO_TRACKS[this.currentTrack];
    this.audio.src = track.file;
    this.audio.volume = 0.4;
    var self = this;
    var promise = this.audio.play();
    if (promise) {
      promise.then(function() {
        console.log('🎵 الراديو شغال: ' + track.name);
      }).catch(function(e) {
        console.warn('⚠️ الراديو محتاج تفاعل:', e.message);
        self.isPlaying = false;
        if (UI.radioToggle) UI.radioToggle.textContent = '▶️';
      });
    }
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
  ground: new THREE.MeshLambertMaterial({ color: COLORS.ground }),
  road: new THREE.MeshLambertMaterial({ color: COLORS.road }),
  roadLine: new THREE.MeshBasicMaterial({ color: 0xffcc00 }),
  sidewalk: new THREE.MeshLambertMaterial({ color: COLORS.sidewalk }),
  sidewalkCurb: new THREE.MeshLambertMaterial({ color: 0x808080 }),
  canal: new THREE.MeshLambertMaterial({ color: COLORS.canal }),
  canalBank: new THREE.MeshLambertMaterial({ color: 0x8b7355 }),
  bridge: new THREE.MeshLambertMaterial({ color: 0x666666 }),
  
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
  
  shopAwning: [
    new THREE.MeshLambertMaterial({ color: 0xe74c3c }),
    new THREE.MeshLambertMaterial({ color: 0x3498db }),
    new THREE.MeshLambertMaterial({ color: 0x2ecc71 }),
    new THREE.MeshLambertMaterial({ color: 0xf39c12 }),
    new THREE.MeshLambertMaterial({ color: 0x9b59b6 }),
    new THREE.MeshLambertMaterial({ color: 0x1abc9c })
  ],
  
  treeTrunk: new THREE.MeshLambertMaterial({ color: 0x5a3a20 }),
  treeLeaf: new THREE.MeshLambertMaterial({ color: 0x3a7a3a }),
  treeLeafDark: new THREE.MeshLambertMaterial({ color: 0x2a5a2a }),
  palmTrunk: new THREE.MeshLambertMaterial({ color: 0x8b6a3a }),
  palmLeaf: new THREE.MeshLambertMaterial({ color: 0x3a8a3a, side: THREE.DoubleSide }),
  
  carBody: [
    new THREE.MeshLambertMaterial({ color: 0xcc3333 }),
    new THREE.MeshLambertMaterial({ color: 0x3366cc }),
    new THREE.MeshLambertMaterial({ color: 0xcccccc }),
    new THREE.MeshLambertMaterial({ color: 0x333333 }),
    new THREE.MeshLambertMaterial({ color: 0xf39c12 }),
    new THREE.MeshLambertMaterial({ color: 0x1abc9c })
  ],
  carTire: new THREE.MeshLambertMaterial({ color: 0x1a1a1a }),
  
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
    new THREE.MeshLambertMaterial({ color: 0xffd700 })
  ],
  peoplePants: [
    new THREE.MeshLambertMaterial({ color: 0x2c3e50 }),
    new THREE.MeshLambertMaterial({ color: 0x1a1a1a }),
    new THREE.MeshLambertMaterial({ color: 0x34495e }),
    new THREE.MeshLambertMaterial({ color: 0x4a4a4a }),
    new THREE.MeshLambertMaterial({ color: 0x5a3a2a })
  ],
  peopleSkin: [
    new THREE.MeshLambertMaterial({ color: 0xf5d5b0 }),
    new THREE.MeshLambertMaterial({ color: 0xe0b890 }),
    new THREE.MeshLambertMaterial({ color: 0xc89870 }),
    new THREE.MeshLambertMaterial({ color: 0xa87850 }),
    new THREE.MeshLambertMaterial({ color: 0x8d5524 })
  ],
  peopleHair: [
    new THREE.MeshLambertMaterial({ color: 0x1a1a1a }),
    new THREE.MeshLambertMaterial({ color: 0x3a2a1a }),
    new THREE.MeshLambertMaterial({ color: 0x5a4a3a }),
    new THREE.MeshLambertMaterial({ color: 0x808080 })
  ],
  
  mosqueWall: new THREE.MeshLambertMaterial({ color: 0xf0e8d0 }),
  mosqueDome: new THREE.MeshLambertMaterial({ color: 0x16a085 }),
  mosqueGold: new THREE.MeshLambertMaterial({ color: 0xffcc00 }),
  stationWall: new THREE.MeshLambertMaterial({ color: 0xe8dcc0 }),
  stationRoof: new THREE.MeshLambertMaterial({ color: 0x8b4513 }),
  factoryWall: new THREE.MeshLambertMaterial({ color: 0x95a5a6 }),
  factoryChimney: new THREE.MeshLambertMaterial({ color: 0x7f8c8d }),
  hospitalWall: new THREE.MeshLambertMaterial({ color: 0xf5f5f5 }),
  hospitalRed: new THREE.MeshBasicMaterial({ color: 0xcc0000 }),
  
  black: new THREE.MeshLambertMaterial({ color: 0x0a0a0a }),
  yellow: new THREE.MeshLambertMaterial({ color: 0xffc800 }),
  yellowDark: new THREE.MeshLambertMaterial({ color: 0xe6a800 }),
  chrome: new THREE.MeshLambertMaterial({ color: 0xcccccc }),
  glassTint: new THREE.MeshLambertMaterial({ color: 0xaaddff, transparent: true, opacity: 0.4 }),
  headlight: new THREE.MeshBasicMaterial({ color: 0xffffcc }),
  taillight: new THREE.MeshBasicMaterial({ color: 0xff2222 }),
  
  trafficPole: new THREE.MeshLambertMaterial({ color: 0x333333 }),
  trafficRed: new THREE.MeshBasicMaterial({ color: 0xff0000 }),
  trafficYellow: new THREE.MeshBasicMaterial({ color: 0xffcc00 }),
  trafficGreen: new THREE.MeshBasicMaterial({ color: 0x00ff00 }),
  trafficOff: new THREE.MeshLambertMaterial({ color: 0x333333 }),
  
  policeShirt: new THREE.MeshLambertMaterial({ color: 0x1a1a3a }),
  policePants: new THREE.MeshLambertMaterial({ color: 0x1a1a1a }),
  policeCap: new THREE.MeshLambertMaterial({ color: 0x1a1a3a }),
  policeBadge: new THREE.MeshBasicMaterial({ color: 0xffcc00 }),
  
  cafeTable: new THREE.MeshLambertMaterial({ color: 0x8b6a3a }),
  cafeChair: new THREE.MeshLambertMaterial({ color: 0x5a3a1a }),
  cafeShisha: new THREE.MeshLambertMaterial({ color: 0xc8a878 }),
  cafeShishaTop: new THREE.MeshLambertMaterial({ color: 0x8b6a3a }),
  cafeGlass: new THREE.MeshLambertMaterial({ color: 0xf0e8d0, transparent: true, opacity: 0.7 }),
  cafeAwning: new THREE.MeshLambertMaterial({ color: 0xd4a574 })
};

/* ============================================================
   نصوص Canvas
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
  
  var grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, bgColor);
  grad.addColorStop(1, '#000');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
  
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 8;
  ctx.strokeRect(8, 8, w - 16, h - 16);
  
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
   الشوارع الحقيقية
   ============================================================ */
var ROADS_DATA = [
  { name: 'شارع أحمد عرابي', x: 0, z: -15, width: 22, length: 1300, rotation: 0, isMain: true, signColor: '#1a5a9a' },
  { name: 'شارع بورسعيد', x: 0, z: 30, width: 18, length: 1300, rotation: 0, signColor: '#8b1a1a' },
  { name: 'شارع الجيش', x: 280, z: 120, width: 18, length: 650, rotation: Math.PI / 2, signColor: '#1a8a3a' },
  { name: 'شارع الجمهورية', x: -320, z: 0, width: 16, length: 600, rotation: Math.PI / 2, signColor: '#8a1a8a' },
  { name: 'شارع جلال الدسوقي', x: -100, z: 380, width: 15, length: 500, rotation: Math.PI / 2, signColor: '#8a6a1a' },
  { name: 'شارع سيدي عبد القادر', x: -520, z: 120, width: 16, length: 450, rotation: Math.PI / 2, signColor: '#1a8a8a' },
  { name: 'شارع الحدائق', x: 120, z: 330, width: 14, length: 450, rotation: Math.PI / 2, signColor: '#3a8a1a' },
  { name: 'شارع المحور', x: 480, z: 280, width: 14, length: 450, rotation: Math.PI / 2, signColor: '#8a3a1a' },
  { name: 'شارع الجلاء', x: -420, z: -240, width: 14, length: 500, rotation: 0, signColor: '#1a3a8a' },
  { name: 'شارع النصر', x: 380, z: -240, width: 14, length: 500, rotation: 0, signColor: '#8a1a1a' },
  { name: 'شارع المحكمة', x: -240, z: -280, width: 13, length: 400, rotation: Math.PI / 2, signColor: '#5a5a5a' },
  { name: 'شارع الموقف', x: 650, z: 0, width: 13, length: 500, rotation: Math.PI / 2, signColor: '#8a5a1a' },
  { name: 'شارع سعد زغلول', x: -650, z: -100, width: 13, length: 400, rotation: Math.PI / 2, signColor: '#6a3a8a' },
  { name: 'شارع التحرير', x: 250, z: 500, width: 13, length: 400, rotation: 0, signColor: '#3a6a8a' }
];

/* ============================================================
   الوجهات
   ============================================================ */
var DESTINATIONS_DATA = [
  { name: 'محطة قطار كفر الدوار', x: -230, z: -80, color: 0x8b4513 },
  { name: 'مسجد الثورة', x: -120, z: 200, color: 0x16a085 },
  { name: 'شركة مصر للغزل والنسيج', x: 380, z: -280, color: 0x95a5a6 },
  { name: 'موقف عزيز المصري', x: 170, z: 70, color: 0xe74c3c },
  { name: 'مجمع الميزانة', x: -140, z: -100, color: 0xf39c12 },
  { name: 'مجمع السعرانية', x: 380, z: 100, color: 0xe67e22 },
  { name: 'مستشفى كفر الدوار العام', x: -520, z: 150, color: 0x3498db },
  { name: 'سوق الأربعاء', x: 100, z: 180, color: 0x9b59b6 },
  { name: 'كورنيش ترعة المحمودية', x: 520, z: -20, color: 0x2980b9 },
  { name: 'جامعة كفر الدوار', x: -420, z: -280, color: 0x8e44ad },
  { name: 'مدرسة صلاح سالم', x: -260, z: 340, color: 0xf39c12 },
  { name: 'شارع الجيش التجاري', x: 300, z: 200, color: 0xe74c3c }
];

/* ============================================================
   نظام الأصوات
   ============================================================ */
var AudioSystem = {
  ctx: null,
  engineOsc: null,
  engineGain: null,
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
      this.engineOsc = null;
      this.engineGain = null;
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
      o.connect(g);
      g.connect(this.ctx.destination);
      o.start();
      o.stop(this.ctx.currentTime + dur);
    } catch (e) {}
  }
};

console.log('✅ الجزء 1 تم تحميله - الإعدادات والمواد والشوارع');

/* ============================================================
   الأرضية والترعة
   ============================================================ */
function createGround() {
  var ground = new THREE.Mesh(new THREE.PlaneGeometry(4000, 4000), MAT.ground);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.05;
  scene.add(ground);
}

var canalRef = null;
function createCanal() {
  var group = new THREE.Group();
  group.name = 'canal';
  
  var water = new THREE.Mesh(
    new THREE.PlaneGeometry(CONFIG.citySize * 1.5, CONFIG.canalWidth),
    MAT.canal
  );
  water.rotation.x = -Math.PI / 2;
  water.position.y = -0.35;
  group.add(water);
  
  for (var s = -1; s <= 1; s += 2) {
    var bank = new THREE.Mesh(
      new THREE.BoxGeometry(CONFIG.citySize * 1.5, 1.5, 3),
      MAT.canalBank
    );
    bank.position.set(0, 0.6, s * (CONFIG.canalWidth / 2 + 1.5));
    group.add(bank);
    
    var rail = new THREE.Mesh(
      new THREE.BoxGeometry(CONFIG.citySize * 1.5, 0.8, 0.15),
      MAT.chrome
    );
    rail.position.set(0, 2.0, s * (CONFIG.canalWidth / 2 + 3));
    group.add(rail);
  }
  
  var bridge = new THREE.Mesh(
    new THREE.BoxGeometry(26, 2.5, CONFIG.canalWidth + 16),
    MAT.bridge
  );
  bridge.position.set(0, 1.5, 0);
  group.add(bridge);
  
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

function createRoads() {
  var group = new THREE.Group();
  group.name = 'roads';
  
  for (var i = 0; i < ROADS_DATA.length; i++) {
    var rd = ROADS_DATA[i];
    
    var road = new THREE.Mesh(
      new THREE.BoxGeometry(rd.width, 0.15, rd.length),
      MAT.road
    );
    road.position.set(rd.x, 0.05, rd.z);
    road.rotation.y = rd.rotation;
    group.add(road);
    
    for (var s = -1; s <= 1; s += 2) {
      var so = s * (rd.width / 2 + CONFIG.sidewalkWidth / 2);
      var dx = Math.cos(rd.rotation) * so;
      var dz = -Math.sin(rd.rotation) * so;
      
      var sidewalk = new THREE.Mesh(
        new THREE.BoxGeometry(CONFIG.sidewalkWidth, 0.3, rd.length),
        MAT.sidewalk
      );
      sidewalk.position.set(rd.x + dx, 0.2, rd.z + dz);
      sidewalk.rotation.y = rd.rotation;
      group.add(sidewalk);
    }
    
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
    
    if (rd.isMain || rd.width >= 15) {
      var signTex = makeTextTexture(rd.name, rd.signColor, '#ffffff', 700, 160);
      var signMat = new THREE.MeshBasicMaterial({ map: signTex, side: THREE.DoubleSide });
      var signGeo = new THREE.PlaneGeometry(9, 2.2);
      
      var signOffset = rd.width / 2 + 2;
      var signX = rd.x + Math.cos(rd.rotation) * signOffset;
      var signZ = rd.z - Math.sin(rd.rotation) * signOffset;
      var posAlong = rd.length / 4;
      signX += Math.sin(rd.rotation) * posAlong;
      signZ += Math.cos(rd.rotation) * posAlong;
      
      var pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.1, 7),
        MAT.chrome
      );
      pole.position.set(signX, 3.5, signZ);
      group.add(pole);
      
      var sign = new THREE.Mesh(signGeo, signMat);
      sign.position.set(signX, 6.5, signZ);
      group.add(sign);
    }
  }
  
  scene.add(group);
}

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
  
  var step = 40;
  for (var x = -CONFIG.citySize * 0.55; x < CONFIG.citySize * 0.55; x += step) {
    if (Math.random() > 0.5) {
      group.add(createPalm(x + Utils.rand(-4, 4), -(CONFIG.canalWidth / 2 + 5), Utils.rand(0.9, 1.1)));
    }
    if (Math.random() > 0.5) {
      group.add(createPalm(x + Utils.rand(-4, 4), (CONFIG.canalWidth / 2 + 5), Utils.rand(0.9, 1.1)));
    }
  }
  
  var treeCount = 0;
  for (var i = 0; i < ROADS_DATA.length && treeCount < QUALITY.treeCount; i++) {
    var rd = ROADS_DATA[i];
    if (rd.width < 14) continue;
    var treeSpacing = 65;
    var trees = Math.floor(rd.length / treeSpacing);
    for (var j = 0; j < trees && treeCount < QUALITY.treeCount; j++) {
      var off = -rd.length / 2 + j * treeSpacing + treeSpacing / 2;
      var s = Math.random() > 0.5 ? 1 : -1;
      var so = s * (rd.width / 2 + CONFIG.sidewalkWidth + 2);
      var tx = rd.x + Math.sin(rd.rotation) * off + Math.cos(rd.rotation) * so;
      var tz = rd.z + Math.cos(rd.rotation) * off - Math.sin(rd.rotation) * so;
      if (Math.abs(tz) > CONFIG.canalWidth / 2 + 8) {
        group.add(createTree(tx, tz, Utils.rand(0.85, 1.15)));
        treeCount++;
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
  radius = radius || 45;
  for (var i = 0; i < DESTINATIONS_DATA.length; i++) {
    var d = DESTINATIONS_DATA[i];
    if (Math.abs(x - d.x) < radius && Math.abs(z - d.z) < radius) return true;
  }
  return false;
}

function createDetailedBuilding(x, z, w, d, h) {
  var g = new THREE.Group();
  var style = Math.floor(Math.random() * 4);
  var wallMat, roofMat, trimMat;
  
  if (style === 0) {
    wallMat = Utils.pick([MAT.plaster, MAT.plasterPink, MAT.concrete, MAT.plasterYellow]);
    roofMat = MAT.tiles;
    trimMat = MAT.concrete;
  } else if (style === 1) {
    wallMat = Utils.pick([MAT.plasterYellow, MAT.plasterBlue, MAT.plasterGreen]);
    roofMat = MAT.tilesRed;
    trimMat = MAT.plaster;
  } else if (style === 2) {
    wallMat = Utils.pick([MAT.plasterGreen, MAT.plasterYellow, MAT.plasterPink]);
    roofMat = MAT.tilesRed;
    trimMat = MAT.plaster;
  } else {
    wallMat = Utils.pick([MAT.brick, MAT.brickDark, MAT.plaster]);
    roofMat = MAT.tiles;
    trimMat = MAT.concrete;
  }
  
  var groundFloorH = 3.5;
  var groundMat = style === 3 ? MAT.brickDark : MAT.concrete;
  
  var groundFloor = new THREE.Mesh(
    new THREE.BoxGeometry(w + 0.2, groundFloorH, d + 0.2),
    groundMat
  );
  groundFloor.position.y = groundFloorH / 2;
  g.add(groundFloor);
  
  var upperH = h - groundFloorH;
  if (upperH > 0) {
    var upperFloors = new THREE.Mesh(
      new THREE.BoxGeometry(w, upperH, d),
      wallMat
    );
    upperFloors.position.y = groundFloorH + upperH / 2;
    g.add(upperFloors);
  }
  
  var roofBase = new THREE.Mesh(
    new THREE.BoxGeometry(w + 0.5, 0.4, d + 0.5),
    roofMat
  );
  roofBase.position.y = h + 0.2;
  g.add(roofBase);
  
  if (style === 1 || Math.random() > 0.5) {
    var shopWin = new THREE.Mesh(
      new THREE.BoxGeometry(w * 0.75, 2.2, 0.15),
      MAT.glass
    );
    shopWin.position.set(0, 1.7, d / 2 + 0.12);
    g.add(shopWin);
    
    var awningColor = Utils.pick(MAT.shopAwning);
    var awning = new THREE.Mesh(
      new THREE.BoxGeometry(w * 0.85, 0.15, 1.6),
      awningColor
    );
    awning.position.set(0, 3.1, d / 2 + 0.8);
    awning.rotation.x = -0.25;
    g.add(awning);
  } else {
    var door = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 2.5, 0.15),
      style === 3 ? MAT.metalDoor : MAT.woodDoor
    );
    door.position.set(0, 1.25, d / 2 + 0.12);
    g.add(door);
  }
  
  var floors = Math.max(1, Math.floor((h - groundFloorH) / 3));
  var winCols = Math.max(2, Math.floor(w / 3));
  
  for (var f = 0; f < floors; f++) {
    var winY = groundFloorH + 1.5 + f * 3;
    for (var c = 0; c < winCols; c++) {
      var winX = -w / 2 + 1.5 + c * (w / winCols);
      
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
      if (Math.abs(z + 15) < 30 && Math.abs(x) < 200 && Math.random() > 0.5) continue;
      if (Math.random() > QUALITY.buildingDensity) continue;
      if (buildingList.length >= QUALITY.maxBuildings) break;
      
      buildingList.push({
        x: x,
        z: z,
        w: Utils.rand(10, 17),
        d: Utils.rand(10, 17),
        h: Utils.rand(6, 20)
      });
    }
  }
  
  console.log('🏢 بناء', buildingList.length, 'مبنى');
  
  buildingList.sort(function(a, b) {
    return (a.x * a.x + a.z * a.z) - (b.x * b.x + b.z * b.z);
  });
  
  var detailedCount = Math.min(QUALITY.detailedBuildings, buildingList.length);
  var detailed = [];
  var simple = [];
  
  for (var i = 0; i < buildingList.length; i++) {
    if (i < detailedCount) detailed.push(buildingList[i]);
    else simple.push(buildingList[i]);
  }
  
  for (var i = 0; i < detailed.length; i++) {
    var b = detailed[i];
    group.add(createDetailedBuilding(b.x, b.z, b.w, b.d, b.h));
  }
  
  if (simple.length > 0) {
    var boxGeo = new THREE.BoxGeometry(1, 1, 1);
    var wallMats = [MAT.plaster, MAT.plasterPink, MAT.plasterYellow, MAT.plasterBlue, MAT.plasterGreen, MAT.concrete];
    
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
   المعالم
   ============================================================ */
function createMosque(x, z) {
  var g = new THREE.Group();
  
  var base = new THREE.Mesh(new THREE.BoxGeometry(20, 10, 20), MAT.mosqueWall);
  base.position.y = 5;
  g.add(base);
  
  var dome = new THREE.Mesh(
    new THREE.SphereGeometry(6, 20, 14, 0, Math.PI * 2, 0, Math.PI / 2),
    MAT.mosqueDome
  );
  dome.position.y = 10;
  g.add(dome);
  
  var finial = new THREE.Mesh(new THREE.ConeGeometry(0.8, 3, 8), MAT.mosqueGold);
  finial.position.y = 17;
  g.add(finial);
  
  for (var s = -1; s <= 1; s += 2) {
    var minaret = new THREE.Mesh(
      new THREE.CylinderGeometry(1, 1, 22, 10),
      MAT.mosqueWall
    );
    minaret.position.set(s * 11, 11, 0);
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
  
  g.position.set(x, 0, z);
  return g;
}

function createFactory(x, z) {
  var g = new THREE.Group();
  
  var main = new THREE.Mesh(new THREE.BoxGeometry(48, 16, 36), MAT.factoryWall);
  main.position.y = 8;
  g.add(main);
  
  for (var i = 0; i < 3; i++) {
    var chimney = new THREE.Mesh(
      new THREE.CylinderGeometry(1.8, 2.2, 32, 12),
      MAT.factoryChimney
    );
    chimney.position.set(-15 + i * 15, 24, -14);
    g.add(chimney);
  }
  
  g.position.set(x, 0, z);
  return g;
}

function createHospital(x, z) {
  var g = new THREE.Group();
  
  var main = new THREE.Mesh(new THREE.BoxGeometry(30, 16, 22), MAT.hospitalWall);
  main.position.y = 8;
  g.add(main);
  
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
   القهاوي
   ============================================================ */
var cafes = [];

function createSimpleSittingPerson() {
  var p = new THREE.Group();
  
  var shirtMat = Utils.pick(MAT.peopleShirt);
  var skinMat = Utils.pick(MAT.peopleSkin);
  var pantsMat = Utils.pick(MAT.peoplePants);
  
  var torso = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.55, 0.3), shirtMat);
  torso.position.y = 0.4;
  p.add(torso);
  
  var head = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 8), skinMat);
  head.position.y = 0.85;
  p.add(head);
  
  if (Math.random() > 0.5) {
    var cap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.17, 0.17, 0.06, 8),
      Utils.pick(MAT.peopleShirt)
    );
    cap.position.y = 0.95;
    p.add(cap);
  }
  
  var legs = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.3, 0.5), pantsMat);
  legs.position.set(0, 0.15, 0.2);
  p.add(legs);
  
  return p;
}

/* ⚠️ مشهد مشرط قاعد على قهوة عماد هارون - الشخصية الرئيسية في البداية */
function createMeshratScene() {
  var scene = new THREE.Group();
  scene.name = 'meshratScene';
  
  // ═════ القهوة ═════
  var cafeGroup = new THREE.Group();
  
  // أرضية القهوة
  var cafeGround = new THREE.Mesh(
    new THREE.BoxGeometry(8, 0.1, 6),
    new THREE.MeshLambertMaterial({ color: 0x8a7a6a })
  );
  cafeGround.position.y = 0.05;
  cafeGroup.add(cafeGround);
  
  // طاولة القهوة
  var table = new THREE.Mesh(
    new THREE.CylinderGeometry(0.7, 0.7, 0.1, 16),
    MAT.cafeTable
  );
  table.position.set(0, 0.85, 0);
  cafeGroup.add(table);
  
  var tableLeg = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.08, 0.8, 8),
    MAT.cafeTable
  );
  tableLeg.position.set(0, 0.4, 0);
  cafeGroup.add(tableLeg);
  
  // كرسي
  var chair = new THREE.Mesh(
    new THREE.BoxGeometry(0.6, 0.1, 0.6),
    MAT.cafeChair
  );
  chair.position.set(0, 0.5, 1.2);
  cafeGroup.add(chair);
  
  var chairBack = new THREE.Mesh(
    new THREE.BoxGeometry(0.6, 0.8, 0.1),
    MAT.cafeChair
  );
  chairBack.position.set(0, 0.9, 0.9);
  cafeGroup.add(chairBack);
  
  // ═════ مشرط ═════
  var meshrat = new THREE.Group();
  
  // جسم مشرط (جلابية بيضاء صعيدية شعبية)
  var galabeya = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.7, 0.35),
    new THREE.MeshLambertMaterial({ color: 0xf5f0e8 })
  );
  galabeya.position.y = 0.9;
  meshrat.add(galabeya);
  
  // رقبة
  var neck = new THREE.Mesh(
    new THREE.CylinderGeometry(0.09, 0.09, 0.1),
    MAT.peopleSkin[2]
  );
  neck.position.y = 1.3;
  meshrat.add(neck);
  
  // الرأس
  var head = new THREE.Mesh(
    new THREE.SphereGeometry(0.19, 12, 12),
    MAT.peopleSkin[2]
  );
  head.position.y = 1.5;
  meshrat.add(head);
  
  // العينان
  var eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  var eyeBlackMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
  for (var s = -1; s <= 1; s += 2) {
    var eyeWhite = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), eyeWhiteMat);
    eyeWhite.position.set(s * 0.07, 1.52, 0.16);
    meshrat.add(eyeWhite);
    
    var eyeBlack = new THREE.Mesh(new THREE.SphereGeometry(0.025, 6, 6), eyeBlackMat);
    eyeBlack.position.set(s * 0.075, 1.52, 0.19);
    meshrat.add(eyeBlack);
  }
  
  // شنب مشرط
  var mustache = new THREE.Mesh(
    new THREE.BoxGeometry(0.16, 0.03, 0.04),
    new THREE.MeshLambertMaterial({ color: 0x1a1a1a })
  );
  mustache.position.set(0, 1.45, 0.18);
  meshrat.add(mustache);
  
  // عمة (طاقية صعيدية)
  var turban = new THREE.Mesh(
    new THREE.SphereGeometry(0.21, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshLambertMaterial({ color: 0xf0f0e8 })
  );
  turban.position.y = 1.53;
  meshrat.add(turban);
  
  // الأرجل
  var legs = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.5, 0.35),
    new THREE.MeshLambertMaterial({ color: 0x2c3e50 })
  );
  legs.position.set(0, 0.35, 0.15);
  meshrat.add(legs);
  
  // الشيب (شبشب صعيدي)
  var shoes = new THREE.Mesh(
    new THREE.BoxGeometry(0.55, 0.08, 0.4),
    new THREE.MeshLambertMaterial({ color: 0x5a3a20 })
  );
  shoes.position.set(0, 0.04, 0.15);
  meshrat.add(shoes);
  
  // الذراع اليمنى (بتمسك الشيشة)
  var armGeo = new THREE.BoxGeometry(0.14, 0.55, 0.14);
  var galabeyaMat = new THREE.MeshLambertMaterial({ color: 0xf5f0e8 });
  
  var armR = new THREE.Mesh(armGeo, galabeyaMat);
  armR.position.set(0.33, 0.9, 0.15);
  armR.rotation.x = -0.7;
  meshrat.add(armR);
  
  var handR = new THREE.Mesh(
    new THREE.SphereGeometry(0.08, 6, 6),
    MAT.peopleSkin[2]
  );
  handR.position.set(0.33, 0.68, 0.35);
  meshrat.add(handR);
  
  // الذراع اليسرى (مرتاحة)
  var armL = new THREE.Mesh(armGeo, galabeyaMat);
  armL.position.set(-0.33, 0.9, 0);
  armL.rotation.x = -0.3;
  meshrat.add(armL);
  
  var handL = new THREE.Mesh(
    new THREE.SphereGeometry(0.08, 6, 6),
    MAT.peopleSkin[2]
  );
  handL.position.set(-0.33, 0.62, 0.15);
  meshrat.add(handL);
  
  // مشرط قاعد
  meshrat.position.set(0, 0, 1.2);
  meshrat.rotation.y = Math.PI;
  meshrat.scale.set(1.1, 1.1, 1.1);
  cafeGroup.add(meshrat);
  
  // ═════ الشيشة ═════
  var shisha = new THREE.Group();
  
  // قاعدة الشيشة
  var shishaBase = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15, 0.18, 0.4, 12),
    new THREE.MeshLambertMaterial({ color: 0xc8a878 })
  );
  shishaBase.position.y = 0.2;
  shisha.add(shishaBase);
  
  // جسم الشيشة الأزرق (زجاج)
  var shishaGlass = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.14, 0.35, 12),
    new THREE.MeshLambertMaterial({ color: 0x2980b9, transparent: true, opacity: 0.8 })
  );
  shishaGlass.position.y = 0.55;
  shisha.add(shishaGlass);
  
  // الحامل
  var shishaStem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.04, 0.9, 8),
    new THREE.MeshLambertMaterial({ color: 0xd4a574 })
  );
  shishaStem.position.y = 1.15;
  shisha.add(shishaStem);
  
  // رأس الشيشة
  var shishaTop = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.12, 0.15, 12),
    new THREE.MeshLambertMaterial({ color: 0x8b6a3a })
  );
  shishaTop.position.y = 1.65;
  shisha.add(shishaTop);
  
  // خرطوم الشيشة
  var hose = new THREE.Mesh(
    new THREE.CylinderGeometry(0.03, 0.03, 0.7, 8),
    new THREE.MeshLambertMaterial({ color: 0x8b3a1a })
  );
  hose.position.set(0.35, 1.1, 0.3);
  hose.rotation.z = Math.PI / 3;
  hose.rotation.y = -Math.PI / 4;
  shisha.add(hose);
  
  // فوهة الشيشة
  var hoseTip = new THREE.Mesh(
    new THREE.SphereGeometry(0.06, 8, 8),
    new THREE.MeshLambertMaterial({ color: 0xffcc00 })
  );
  hoseTip.position.set(0.5, 0.85, 0.45);
  shisha.add(hoseTip);
  
  shisha.position.set(0.7, 0, 0.3);
  cafeGroup.add(shisha);
  
  // ═════ كوباية الشاي ═════
  var teaGlass = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.05, 0.15, 12),
    new THREE.MeshLambertMaterial({ color: 0xc8a878, transparent: true, opacity: 0.85 })
  );
  teaGlass.position.set(-0.3, 0.93, 0);
  cafeGroup.add(teaGlass);
  
  // ═════ لوحة قهوة عماد هارون ═════
  var signTex = makeTextTexture('قهوة عماد هارون', '#5a3a1a', '#ffcc00', 512, 128);
  var signMat = new THREE.MeshBasicMaterial({ map: signTex, side: THREE.DoubleSide });
  var sign = new THREE.Mesh(new THREE.PlaneGeometry(5, 1.2), signMat);
  sign.position.set(0, 3, -1.5);
  cafeGroup.add(sign);
  
  // عمودين اللافتة
  for (var s = -1; s <= 1; s += 2) {
    var pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 3),
      MAT.woodDoor
    );
    pole.position.set(s * 2.5, 1.5, -1.5);
    cafeGroup.add(pole);
  }
  
  // ═════ إضاءة نقطية على القهوة ═════
  var pointLight = new THREE.PointLight(0xffcc88, 1.5, 15);
  pointLight.position.set(0, 3, 0);
  cafeGroup.add(pointLight);
  
  scene.add(cafeGroup);
  scene.userData.cafeGroup = cafeGroup;
  scene.userData.meshrat = meshrat;
  scene.userData.shisha = shisha;
  
  return scene;
}

var meshratScene = createMeshratScene();
scene.add(meshratScene);

console.log('☕ مشهد مشرط على قهوة عماد هارون جاهز');

/* ============================================================
   القهاوي الأخرى
   ============================================================ */
function createCafe(x, z, rotation) {
  var g = new THREE.Group();
  
  var base = new THREE.Mesh(
    new THREE.BoxGeometry(10, 0.15, 8),
    new THREE.MeshLambertMaterial({ color: 0x8a7a6a })
  );
  base.position.y = 0.15;
  g.add(base);
  
  var wall = new THREE.Mesh(
    new THREE.BoxGeometry(10, 4, 6),
    Utils.pick([MAT.plaster, MAT.plasterYellow, MAT.plasterPink])
  );
  wall.position.set(0, 2, -1);
  g.add(wall);
  
  var roof = new THREE.Mesh(new THREE.BoxGeometry(10.5, 0.3, 6.5), MAT.tiles);
  roof.position.set(0, 4.15, -1);
  g.add(roof);
  
  for (var i = 0; i < 4; i++) {
    var tx = -3 + i * 2;
    var tz = 2.5;
    
    var table = new THREE.Mesh(
      new THREE.CylinderGeometry(0.6, 0.6, 0.08, 12),
      MAT.cafeTable
    );
    table.position.set(tx, 0.85, tz);
    g.add(table);
    
    for (var c = -1; c <= 1; c += 2) {
      var chair = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.08, 0.5),
        MAT.cafeChair
      );
      chair.position.set(tx + c * 0.9, 0.55, tz);
      g.add(chair);
    }
    
    if (Math.random() > 0.3) {
      var shishaBase = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.1, 0.3, 8),
        MAT.cafeShisha
      );
      shishaBase.position.set(tx + 0.3, 1, tz + 0.2);
      g.add(shishaBase);
    }
  }
  
  for (var i = 0; i < 3; i++) {
    var person = createSimpleSittingPerson();
    person.position.set(Utils.rand(-3, 3), 0.55, 2.5);
    person.rotation.y = Utils.rand(-0.5, 0.5);
    g.add(person);
  }
  
  g.position.set(x, 0, z);
  g.rotation.y = rotation;
  return g;
}

function createCafes() {
  console.log('☕ بناء القهاوي...');
  var group = new THREE.Group();
  
  var cafePositions = [
    { x: -80, z: 0, r: Math.PI },
    { x: 80, z: 0, r: Math.PI },
    { x: -160, z: 30, r: 0 },
    { x: 160, z: 30, r: 0 },
    { x: -240, z: 0, r: Math.PI },
    { x: 240, z: 0, r: Math.PI }
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
  
  var body = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.6, 3.8), bodyMat);
  body.position.y = 0.5;
  car.add(body);
  
  var cabin = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.5, 1.8), bodyMat);
  cabin.position.set(0, 1.05, -0.2);
  car.add(cabin);
  
  var windshield = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.4, 0.1), MAT.glass);
  windshield.position.set(0, 1.05, 0.7);
  car.add(windshield);
  
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
    
    var sideOffset = (Math.random() > 0.5 ? 1 : -1) * (rd.width / 4);
    var dx = Math.cos(rd.rotation) * sideOffset;
    var dz = -Math.sin(rd.rotation) * sideOffset;
    
    var car = createCar(x + dx, z + dz, rd.rotation + (Math.random() > 0.5 ? 0 : Math.PI));
    car.userData = {
      road: rd,
      offset: off,
      sideOffset: sideOffset,
      speed: Utils.rand(3, 6),
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

function createPerson(x, z, type) {
  var p = new THREE.Group();
  type = type || 'walker';
  
  var shirtMat = Utils.pick(MAT.peopleShirt);
  var pantsMat = Utils.pick(MAT.peoplePants);
  var skinMat = Utils.pick(MAT.peopleSkin);
  var hairMat = Utils.pick(MAT.peopleHair);
  
  var torso = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.65, 0.26), shirtMat);
  torso.position.y = 1.08;
  p.add(torso);
  
  var neck = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.1), skinMat);
  neck.position.y = 1.43;
  p.add(neck);
  
  var head = new THREE.Mesh(new THREE.SphereGeometry(0.17, 10, 10), skinMat);
  head.position.y = 1.62;
  p.add(head);
  
  var eyeMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
  for (var s = -1; s <= 1; s += 2) {
    var eye = new THREE.Mesh(new THREE.SphereGeometry(0.025, 6, 6), eyeMat);
    eye.position.set(s * 0.06, 1.65, 0.15);
    p.add(eye);
  }
  
  var hair = new THREE.Mesh(
    new THREE.SphereGeometry(0.18, 10, 10, 0, Math.PI * 2, 0, Math.PI / 2),
    hairMat
  );
  hair.position.y = 1.65;
  p.add(hair);
  
  var legs = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.8, 0.26), pantsMat);
  legs.position.y = 0.35;
  p.add(legs);
  
  var shoes = new THREE.Mesh(
    new THREE.BoxGeometry(0.44, 0.08, 0.32),
    new THREE.MeshLambertMaterial({ color: 0x1a1a1a })
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
      if (distFromHome > 10) {
        ud.direction = Math.atan2(dz, dx);
      }
      
      p.position.x += Math.cos(ud.direction) * ud.speed * dt;
      p.position.z += Math.sin(ud.direction) * ud.speed * dt;
      p.rotation.y = -ud.direction + Math.PI / 2;
      
      if (ud.armL) ud.armL.rotation.x = Math.sin(ud.walkPhase) * 0.6;
      if (ud.armR) ud.armR.rotation.x = -Math.sin(ud.walkPhase) * 0.6;
    }
  }
}

/* ============================================================
   السواق مشرط داخل التوك توك
   ============================================================ */
function createDriverMesh() {
  var driver = new THREE.Group();
  
  var galabeyaMat = new THREE.MeshLambertMaterial({ color: 0xf5f0e8 });
  
  var torso = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.6, 0.28), galabeyaMat);
  torso.position.y = 1.1;
  driver.add(torso);
  
  var neck = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.08, 0.08),
    MAT.peopleSkin[2]
  );
  neck.position.y = 1.44;
  driver.add(neck);
  
  var head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 10), MAT.peopleSkin[2]);
  head.position.y = 1.63;
  driver.add(head);
  
  var eyeMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
  for (var s = -1; s <= 1; s += 2) {
    var eye = new THREE.Mesh(new THREE.SphereGeometry(0.025, 6, 6), eyeMat);
    eye.position.set(s * 0.06, 1.65, 0.15);
    driver.add(eye);
  }
  
  var mustache = new THREE.Mesh(
    new THREE.BoxGeometry(0.14, 0.025, 0.03),
    new THREE.MeshLambertMaterial({ color: 0x1a1a1a })
  );
  mustache.position.set(0, 1.58, 0.17);
  driver.add(mustache);
  
  var turban = new THREE.Mesh(
    new THREE.SphereGeometry(0.2, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshLambertMaterial({ color: 0xf0f0e8 })
  );
  turban.position.y = 1.65;
  driver.add(turban);
  
  var legs = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.35, 0.26), galabeyaMat);
  legs.position.set(0, 0.55, 0.15);
  driver.add(legs);
  
  var armGeo = new THREE.BoxGeometry(0.12, 0.5, 0.12);
  var armL = new THREE.Mesh(armGeo, galabeyaMat);
  armL.position.set(-0.27, 1.08, 0);
  driver.add(armL);
  
  var armR = new THREE.Mesh(armGeo, galabeyaMat);
  armR.position.set(0.27, 1.08, 0.05);
  armR.rotation.x = -0.5;
  driver.add(armR);
  
  var hand = new THREE.Mesh(
    new THREE.SphereGeometry(0.07, 6, 6),
    MAT.peopleSkin[2]
  );
  hand.position.set(0.27, 0.85, 0.25);
  driver.add(hand);
  
  return driver;
}

function createTukTuk() {
  var t = new THREE.Group();
  t.name = 'tukTuk';
  
  var chassis = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.12, 2.4), MAT.black);
  chassis.position.y = 0.42;
  t.add(chassis);
  
  var floorF = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.08, 1.0), MAT.black);
  floorF.position.set(0, 0.52, 0.65);
  t.add(floorF);
  
  var floorR = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.08, 1.3), MAT.black);
  floorR.position.set(0, 0.52, -0.6);
  t.add(floorR);
  
  var frontPanel = new THREE.Mesh(new THREE.BoxGeometry(1.28, 0.85, 0.15), MAT.yellow);
  frontPanel.position.set(0, 0.95, 1.15);
  t.add(frontPanel);
  
  var frontCabin = new THREE.Mesh(new THREE.BoxGeometry(1.28, 0.85, 1.0), MAT.yellow);
  frontCabin.position.set(0, 0.95, 0.6);
  t.add(frontCabin);
  
  var rearCabin = new THREE.Mesh(new THREE.BoxGeometry(1.32, 1.5, 1.4), MAT.yellow);
  rearCabin.position.set(0, 1.25, -0.6);
  t.add(rearCabin);
  
  var roof = new THREE.Mesh(new THREE.BoxGeometry(1.42, 0.1, 2.5), MAT.black);
  roof.position.set(0, 2.1, 0);
  t.add(roof);
  
  var pillarGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.75, 6);
  var pillarPos = [
    [-0.62, 1.2, -1.2], [0.62, 1.2, -1.2],
    [-0.62, 1.2, -0.05], [0.62, 1.2, -0.05],
    [-0.62, 1.2, 1.05], [0.62, 1.2, 1.05]
  ];
  for (var i = 0; i < pillarPos.length; i++) {
    var pillar = new THREE.Mesh(pillarGeo, MAT.black);
    pillar.position.set(pillarPos[i][0], pillarPos[i][1], pillarPos[i][2]);
    t.add(pillar);
  }
  
  var windshield = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.85, 0.04), MAT.glassTint);
  windshield.position.set(0, 1.85, 1.1);
  t.add(windshield);
  
  for (var s = -1; s <= 1; s += 2) {
    var sg = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.8, 0.9), MAT.glassTint);
    sg.position.set(s * 0.64, 1.8, 0.6);
    t.add(sg);
    
    var rg = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.95, 1.2), MAT.glassTint);
    rg.position.set(s * 0.66, 1.7, -0.6);
    t.add(rg);
  }
  
  var rearGlass = new THREE.Mesh(new THREE.BoxGeometry(1.28, 1, 0.04), MAT.glassTint);
  rearGlass.position.set(0, 1.7, -1.28);
  t.add(rearGlass);
  
  var headlightGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.1, 16);
  for (var s = -1; s <= 1; s += 2) {
    var hlGlass = new THREE.Mesh(headlightGeo, MAT.headlight);
    hlGlass.rotation.x = Math.PI / 2;
    hlGlass.position.set(s * 0.44, 1.15, 1.18);
    t.add(hlGlass);
  }
  
  var taillightGeo = new THREE.BoxGeometry(0.12, 0.22, 0.05);
  for (var s = -1; s <= 1; s += 2) {
    var tl = new THREE.Mesh(taillightGeo, MAT.taillight);
    tl.position.set(s * 0.48, 0.9, -1.31);
    t.add(tl);
  }
  
  var steerGroup = new THREE.Group();
  var steerRing = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.02, 8, 20), MAT.black);
  steerGroup.add(steerRing);
  
  for (var i = 0; i < 3; i++) {
    var spoke = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.14, 0.015), MAT.black);
    spoke.rotation.z = (i / 3) * Math.PI * 2;
    steerGroup.add(spoke);
  }
  
  steerGroup.position.set(0, 1.5, 0.8);
  steerGroup.rotation.x = -0.35;
  t.add(steerGroup);
  
  var seatMat = new THREE.MeshLambertMaterial({ color: 0x2a2a2a });
  
  var seatDriver = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.12, 0.5), seatMat);
  seatDriver.position.set(0, 0.8, 0.4);
  t.add(seatDriver);
  
  var rearSeat = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.12, 0.55), seatMat);
  rearSeat.position.set(0, 0.8, -0.75);
  t.add(rearSeat);
  
  var wheels = [];
  
  function makeWheel(wx, wz, isFront) {
    var wg = new THREE.Group();
    wg.userData.isFront = isFront;
    
    var tire = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.11, 12, 20), MAT.carTire);
    tire.rotation.y = Math.PI / 2;
    wg.add(tire);
    
    var rim = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.13, 12), MAT.chrome);
    rim.rotation.z = Math.PI / 2;
    wg.add(rim);
    
    wg.position.set(wx, 0.26, wz);
    t.add(wg);
    wheels.push(wg);
    return wg;
  }
  
  makeWheel(0, 1.1, true);
  makeWheel(-0.6, -0.75, false);
  makeWheel(0.6, -0.75, false);
  
  var driver = createDriverMesh();
  driver.position.set(0, 0, 0.45);
  driver.rotation.y = Math.PI;
  t.add(driver);
  
  t.userData.wheels = wheels;
  t.userData.steeringWheel = steerGroup;
  
  return t;
}

var tukTuk = createTukTuk();
tukTuk.position.set(0, 0, 150);
scene.add(tukTuk);

console.log('✅ الجزء 2 تم تحميله - المدينة ومشرط على القهوة');

/* ============================================================
   🚦 الجزء 3: القيادة + الركاب + الخريطة + الراديو
   ============================================================ */

var trafficLights = [];

function createTrafficLight(x, z, rotation) {
  var g = new THREE.Group();
  
  var pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.12, 6, 8),
    MAT.trafficPole
  );
  pole.position.y = 3;
  g.add(pole);
  
  var box = new THREE.Mesh(new THREE.BoxGeometry(0.7, 2, 0.5), MAT.trafficPole);
  box.position.y = 6.5;
  g.add(box);
  
  var redLight = new THREE.Mesh(new THREE.CircleGeometry(0.22, 12), MAT.trafficRed);
  redLight.position.set(0, 7.2, 0.26);
  g.add(redLight);
  
  var yellowLight = new THREE.Mesh(new THREE.CircleGeometry(0.22, 12), MAT.trafficOff);
  yellowLight.position.set(0, 6.5, 0.26);
  g.add(yellowLight);
  
  var greenLight = new THREE.Mesh(new THREE.CircleGeometry(0.22, 12), MAT.trafficOff);
  greenLight.position.set(0, 5.8, 0.26);
  g.add(greenLight);
  
  g.position.set(x, 0, z);
  g.rotation.y = rotation;
  
  g.userData = {
    redLight: redLight,
    yellowLight: yellowLight,
    greenLight: greenLight,
    state: 0,
    timer: Math.random() * 10
  };
  
  return g;
}

function createTrafficLights() {
  var group = new THREE.Group();
  
  var intersections = [
    { x: 20, z: -15, r: 0 },
    { x: -20, z: -15, r: Math.PI },
    { x: 20, z: 30, r: 0 },
    { x: 280, z: 120, r: 0 }
  ];
  
  for (var i = 0; i < intersections.length; i++) {
    var tl = createTrafficLight(intersections[i].x, intersections[i].z, intersections[i].r);
    group.add(tl);
    trafficLights.push(tl);
  }
  
  scene.add(group);
}

function updateTrafficLights(dt) {
  for (var i = 0; i < trafficLights.length; i++) {
    var tl = trafficLights[i];
    var ud = tl.userData;
    
    ud.timer -= dt;
    if (ud.timer <= 0) {
      ud.state = (ud.state + 1) % 3;
      ud.timer = ud.state === 1 ? 2 : 6;
      
      ud.redLight.material = ud.state === 0 ? MAT.trafficRed : MAT.trafficOff;
      ud.yellowLight.material = ud.state === 1 ? MAT.trafficYellow : MAT.trafficOff;
      ud.greenLight.material = ud.state === 2 ? MAT.trafficGreen : MAT.trafficOff;
    }
  }
}

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

var CAMERA_DISTANCE = 7.5;
var CAMERA_HEIGHT = 3.8;
var CAMERA_LOOK_HEIGHT = 1.3;

function updateCamera(dt) {
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
    UI.showToast(player.engineOn ? '🔊 المحرك شغّال' : '🔇 المحرك مطفأ', 1000);
  }
  if (e.code === 'KeyH') {
    AudioSystem.playHorn();
    UI.showToast('📢 كلاكس', 800);
  }
  if (e.code === 'KeyR') {
    radio.toggle();
  }
});

document.addEventListener('keyup', function(e) {
  keys[e.code] = false;
  if (e.code === 'Space') player.handbrake = false;
});

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
  
  var inCanalX = !(newPos.x > -14 && newPos.x < 14);
  var nearCanal = Math.abs(newPos.z) < CONFIG.canalWidth / 2 + 1.5;
  
  if (nearCanal && inCanalX) {
    player.speed *= -0.25;
  } else if (Math.abs(newPos.x) < CONFIG.citySize / 2 - 3 && Math.abs(newPos.z) < CONFIG.citySize / 2 - 3) {
    tukTuk.position.copy(newPos);
  } else {
    player.speed *= -0.3;
  }
  
  var wheelRoll = (player.speed * dt) / 0.26;
  for (var i = 0; i < tukTuk.userData.wheels.length; i++) {
    var w = tukTuk.userData.wheels[i];
    var tire = w.children[0];
    if (tire) tire.rotation.x += wheelRoll;
    if (w.userData.isFront) w.rotation.y = player.currentWheelAngle;
  }
  
  tukTuk.userData.steeringWheel.rotation.z = -player.steering * Math.PI * 0.85;
  tukTuk.position.y = Math.max(0, Math.sin(performance.now() * 0.02) * 0.005 * (1 + speedRatio));
}

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
  dialogTimer: 5
};

/* ============================================================
   الركاب - محدّث مع مؤشرات واضحة
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
      if (Math.abs(x + 260) < 8) continue;
      
      var dist = Math.hypot(x - tukTuk.position.x, z - tukTuk.position.z);
      if (dist < 40 || dist > 300) continue;
      
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
  
  var neck = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.08), skinMat);
  neck.position.y = 1.44;
  group.add(neck);
  
  var head = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 10), skinMat);
  head.position.y = 1.6;
  group.add(head);
  
  var eyeMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
  for (var s = -1; s <= 1; s += 2) {
    var eye = new THREE.Mesh(new THREE.SphereGeometry(0.022, 6, 6), eyeMat);
    eye.position.set(s * 0.055, 1.62, 0.14);
    group.add(eye);
  }
  
  var hair = new THREE.Mesh(
    new THREE.SphereGeometry(0.17, 10, 10, 0, Math.PI * 2, 0, Math.PI / 1.8),
    hairMat
  );
  hair.position.y = 1.62;
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
  
  // ═════ هالة أرضية كبيرة ═════
  var ringMat = new THREE.MeshBasicMaterial({
    color: 0x00ff88,
    transparent: true,
    opacity: 0.85,
    side: THREE.DoubleSide
  });
  var ring = new THREE.Mesh(new THREE.RingGeometry(0.7, 1.0, 20), ringMat);
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.05;
  group.add(ring);
  group.userData.ring = ring;
  
  // ═════ سهم كبير فوق الرأس ═════
  var arrowMat = new THREE.MeshBasicMaterial({ color: 0x00ff88 });
  var arrow = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.7, 4), arrowMat);
  arrow.position.y = 2.6;
  arrow.rotation.x = Math.PI;
  group.add(arrow);
  group.userData.arrow = arrow;
  
  // ═════ خط من الرأس للسماء ═════
  var beamMat = new THREE.MeshBasicMaterial({
    color: 0x00ff88,
    transparent: true,
    opacity: 0.5,
    side: THREE.DoubleSide
  });
  var beam = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.15, 5, 8, 1, true),
    beamMat
  );
  beam.position.y = 4;
  group.add(beam);
  group.userData.beam = beam;
  
  // ═════ إضاءة نقطية خضراء ═════
  var pointLight = new THREE.PointLight(0x00ff88, 1.5, 12);
  pointLight.position.y = 1;
  group.add(pointLight);
  
  return group;
}

function spawnPassenger() {
  if (passengers.length >= CONFIG.maxPassengers) return;
  
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
  
  console.log('👤 راكب جديد في انتظار');
  UI.showToast('👤 راكب جديد ينتظر!', 1500);
  updateMissionUI();
}

function createDestinationMarker(destination) {
  var group = new THREE.Group();
  
  var ringMat = new THREE.MeshBasicMaterial({
    color: destination.color,
    transparent: true,
    opacity: 0.75,
    side: THREE.DoubleSide
  });
  var ring = new THREE.Mesh(new THREE.RingGeometry(2.5, 4, 28), ringMat);
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.1;
  group.add(ring);
  
  var beamMat = new THREE.MeshBasicMaterial({
    color: destination.color,
    transparent: true,
    opacity: 0.35,
    side: THREE.DoubleSide
  });
  var beam = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 2, 12, 12, 1, true), beamMat);
  beam.position.y = 6;
  group.add(beam);
  
  var iconMat = new THREE.MeshBasicMaterial({ color: destination.color });
  var icon = new THREE.Mesh(new THREE.SphereGeometry(0.9, 12, 12), iconMat);
  icon.position.y = 9;
  group.add(icon);
  
  var pointLight = new THREE.PointLight(destination.color, 2, 20);
  pointLight.position.y = 5;
  group.add(pointLight);
  
  group.position.set(destination.x, 0, destination.z);
  group.userData = {
    destination: destination,
    startTime: performance.now(),
    icon: icon,
    beam: beam,
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
      riderMesh.position.set(0, 0.35, -0.7);
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
    else { reward = 60; rating = 2; }
    
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
    gameState.spawnTimer = 1;
    
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
    UI.missionPanel.textContent = '🎯 مشرط هيوصلك لـ: ' + player.currentPassenger.name;
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
      p.mesh.position.y = Math.sin(p.bobPhase) * 0.08;
      if (p.mesh.userData.ring) {
        p.mesh.userData.ring.rotation.z += dt * 1.5;
        var pulse = 1 + Math.sin(now * 0.005) * 0.15;
        p.mesh.userData.ring.scale.set(pulse, pulse, 1);
      }
      if (p.mesh.userData.arrow) {
        p.mesh.userData.arrow.position.y = 2.6 + Math.sin(now * 0.005) * 0.25;
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
    ud.icon.position.y = 9 + Math.sin(time * 2) * 0.5;
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
   الخريطة التفاعلية
   ============================================================ */
var minimapCtx = null;

function initMinimap() {
  if (!UI.minimapCanvas) return;
  minimapCtx = UI.minimapCanvas.getContext('2d');
  if (minimapCtx) minimapCtx.imageSmoothingEnabled = true;
}

function drawMinimap() {
  if (!minimapCtx) return;
  
  var ctx = minimapCtx;
  var w = UI.minimapCanvas.width;
  var h = UI.minimapCanvas.height;
  var scale = 0.12;
  var cx = w / 2;
  var cy = h / 2;
  
  ctx.fillStyle = '#0a1828';
  ctx.fillRect(0, 0, w, h);
  
  function toMap(x, z) {
    return {
      x: cx + (x - tukTuk.position.x) * scale,
      y: cy + (z - tukTuk.position.z) * scale
    };
  }
  
  ctx.fillStyle = '#1a6a9a';
  var c1 = toMap(-CONFIG.citySize * 0.6, -CONFIG.canalWidth / 2);
  var c2 = toMap(CONFIG.citySize * 0.6, CONFIG.canalWidth / 2);
  ctx.fillRect(c1.x, c1.y, c2.x - c1.x, c2.y - c1.y);
  
  for (var i = 0; i < ROADS_DATA.length; i++) {
    var rd = ROADS_DATA[i];
    ctx.fillStyle = rd.isMain ? '#4a7aaa' : '#2a4a6a';
    
    var p1 = toMap(
      rd.x - Math.sin(rd.rotation) * rd.length / 2,
      rd.z - Math.cos(rd.rotation) * rd.length / 2
    );
    
    ctx.save();
    ctx.translate(p1.x, p1.y);
    ctx.rotate(-rd.rotation);
    var roadW = Math.max(2, rd.width * scale);
    var roadL = Math.max(2, rd.length * scale);
    ctx.fillRect(-roadW / 2, -roadL / 2, roadW, roadL);
    ctx.restore();
  }
  
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
      ctx.arc(p.x, p.y, 9 + Math.sin(performance.now() * 0.005) * 3, 0, Math.PI * 2);
      ctx.strokeStyle = '#00ff88';
      ctx.lineWidth = 3;
      ctx.stroke();
    }
  }
  
  // ═════ الركاب - دائرة خضراء كبيرة مع نبض ═════
  for (var i = 0; i < passengers.length; i++) {
    var p = toMap(passengers[i].x, passengers[i].z);
    if (p.x < -20 || p.x > w + 20 || p.y < -20 || p.y > h + 20) continue;
    
    var pulse = 1 + Math.sin(performance.now() * 0.008) * 0.5;
    
    ctx.beginPath();
    ctx.arc(p.x, p.y, 5 * pulse, 0, Math.PI * 2);
    ctx.fillStyle = '#00ff88';
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(p.x, p.y, 9 * pulse, 0, Math.PI * 2);
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  
  for (var i = 0; i < cars.length; i++) {
    var p = toMap(cars[i].position.x, cars[i].position.z);
    if (p.x < -10 || p.x > w + 10 || p.y < -10 || p.y > h + 10) continue;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#ffcc00';
    ctx.fill();
  }
  
  // التوك توك (السهم)
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-tukTuk.rotation.y);
  ctx.beginPath();
  ctx.moveTo(0, -10);
  ctx.lineTo(-6, 6);
  ctx.lineTo(0, 4);
  ctx.lineTo(6, 6);
  ctx.closePath();
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
  
  ctx.strokeStyle = '#ffc800';
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, w - 4, h - 4);
}

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
    if (passengers.length < CONFIG.maxPassengers) {
      spawnPassenger();
    }
    gameState.spawnTimer = 2.5 + Math.random() * 2;
  }
  
  updateTukTukPhysics(dt);
  checkPassengerPickup();
  checkDelivery();
  updateCamera(dt);
  updatePassengers(dt);
  updatePeople(dt);
  updateCars(dt);
  updateTrafficLights(dt);
  
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
    { name: 'بناء ترعة المحمودية...', fn: createCanal, weight: 7 },
    { name: 'رصف الشوارع...', fn: createRoads, weight: 12 },
    { name: 'مد السكة الحديد...', fn: createRailway, weight: 3 },
    { name: 'زراعة النخيل والأشجار...', fn: createFoliage, weight: 8 },
    { name: 'بناء المباني...', fn: createBuildings, weight: 18 },
    { name: 'بناء المعالم الحقيقية...', fn: createLandmarks, weight: 12 },
    { name: 'فتح القهاوي الشعبية...', fn: createCafes, weight: 7 },
    { name: 'إضافة الناس...', fn: createPeople, weight: 8 },
    { name: 'إضافة السيارات...', fn: createCars, weight: 5 },
    { name: 'تركيب إشارات المرور...', fn: createTrafficLights, weight: 3 },
    { name: 'تركيب الخريطة...', fn: initMinimap, weight: 2 },
    { name: 'تشغيل الراديو...', fn: function() {
      radio.init();
      setupRadio();
    }, weight: 3 }
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
  
  // 🎵 تشغيل الراديو تلقائي
  setTimeout(function() {
    if (!radio.isPlaying) {
      radio.play();
    }
  }, 800);
  
  if (isInitialized) {
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
    
    if (isMobile) {
      UI.controls.classList.add('visible');
      UI.showHint('استخدم الأزرار للقيادة', 5000);
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
    
    UI.loadingScreen.classList.add('hidden');
    UI.startScreen.classList.remove('visible');
    UI.endScreen.classList.remove('visible');
    UI.hud.classList.add('visible');
    UI.missionPanel.classList.add('visible');
    UI.pauseBtn.style.display = 'flex';
    UI.radioBtn.style.display = 'flex';
    UI.fullscreenBtn.style.display = 'flex';
    
    if (isMobile) {
      UI.controls.classList.add('visible');
      UI.showHint('استخدم الأزرار للقيادة', 5000);
    }
    
    if (player.engineOn) AudioSystem.setEngine(true);
    
    setTimeout(function() { spawnPassenger(); }, 500);
    setTimeout(function() { spawnPassenger(); }, 1500);
    
    UI.showToast('🛺 يلا بينا مع مشرط!', 2500);
    UI.showDialog('مشرط: أنا كنت قاعد على قهوة عماد هارون، يلا بينا نشتغل!', 4000);
    
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
  
  UI.endTitle.textContent = gameState.deliveries > 0 ? '🎉 مشرط بيقول: شغل جميل!' : '⏰ خلص الوقت!';
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
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen && document.documentElement.requestFullscreen().catch(function() {});
    } else {
      document.exitFullscreen && document.exitFullscreen().catch(function() {});
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
window.gameStarted = true;
window.gameInitialized = true;
window.radio = radio;

console.log('✅ الجزء 3 تم تحميله - القيادة والركاب والخريطة والراديو');
console.log('🎮 اللعبة جاهزة! اضغط "🚀 ابدأ الشغل مع مشرط"');
console.log('🎵 الراديو هشتغل تلقائي مع بداية اللعب');
console.log('🚕 مشرط قاعد على قهوة عماد هارون في البيضا');
