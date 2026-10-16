/* ============================================================
   🛺 توك توك كفر الدوار - Babylon.js Engine
   الجزء 1: الإعداد + المدينة + الشوارع + عزبة بولضو
   ============================================================ */

'use strict';

console.log('🚀 تحميل Babylon.js Engine...');

if (typeof BABYLON === 'undefined') {
  alert('فشل تحميل Babylon.js');
  throw new Error('Babylon.js not loaded');
}

console.log('✅ Babylon.js v' + BABYLON.Engine.Version);

/* ═══════════════════════════════════════════════════════════
   إعدادات عامة
   ═══════════════════════════════════════════════════════════ */
var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  || (navigator.maxTouchPoints && navigator.maxTouchPoints > 2);

var CONFIG = {
  citySize: 1600,
  canalWidth: 24,
  maxSpeed: 16,
  maxReverseSpeed: 5,
  acceleration: 8,
  braking: 20,
  friction: 0.9,
  steeringSpeed: 3.5,
  maxWheelAngle: 0.6,
  gameDuration: 300,
  deliveryBonus: 30,
  maxPassengers: 4
};

/* ═══════════════════════════════════════════════════════════
   إنشاء الكانفس والمحرك
   ═══════════════════════════════════════════════════════════ */
var canvas = document.getElementById('renderCanvas');

var engine = new BABYLON.Engine(canvas, true, {
  preserveDrawingBuffer: true,
  stencil: true,
  antialias: !isMobile,
  powerPreference: 'high-performance',
  disableWebGL2Support: false
}, true);

// إعداد الأداء
engine.setHardwareScalingLevel(isMobile ? 1.2 : 0.85);

console.log('🎮 Engine initialized');

/* ═══════════════════════════════════════════════════════════
   المشهد الرئيسي
   ═══════════════════════════════════════════════════════════ */
var scene = new BABYLON.Scene(engine);

// ضباب طبيعي
scene.fogMode = BABYLON.Scene.FOGMODE_EXP2;
scene.fogColor = new BABYLON.Color3(0.65, 0.78, 0.92);
scene.fogDensity = isMobile ? 0.008 : 0.005;

// تفعيل الظلال
scene.shadowsEnabled = true;

console.log('🌫️ Fog enabled');

/* ═══════════════════════════════════════════════════════════
   الكاميرا - الشخص الثالث
   ═══════════════════════════════════════════════════════════ */
var camera = new BABYLON.FreeCamera(
  'camera',
  new BABYLON.Vector3(0, 6, -12),
  scene
);

camera.setTarget(new BABYLON.Vector3(0, 2, 0));
camera.fov = 0.9;
camera.minZ = 0.1;
camera.maxZ = 800;

// ربط الكاميرا بالكانفس
camera.attachControl(canvas, true);
camera.inputs.removeByType('FreeCameraKeyboardMoveInput');
camera.inputs.removeByType('FreeCameraMouseInput');
camera.inputs.removeByType('FreeCameraTouchInput');

console.log('📷 Camera ready');

/* ═══════════════════════════════════════════════════════════
   الإضاءة PBR - طبيعية ومتقدمة
   ═══════════════════════════════════════════════════════════ */

// 1. إضاءة السماء والمحيط
var hemiLight = new BABYLON.HemisphericLight(
  'hemiLight',
  new BABYLON.Vector3(0, 1, 0),
  scene
);
hemiLight.intensity = 0.75;
hemiLight.diffuse = new BABYLON.Color3(0.95, 0.95, 1);
hemiLight.groundColor = new BABYLON.Color3(0.5, 0.45, 0.4);
hemiLight.specular = new BABYLON.Color3(0.1, 0.1, 0.1);

// 2. الشمس (DirectionalLight)
var sunLight = new BABYLON.DirectionalLight(
  'sunLight',
  new BABYLON.Vector3(-0.5, -1, -0.3),
  scene
);
sunLight.position = new BABYLON.Vector3(200, 300, 150);
sunLight.intensity = 2.2;
sunLight.diffuse = new BABYLON.Color3(1, 0.96, 0.85);
sunLight.specular = new BABYLON.Color3(1, 1, 1);

// ظلال عالية الجودة
var shadowGenerator = new BABYLON.ShadowGenerator(isMobile ? 1024 : 2048, sunLight);
shadowGenerator.useBlurExponentialShadowMap = true;
shadowGenerator.blurScale = 2;
shadowGenerator.setDarkness(0.35);
shadowGenerator.bias = 0.0005;
shadowGenerator.normalBias = 0.02;

console.log('💡 Lighting ready');

/* ═══════════════════════════════════════════════════════════
   السماء
   ═══════════════════════════════════════════════════════════ */
var skybox = BABYLON.MeshBuilder.CreateBox(
  'skybox',
  { size: 2000 },
  scene
);

var skyMaterial = new BABYLON.StandardMaterial('skyMat', scene);
skyMaterial.backFaceCulling = false;
skyMaterial.disableLighting = true;
skyMaterial.emissiveColor = new BABYLON.Color3(0.53, 0.81, 0.92);
skybox.material = skyMaterial;
skybox.infiniteDistance = true;

console.log('☁️ Sky ready');

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
    'اركب يا معلم، ده مشرط اللي معاك',
    'من عزبة بولضو، للشغل في شارع الجيش',
    'أهلاً وسهلاً، اتفضل ورا'
  ],
  driving: [
    'شارع الجيش ده بيتي',
    'الطريق زحمة النهاردة',
    'أنا مشرط، مفيش حد يقدر عليّا',
    'على فكرة، أنا من عزبة بولضو',
    'عدينا على شارع الصيدلية والفرن',
    'دي شارع عيلة نصير',
    'بعد كده كله أراضى زراعية',
    'كفر الدوار دي بلدي يا معلم',
    'قربنا نوصل يا باشا'
  ],
  arrived: [
    'وصلنا يا باشا، اتفضل',
    'الحمد لله، كنا في الموعد',
    'أيوه كده، المكان ده هو',
    'وصلنا بألف سلامة يسطا'
  ],
  angry: [
    '⚠️ خد بالك يا معلم!',
    '⚠️ إنت مش شايف؟!',
    '⚠️ الراجل كان هيموت!',
    '⚠️ خد بالك من الناس!'
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
   نظام الأصوات
   ═══════════════════════════════════════════════════════════ */
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
    s._tone(500, 500, 0.15, 0.15, 'square');
    setTimeout(function() { s._tone(600, 600, 0.2, 0.15, 'square'); }, 150);
  },
  
  playPickup: function() {
    if (this.ctx) this._tone(700, 1200, 0.25, 0.12, 'sine');
  },
  
  playDelivery: function() {
    if (!this.ctx) return;
    var s = this;
    s._tone(523, 523, 0.12, 0.12, 'sine');
    setTimeout(function() { s._tone(659, 659, 0.12, 0.12, 'sine'); }, 120);
    setTimeout(function() { s._tone(784, 784, 0.25, 0.12, 'sine'); }, 240);
  },
  
  playAngry: function() {
    if (this.ctx) this._tone(200, 100, 0.3, 0.12, 'sawtooth');
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
   المواد PBR - طبيعية واحترافية
   ═══════════════════════════════════════════════════════════ */
var MAT = {
  // أرضية
  ground: null,
  road: null,
  sidewalk: null,
  grass: null,
  
  // مباني
  wall: [],
  roof: [],
  
  // ناس
  skin: [],
  shirt: [],
  pants: [],
  
  // توك توك
  yellow: null,
  yellowDark: null,
  black: null,
  chrome: null,
  glass: null,
  
  // حقول
  field: []
};

function createMaterials() {
  console.log('🎨 إنشاء المواد PBR...');
  
  // ═══ أرضية عشبية واقعية ═══
  MAT.ground = new BABYLON.PBRMaterial('groundMat', scene);
  MAT.ground.albedoColor = new BABYLON.Color3(0.42, 0.62, 0.28);
  MAT.ground.metallic = 0;
  MAT.ground.roughness = 1;
  MAT.ground.specularIntensity = 0;
  
  // ═══ أسفلت الشوارع ═══
  MAT.road = new BABYLON.PBRMaterial('roadMat', scene);
  MAT.road.albedoColor = new BABYLON.Color3(0.13, 0.13, 0.15);
  MAT.road.metallic = 0.05;
  MAT.road.roughness = 0.95;
  
  // ═══ رصيف ═══
  MAT.sidewalk = new BABYLON.PBRMaterial('sidewalkMat', scene);
  MAT.sidewalk.albedoColor = new BABYLON.Color3(0.75, 0.72, 0.68);
  MAT.sidewalk.metallic = 0;
  MAT.sidewalk.roughness = 0.9;
  
  // ═══ مواد المباني - PBR واقعية ═══
  var wallColors = [
    { name: 'cream', color: [0.94, 0.88, 0.76] },
    { name: 'beige', color: [0.85, 0.75, 0.6] },
    { name: 'tan', color: [0.78, 0.65, 0.48] },
    { name: 'blue', color: [0.7, 0.78, 0.88] },
    { name: 'green', color: [0.72, 0.85, 0.7] },
    { name: 'pink', color: [0.9, 0.75, 0.75] },
    { name: 'white', color: [0.95, 0.95, 0.95] }
  ];
  
  for (var i = 0; i < wallColors.length; i++) {
    var wc = wallColors[i];
    var mat = new BABYLON.PBRMaterial('wall_' + wc.name, scene);
    mat.albedoColor = new BABYLON.Color3(wc.color[0], wc.color[1], wc.color[2]);
    mat.metallic = 0;
    mat.roughness = 0.85;
    MAT.wall.push(mat);
  }
  
  // أسطح المباني
  var roofColors = [
    { name: 'brick', color: [0.65, 0.32, 0.2] },
    { name: 'concrete', color: [0.6, 0.6, 0.6] },
    { name: 'tile', color: [0.7, 0.42, 0.32] }
  ];
  
  for (var i = 0; i < roofColors.length; i++) {
    var rc = roofColors[i];
    var mat2 = new BABYLON.PBRMaterial('roof_' + rc.name, scene);
    mat2.albedoColor = new BABYLON.Color3(rc.color[0], rc.color[1], rc.color[2]);
    mat2.metallic = 0;
    mat2.roughness = 0.9;
    MAT.roof.push(mat2);
  }
  
  // ═══ مواد الناس ═══
  var skinColors = [
    [0.96, 0.84, 0.72],
    [0.9, 0.75, 0.6],
    [0.82, 0.65, 0.5],
    [0.68, 0.5, 0.35]
  ];
  
  for (var i = 0; i < skinColors.length; i++) {
    var sc = skinColors[i];
    var skinMat = new BABYLON.PBRMaterial('skin_' + i, scene);
    skinMat.albedoColor = new BABYLON.Color3(sc[0], sc[1], sc[2]);
    skinMat.metallic = 0;
    skinMat.roughness = 0.9;
    MAT.skin.push(skinMat);
  }
  
  var shirtColors = [
    [0.9, 0.3, 0.25],
    [0.2, 0.6, 0.9],
    [0.3, 0.85, 0.4],
    [0.95, 0.6, 0.15],
    [0.6, 0.35, 0.7],
    [0.15, 0.75, 0.65],
    [0.9, 0.9, 0.9],
    [0.2, 0.25, 0.35]
  ];
  
  for (var i = 0; i < shirtColors.length; i++) {
    var shc = shirtColors[i];
    var shirtMat = new BABYLON.PBRMaterial('shirt_' + i, scene);
    shirtMat.albedoColor = new BABYLON.Color3(shc[0], shc[1], shc[2]);
    shirtMat.metallic = 0;
    shirtMat.roughness = 0.85;
    MAT.shirt.push(shirtMat);
  }
  
  var pantsColors = [
    [0.15, 0.2, 0.3],
    [0.1, 0.1, 0.1],
    [0.35, 0.35, 0.35],
    [0.4, 0.25, 0.15]
  ];
  
  for (var i = 0; i < pantsColors.length; i++) {
    var pc = pantsColors[i];
    var pantsMat = new BABYLON.PBRMaterial('pants_' + i, scene);
    pantsMat.albedoColor = new BABYLON.Color3(pc[0], pc[1], pc[2]);
    pantsMat.metallic = 0;
    pantsMat.roughness = 0.9;
    MAT.pants.push(pantsMat);
  }
  
  // ═══ توك توك ═══
  MAT.yellow = new BABYLON.PBRMaterial('tukYellow', scene);
  MAT.yellow.albedoColor = new BABYLON.Color3(1, 0.82, 0.1);
  MAT.yellow.metallic = 0.3;
  MAT.yellow.roughness = 0.35;
  
  MAT.yellowDark = new BABYLON.PBRMaterial('tukYellowDark', scene);
  MAT.yellowDark.albedoColor = new BABYLON.Color3(0.9, 0.72, 0);
  MAT.yellowDark.metallic = 0.3;
  MAT.yellowDark.roughness = 0.4;
  
  MAT.black = new BABYLON.PBRMaterial('tukBlack', scene);
  MAT.black.albedoColor = new BABYLON.Color3(0.06, 0.06, 0.06);
  MAT.black.metallic = 0.2;
  MAT.black.roughness = 0.6;
  
  MAT.chrome = new BABYLON.PBRMaterial('tukChrome', scene);
  MAT.chrome.albedoColor = new BABYLON.Color3(0.85, 0.85, 0.85);
  MAT.chrome.metallic = 1;
  MAT.chrome.roughness = 0.1;
  
  MAT.glass = new BABYLON.PBRMaterial('tukGlass', scene);
  MAT.glass.albedoColor = new BABYLON.Color3(0.7, 0.85, 1);
  MAT.glass.alpha = 0.35;
  MAT.glass.metallic = 0.1;
  MAT.glass.roughness = 0.05;
  MAT.glass.transparencyMode = BABYLON.PBRMaterial.PBRMATERIAL_ALPHABLEND;
  
  // ═══ حقول زراعية ═══
  var fieldColors = [
    [0.55, 0.75, 0.3],
    [0.45, 0.68, 0.25],
    [0.62, 0.8, 0.4],
    [0.72, 0.82, 0.35]
  ];
  
  for (var i = 0; i < fieldColors.length; i++) {
    var fc = fieldColors[i];
    var fMat = new BABYLON.PBRMaterial('field_' + i, scene);
    fMat.albedoColor = new BABYLON.Color3(fc[0], fc[1], fc[2]);
    fMat.metallic = 0;
    fMat.roughness = 1;
    MAT.field.push(fMat);
  }
  
  console.log('✅ Materials ready');
}

/* ═══════════════════════════════════════════════════════════
   الأرضية
   ═══════════════════════════════════════════════════════════ */
function createGround() {
  console.log('🌍 إنشاء الأرضية...');
  
  // الأرضية الرئيسية
  var ground = BABYLON.MeshBuilder.CreateGround(
    'ground',
    { width: 4000, height: 4000, subdivisions: 2 },
    scene
  );
  ground.material = MAT.ground;
  ground.receiveShadows = true;
  ground.position.y = -0.05;
}

/* ═══════════════════════════════════════════════════════════
   الشوارع
   ═══════════════════════════════════════════════════════════ */
var ROADS_DATA = [
  // ═══ شارع الجيش - المحور الرئيسي ═══
  { name: 'شارع الجيش', x: 0, z: 0, width: 24, length: 1600, rotation: 0, isMain: true },
  
  // ═══ الشوارع العرضية ═══
  { name: 'شارع أحمد عرابي', x: -400, z: 0, width: 20, length: 800, rotation: Math.PI / 2 },
  { name: 'شارع بورسعيد', x: -180, z: 0, width: 18, length: 600, rotation: Math.PI / 2 },
  { name: 'شارع الجمهورية', x: 100, z: 0, width: 18, length: 600, rotation: Math.PI / 2 },
  { name: 'شارع سعد زغلول', x: 300, z: 0, width: 16, length: 500, rotation: Math.PI / 2 },
  { name: 'شارع المحكمة', x: 450, z: 0, width: 16, length: 500, rotation: Math.PI / 2 },
  
  // ═══ شوارع موازية ═══
  { name: 'شارع النصر', x: -250, z: 350, width: 16, length: 600, rotation: 0 },
  { name: 'شارع المحور', x: 200, z: 300, width: 16, length: 600, rotation: 0 },
  { name: 'شارع التحرير', x: -150, z: -400, width: 16, length: 500, rotation: 0 },
  { name: 'شارع الموقف', x: 250, z: -350, width: 15, length: 500, rotation: 0 }
];

function createRoads() {
  console.log('🛣️ إنشاء الشوارع...');
  
  for (var i = 0; i < ROADS_DATA.length; i++) {
    var rd = ROADS_DATA[i];
    
    // جسم الشارع - Box (أفضل من Ground للفيزياء)
    var road = BABYLON.MeshBuilder.CreateBox(
      'road_' + i,
      {
        width: rd.width,
        height: 0.15,
        depth: rd.length
      },
      scene
    );
    
    road.material = MAT.road;
    road.position.set(rd.x, 0.075, rd.z);
    road.rotation.y = rd.rotation;
    road.receiveShadows = true;
    
    // الأرصفة على الجانبين
    for (var s = -1; s <= 1; s += 2) {
      var sidewalkWidth = 3;
      var sidewalkOffset = s * (rd.width / 2 + sidewalkWidth / 2);
      
      var dx = Math.cos(rd.rotation) * sidewalkOffset;
      var dz = -Math.sin(rd.rotation) * sidewalkOffset;
      
      var sidewalk = BABYLON.MeshBuilder.CreateBox(
        'sidewalk_' + i + '_' + s,
        {
          width: sidewalkWidth,
          height: 0.3,
          depth: rd.length
        },
        scene
      );
      
      sidewalk.material = MAT.sidewalk;
      sidewalk.position.set(rd.x + dx, 0.15, rd.z + dz);
      sidewalk.rotation.y = rd.rotation;
      sidewalk.receiveShadows = true;
    }
    
    // خطوط الطريق
    if (rd.width >= 18) {
      var lineCount = Math.floor(rd.length / 30);
      for (var j = 0; j < lineCount; j++) {
        var off = -rd.length / 2 + j * 30 + 15;
        var mark = BABYLON.MeshBuilder.CreateBox(
          'line_' + i + '_' + j,
          { width: 0.4, height: 0.05, depth: 8 },
          scene
        );
        
        var lineMat = new BABYLON.StandardMaterial('lineMat', scene);
        lineMat.emissiveColor = new BABYLON.Color3(1, 0.85, 0.2);
        lineMat.disableLighting = true;
        
        mark.material = lineMat;
        mark.position.set(
          rd.x + Math.sin(rd.rotation) * off,
          0.16,
          rd.z + Math.cos(rd.rotation) * off
        );
        mark.rotation.y = rd.rotation;
      }
    }
  }
}

/* ═══════════════════════════════════════════════════════════
   🌊 ترعة المحمودية
   ═══════════════════════════════════════════════════════════ */
function createCanal() {
  console.log('🌊 إنشاء الترعة...');
  
  // الماء
  var water = BABYLON.MeshBuilder.CreateGround(
    'canalWater',
    {
      width: CONFIG.citySize * 1.4,
      height: CONFIG.canalWidth,
      subdivisions: 10
    },
    scene
  );
  
  var waterMat = new BABYLON.PBRMaterial('waterMat', scene);
  waterMat.albedoColor = new BABYLON.Color3(0.15, 0.45, 0.68);
  waterMat.metallic = 0.4;
  waterMat.roughness = 0.15;
  waterMat.alpha = 0.9;
  water.material = waterMat;
  water.position.y = -0.3;
  
  // موجات بسيطة
  var waterBaseY = -0.3;
  scene.registerBeforeRender(function() {
    if (!water) return;
    var t = performance.now() * 0.001;
    water.position.y = waterBaseY + Math.sin(t) * 0.05;
  });
  
  // الضفتين
  for (var s = -1; s <= 1; s += 2) {
    var bank = BABYLON.MeshBuilder.CreateBox(
      'canalBank_' + s,
      {
        width: CONFIG.citySize * 1.4,
        height: 1.2,
        depth: 4
      },
      scene
    );
    
    var bankMat = new BABYLON.PBRMaterial('bankMat', scene);
    bankMat.albedoColor = new BABYLON.Color3(0.55, 0.45, 0.32);
    bankMat.metallic = 0;
    bankMat.roughness = 1;
    bank.material = bankMat;
    
    bank.position.set(0, 0.6, s * (CONFIG.canalWidth / 2 + 2));
    bank.receiveShadows = true;
  }
  
  // كوبري
  var bridge = BABYLON.MeshBuilder.CreateBox(
    'bridge',
    {
      width: 24,
      height: 2,
      depth: CONFIG.canalWidth + 18
    },
    scene
  );
  
  var bridgeMat = new BABYLON.PBRMaterial('bridgeMat', scene);
  bridgeMat.albedoColor = new BABYLON.Color3(0.5, 0.5, 0.5);
  bridgeMat.metallic = 0;
  bridgeMat.roughness = 0.9;
  bridge.material = bridgeMat;
  bridge.position.set(100, 1, 0);
  bridge.receiveShadows = true;
  shadowGenerator.addShadowCaster(bridge);
}

/* ═══════════════════════════════════════════════════════════
   🌾 عزبة بولضو
   (شارع الصيدلية والفرن + شارع عيلة نصير + أراضى زراعية)
   ═══════════════════════════════════════════════════════════ */
function createEzbetBoldu() {
  console.log('🌾 إنشاء عزبة بولضو...');
  
  var ezbetX = 550; // موقع العزبة شرق شارع الجيش
  
  // ═══════════════════════════════════════════════════════
  // الشارع الأول: شارع الصيدلية والفرن
  // ═══════════════════════════════════════════════════════
  var street1 = BABYLON.MeshBuilder.CreateBox(
    'ezbetStreet1',
    { width: 10, height: 0.15, depth: 250 },
    scene
  );
  street1.material = MAT.road;
  street1.position.set(ezbetX, 0.075, 0);
  street1.receiveShadows = true;
  
  // الأرصفة
  for (var s = -1; s <= 1; s += 2) {
    var sw1 = BABYLON.MeshBuilder.CreateBox(
      'ezbetSW1_' + s,
      { width: 2, height: 0.3, depth: 250 },
      scene
    );
    sw1.material = MAT.sidewalk;
    sw1.position.set(ezbetX + s * 6, 0.15, 0);
    sw1.receiveShadows = true;
  }
  
  // الصيدلية (على الشارع الأول)
  var pharmacy = createSimpleBuilding(ezbetX - 15, -60, 12, 12, 7, 'pharmacy');
  // الفرن (على الشارع الأول)
  var bakery = createSimpleBuilding(ezbetX + 15, 60, 12, 12, 8, 'bakery');
  
  // ═══════════════════════════════════════════════════════
  // الشارع التاني: شارع عيلة نصير
  // ═══════════════════════════════════════════════════════
  var street2 = BABYLON.MeshBuilder.CreateBox(
    'ezbetStreet2',
    { width: 10, height: 0.15, depth: 250 },
    scene
  );
  street2.material = MAT.road;
  street2.position.set(ezbetX + 80, 0.075, 0);
  street2.receiveShadows = true;
  
  for (var s = -1; s <= 1; s += 2) {
    var sw2 = BABYLON.MeshBuilder.CreateBox(
      'ezbetSW2_' + s,
      { width: 2, height: 0.3, depth: 250 },
      scene
    );
    sw2.material = MAT.sidewalk;
    sw2.position.set(ezbetX + 80 + s * 6, 0.15, 0);
    sw2.receiveShadows = true;
  }
  
  // بيوت عيلة نصير
  for (var i = 0; i < 6; i++) {
    var side = i % 2 === 0 ? -1 : 1;
    var zPos = -100 + Math.floor(i / 2) * 70;
    
    var house = createSimpleBuilding(
      ezbetX + 80 + side * 15,
      zPos,
      10,
      10,
      Utils.rand(5, 9),
      'house'
    );
  }
  
  // ═══════════════════════════════════════════════════════
  // الأراضى الزراعية (شرق عزبة بولضو)
  // ═══════════════════════════════════════════════════════
  for (var i = 0; i < 12; i++) {
    var field = BABYLON.MeshBuilder.CreateGround(
      'field_' + i,
      {
        width: Utils.rand(30, 60),
        height: Utils.rand(40, 80),
        subdivisions: 1
      },
      scene
    );
    
    field.material = Utils.pick(MAT.field);
    field.position.set(
      ezbetX + 200 + Utils.rand(-60, 120),
      0.05,
      Utils.rand(-300, 300)
    );
    field.rotation.y = Utils.rand(-0.2, 0.2);
    field.receiveShadows = true;
  }
  
  // نخيل على حدود الحقول
  for (var i = 0; i < 25; i++) {
    createPalm(
      ezbetX + 150 + Utils.rand(0, 200),
      Utils.rand(-300, 300),
      Utils.rand(0.9, 1.2)
    );
  }
  
  // ═══════════════════════════════════════════════════════
  // لافتات العزبة
  // ═══════════════════════════════════════════════════════
  createSignPost(ezbetX - 30, 0, 'عزبة بولضو', new BABYLON.Color3(0.54, 0.72, 0.29));
  createSignPost(ezbetX - 15, -100, 'شارع الصيدلية والفرن', new BABYLON.Color3(0.9, 0.4, 0.4));
  createSignPost(ezbetX + 80, -100, 'شارع عيلة نصير', new BABYLON.Color3(0.3, 0.5, 0.9));
}

/* ═══════════════════════════════════════════════════════════
   دالة إنشاء مبنى بسيط
   ═══════════════════════════════════════════════════════════ */
function createSimpleBuilding(x, z, w, d, h, type) {
  var building = BABYLON.MeshBuilder.CreateBox(
    'building_' + Math.random(),
    { width: w, height: h, depth: d },
    scene
  );
  
  // اختيار المادة
  var wallMat = Utils.pick(MAT.wall);
  building.material = wallMat;
  
  building.position.set(x, h / 2, z);
  building.receiveShadows = true;
  shadowGenerator.addShadowCaster(building);
  
  // سقف
  var roof = BABYLON.MeshBuilder.CreateBox(
    'roof',
    { width: w + 0.4, height: 0.4, depth: d + 0.4 },
    scene
  );
  roof.material = Utils.pick(MAT.roof);
  roof.position.set(x, h + 0.2, z);
  shadowGenerator.addShadowCaster(roof);
  
  // باب
  var doorMat = new BABYLON.PBRMaterial('door', scene);
  doorMat.albedoColor = new BABYLON.Color3(0.35, 0.2, 0.1);
  doorMat.metallic = 0;
  doorMat.roughness = 0.8;
  
  var door = BABYLON.MeshBuilder.CreateBox(
    'door',
    { width: 1.3, height: 2.5, depth: 0.15 },
    scene
  );
  door.material = doorMat;
  door.position.set(x, 1.25, z + d / 2 + 0.1);
  
  // نوافذ
  for (var f = 0; f < Math.floor(h / 3); f++) {
    var winY = 2 + f * 3;
    if (winY > h - 1) break;
    
    for (var c = -1; c <= 1; c += 2) {
      var win = BABYLON.MeshBuilder.CreateBox(
        'win',
        { width: 1.2, height: 1.5, depth: 0.15 },
        scene
      );
      
      var winMat = new BABYLON.PBRMaterial('winGlass', scene);
      winMat.albedoColor = new BABYLON.Color3(0.5, 0.7, 0.9);
      winMat.metallic = 0.5;
      winMat.roughness = 0.1;
      winMat.alpha = 0.7;
      win.material = winMat;
      
      win.position.set(x + c * w * 0.25, winY, z + d / 2 + 0.1);
    }
  }
  
  // لو الصيدلية - لافتة خضراء
  if (type === 'pharmacy') {
    var signMat = new BABYLON.StandardMaterial('signMat', scene);
    signMat.emissiveColor = new BABYLON.Color3(0.1, 0.8, 0.3);
    signMat.disableLighting = true;
    
    var sign = BABYLON.MeshBuilder.CreateBox(
      'pharmSign',
      { width: w * 0.7, height: 0.8, depth: 0.1 },
      scene
    );
    sign.material = signMat;
    sign.position.set(x, 3.5, z + d / 2 + 0.2);
  }
  
  // لو الفرن - لافتة حمراء
  if (type === 'bakery') {
    var signMat2 = new BABYLON.StandardMaterial('bakerySignMat', scene);
    signMat2.emissiveColor = new BABYLON.Color3(1, 0.4, 0.1);
    signMat2.disableLighting = true;
    
    var sign2 = BABYLON.MeshBuilder.CreateBox(
      'bakerySign',
      { width: w * 0.7, height: 0.8, depth: 0.1 },
      scene
    );
    sign2.material = signMat2;
    sign2.position.set(x, 3.5, z + d / 2 + 0.2);
  }
  
  return building;
}

/* ═══════════════════════════════════════════════════════════
   دالة إنشاء عمود لافتة
   ═══════════════════════════════════════════════════════════ */
function createSignPost(x, z, text, color) {
  // العمود
  var poleMat = new BABYLON.PBRMaterial('poleMat', scene);
  poleMat.albedoColor = new BABYLON.Color3(0.5, 0.5, 0.5);
  poleMat.metallic = 0.8;
  poleMat.roughness = 0.3;
  
  var pole = BABYLON.MeshBuilder.CreateCylinder(
    'pole',
    { height: 6, diameter: 0.2 },
    scene
  );
  pole.material = poleMat;
  pole.position.set(x, 3, z);
  
  // اللافتة
  var signMat = new BABYLON.StandardMaterial('signMat_' + Math.random(), scene);
  signMat.emissiveColor = color;
  signMat.disableLighting = true;
  
  var sign = BABYLON.MeshBuilder.CreateBox(
    'sign',
    { width: 6, height: 1.5, depth: 0.2 },
    scene
  );
  sign.material = signMat;
  sign.position.set(x, 5.5, z);
  sign.rotation.y = Math.PI / 2;
}

/* ═══════════════════════════════════════════════════════════
   الأشجار والنخيل
   ═══════════════════════════════════════════════════════════ */
function createPalm(x, z, scale) {
  scale = scale || 1;
  
  // الجذع
  var trunkMat = new BABYLON.PBRMaterial('palmTrunk', scene);
  trunkMat.albedoColor = new BABYLON.Color3(0.55, 0.4, 0.25);
  trunkMat.metallic = 0;
  trunkMat.roughness = 0.95;
  
  var trunk = BABYLON.MeshBuilder.CreateCylinder(
    'trunk',
    { height: 6 * scale, diameterTop: 0.25 * scale, diameterBottom: 0.4 * scale },
    scene
  );
  trunk.material = trunkMat;
  trunk.position.set(x, 3 * scale, z);
  shadowGenerator.addShadowCaster(trunk);
  
  // الأوراق
  var leafMat = new BABYLON.PBRMaterial('palmLeaf', scene);
  leafMat.albedoColor = new BABYLON.Color3(0.3, 0.6, 0.25);
  leafMat.metallic = 0;
  leafMat.roughness = 0.85;
  leafMat.backFaceCulling = false;
  
  for (var i = 0; i < 8; i++) {
    var angle = (i / 8) * Math.PI * 2;
    var leaf = BABYLON.MeshBuilder.CreateBox(
      'leaf',
      { width: 0.7 * scale, height: 0.08, depth: 3 * scale },
      scene
    );
    leaf.material = leafMat;
    leaf.position.set(
      x + Math.cos(angle) * 1.2 * scale,
      6 * scale,
      z + Math.sin(angle) * 1.2 * scale
    );
    leaf.rotation.y = angle;
    leaf.rotation.x = -0.4;
    shadowGenerator.addShadowCaster(leaf);
  }
}

function createTree(x, z, scale) {
  scale = scale || 1;
  
  var trunkMat = new BABYLON.PBRMaterial('trunkMat', scene);
  trunkMat.albedoColor = new BABYLON.Color3(0.4, 0.28, 0.18);
  trunkMat.metallic = 0;
  trunkMat.roughness = 1;
  
  var trunk = BABYLON.MeshBuilder.CreateCylinder(
    'treeTrunk',
    { height: 2.5 * scale, diameter: 0.4 * scale },
    scene
  );
  trunk.material = trunkMat;
  trunk.position.set(x, 1.25 * scale, z);
  shadowGenerator.addShadowCaster(trunk);
  
  var leafMat = new BABYLON.PBRMaterial('leafMat', scene);
  leafMat.albedoColor = new BABYLON.Color3(0.3, 0.65, 0.25);
  leafMat.metallic = 0;
  leafMat.roughness = 0.9;
  
  var leaves = BABYLON.MeshBuilder.CreateSphere(
    'leaves',
    { diameter: 3 * scale, segments: 8 },
    scene
  );
  leaves.material = leafMat;
  leaves.position.set(x, 3.2 * scale, z);
  shadowGenerator.addShadowCaster(leaves);
}

/* ═══════════════════════════════════════════════════════════
   المباني العامة (خارج عزبة بولضو)
   ═══════════════════════════════════════════════════════════ */
function isOnRoad(x, z, pad) {
  pad = pad || 0;
  for (var i = 0; i < ROADS_DATA.length; i++) {
    var r = ROADS_DATA[i];
    var hw = r.width / 2 + 3 + pad;
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

function createBuildings() {
  console.log('🏢 إنشاء المباني...');
  
  var buildingCount = 0;
  var half = CONFIG.citySize / 2;
  
  for (var gx = -half; gx < half; gx += 40) {
    for (var gz = -half; gz < half; gz += 40) {
      var x = gx + 20 + Utils.rand(-3, 3);
      var z = gz + 20 + Utils.rand(-3, 3);
      
      if (isOnRoad(x, z, 5)) continue;
      if (Math.abs(z) < CONFIG.canalWidth / 2 + 15) continue;
      if (x > 400) continue; // عزبة بولضو
      if (Math.abs(x) < 30 && Math.abs(z) < 30) continue;
      if (Math.random() > 0.55) continue;
      if (buildingCount >= (isMobile ? 150 : 300)) break;
      
      var w = Utils.rand(10, 16);
      var d = Utils.rand(10, 16);
      var h = Utils.rand(6, 18);
      
      createSimpleBuilding(x, z, w, d, h, 'normal');
      buildingCount++;
    }
  }
  
  console.log('✅ اتبنى ' + buildingCount + ' مبنى');
}

/* ═══════════════════════════════════════════════════════════
   بناء المدينة كلها
   ═══════════════════════════════════════════════════════════ */
async function buildCity(onProgress) {
  var steps = [
    { name: 'إنشاء المواد PBR...', fn: createMaterials, weight: 5 },
    { name: 'إنشاء الأرضية...', fn: createGround, weight: 3 },
    { name: 'بناء الشوارع...', fn: createRoads, weight: 15 },
    { name: 'بناء الترعة...', fn: createCanal, weight: 8 },
    { name: 'بناء عزبة بولضو...', fn: createEzbetBoldu, weight: 15 },
    { name: 'بناء المباني...', fn: createBuildings, weight: 25 }
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
      }, 30);
    });
    
    accumulated += step.weight;
  }
  
  if (onProgress) onProgress(100, 'جاهز! 🚀');
}

/* ═══════════════════════════════════════════════════════════
   تصدير للجزء التاني
   ═══════════════════════════════════════════════════════════ */
window._scene = scene;
window._engine = engine;
window._camera = camera;
window._shadowGenerator = shadowGenerator;
window._UI = UI;
window._Utils = Utils;
window._MAT = MAT;
window._CONFIG = CONFIG;
window._DIALOGS = DIALOGS;
window._radio = radio;
window._AudioSystem = AudioSystem;
window._buildCity = buildCity;
window._createPalm = createPalm;
window._createTree = createTree;
window._createSimpleBuilding = createSimpleBuilding;

console.log('✅ الجزء 1 تم تحميله - Babylon.js Engine + المدينة');

/* ============================================================
   🚕 الجزء 2: التوك توك + مشرط + الركاب + الحلقة الرئيسية
   ============================================================ */

/* ═══════════════════════════════════════════════════════════
   🛺 التوك توك الكامل بـ Babylon.js
   ═══════════════════════════════════════════════════════════ */
function createTukTuk() {
  console.log('🛺 إنشاء التوك توك...');
  
  // كل حاجة في الأب
  var root = new BABYLON.TransformNode('tukTukRoot', scene);
  var parts = [];
  
  // ═══ الشاسيه ═══
  var chassis = BABYLON.MeshBuilder.CreateBox('chassis',
    { width: 1.4, height: 0.15, depth: 2.6 }, scene);
  chassis.material = MAT.black;
  chassis.position.y = 0.42;
  chassis.parent = root;
  shadowGenerator.addShadowCaster(chassis);
  parts.push(chassis);
  
  var floorF = BABYLON.MeshBuilder.CreateBox('floorF',
    { width: 1.35, height: 0.1, depth: 1.05 }, scene);
  floorF.material = MAT.black;
  floorF.position.set(0, 0.52, 0.75);
  floorF.parent = root;
  parts.push(floorF);
  
  var floorR = BABYLON.MeshBuilder.CreateBox('floorR',
    { width: 1.35, height: 0.1, depth: 1.4 }, scene);
  floorR.material = MAT.black;
  floorR.position.set(0, 0.52, -0.6);
  floorR.parent = root;
  parts.push(floorR);
  
  // ═══ المقدمة ═══
  var frontPanel = BABYLON.MeshBuilder.CreateBox('frontPanel',
    { width: 1.36, height: 0.9, depth: 0.2 }, scene);
  frontPanel.material = MAT.yellow;
  frontPanel.position.set(0, 1.05, 1.2);
  frontPanel.parent = root;
  shadowGenerator.addShadowCaster(frontPanel);
  parts.push(frontPanel);
  
  var frontCabin = BABYLON.MeshBuilder.CreateBox('frontCabin',
    { width: 1.36, height: 0.9, depth: 1.05 }, scene);
  frontCabin.material = MAT.yellow;
  frontCabin.position.set(0, 1.05, 0.65);
  frontCabin.parent = root;
  shadowGenerator.addShadowCaster(frontCabin);
  parts.push(frontCabin);
  
  // غطاء المقدمة
  var hood = BABYLON.MeshBuilder.CreateBox('hood',
    { width: 1.36, height: 0.1, depth: 0.55 }, scene);
  hood.material = MAT.yellowDark;
  hood.position.set(0, 1.52, 1.05);
  hood.rotation.x = -0.08;
  hood.parent = root;
  parts.push(hood);
  
  // ═══ خط أحمر عريض ═══
  var redMat = new BABYLON.PBRMaterial('redStripe', scene);
  redMat.albedoColor = new BABYLON.Color3(0.85, 0.15, 0.15);
  redMat.metallic = 0.2;
  redMat.roughness = 0.5;
  
  for (var s = -1; s <= 1; s += 2) {
    var redStripe = BABYLON.MeshBuilder.CreateBox('redStripe_' + s,
      { width: 0.05, height: 0.4, depth: 2.3 }, scene);
    redStripe.material = redMat;
    redStripe.position.set(s * 0.69, 1.1, 0.05);
    redStripe.parent = root;
    parts.push(redStripe);
  }
  
  // ═══ الكابينة الخلفية ═══
  var rearCabin = BABYLON.MeshBuilder.CreateBox('rearCabin',
    { width: 1.4, height: 1.6, depth: 1.5 }, scene);
  rearCabin.material = MAT.yellow;
  rearCabin.position.set(0, 1.35, -0.6);
  rearCabin.parent = root;
  shadowGenerator.addShadowCaster(rearCabin);
  parts.push(rearCabin);
  
  // خط أسود فاصل
  var stripe = BABYLON.MeshBuilder.CreateBox('stripe',
    { width: 1.42, height: 0.12, depth: 1.52 }, scene);
  stripe.material = MAT.black;
  stripe.position.set(0, 1.5, -0.6);
  stripe.parent = root;
  parts.push(stripe);
  
  // ═══ السقف ═══
  var roof = BABYLON.MeshBuilder.CreateBox('roof',
    { width: 1.5, height: 0.15, depth: 2.7 }, scene);
  roof.material = MAT.black;
  roof.position.set(0, 2.25, 0);
  roof.parent = root;
  shadowGenerator.addShadowCaster(roof);
  parts.push(roof);
  
  // حافة كروم
  var roofTrim = BABYLON.MeshBuilder.CreateBox('roofTrim',
    { width: 1.52, height: 0.06, depth: 2.72 }, scene);
  roofTrim.material = MAT.chrome;
  roofTrim.position.set(0, 2.16, 0);
  roofTrim.parent = root;
  parts.push(roofTrim);
  
  // ═══ أعمدة السقف ═══
  var pillarPositions = [
    [-0.68, 1.35, -1.3], [0.68, 1.35, -1.3],
    [-0.68, 1.35, -0.05], [0.68, 1.35, -0.05],
    [-0.68, 1.35, 1.15], [0.68, 1.35, 1.15]
  ];
  
  for (var i = 0; i < pillarPositions.length; i++) {
    var pillar = BABYLON.MeshBuilder.CreateCylinder('pillar_' + i,
      { height: 1.85, diameter: 0.1 }, scene);
    pillar.material = MAT.black;
    pillar.position.set(pillarPositions[i][0], pillarPositions[i][1], pillarPositions[i][2]);
    pillar.parent = root;
    parts.push(pillar);
  }
  
  // ═══ الزجاج ═══
  var windshield = BABYLON.MeshBuilder.CreateBox('windshield',
    { width: 1.3, height: 0.9, depth: 0.05 }, scene);
  windshield.material = MAT.glass;
  windshield.position.set(0, 1.95, 1.18);
  windshield.parent = root;
  parts.push(windshield);
  
  for (var s = -1; s <= 1; s += 2) {
    var sideGlassF = BABYLON.MeshBuilder.CreateBox('sideGlassF_' + s,
      { width: 0.05, height: 0.85, depth: 0.95 }, scene);
    sideGlassF.material = MAT.glass;
    sideGlassF.position.set(s * 0.69, 1.9, 0.65);
    sideGlassF.parent = root;
    parts.push(sideGlassF);
    
    var sideGlassR = BABYLON.MeshBuilder.CreateBox('sideGlassR_' + s,
      { width: 0.05, height: 1.05, depth: 1.3 }, scene);
    sideGlassR.material = MAT.glass;
    sideGlassR.position.set(s * 0.71, 1.85, -0.6);
    sideGlassR.parent = root;
    parts.push(sideGlassR);
  }
  
  var rearGlass = BABYLON.MeshBuilder.CreateBox('rearGlass',
    { width: 1.36, height: 1.1, depth: 0.05 }, scene);
  rearGlass.material = MAT.glass;
  rearGlass.position.set(0, 1.85, -1.36);
  rearGlass.parent = root;
  parts.push(rearGlass);
  
  // ═══ الشبكة الأمامية ═══
  var grillFrame = BABYLON.MeshBuilder.CreateBox('grillFrame',
    { width: 0.95, height: 0.4, depth: 0.08 }, scene);
  grillFrame.material = MAT.chrome;
  grillFrame.position.set(0, 1.05, 1.29);
  grillFrame.parent = root;
  parts.push(grillFrame);
  
  for (var i = 0; i < 5; i++) {
    var slat = BABYLON.MeshBuilder.CreateBox('slat_' + i,
      { width: 0.88, height: 0.04, depth: 0.05 }, scene);
    slat.material = MAT.black;
    slat.position.set(0, 0.9 + i * 0.07, 1.33);
    slat.parent = root;
    parts.push(slat);
  }
  
  // ═══ المصابيح الأمامية ═══
  var headlightMat = new BABYLON.StandardMaterial('headlightMat', scene);
  headlightMat.emissiveColor = new BABYLON.Color3(1, 1, 0.8);
  headlightMat.disableLighting = true;
  
  for (var s = -1; s <= 1; s += 2) {
    var hlFrame = BABYLON.MeshBuilder.CreateCylinder('hlFrame_' + s,
      { height: 0.12, diameter: 0.28, tessellation: 16 }, scene);
    hlFrame.material = MAT.chrome;
    hlFrame.rotation.x = Math.PI / 2;
    hlFrame.position.set(s * 0.48, 1.25, 1.26);
    hlFrame.parent = root;
    parts.push(hlFrame);
    
    var hlGlass = BABYLON.MeshBuilder.CreateCylinder('hlGlass_' + s,
      { height: 0.12, diameter: 0.24, tessellation: 16 }, scene);
    hlGlass.material = headlightMat;
    hlGlass.rotation.x = Math.PI / 2;
    hlGlass.position.set(s * 0.48, 1.25, 1.3);
    hlGlass.parent = root;
    parts.push(hlGlass);
  }
  
  // ═══ الفوانيس الخلفية ═══
  var taillightMat = new BABYLON.StandardMaterial('taillightMat', scene);
  taillightMat.emissiveColor = new BABYLON.Color3(1, 0.15, 0.15);
  taillightMat.disableLighting = true;
  
  for (var s = -1; s <= 1; s += 2) {
    var tl = BABYLON.MeshBuilder.CreateBox('taillight_' + s,
      { width: 0.15, height: 0.28, depth: 0.08 }, scene);
    tl.material = taillightMat;
    tl.position.set(s * 0.52, 1, -1.39);
    tl.parent = root;
    parts.push(tl);
  }
  
  // ═══ المقود ═══
  var steerRoot = new BABYLON.TransformNode('steerRoot', scene);
  steerRoot.position.set(0, 1.65, 0.9);
  steerRoot.rotation.x = -0.4;
  steerRoot.parent = root;
  
  var steerRing = BABYLON.MeshBuilder.CreateTorus('steerRing',
    { diameter: 0.34, thickness: 0.05, tessellation: 16 }, scene);
  steerRing.material = MAT.black;
  steerRing.parent = steerRoot;
  
  for (var i = 0; i < 3; i++) {
    var spoke = BABYLON.MeshBuilder.CreateBox('spoke_' + i,
      { width: 0.03, height: 0.16, depth: 0.02 }, scene);
    spoke.material = MAT.black;
    spoke.rotation.z = (i / 3) * Math.PI * 2;
    spoke.parent = steerRoot;
  }
  
  // ═══ المقاعد ═══
  var seatMat = new BABYLON.PBRMaterial('seatMat', scene);
  seatMat.albedoColor = new BABYLON.Color3(0.15, 0.15, 0.15);
  seatMat.metallic = 0;
  seatMat.roughness = 0.9;
  
  var seatDriver = BABYLON.MeshBuilder.CreateBox('seatDriver',
    { width: 0.65, height: 0.15, depth: 0.6 }, scene);
  seatDriver.material = seatMat;
  seatDriver.position.set(0, 0.85, 0.45);
  seatDriver.parent = root;
  parts.push(seatDriver);
  
  var backDriver = BABYLON.MeshBuilder.CreateBox('backDriver',
    { width: 0.65, height: 0.65, depth: 0.1 }, scene);
  backDriver.material = seatMat;
  backDriver.position.set(0, 1.2, 0.18);
  backDriver.parent = root;
  parts.push(backDriver);
  
  var rearSeat = BABYLON.MeshBuilder.CreateBox('rearSeat',
    { width: 1.3, height: 0.15, depth: 0.65 }, scene);
  rearSeat.material = seatMat;
  rearSeat.position.set(0, 0.85, -0.75);
  rearSeat.parent = root;
  parts.push(rearSeat);
  
  var rearBack = BABYLON.MeshBuilder.CreateBox('rearBack',
    { width: 1.3, height: 0.75, depth: 0.1 }, scene);
  rearBack.material = seatMat;
  rearBack.position.set(0, 1.25, -1.08);
  rearBack.parent = root;
  parts.push(rearBack);
  
  // ═══ العجلات ═══
  var wheels = [];
  
  function makeWheel(wx, wz, isFront) {
    var wg = new BABYLON.TransformNode('wheel_' + Math.random(), scene);
    wg.parent = root;
    wg.position.set(wx, 0.32, wz);
    
    // الإطار (Torus كبير)
    var tire = BABYLON.MeshBuilder.CreateTorus('tire',
      { diameter: 0.65, thickness: 0.22, tessellation: 16 }, scene);
    tire.material = MAT.black;
    tire.rotation.z = Math.PI / 2;
    tire.parent = wg;
    shadowGenerator.addShadowCaster(tire);
    
    // الجنط
    var rim = BABYLON.MeshBuilder.CreateCylinder('rim',
      { height: 0.18, diameter: 0.4, tessellation: 16 }, scene);
    rim.material = MAT.chrome;
    rim.rotation.z = Math.PI / 2;
    rim.parent = wg;
    
    wg.userData = { isFront: isFront, tire: tire };
    wheels.push(wg);
    return wg;
  }
  
  var frontWheel = makeWheel(0, 1.2, true);
  makeWheel(-0.68, -0.85, false);
  makeWheel(0.68, -0.85, false);
  
  // ═══════════════════════════════════════════════════════
  // 👳 مشرط في الكابينة
  // ═══════════════════════════════════════════════════════
  var driver = new BABYLON.TransformNode('driver', scene);
  driver.parent = root;
  driver.position.set(0, 0, 0.45);
  driver.rotation.y = Math.PI;
  
  // الجلابية البيضاء
  var galabeyaMat = new BABYLON.PBRMaterial('galabeya', scene);
  galabeyaMat.albedoColor = new BABYLON.Color3(0.95, 0.94, 0.9);
  galabeyaMat.metallic = 0;
  galabeyaMat.roughness = 0.85;
  
  // الجسم
  var torso = BABYLON.MeshBuilder.CreateBox('driverTorso',
    { width: 0.5, height: 0.65, depth: 0.35 }, scene);
  torso.material = galabeyaMat;
  torso.position.y = 1.15;
  torso.parent = driver;
  shadowGenerator.addShadowCaster(torso);
  
  // الرقبة
  var neck = BABYLON.MeshBuilder.CreateCylinder('driverNeck',
    { height: 0.1, diameter: 0.18 }, scene);
  neck.material = Utils.pick(MAT.skin);
  neck.position.y = 1.53;
  neck.parent = driver;
  
  // الرأس
  var head = BABYLON.MeshBuilder.CreateSphere('driverHead',
    { diameter: 0.4, segments: 12 }, scene);
  head.material = Utils.pick(MAT.skin);
  head.position.y = 1.72;
  head.parent = driver;
  shadowGenerator.addShadowCaster(head);
  
  // العيون
  var eyeBlackMat = new BABYLON.StandardMaterial('eyeBlackMat', scene);
  eyeBlackMat.emissiveColor = new BABYLON.Color3(0.1, 0.1, 0.1);
  eyeBlackMat.disableLighting = true;
  
  for (var s = -1; s <= 1; s += 2) {
    var eye = BABYLON.MeshBuilder.CreateSphere('eye_' + s,
      { diameter: 0.06, segments: 8 }, scene);
    eye.material = eyeBlackMat;
    eye.position.set(s * 0.07, 1.74, 0.17);
    eye.parent = driver;
  }
  
  // الشنب
  var mustacheMat = new BABYLON.PBRMaterial('mustacheMat', scene);
  mustacheMat.albedoColor = new BABYLON.Color3(0.08, 0.08, 0.08);
  mustacheMat.metallic = 0;
  mustacheMat.roughness = 0.9;
  
  var mustache = BABYLON.MeshBuilder.CreateBox('mustache',
    { width: 0.18, height: 0.04, depth: 0.05 }, scene);
  mustache.material = mustacheMat;
  mustache.position.set(0, 1.66, 0.19);
  mustache.parent = driver;
  
  // العمة
  var turbanMat = new BABYLON.PBRMaterial('turbanMat', scene);
  turbanMat.albedoColor = new BABYLON.Color3(0.96, 0.96, 0.9);
  turbanMat.metallic = 0;
  turbanMat.roughness = 0.9;
  
  var turban = BABYLON.MeshBuilder.CreateSphere('turban',
    { diameter: 0.45, segments: 10 }, scene);
  turban.material = turbanMat;
  turban.position.y = 1.78;
  turban.scaling.y = 0.55;
  turban.parent = driver;
  
  // الذراعين
  var armR = BABYLON.MeshBuilder.CreateBox('driverArmR',
    { width: 0.14, height: 0.6, depth: 0.14 }, scene);
  armR.material = galabeyaMat;
  armR.position.set(0.32, 1.15, 0.2);
  armR.rotation.x = -0.7;
  armR.parent = driver;
  
  var armL = BABYLON.MeshBuilder.CreateBox('driverArmL',
    { width: 0.14, height: 0.6, depth: 0.14 }, scene);
  armL.material = galabeyaMat;
  armL.position.set(-0.32, 1.15, 0.05);
  armL.rotation.x = -0.4;
  armL.parent = driver;
  
  // الإضاءة الأمامية الفعلية
  var headlightLight = new BABYLON.SpotLight('headlightLight',
    new BABYLON.Vector3(0, 1.3, 1.3),
    new BABYLON.Vector3(0, 0, 1),
    Math.PI / 3, 2, scene);
  headlightLight.intensity = 2;
  headlightLight.parent = root;
  
  return {
    root: root,
    parts: parts,
    wheels: wheels,
    steeringWheel: steerRoot,
    driver: driver
  };
}

/* ═══════════════════════════════════════════════════════════
   👥 الركاب
   ═══════════════════════════════════════════════════════════ */
function createPassengerMesh() {
  var group = new BABYLON.TransformNode('passenger_' + Math.random(), scene);
  
  var skin = Utils.pick(MAT.skin);
  var shirt = Utils.pick(MAT.shirt);
  var pants = Utils.pick(MAT.pants);
  
  // الجسم
  var torso = BABYLON.MeshBuilder.CreateBox('p_torso',
    { width: 0.5, height: 0.7, depth: 0.32 }, scene);
  torso.material = shirt;
  torso.position.y = 1.15;
  torso.parent = group;
  shadowGenerator.addShadowCaster(torso);
  
  // الرأس
  var head = BABYLON.MeshBuilder.CreateSphere('p_head',
    { diameter: 0.4, segments: 10 }, scene);
  head.material = skin;
  head.position.y = 1.7;
  head.parent = group;
  shadowGenerator.addShadowCaster(head);
  
  // العيون
  var eyeMat = new BABYLON.StandardMaterial('p_eyeMat_' + Math.random(), scene);
  eyeMat.emissiveColor = new BABYLON.Color3(0.1, 0.1, 0.1);
  eyeMat.disableLighting = true;
  
  for (var s = -1; s <= 1; s += 2) {
    var eye = BABYLON.MeshBuilder.CreateSphere('p_eye_' + s,
      { diameter: 0.055, segments: 6 }, scene);
    eye.material = eyeMat;
    eye.position.set(s * 0.07, 1.72, 0.17);
    eye.parent = group;
  }
  
  // الأرجل
  var legs = BABYLON.MeshBuilder.CreateBox('p_legs',
    { width: 0.5, height: 0.85, depth: 0.32 }, scene);
  legs.material = pants;
  legs.position.y = 0.42;
  legs.parent = group;
  shadowGenerator.addShadowCaster(legs);
  
  // الذراعين
  var armGeo = { width: 0.14, height: 0.62, depth: 0.14 };
  var armL = BABYLON.MeshBuilder.CreateBox('p_armL', armGeo, scene);
  armL.material = shirt;
  armL.position.set(-0.32, 1.15, 0);
  armL.parent = group;
  
  var armR = BABYLON.MeshBuilder.CreateBox('p_armR', armGeo, scene);
  armR.material = shirt;
  armR.position.set(0.32, 1.15, 0);
  armR.parent = group;
  
  // ═══════════════════════════════════════════════════════
  // 🟢 هالة أرضية نابضة (GlowLayer)
  // ═══════════════════════════════════════════════════════
  var ringMat = new BABYLON.StandardMaterial('ringMat_' + Math.random(), scene);
  ringMat.emissiveColor = new BABYLON.Color3(0, 1, 0.5);
  ringMat.disableLighting = true;
  ringMat.alpha = 0.8;
  
  var ring = BABYLON.MeshBuilder.CreateDisc('p_ring',
    { radius: 1.3, tessellation: 32 }, scene);
  ring.material = ringMat;
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.05;
  ring.parent = group;
  
  // ═══════════════════════════════════════════════════════
  // 🟢 سهم كبير لفوق
  // ═══════════════════════════════════════════════════════
  var arrowMat = new BABYLON.StandardMaterial('arrowMat_' + Math.random(), scene);
  arrowMat.emissiveColor = new BABYLON.Color3(0, 1, 0.5);
  arrowMat.disableLighting = true;
  
  var arrow = BABYLON.MeshBuilder.CreateCylinder('p_arrow',
    { height: 1, diameterTop: 0, diameterBottom: 0.6, tessellation: 4 }, scene);
  arrow.material = arrowMat;
  arrow.position.y = 3.2;
  arrow.rotation.x = Math.PI;
  arrow.parent = group;
  
  // ═══════════════════════════════════════════════════════
  // 🟢 عمود ضوء للسماء
  // ═══════════════════════════════════════════════════════
  var beamMat = new BABYLON.StandardMaterial('beamMat_' + Math.random(), scene);
  beamMat.emissiveColor = new BABYLON.Color3(0, 1, 0.5);
  beamMat.disableLighting = true;
  beamMat.alpha = 0.4;
  
  var beam = BABYLON.MeshBuilder.CreateCylinder('p_beam',
    { height: 8, diameterTop: 0.3, diameterBottom: 0.8, tessellation: 12 }, scene);
  beam.material = beamMat;
  beam.position.y = 6;
  beam.parent = group;
  
  group.metadata = {
    ring: ring,
    arrow: arrow,
    beam: beam
  };
  
  return group;
}

/* ═══════════════════════════════════════════════════════════
   📊 إعداد Game State
   ═══════════════════════════════════════════════════════════ */
var gameState = {
  running: false,
  paused: false,
  money: 0,
  deliveries: 0,
  ratingSum: 0,
  ratingCount: 0,
  timeLeft: CONFIG.gameDuration,
  elapsedTime: 0,
  spawnTimer: 0,
  dialogTimer: 5,
  showingCafeScene: false,
  cafeSceneTimer: 0,
  cafeSceneRoot: null
};

var player = {
  speed: 0,
  steering: 0,
  currentWheelAngle: 0,
  engineOn: true,
  handbrake: false,
  hasPassenger: false,
  currentPassenger: null,
  tripStartTime: 0,
  bumpCount: 0
};

var passengers = [];
var cars = [];
var people = [];
var activeDestination = null;

/* ═══════════════════════════════════════════════════════════
   إنشاء التوك توك في المشهد
   ═══════════════════════════════════════════════════════════ */
var tukTukObj = createTukTuk();
var tukTuk = tukTukObj.root;
tukTuk.position.set(0, 0, 100);

/* ═══════════════════════════════════════════════════════════
   👥 نظام الركاب
   ═══════════════════════════════════════════════════════════ */
var DESTINATIONS_DATA = [
  { name: 'محطة قطار كفر الدوار', x: -300, z: -120, color: new BABYLON.Color3(0.63, 0.32, 0.17) },
  { name: 'مسجد الثورة', x: -120, z: 180, color: new BABYLON.Color3(0.09, 0.63, 0.52) },
  { name: 'شركة مصر للغزل والنسيج', x: 450, z: -280, color: new BABYLON.Color3(0.58, 0.65, 0.65) },
  { name: 'موقف عزيز المصري', x: 200, z: 80, color: new BABYLON.Color3(0.9, 0.3, 0.24) },
  { name: 'مستشفى كفر الدوار العام', x: -450, z: 130, color: new BABYLON.Color3(0.2, 0.6, 0.86) },
  { name: 'سوق الأربعاء', x: 120, z: 240, color: new BABYLON.Color3(0.61, 0.35, 0.71) },
  { name: 'كورنيش ترعة المحمودية', x: 450, z: -30, color: new BABYLON.Color3(0.16, 0.5, 0.72) },
  { name: 'عزبة بولضو', x: 550, z: 100, color: new BABYLON.Color3(0.54, 0.72, 0.29) },
  { name: 'شارع الصيدلية والفرن', x: 535, z: -60, color: new BABYLON.Color3(0.9, 0.4, 0.4) },
  { name: 'شارع عيلة نصير', x: 630, z: 60, color: new BABYLON.Color3(0.3, 0.5, 0.9) }
];

function getPassengerSpawnPoint() {
  var candidates = [];
  
  for (var i = 0; i < ROADS_DATA.length; i++) {
    var rd = ROADS_DATA[i];
    var steps = Math.floor(rd.length / 100);
    
    for (var j = 0; j < steps; j++) {
      var off = -rd.length / 2 + j * 100 + 50;
      var side = Math.random() > 0.5 ? 1 : -1;
      var so = side * (rd.width / 2 + 3);
      var x = rd.x + Math.sin(rd.rotation) * off + Math.cos(rd.rotation) * so;
      var z = rd.z + Math.cos(rd.rotation) * off - Math.sin(rd.rotation) * so;
      
      if (Math.abs(z) < CONFIG.canalWidth / 2 + 6) continue;
      
      var dist = Math.sqrt(
        (x - tukTuk.position.x) * (x - tukTuk.position.x) +
        (z - tukTuk.position.z) * (z - tukTuk.position.z)
      );
      if (dist < 40 || dist > 300) continue;
      
      candidates.push({ x: x, z: z });
    }
  }
  
  if (candidates.length === 0) return null;
  return Utils.pick(candidates);
}

function spawnPassenger() {
  if (passengers.length >= CONFIG.maxPassengers) return;
  
  var sp = getPassengerSpawnPoint();
  if (!sp) return;
  
  var dest;
  var attempts = 0;
  do {
    dest = Utils.pick(DESTINATIONS_DATA);
    attempts++;
  } while (attempts < 10 && passengers.some(function(p) {
    return p.destination.name === dest.name;
  }));
  
  var mesh = createPassengerMesh();
  mesh.position.set(sp.x, 0, sp.z);
  mesh.rotation.y = Math.random() * Math.PI * 2;
  
  passengers.push({
    mesh: mesh,
    x: sp.x,
    z: sp.z,
    destination: dest,
    bobPhase: Math.random() * Math.PI * 2
  });
  
  console.log('👤 راكب جديد');
  UI.showToast('👤 راكب ينتظر', 1500);
  updateMissionUI();
}

function createDestinationMarker(destination) {
  var group = new BABYLON.TransformNode('dest_' + Math.random(), scene);
  group.position.set(destination.x, 0, destination.z);
  
  var ringMat = new BABYLON.StandardMaterial('destRingMat_' + Math.random(), scene);
  ringMat.emissiveColor = destination.color;
  ringMat.disableLighting = true;
  ringMat.alpha = 0.85;
  
  var ring = BABYLON.MeshBuilder.CreateTorus('destRing',
    { diameter: 8, thickness: 0.6, tessellation: 24 }, scene);
  ring.material = ringMat;
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.15;
  ring.parent = group;
  
  var beamMat = new BABYLON.StandardMaterial('destBeamMat_' + Math.random(), scene);
  beamMat.emissiveColor = destination.color;
  beamMat.disableLighting = true;
  beamMat.alpha = 0.35;
  
  var beam = BABYLON.MeshBuilder.CreateCylinder('destBeam',
    { height: 16, diameterTop: 2, diameterBottom: 6, tessellation: 12 }, scene);
  beam.material = beamMat;
  beam.position.y = 8;
  beam.parent = group;
  
  var icon = BABYLON.MeshBuilder.CreateSphere('destIcon',
    { diameter: 2.4, segments: 12 }, scene);
  var iconMat = new BABYLON.StandardMaterial('destIconMat_' + Math.random(), scene);
  iconMat.emissiveColor = destination.color;
  iconMat.disableLighting = true;
  icon.material = iconMat;
  icon.position.y = 13;
  icon.parent = group;
  
  group.metadata = {
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
    var dx = p.x - tukTuk.position.x;
    var dz = p.z - tukTuk.position.z;
    var dist = Math.sqrt(dx * dx + dz * dz);
    
    if (dist < 3.5) {
      var dest = p.destination;
      
      // إزالة الراكب
      var md = p.mesh.metadata;
      if (md) {
        if (md.ring) md.ring.dispose();
        if (md.arrow) md.arrow.dispose();
        if (md.beam) md.beam.dispose();
      }
      p.mesh.getChildMeshes().forEach(function(m) { m.dispose(); });
      p.mesh.dispose();
      passengers.splice(i, 1);
      
      player.hasPassenger = true;
      player.currentPassenger = dest;
      player.tripStartTime = performance.now();
      
      activeDestination = createDestinationMarker(dest);
      
      AudioSystem.playPickup();
      UI.showDialog('مشرط: ' + Utils.pick(DIALOGS.pickup), 3000);
      UI.showToast('✅ راكب صعد! → ' + dest.name, 2500);
      
      // إضافة راكب في التوك توك
      var riderMesh = createPassengerMesh();
      riderMesh.scaling.set(0.75, 0.75, 0.75);
      riderMesh.position.set(0, 0.4, -0.75);
      riderMesh.parent = tukTuk;
      if (riderMesh.metadata) {
        riderMesh.metadata.ring.setEnabled(false);
        riderMesh.metadata.arrow.setEnabled(false);
        riderMesh.metadata.beam.setEnabled(false);
      }
      tukTukObj.rider = riderMesh;
      
      updateMissionUI();
      break;
    }
  }
}

function checkDelivery() {
  if (!player.hasPassenger || !activeDestination) return;
  
  var dest = activeDestination.metadata.destination;
  var dx = dest.x - tukTuk.position.x;
  var dz = dest.z - tukTuk.position.z;
  var dist = Math.sqrt(dx * dx + dz * dz);
  
  if (dist < 8) {
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
    
    // مسح الوجهة
    activeDestination.getChildMeshes().forEach(function(m) { m.dispose(); });
    activeDestination.dispose();
    activeDestination = null;
    
    // مسح الراكب من التوك توك
    if (tukTukObj.rider) {
      tukTukObj.rider.getChildMeshes().forEach(function(m) { m.dispose(); });
      tukTukObj.rider.dispose();
      tukTukObj.rider = null;
    }
    
    player.hasPassenger = false;
    player.currentPassenger = null;
    gameState.spawnTimer = 1.5;
    
    updateHUD();
    updateMissionUI();
  }
}

/* ═══════════════════════════════════════════════════════════
   🎮 المدخلات
   ═══════════════════════════════════════════════════════════ */
var keys = {};
var mobileInput = { accel: false, brake: false, left: false, right: false };

document.addEventListener('keydown', function(e) {
  keys[e.code] = true;
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
  }
  if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'ArrowDown' ||
      e.code === 'ArrowLeft' || e.code === 'ArrowRight') {
    e.preventDefault();
  }
});

document.addEventListener('keyup', function(e) {
  keys[e.code] = false;
  if (e.code === 'Space') player.handbrake = false;
});

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
      UI.showToast('📢 كلاكس', 800);
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

/* ═══════════════════════════════════════════════════════════
   🚗 فيزياء التوك توك
   ═══════════════════════════════════════════════════════════ */
function updateTukTukPhysics(dt) {
  if (!gameState.running || gameState.paused) return;
  
  var throttle = (keys.KeyW || keys.ArrowUp || mobileInput.accel) ? 1 : 0;
  var brake = (keys.KeyS || keys.ArrowDown || mobileInput.brake) ? 1 : 0;
  
  // ═══ التسارع/الفرملة ═══
  if (!player.engineOn) {
    player.speed *= (1 - 4 * dt);
    if (Math.abs(player.speed) < 0.1) player.speed = 0;
  } else if (player.handbrake) {
    player.speed *= (1 - 15 * dt);
    if (Math.abs(player.speed) < 0.1) player.speed = 0;
  } else {
    if (throttle && !brake) {
      var accel = CONFIG.acceleration * (1 - Math.abs(player.speed) / CONFIG.maxSpeed * 0.5);
      player.speed += accel * dt;
    } else if (brake && !throttle) {
      if (player.speed > 1) player.speed -= CONFIG.braking * dt;
      else if (player.speed > 0.3) player.speed -= 8 * dt;
      else player.speed -= CONFIG.acceleration * 0.6 * dt;
    } else {
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
  
  // ═══ المقود ═══
  var leftInput = (keys.KeyA || keys.ArrowLeft || mobileInput.left) ? 1 : 0;
  var rightInput = (keys.KeyD || keys.ArrowRight || mobileInput.right) ? 1 : 0;
  var steerInput = rightInput - leftInput;
  
  var steerDiff = steerInput - player.steering;
  var steerStep = Math.sign(steerDiff) * Math.min(Math.abs(steerDiff), CONFIG.steeringSpeed * dt);
  player.steering += steerStep;
  player.steering = Utils.clamp(player.steering, -1, 1);
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
  var forwardX = Math.sin(tukTuk.rotation.y);
  var forwardZ = Math.cos(tukTuk.rotation.y);
  
  var newX = tukTuk.position.x + forwardX * player.speed * dt;
  var newZ = tukTuk.position.z + forwardZ * player.speed * dt;
  
  // منع دخول الترعة
  var inCanalX = !(newX > 88 && newX < 112);
  var nearCanal = Math.abs(newZ) < CONFIG.canalWidth / 2 + 1.5;
  
  if (nearCanal && inCanalX) {
    player.speed *= -0.3;
  } else if (Math.abs(newX) < CONFIG.citySize / 2 && Math.abs(newZ) < CONFIG.citySize / 2) {
    tukTuk.position.x = newX;
    tukTuk.position.z = newZ;
  } else {
    player.speed *= -0.3;
  }
  
  // ═══ العجلات ═══
  var wheelRoll = (player.speed * dt) / 0.3;
  for (var i = 0; i < tukTukObj.wheels.length; i++) {
    var w = tukTukObj.wheels[i];
    if (w.userData && w.userData.tire) {
      w.userData.tire.rotation.x += wheelRoll;
    }
    if (w.userData && w.userData.isFront) {
      w.rotation.y = player.currentWheelAngle;
    }
  }
  
  // ═══ المقود ═══
  if (tukTukObj.steeringWheel) {
    tukTukObj.steeringWheel.rotation.z = -player.steering * Math.PI * 0.85;
  }
  
  // ═══ الكاميرا ═══
  updateCamera(dt);
  
  // ═══ اصطدام بالناس ═══
  checkPeopleCollision();
}

function updateCamera(dt) {
  if (gameState.showingCafeScene) return;
  
  var camDist = 9;
  var camHeight = 5;
  
  var forwardX = Math.sin(tukTuk.rotation.y);
  var forwardZ = Math.cos(tukTuk.rotation.y);
  
  var targetX = tukTuk.position.x - forwardX * camDist;
  var targetY = camHeight;
  var targetZ = tukTuk.position.z - forwardZ * camDist;
  
  // Smooth interpolation
  var smooth = 1 - Math.pow(0.001, dt);
  camera.position.x += (targetX - camera.position.x) * smooth;
  camera.position.y += (targetY - camera.position.y) * smooth;
  camera.position.z += (targetZ - camera.position.z) * smooth;
  
  camera.setTarget(new BABYLON.Vector3(
    tukTuk.position.x,
    tukTuk.position.y + 1.5,
    tukTuk.position.z
  ));
}

/* ═══════════════════════════════════════════════════════════
   💥 الاصطدام بالناس
   ═══════════════════════════════════════════════════════════ */
function checkPeopleCollision() {
  if (Math.abs(player.speed) < 1) return;
  
  for (var i = 0; i < people.length; i++) {
    var p = people[i];
    var dx = p.position.x - tukTuk.position.x;
    var dz = p.position.z - tukTuk.position.z;
    var dist = Math.sqrt(dx * dx + dz * dz);
    
    if (dist < 1.5) {
      if (!p.metadata.isScared) {
        p.metadata.isScared = true;
        p.metadata.scaredTimer = 3;
        p.metadata.direction = Math.random() * Math.PI * 2;
        
        gameState.ratingSum -= 1;
        gameState.ratingCount += 1;
        player.bumpCount++;
        
        AudioSystem.playAngry();
        UI.showToast('⚠️ ' + Utils.pick(DIALOGS.angry), 2000);
        UI.showDialog('مشرط: ' + Utils.pick(DIALOGS.angry), 2500);
      }
    }
  }
}

/* ═══════════════════════════════════════════════════════════
   👥 إنشاء الناس
   ═══════════════════════════════════════════════════════════ */
function createPerson(x, z) {
  var person = new BABYLON.TransformNode('person_' + Math.random(), scene);
  person.position.set(x, 0, z);
  person.rotation.y = Math.random() * Math.PI * 2;
  
  var skin = Utils.pick(MAT.skin);
  var shirt = Utils.pick(MAT.shirt);
  var pants = Utils.pick(MAT.pants);
  
  var torso = BABYLON.MeshBuilder.CreateBox('torso',
    { width: 0.42, height: 0.65, depth: 0.26 }, scene);
  torso.material = shirt;
  torso.position.y = 1.08;
  torso.parent = person;
  shadowGenerator.addShadowCaster(torso);
  
  var head = BABYLON.MeshBuilder.CreateSphere('head',
    { diameter: 0.34, segments: 8 }, scene);
  head.material = skin;
  head.position.y = 1.6;
  head.parent = person;
  shadowGenerator.addShadowCaster(head);
  
  var legs = BABYLON.MeshBuilder.CreateBox('legs',
    { width: 0.42, height: 0.8, depth: 0.26 }, scene);
  legs.material = pants;
  legs.position.y = 0.4;
  legs.parent = person;
  
  var armGeo = { width: 0.12, height: 0.58, depth: 0.12 };
  var armL = BABYLON.MeshBuilder.CreateBox('armL', armGeo, scene);
  armL.material = shirt;
  armL.position.set(-0.27, 1.08, 0);
  armL.parent = person;
  
  var armR = BABYLON.MeshBuilder.CreateBox('armR', armGeo, scene);
  armR.material = shirt;
  armR.position.set(0.27, 1.08, 0);
  armR.parent = person;
  
  person.metadata = {
    direction: Math.random() * Math.PI * 2,
    speed: Utils.rand(0.8, 1.5),
    walkPhase: Math.random() * Math.PI * 2,
    homeX: x,
    homeZ: z,
    wanderTimer: Utils.rand(1, 3),
    isScared: false,
    scaredTimer: 0,
    armL: armL,
    armR: armR
  };
  
  return person;
}

function createPeople() {
  console.log('👥 إنشاء الناس...');
  var count = isMobile ? 15 : 30;
  
  for (var i = 0; i < count; i++) {
    var rd = Utils.pick(ROADS_DATA);
    var off = Utils.rand(-rd.length / 2 + 50, rd.length / 2 - 50);
    var side = Math.random() > 0.5 ? 1 : -1;
    var so = side * (rd.width / 2 + 3);
    
    var x = rd.x + Math.sin(rd.rotation) * off + Math.cos(rd.rotation) * so;
    var z = rd.z + Math.cos(rd.rotation) * off - Math.sin(rd.rotation) * so;
    
    if (Math.abs(z) < CONFIG.canalWidth / 2 + 5) continue;
    
    var person = createPerson(x, z);
    people.push(person);
  }
}

function updatePeople(dt) {
  for (var i = 0; i < people.length; i++) {
    var p = people[i];
    var md = p.metadata;
    
    md.walkPhase += dt * 5;
    p.position.y = Math.abs(Math.sin(md.walkPhase)) * 0.05;
    
    if (md.isScared) {
      md.scaredTimer -= dt;
      if (md.scaredTimer <= 0) md.isScared = false;
      else {
        p.position.x += Math.cos(md.direction) * md.speed * 3 * dt;
        p.position.z += Math.sin(md.direction) * md.speed * 3 * dt;
        p.rotation.y = -md.direction + Math.PI / 2;
        continue;
      }
    }
    
    md.wanderTimer -= dt;
    if (md.wanderTimer <= 0) {
      md.direction += Utils.rand(-0.5, 0.5);
      md.wanderTimer = Utils.rand(2, 4);
    }
    
    var dx = md.homeX - p.position.x;
    var dz = md.homeZ - p.position.z;
    if (Math.sqrt(dx * dx + dz * dz) > 10) {
      md.direction = Math.atan2(dz, dx);
    }
    
    p.position.x += Math.cos(md.direction) * md.speed * dt;
    p.position.z += Math.sin(md.direction) * md.speed * dt;
    p.rotation.y = -md.direction + Math.PI / 2;
    
    if (md.armL) md.armL.rotation.x = Math.sin(md.walkPhase) * 0.5;
    if (md.armR) md.armR.rotation.x = -Math.sin(md.walkPhase) * 0.5;
  }
}

/* ═══════════════════════════════════════════════════════════
   🚗 السيارات
   ═══════════════════════════════════════════════════════════ */
function createCar(x, z, rotation) {
  var car = new BABYLON.TransformNode('car_' + Math.random(), scene);
  car.position.set(x, 0, z);
  car.rotation.y = rotation;
  
  var carColors = [
    new BABYLON.Color3(0.8, 0.2, 0.2),
    new BABYLON.Color3(0.2, 0.4, 0.8),
    new BABYLON.Color3(0.9, 0.9, 0.9),
    new BABYLON.Color3(0.2, 0.2, 0.2),
    new BABYLON.Color3(0.9, 0.6, 0.2)
  ];
  
  var bodyMat = new BABYLON.PBRMaterial('carBody_' + Math.random(), scene);
  bodyMat.albedoColor = Utils.pick(carColors);
  bodyMat.metallic = 0.6;
  bodyMat.roughness = 0.3;
  
  var body = BABYLON.MeshBuilder.CreateBox('carBody',
    { width: 1.9, height: 0.7, depth: 4.2 }, scene);
  body.material = bodyMat;
  body.position.y = 0.55;
  body.parent = car;
  shadowGenerator.addShadowCaster(body);
  
  var cabin = BABYLON.MeshBuilder.CreateBox('carCabin',
    { width: 1.7, height: 0.6, depth: 2 }, scene);
  cabin.material = bodyMat;
  cabin.position.set(0, 1.2, -0.2);
  cabin.parent = car;
  shadowGenerator.addShadowCaster(cabin);
  
  // عجلات
  for (var wx = -1; wx <= 1; wx += 2) {
    for (var wz = -1; wz <= 1; wz += 2) {
      var tire = BABYLON.MeshBuilder.CreateCylinder('tire',
        { height: 0.28, diameter: 0.76, tessellation: 12 }, scene);
      tire.material = MAT.black;
      tire.rotation.z = Math.PI / 2;
      tire.position.set(wx * 1, 0.38, wz * 1.4);
      tire.parent = car;
    }
  }
  
  car.metadata = {
    speed: Utils.rand(4, 8),
    direction: Math.random() > 0.5 ? 1 : -1,
    road: null,
    offset: 0,
    sideOffset: 0
  };
  
  return car;
}

function createCars() {
  console.log('🚗 إنشاء السيارات...');
  var count = isMobile ? 6 : 12;
  
  for (var i = 0; i < count; i++) {
    var rd = Utils.pick(ROADS_DATA);
    var off = Utils.rand(-rd.length / 2 + 50, rd.length / 2 - 50);
    var x = rd.x + Math.sin(rd.rotation) * off;
    var z = rd.z + Math.cos(rd.rotation) * off;
    
    var sideOffset = (Math.random() > 0.5 ? 1 : -1) * (rd.width / 4);
    var dx = Math.cos(rd.rotation) * sideOffset;
    var dz = -Math.sin(rd.rotation) * sideOffset;
    
    var car = createCar(x + dx, z + dz, rd.rotation);
    car.metadata.road = rd;
    car.metadata.offset = off;
    car.metadata.sideOffset = sideOffset;
    
    cars.push(car);
  }
}

function updateCars(dt) {
  for (var i = 0; i < cars.length; i++) {
    var c = cars[i];
    var md = c.metadata;
    var rd = md.road;
    if (!rd) continue;
    
    md.offset += md.speed * md.direction * dt;
    
    if (md.offset > rd.length / 2 - 40) {
      md.direction = -1;
      c.rotation.y = rd.rotation + Math.PI;
    }
    if (md.offset < -rd.length / 2 + 40) {
      md.direction = 1;
      c.rotation.y = rd.rotation;
    }
    
    var x = rd.x + Math.sin(rd.rotation) * md.offset;
    var z = rd.z + Math.cos(rd.rotation) * md.offset;
    
    var dx = Math.cos(rd.rotation) * md.sideOffset;
    var dz = -Math.sin(rd.rotation) * md.sideOffset;
    
    c.position.x = x + dx;
    c.position.z = z + dz;
  }
}

/* ═══════════════════════════════════════════════════════════
   📊 تحديث واجهة المستخدم
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
    UI.missionPanel.textContent = '👤 ' + passengers.length + ' راكب ينتظر';
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
      
      var md = p.mesh.metadata;
      if (md) {
        if (md.ring) {
          var pulse = 1 + Math.sin(now * 0.006) * 0.25;
          md.ring.scaling.set(pulse, pulse, 1);
          md.ring.rotation.y += dt * 2;
        }
        if (md.arrow) {
          md.arrow.position.y = 3.2 + Math.sin(now * 0.005) * 0.4;
          md.arrow.rotation.y += dt * 3;
        }
      }
    }
  }
  
  if (activeDestination) {
    var destMd = activeDestination.metadata;
    var time = (now - destMd.startTime) / 1000;
    var pulse = 1 + Math.sin(time * 3) * 0.15;
    destMd.ring.scaling.set(pulse, pulse, 1);
    destMd.icon.rotation.y += dt * 2;
    destMd.icon.position.y = 13 + Math.sin(time * 2) * 0.8;
  }
  
  if (player.hasPassenger) {
    gameState.dialogTimer -= dt;
    if (gameState.dialogTimer <= 0) {
      UI.showDialog('مشرط: ' + Utils.pick(DIALOGS.driving), 2500);
      gameState.dialogTimer = Utils.rand(8, 15);
    }
  }
}

/* ═══════════════════════════════════════════════════════════
   ☕ مشهد مشرط على قهوة عماد هارون
   ═══════════════════════════════════════════════════════════ */
function createCafeScene() {
  var root = new BABYLON.TransformNode('cafeScene', scene);
  root.position.set(0, 0, -300);
  
  // أرضية القهوة
  var ground = BABYLON.MeshBuilder.CreateBox('cafeGround',
    { width: 16, height: 0.2, depth: 14 }, scene);
  var groundMat = new BABYLON.PBRMaterial('cafeGroundMat', scene);
  groundMat.albedoColor = new BABYLON.Color3(0.55, 0.5, 0.42);
  groundMat.metallic = 0;
  groundMat.roughness = 1;
  ground.material = groundMat;
  ground.position.y = 0.1;
  ground.parent = root;
  
  // مبنى القهوة
  var building = BABYLON.MeshBuilder.CreateBox('cafeBuilding',
    { width: 14, height: 4, depth: 6 }, scene);
  var buildingMat = new BABYLON.PBRMaterial('cafeBuildingMat', scene);
  buildingMat.albedoColor = new BABYLON.Color3(0.9, 0.82, 0.7);
  buildingMat.metallic = 0;
  buildingMat.roughness = 0.85;
  building.material = buildingMat;
  building.position.set(0, 2, -6);
  building.parent = root;
  shadowGenerator.addShadowCaster(building);
  
  // سقف
  var roof = BABYLON.MeshBuilder.CreateBox('cafeRoof',
    { width: 14.5, height: 0.4, depth: 6.5 }, scene);
  var roofMat = new BABYLON.PBRMaterial('cafeRoofMat', scene);
  roofMat.albedoColor = new BABYLON.Color3(0.55, 0.32, 0.2);
  roofMat.metallic = 0;
  roofMat.roughness = 0.9;
  roof.material = roofMat;
  roof.position.set(0, 4.2, -6);
  roof.parent = root;
  
  // مظلة
  var awning = BABYLON.MeshBuilder.CreateBox('awning',
    { width: 14, height: 0.15, depth: 7 }, scene);
  var awningMat = new BABYLON.PBRMaterial('awningMat', scene);
  awningMat.albedoColor = new BABYLON.Color3(0.85, 0.65, 0.45);
  awningMat.metallic = 0;
  awningMat.roughness = 0.9;
  awning.material = awningMat;
  awning.position.set(0, 4.5, 2);
  awning.rotation.x = -0.1;
  awning.parent = root;
  
  // طاولة
  var table = BABYLON.MeshBuilder.CreateCylinder('table',
    { height: 0.1, diameter: 1.6, tessellation: 16 }, scene);
  var tableMat = new BABYLON.PBRMaterial('tableMat', scene);
  tableMat.albedoColor = new BABYLON.Color3(0.55, 0.4, 0.22);
  tableMat.metallic = 0;
  tableMat.roughness = 0.8;
  table.material = tableMat;
  table.position.set(0, 0.9, 0);
  table.parent = root;
  
  // ═══ مشرط ═══
  var meshrat = new BABYLON.TransformNode('meshrat', scene);
  meshrat.parent = root;
  meshrat.position.set(0, 0.55, 1.6);
  meshrat.rotation.y = Math.PI;
  meshrat.scaling.set(1.15, 1.15, 1.15);
  
  var galabeyaMat = new BABYLON.PBRMaterial('meshratGalabeya', scene);
  galabeyaMat.albedoColor = new BABYLON.Color3(0.95, 0.94, 0.9);
  galabeyaMat.metallic = 0;
  galabeyaMat.roughness = 0.85;
  
  var torso = BABYLON.MeshBuilder.CreateBox('meshratTorso',
    { width: 0.6, height: 0.9, depth: 0.45 }, scene);
  torso.material = galabeyaMat;
  torso.position.y = 1;
  torso.parent = meshrat;
  shadowGenerator.addShadowCaster(torso);
  
  var head = BABYLON.MeshBuilder.CreateSphere('meshratHead',
    { diameter: 0.44, segments: 12 }, scene);
  head.material = MAT.skin[2];
  head.position.y = 1.65;
  head.parent = meshrat;
  shadowGenerator.addShadowCaster(head);
  
  var eyeMat = new BABYLON.StandardMaterial('meshratEye', scene);
  eyeMat.emissiveColor = new BABYLON.Color3(0.1, 0.1, 0.1);
  eyeMat.disableLighting = true;
  for (var s = -1; s <= 1; s += 2) {
    var eye = BABYLON.MeshBuilder.CreateSphere('meshratEye_' + s,
      { diameter: 0.06, segments: 6 }, scene);
    eye.material = eyeMat;
    eye.position.set(s * 0.08, 1.68, 0.19);
    eye.parent = meshrat;
  }
  
  var mustacheMat = new BABYLON.PBRMaterial('meshratMustache', scene);
  mustacheMat.albedoColor = new BABYLON.Color3(0.08, 0.08, 0.08);
  mustacheMat.metallic = 0;
  mustacheMat.roughness = 0.9;
  var mustache = BABYLON.MeshBuilder.CreateBox('meshratMustache',
    { width: 0.2, height: 0.045, depth: 0.05 }, scene);
  mustache.material = mustacheMat;
  mustache.position.set(0, 1.58, 0.21);
  mustache.parent = meshrat;
  
  var turbanMat = new BABYLON.PBRMaterial('meshratTurban', scene);
  turbanMat.albedoColor = new BABYLON.Color3(0.96, 0.96, 0.9);
  turbanMat.metallic = 0;
  turbanMat.roughness = 0.9;
  var turban = BABYLON.MeshBuilder.CreateSphere('meshratTurban',
    { diameter: 0.5, segments: 10 }, scene);
  turban.material = turbanMat;
  turban.position.y = 1.72;
  turban.scaling.y = 0.5;
  turban.parent = meshrat;
  
  // ═══ الشيشة ═══
  var shishaRoot = new BABYLON.TransformNode('shisha', scene);
  shishaRoot.parent = root;
  shishaRoot.position.set(0.9, 0, 0.3);
  
  var shishaBase = BABYLON.MeshBuilder.CreateCylinder('shishaBase',
    { height: 0.5, diameterBottom: 0.45, diameterTop: 0.35, tessellation: 12 }, scene);
  var shishaMat = new BABYLON.PBRMaterial('shishaMat', scene);
  shishaMat.albedoColor = new BABYLON.Color3(0.75, 0.6, 0.4);
  shishaMat.metallic = 0.3;
  shishaMat.roughness = 0.5;
  shishaBase.material = shishaMat;
  shishaBase.position.y = 0.25;
  shishaBase.parent = shishaRoot;
  
  var shishaGlass = BABYLON.MeshBuilder.CreateCylinder('shishaGlass',
    { height: 0.4, diameter: 0.3, tessellation: 12 }, scene);
  var shishaGlassMat = new BABYLON.PBRMaterial('shishaGlassMat', scene);
  shishaGlassMat.albedoColor = new BABYLON.Color3(0.2, 0.5, 0.7);
  shishaGlassMat.alpha = 0.85;
  shishaGlassMat.metallic = 0.4;
  shishaGlassMat.roughness = 0.1;
  shishaGlassMat.transparencyMode = BABYLON.PBRMaterial.PBRMATERIAL_ALPHABLEND;
  shishaGlass.material = shishaGlassMat;
  shishaGlass.position.y = 0.7;
  shishaGlass.parent = shishaRoot;
  
  var stem = BABYLON.MeshBuilder.CreateCylinder('stem',
    { height: 1, diameter: 0.08, tessellation: 8 }, scene);
  var stemMat = new BABYLON.PBRMaterial('stemMat', scene);
  stemMat.albedoColor = new BABYLON.Color3(0.85, 0.65, 0.45);
  stemMat.metallic = 0.5;
  stemMat.roughness = 0.4;
  stem.material = stemMat;
  stem.position.y = 1.4;
  stem.parent = shishaRoot;
  
  var top = BABYLON.MeshBuilder.CreateCylinder('top',
    { height: 0.2, diameterTop: 0.24, diameterBottom: 0.3, tessellation: 12 }, scene);
  var topMat = new BABYLON.PBRMaterial('topMat', scene);
  topMat.albedoColor = new BABYLON.Color3(0.55, 0.4, 0.22);
  topMat.metallic = 0;
  topMat.roughness = 0.8;
  top.material = topMat;
  top.position.y = 1.95;
  top.parent = shishaRoot;
  
  // ═══ لافتة "قهوة عماد هارون" ═══
  var signMat = new BABYLON.StandardMaterial('signMat', scene);
  signMat.emissiveColor = new BABYLON.Color3(1, 0.85, 0.2);
  signMat.disableLighting = true;
  
  var sign = BABYLON.MeshBuilder.CreateBox('sign',
    { width: 10, height: 2, depth: 0.3 }, scene);
  sign.material = signMat;
  sign.position.set(0, 5.5, -3);
  sign.parent = root;
  
  // ═══ إضاءة دافئة ═══
  var warmLight = new BABYLON.PointLight('warmLight',
    new BABYLON.Vector3(0, 4, 1), scene);
  warmLight.intensity = 0.8;
  warmLight.diffuse = new BABYLON.Color3(1, 0.8, 0.55);
  warmLight.range = 25;
  warmLight.parent = root;
  
  return root;
}

/* ═══════════════════════════════════════════════════════════
   📻 ربط الراديو
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
   🎬 الحلقة الرئيسية
   ═══════════════════════════════════════════════════════════ */
var lastTime = performance.now();

function gameLoop() {
  var now = performance.now();
  var dt = (now - lastTime) / 1000;
  lastTime = now;
  dt = Math.min(dt, 0.05);
  
  // مشهد القهوة
  if (gameState.showingCafeScene) {
    gameState.cafeSceneTimer -= dt;
    
    if (gameState.cafeSceneRoot) {
      var rot = (4 - gameState.cafeSceneTimer) * 0.3;
      var radius = 14;
      var target = gameState.cafeSceneRoot.position;
      
      camera.position.x = target.x + Math.sin(rot) * radius;
      camera.position.y = 5;
      camera.position.z = target.z + Math.cos(rot) * radius;
      camera.setTarget(new BABYLON.Vector3(target.x, 1.5, target.z));
    }
    
    if (gameState.cafeSceneTimer <= 0) {
      gameState.showingCafeScene = false;
      if (gameState.cafeSceneRoot) {
        gameState.cafeSceneRoot.getChildMeshes().forEach(function(m) { m.dispose(); });
        gameState.cafeSceneRoot.dispose();
        gameState.cafeSceneRoot = null;
      }
      startPlayingGame();
    }
    
    return;
  }
  
  if (!gameState.running || gameState.paused) return;
  
  gameState.elapsedTime += dt;
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
  updatePassengers(dt);
  updatePeople(dt);
  updateCars(dt);
  
  // الأصوات
  var isAccel = !!(keys.KeyW || keys.ArrowUp || mobileInput.accel);
  AudioSystem.updateEngine(Math.abs(player.speed), CONFIG.maxSpeed, isAccel);
  
  // الشمس تتبع
  sunLight.position.x = tukTuk.position.x + 200;
  sunLight.position.z = tukTuk.position.z + 150;
  
  updateHUD();
}

/* ═══════════════════════════════════════════════════════════
   🚀 بدء اللعبة
   ═══════════════════════════════════════════════════════════ */
var isInitialized = false;

async function startGame() {
  console.log('🎬 بدء اللعبة...');
  
  AudioSystem.init();
  AudioSystem.resume();
  
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
    
    if (isMobile) UI.controls.classList.add('visible');
    
    if (player.engineOn) AudioSystem.setEngine(true);
    
    setTimeout(function() {
      if (!radio.isPlaying) radio.play();
    }, 800);
    
    setTimeout(function() { spawnPassenger(); }, 500);
    setTimeout(function() { spawnPassenger(); }, 1500);
    
    lastTime = performance.now();
    return;
  }
  
  UI.startBtn.disabled = true;
  UI.startBtn.textContent = '⏳ جاري التحميل...';
  
  try {
    await buildCity(function(pct, text) {
      UI.updateLoading(pct, text);
    });
    
    setupMobileButtons();
    setupRadio();
    radio.init();
    
    createPeople();
    createCars();
    
    isInitialized = true;
    
    // إظهار مشهد القهوة
    gameState.cafeSceneRoot = createCafeScene();
    gameState.showingCafeScene = true;
    gameState.cafeSceneTimer = 4;
    gameState.running = true;
    lastTime = performance.now();
    
    UI.loadingScreen.classList.add('hidden');
    UI.startScreen.classList.remove('visible');
    UI.hud.classList.add('visible');
    
    console.log('✅ اللعبة بدأت!');
    
  } catch (error) {
    console.error('❌ خطأ:', error);
    UI.showToast('حدث خطأ أثناء التحميل', 3000);
    UI.startBtn.disabled = false;
    UI.startBtn.textContent = '🚀 ابدأ الشغل';
  }
}

function startPlayingGame() {
  resetGame();
  gameState.running = true;
  gameState.paused = false;
  lastTime = performance.now();
  
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
  
  UI.showToast('🛺 يلا بينا مع مشرط!', 2500);
  UI.showDialog('مشرط: يلا بينا نشتغل!', 3000);
}

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
  
  tukTuk.position.set(0, 0, 100);
  tukTuk.rotation.set(0, 0, 0);
  
  // مسح الركاب
  for (var i = 0; i < passengers.length; i++) {
    var md = passengers[i].mesh.metadata;
    if (md) {
      if (md.ring) md.ring.dispose();
      if (md.arrow) md.arrow.dispose();
      if (md.beam) md.beam.dispose();
    }
    passengers[i].mesh.getChildMeshes().forEach(function(m) { m.dispose(); });
    passengers[i].mesh.dispose();
  }
  passengers.length = 0;
  
  if (activeDestination) {
    activeDestination.getChildMeshes().forEach(function(m) { m.dispose(); });
    activeDestination.dispose();
    activeDestination = null;
  }
  
  if (tukTukObj.rider) {
    tukTukObj.rider.getChildMeshes().forEach(function(m) { m.dispose(); });
    tukTukObj.rider.dispose();
    tukTukObj.rider = null;
  }
  
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
    lastTime = performance.now();
  }
}

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
    ? 'مشرط: خد بالك من الناس المرة الجاية'
    : 'مشرط: شغل تمام يا معلم';
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
   تشغيل الـ render loop
   ═══════════════════════════════════════════════════════════ */
engine.runRenderLoop(function() {
  gameLoop();
  scene.render();
});

window.addEventListener('resize', function() {
  engine.resize();
});

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
