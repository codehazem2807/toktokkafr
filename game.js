/* ============================================================
   🛺 توك توك كفر الدوار - Babylon.js (نسخة محسّنة)
   الأداء أولوية - بدون تهنيج - Progress Bar حقيقي
   ============================================================ */

'use strict';

console.log('🚀 تحميل Babylon.js Engine...');

if (typeof BABYLON === 'undefined') {
  alert('فشل تحميل Babylon.js');
  throw new Error('Babylon.js not loaded');
}

console.log('✅ Babylon.js v' + BABYLON.Engine.Version);

/* ═══════════════════════════════════════════════════════════
   الإعدادات - محسّنة للأداء
   ═══════════════════════════════════════════════════════════ */
var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  || (navigator.maxTouchPoints && navigator.maxTouchPoints > 2);

var CONFIG = {
  maxSpeed: 16,
  maxReverseSpeed: 5,
  acceleration: 8,
  braking: 20,
  friction: 0.9,
  steeringSpeed: 3.5,
  maxWheelAngle: 0.6,
  gameDuration: 300,
  deliveryBonus: 30,
  maxPassengers: 3,
  canalWidth: 24
};

/* ═══════════════════════════════════════════════════════════
   إنشاء المحرك - أداء عالي
   ═══════════════════════════════════════════════════════════ */
var canvas = document.getElementById('renderCanvas');

var engine = new BABYLON.Engine(canvas, false, {
  preserveDrawingBuffer: false,
  stencil: false,
  antialias: false,
  powerPreference: 'high-performance',
  disableWebGL2Support: false,
  failIfMajorPerformanceCaveat: false
}, false);

// تقليل الجودة على الموبايل
engine.setHardwareScalingLevel(isMobile ? 1.3 : 0.9);

console.log('🎮 Engine ready');

/* ═══════════════════════════════════════════════════════════
   المشهد - بدون ظلال إجبارية
   ═══════════════════════════════════════════════════════════ */
var scene = new BABYLON.Scene(engine);
scene.clearColor = new BABYLON.Color4(0.53, 0.81, 0.92, 1);
scene.ambientColor = new BABYLON.Color3(0.8, 0.8, 0.85);

// ضباب خفيف
scene.fogMode = BABYLON.Scene.FOGMODE_LINEAR;
scene.fogColor = new BABYLON.Color3(0.7, 0.82, 0.92);
scene.fogStart = 200;
scene.fogEnd = 500;

// تعطيل الأشياء الغير ضرورية
scene.skipPointerMovePicking = true;
scene.blockMaterialDirtyMechanism = true;
scene.autoClear = true;
scene.autoClearDepthAndStencil = true;

/* ═══════════════════════════════════════════════════════════
   الكاميرا
   ═══════════════════════════════════════════════════════════ */
var camera = new BABYLON.FreeCamera('camera', new BABYLON.Vector3(0, 6, -12), scene);
camera.setTarget(new BABYLON.Vector3(0, 2, 0));
camera.fov = 0.9;
camera.minZ = 0.5;
camera.maxZ = 600;

// إزالة كل مدخلات التحكم
camera.inputs.clear();

/* ═══════════════════════════════════════════════════════════
   الإضاءة - بسيطة وسريعة
   ═══════════════════════════════════════════════════════════ */
var hemiLight = new BABYLON.HemisphericLight('hemi', new BABYLON.Vector3(0, 1, 0), scene);
hemiLight.intensity = 1.0;
hemiLight.diffuse = new BABYLON.Color3(1, 0.98, 0.95);
hemiLight.groundColor = new BABYLON.Color3(0.5, 0.5, 0.45);

var sunLight = new BABYLON.DirectionalLight('sun', new BABYLON.Vector3(-0.4, -1, -0.3), scene);
sunLight.intensity = 1.2;
sunLight.diffuse = new BABYLON.Color3(1, 0.95, 0.85);

// ظلال واحدة بسيطة
var shadowGenerator = new BABYLON.ShadowGenerator(isMobile ? 512 : 1024, sunLight);
shadowGenerator.useBlurExponentialShadowMap = false;
shadowGenerator.usePoissonSampling = false;
shadowGenerator.setDarkness(0.5);

console.log('💡 Lights ready');

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
    'من عزبة بولضو، للشغل في شارع الجيش',
    'اركب يا معلم، ده مشرط اللي معاك'
  ],
  driving: [
    'شارع الجيش ده بيتي',
    'أنا مشرط، مفيش حد يقدر عليّا',
    'أنا من عزبة بولضو',
    'عدينا على شارع الصيدلية والفرن',
    'دي شارع عيلة نصير',
    'بعد كده كله أراضى زراعية',
    'قربنا نوصل يا باشا'
  ],
  arrived: [
    'وصلنا يا باشا، اتفضل',
    'الحمد لله، كنا في الموعد',
    'وصلنا بألف سلامة يسطا'
  ],
  angry: [
    '⚠️ خد بالك يا معلم!',
    '⚠️ إنت مش شايف؟!',
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
    this.audio.preload = 'auto';
    var self = this;
    this.audio.addEventListener('ended', function() { self.next(); });
  },
  
  play: function() {
    if (!this.audio) this.init();
    var track = RADIO_TRACKS[this.currentTrack];
    this.audio.src = track.file;
    var self = this;
    this.audio.play().catch(function() {
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
   الأصوات
   ═══════════════════════════════════════════════════════════ */
var AudioSystem = {
  ctx: null,
  engineOsc: null,
  engineGain: null,
  
  init: function() {
    if (this.ctx) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {}
  },
  
  setEngine: function(on) {
    if (!this.ctx) return;
    if (on && !this.engineOsc) {
      try {
        this.engineOsc = this.ctx.createOscillator();
        this.engineOsc.type = 'sawtooth';
        this.engineOsc.frequency.value = 60;
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
    if (!this.engineOsc || !this.engineGain) return;
    var r = Math.min(Math.abs(speed) / maxSpeed, 1);
    this.engineOsc.frequency.setTargetAtTime(60 + r * 100, this.ctx.currentTime, 0.1);
    this.engineGain.gain.setTargetAtTime(0.01 + r * 0.04 + (isAcc ? 0.01 : 0), this.ctx.currentTime, 0.15);
  },
  
  playHorn: function() {
    if (!this.ctx) return;
    var s = this;
    s._tone(500, 500, 0.15, 0.15, 'square');
    setTimeout(function() { s._tone(600, 600, 0.2, 0.15, 'square'); }, 150);
  },
  
  playPickup: function() {
    if (this.ctx) this._tone(700, 1200, 0.25, 0.12);
  },
  
  playDelivery: function() {
    if (!this.ctx) return;
    var s = this;
    s._tone(523, 523, 0.12, 0.12);
    setTimeout(function() { s._tone(659, 659, 0.12, 0.12); }, 120);
    setTimeout(function() { s._tone(784, 784, 0.25, 0.12); }, 240);
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
   المواد - StandardMaterial (أسرع 5x)
   ═══════════════════════════════════════════════════════════ */
var MAT = {};

function createMaterials() {
  console.log('🎨 المواد...');
  
  // دالة مساعدة
  function mat(name, color, spec) {
    var m = new BABYLON.StandardMaterial(name, scene);
    m.diffuseColor = color;
    m.specularColor = spec || new BABYLON.Color3(0.05, 0.05, 0.05);
    m.specularPower = 32;
    return m;
  }
  
  // أرضية وطرق
  MAT.ground = mat('ground', new BABYLON.Color3(0.45, 0.65, 0.3));
  MAT.road = mat('road', new BABYLON.Color3(0.15, 0.15, 0.18));
  MAT.sidewalk = mat('sidewalk', new BABYLON.Color3(0.7, 0.68, 0.62));
  MAT.canal = mat('canal', new BABYLON.Color3(0.15, 0.5, 0.75));
  MAT.canal.freeze();
  MAT.canalBank = mat('canalBank', new BABYLON.Color3(0.55, 0.45, 0.32));
  MAT.bridge = mat('bridge', new BABYLON.Color3(0.5, 0.5, 0.5));
  
  // خطوط الشارع
  MAT.roadLine = new BABYLON.StandardMaterial('roadLine', scene);
  MAT.roadLine.emissiveColor = new BABYLON.Color3(1, 0.85, 0.2);
  MAT.roadLine.disableLighting = true;
  
  // مباني
  var wallColors = [
    new BABYLON.Color3(0.92, 0.86, 0.74),
    new BABYLON.Color3(0.85, 0.75, 0.6),
    new BABYLON.Color3(0.95, 0.95, 0.95),
    new BABYLON.Color3(0.7, 0.78, 0.88),
    new BABYLON.Color3(0.72, 0.85, 0.7),
    new BABYLON.Color3(0.9, 0.75, 0.75)
  ];
  MAT.wall = [];
  for (var i = 0; i < wallColors.length; i++) {
    MAT.wall.push(mat('wall_' + i, wallColors[i]));
  }
  
  MAT.roof = mat('roof', new BABYLON.Color3(0.6, 0.35, 0.25));
  MAT.roof.freeze();
  
  // مشرط والتوك توك
  MAT.yellow = mat('yellow', new BABYLON.Color3(1, 0.82, 0.1), new BABYLON.Color3(0.3, 0.3, 0.3));
  MAT.yellow.specularPower = 64;
  MAT.yellowDark = mat('yellowDark', new BABYLON.Color3(0.9, 0.72, 0));
  MAT.black = mat('black', new BABYLON.Color3(0.08, 0.08, 0.08), new BABYLON.Color3(0.2, 0.2, 0.2));
  MAT.chrome = mat('chrome', new BABYLON.Color3(0.85, 0.85, 0.85), new BABYLON.Color3(0.5, 0.5, 0.5));
  MAT.chrome.specularPower = 128;
  
  // زجاج
  MAT.glass = new BABYLON.StandardMaterial('glass', scene);
  MAT.glass.diffuseColor = new BABYLON.Color3(0.6, 0.8, 0.95);
  MAT.glass.alpha = 0.4;
  MAT.glass.specularColor = new BABYLON.Color3(0.8, 0.8, 0.8);
  MAT.glass.specularPower = 128;
  MAT.glass.backFaceCulling = false;
  
  // ناس
  var skinColors = [
    new BABYLON.Color3(0.96, 0.84, 0.72),
    new BABYLON.Color3(0.9, 0.75, 0.6),
    new BABYLON.Color3(0.82, 0.65, 0.5),
    new BABYLON.Color3(0.68, 0.5, 0.35)
  ];
  MAT.skin = [];
  for (var i = 0; i < skinColors.length; i++) {
    var sm = mat('skin_' + i, skinColors[i]);
    sm.freeze();
    MAT.skin.push(sm);
  }
  
  var shirtColors = [
    new BABYLON.Color3(0.9, 0.3, 0.25),
    new BABYLON.Color3(0.2, 0.6, 0.9),
    new BABYLON.Color3(0.3, 0.85, 0.4),
    new BABYLON.Color3(0.95, 0.6, 0.15),
    new BABYLON.Color3(0.6, 0.35, 0.7),
    new BABYLON.Color3(0.9, 0.9, 0.9),
    new BABYLON.Color3(0.2, 0.25, 0.35)
  ];
  MAT.shirt = [];
  for (var i = 0; i < shirtColors.length; i++) {
    var shm = mat('shirt_' + i, shirtColors[i]);
    shm.freeze();
    MAT.shirt.push(shm);
  }
  
  var pantsColors = [
    new BABYLON.Color3(0.15, 0.2, 0.3),
    new BABYLON.Color3(0.1, 0.1, 0.1),
    new BABYLON.Color3(0.35, 0.35, 0.35)
  ];
  MAT.pants = [];
  for (var i = 0; i < pantsColors.length; i++) {
    var pm = mat('pants_' + i, pantsColors[i]);
    pm.freeze();
    MAT.pants.push(pm);
  }
  
  // حقول
  MAT.field = mat('field', new BABYLON.Color3(0.55, 0.75, 0.3));
  MAT.field.freeze();
  MAT.field2 = mat('field2', new BABYLON.Color3(0.62, 0.8, 0.4));
  MAT.field2.freeze();
  
  // شجر
  MAT.treeTrunk = mat('treeTrunk', new BABYLON.Color3(0.45, 0.3, 0.2));
  MAT.treeTrunk.freeze();
  MAT.treeLeaf = mat('treeLeaf', new BABYLON.Color3(0.3, 0.6, 0.25));
  MAT.treeLeaf.freeze();
  
  // مصابيح
  MAT.headlight = new BABYLON.StandardMaterial('headlightMat', scene);
  MAT.headlight.emissiveColor = new BABYLON.Color3(1, 1, 0.8);
  MAT.headlight.disableLighting = true;
  
  MAT.taillight = new BABYLON.StandardMaterial('taillightMat', scene);
  MAT.taillight.emissiveColor = new BABYLON.Color3(1, 0.15, 0.15);
  MAT.taillight.disableLighting = true;
  
  // أخضر للركاب
  MAT.marker = new BABYLON.StandardMaterial('markerMat', scene);
  MAT.marker.emissiveColor = new BABYLON.Color3(0, 1, 0.5);
  MAT.marker.disableLighting = true;
  MAT.marker.alpha = 0.8;
  
  console.log('✅ المواد جاهزة');
}

/* ═══════════════════════════════════════════════════════════
   الشوارع
   ═══════════════════════════════════════════════════════════ */
var ROADS_DATA = [
  { name: 'شارع الجيش', x: 0, z: 0, width: 22, length: 1200, rotation: 0, isMain: true },
  { name: 'شارع أحمد عرابي', x: -350, z: 0, width: 18, length: 600, rotation: Math.PI / 2 },
  { name: 'شارع بورسعيد', x: -150, z: 0, width: 16, length: 500, rotation: Math.PI / 2 },
  { name: 'شارع الجمهورية', x: 100, z: 0, width: 16, length: 500, rotation: Math.PI / 2 },
  { name: 'شارع سعد زغلول', x: 280, z: 0, width: 14, length: 400, rotation: Math.PI / 2 },
  { name: 'شارع النصر', x: -220, z: 320, width: 14, length: 500, rotation: 0 },
  { name: 'شارع المحور', x: 180, z: 280, width: 14, length: 500, rotation: 0 },
  { name: 'شارع التحرير', x: -130, z: -350, width: 14, length: 400, rotation: 0 },
  { name: 'شارع الموقف', x: 220, z: -320, width: 13, length: 400, rotation: 0 }
];

function createGround() {
  console.log('🌍 الأرضية...');
  
  var ground = BABYLON.MeshBuilder.CreateGround('ground',
    { width: 3000, height: 3000, subdivisions: 1 }, scene);
  ground.material = MAT.ground;
  ground.receiveShadows = true;
}

function createRoads() {
  console.log('🛣️ الشوارع...');
  
  // نستخدم Instances للأداء
  for (var i = 0; i < ROADS_DATA.length; i++) {
    var rd = ROADS_DATA[i];
    
    // جسم الشارع
    var road = BABYLON.MeshBuilder.CreateBox('road_' + i, {
      width: rd.width,
      height: 0.15,
      depth: rd.length
    }, scene);
    road.material = MAT.road;
    road.position.set(rd.x, 0.075, rd.z);
    road.rotation.y = rd.rotation;
    road.receiveShadows = true;
    road.freezeWorldMatrix();
    
    // الأرصفة
    for (var s = -1; s <= 1; s += 2) {
      var sw = BABYLON.MeshBuilder.CreateBox('sw_' + i + '_' + s, {
        width: 2.5,
        height: 0.25,
        depth: rd.length
      }, scene);
      sw.material = MAT.sidewalk;
      
      var offset = s * (rd.width / 2 + 1.25);
      var dx = Math.cos(rd.rotation) * offset;
      var dz = -Math.sin(rd.rotation) * offset;
      
      sw.position.set(rd.x + dx, 0.125, rd.z + dz);
      sw.rotation.y = rd.rotation;
      sw.receiveShadows = true;
      sw.freezeWorldMatrix();
    }
    
    // خطوط الطريق
    if (rd.width >= 14) {
      var lineCount = Math.floor(rd.length / 40);
      for (var j = 0; j < lineCount; j++) {
        var off = -rd.length / 2 + j * 40 + 20;
        var mark = BABYLON.MeshBuilder.CreateBox('mark_' + i + '_' + j, {
          width: 0.35,
          height: 0.05,
          depth: 8
        }, scene);
        mark.material = MAT.roadLine;
        mark.position.set(
          rd.x + Math.sin(rd.rotation) * off,
          0.16,
          rd.z + Math.cos(rd.rotation) * off
        );
        mark.rotation.y = rd.rotation;
        mark.freezeWorldMatrix();
      }
    }
  }
}

function createCanal() {
  console.log('🌊 الترعة...');
  
  // الماء
  var water = BABYLON.MeshBuilder.CreateGround('water',
    { width: 1800, height: CONFIG.canalWidth, subdivisions: 1 }, scene);
  water.material = MAT.canal;
  water.position.y = -0.3;
  water.freezeWorldMatrix();
  
  // الضفتين
  for (var s = -1; s <= 1; s += 2) {
    var bank = BABYLON.MeshBuilder.CreateBox('bank_' + s, {
      width: 1800, height: 1.2, depth: 4
    }, scene);
    bank.material = MAT.canalBank;
    bank.position.set(0, 0.6, s * (CONFIG.canalWidth / 2 + 2));
    bank.receiveShadows = true;
    bank.freezeWorldMatrix();
  }
  
  // كوبري
  var bridge = BABYLON.MeshBuilder.CreateBox('bridge', {
    width: 22, height: 2, depth: CONFIG.canalWidth + 18
  }, scene);
  bridge.material = MAT.bridge;
  bridge.position.set(100, 1, 0);
  bridge.receiveShadows = true;
  bridge.freezeWorldMatrix();
}

/* ═══════════════════════════════════════════════════════════
   🌾 عزبة بولضو
   ═══════════════════════════════════════════════════════════ */
function createEzbetBoldu() {
  console.log('🌾 عزبة بولضو...');
  
  var ezbetX = 550;
  
  // ═══ شارع الصيدلية والفرن ═══
  var street1 = BABYLON.MeshBuilder.CreateBox('ezbetSt1', {
    width: 10, height: 0.15, depth: 250
  }, scene);
  street1.material = MAT.road;
  street1.position.set(ezbetX, 0.075, 0);
  street1.receiveShadows = true;
  street1.freezeWorldMatrix();
  
  // الصيدلية (شارع 1)
  var pharmacy = BABYLON.MeshBuilder.CreateBox('pharmacy', {
    width: 12, height: 7, depth: 12
  }, scene);
  pharmacy.material = MAT.wall[3];
  pharmacy.position.set(ezbetX - 15, 3.5, -60);
  pharmacy.receiveShadows = true;
  
  var pharmacySign = new BABYLON.StandardMaterial('pharmSignMat', scene);
  pharmacySign.emissiveColor = new BABYLON.Color3(0, 1, 0.3);
  pharmacySign.disableLighting = true;
  var pharmSign = BABYLON.MeshBuilder.CreateBox('pharmSign', {
    width: 8, height: 0.8, depth: 0.2
  }, scene);
  pharmSign.material = pharmacySign;
  pharmSign.position.set(ezbetX - 15, 4, -60 + 6);
  
  // الفرن (شارع 1)
  var bakery = BABYLON.MeshBuilder.CreateBox('bakery', {
    width: 12, height: 7, depth: 12
  }, scene);
  bakery.material = MAT.wall[4];
  bakery.position.set(ezbetX + 15, 3.5, 60);
  bakery.receiveShadows = true;
  
  var bakerySign = new BABYLON.StandardMaterial('bakerySignMat', scene);
  bakerySign.emissiveColor = new BABYLON.Color3(1, 0.5, 0.1);
  bakerySign.disableLighting = true;
  var bakeSign = BABYLON.MeshBuilder.CreateBox('bakeSign', {
    width: 8, height: 0.8, depth: 0.2
  }, scene);
  bakeSign.material = bakerySign;
  bakeSign.position.set(ezbetX + 15, 4, 60 + 6);
  
  // ═══ شارع عيلة نصير ═══
  var street2 = BABYLON.MeshBuilder.CreateBox('ezbetSt2', {
    width: 10, height: 0.15, depth: 250
  }, scene);
  street2.material = MAT.road;
  street2.position.set(ezbetX + 80, 0.075, 0);
  street2.receiveShadows = true;
  street2.freezeWorldMatrix();
  
  // بيوت عيلة نصير
  for (var i = 0; i < 6; i++) {
    var side = i % 2 === 0 ? -1 : 1;
    var zPos = -100 + Math.floor(i / 2) * 70;
    
    var house = BABYLON.MeshBuilder.CreateBox('nasirHouse_' + i, {
      width: 10, height: Utils.rand(5, 9), depth: 10
    }, scene);
    house.material = Utils.pick(MAT.wall);
    house.position.set(ezbetX + 80 + side * 15, house.scaling.y, zPos);
    // Fix position based on actual height
    house.position.y = house.getBoundingInfo().boundingBox.extendSize.y;
    house.receiveShadows = true;
  }
  
  // ═══ الأراضى الزراعية ═══
  for (var i = 0; i < 10; i++) {
    var field = BABYLON.MeshBuilder.CreateGround('field_' + i, {
      width: Utils.rand(40, 70),
      height: Utils.rand(50, 90),
      subdivisions: 1
    }, scene);
    field.material = Math.random() > 0.5 ? MAT.field : MAT.field2;
    field.position.set(
      ezbetX + 200 + Utils.rand(-60, 120),
      0.05,
      Utils.rand(-300, 300)
    );
    field.freezeWorldMatrix();
  }
  
  // نخيل على الحدود
  for (var i = 0; i < 15; i++) {
    createPalm(
      ezbetX + 150 + Utils.rand(0, 200),
      Utils.rand(-300, 300),
      Utils.rand(0.9, 1.2)
    );
  }
}

/* ═══════════════════════════════════════════════════════════
   نخلة وشجرة - بسيطة
   ═══════════════════════════════════════════════════════════ */
function createPalm(x, z, scale) {
  scale = scale || 1;
  
  var trunk = BABYLON.MeshBuilder.CreateCylinder('palmTrunk', {
    height: 6 * scale,
    diameterTop: 0.25 * scale,
    diameterBottom: 0.4 * scale,
    tessellation: 6
  }, scene);
  trunk.material = MAT.treeTrunk;
  trunk.position.set(x, 3 * scale, z);
  trunk.freezeWorldMatrix();
  
  // أوراق النخيل
  for (var i = 0; i < 6; i++) {
    var angle = (i / 6) * Math.PI * 2;
    var leaf = BABYLON.MeshBuilder.CreateBox('palmLeaf', {
      width: 0.5 * scale,
      height: 0.08,
      depth: 2.5 * scale
    }, scene);
    leaf.material = MAT.treeLeaf;
    leaf.position.set(
      x + Math.cos(angle) * 0.8 * scale,
      6 * scale,
      z + Math.sin(angle) * 0.8 * scale
    );
    leaf.rotation.y = angle;
    leaf.rotation.x = -0.4;
    leaf.freezeWorldMatrix();
  }
}

function createTree(x, z, scale) {
  scale = scale || 1;
  
  var trunk = BABYLON.MeshBuilder.CreateCylinder('treeTrunk', {
    height: 2.5 * scale,
    diameter: 0.35 * scale,
    tessellation: 5
  }, scene);
  trunk.material = MAT.treeTrunk;
  trunk.position.set(x, 1.25 * scale, z);
  trunk.freezeWorldMatrix();
  
  var leaves = BABYLON.MeshBuilder.CreateSphere('treeLeaves', {
    diameter: 3 * scale,
    segments: 6
  }, scene);
  leaves.material = MAT.treeLeaf;
  leaves.position.set(x, 3.2 * scale, z);
  leaves.freezeWorldMatrix();
}

/* ═══════════════════════════════════════════════════════════
   المباني - Instances للأداء
   ═══════════════════════════════════════════════════════════ */
function isOnRoad(x, z) {
  for (var i = 0; i < ROADS_DATA.length; i++) {
    var r = ROADS_DATA[i];
    var hw = r.width / 2 + 5;
    var hl = r.length / 2;
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
  console.log('🏢 المباني...');
  
  // نموذج أساسي واحد نبني منه Instances
  var box = BABYLON.MeshBuilder.CreateBox('buildingTemplate', {
    width: 1, height: 1, depth: 1
  }, scene);
  box.isVisible = false;
  
  var buildingCount = 0;
  var maxBuildings = isMobile ? 100 : 200;
  
  for (var gx = -600; gx < 600; gx += 40) {
    for (var gz = -600; gz < 600; gz += 40) {
      if (buildingCount >= maxBuildings) break;
      
      var x = gx + 20 + Utils.rand(-3, 3);
      var z = gz + 20 + Utils.rand(-3, 3);
      
      if (isOnRoad(x, z)) continue;
      if (Math.abs(z) < CONFIG.canalWidth / 2 + 12) continue;
      if (x > 400) continue;
      if (Math.abs(x) < 25 && Math.abs(z) < 25) continue;
      if (Math.random() > 0.6) continue;
      
      var w = Utils.rand(8, 14);
      var h = Utils.rand(6, 16);
      var d = Utils.rand(8, 14);
      
      var b = box.createInstance('b_' + buildingCount);
      b.position.set(x, h / 2, z);
      b.scaling.set(w, h, d);
      b.material = Utils.pick(MAT.wall);
      b.receiveShadows = true;
      b.freezeWorldMatrix();
      
      buildingCount++;
    }
  }
  
  console.log('✅ ' + buildingCount + ' مبنى');
}

/* ═══════════════════════════════════════════════════════════
   🛺 التوك توك
   ═══════════════════════════════════════════════════════════ */
function createTukTuk() {
  console.log('🛺 التوك توك...');
  
  var root = new BABYLON.TransformNode('tukTuk', scene);
  var parts = [];
  var wheels = [];
  
  // الشاسيه
  var chassis = BABYLON.MeshBuilder.CreateBox('chassis', {
    width: 1.4, height: 0.15, depth: 2.6
  }, scene);
  chassis.material = MAT.black;
  chassis.position.y = 0.42;
  chassis.parent = root;
  shadowGenerator.addShadowCaster(chassis);
  
  // الأرضية
  var floorF = BABYLON.MeshBuilder.CreateBox('floorF', {
    width: 1.35, height: 0.1, depth: 1.05
  }, scene);
  floorF.material = MAT.black;
  floorF.position.set(0, 0.52, 0.75);
  floorF.parent = root;
  
  var floorR = BABYLON.MeshBuilder.CreateBox('floorR', {
    width: 1.35, height: 0.1, depth: 1.4
  }, scene);
  floorR.material = MAT.black;
  floorR.position.set(0, 0.52, -0.6);
  floorR.parent = root;
  
  // المقدمة
  var frontPanel = BABYLON.MeshBuilder.CreateBox('frontPanel', {
    width: 1.36, height: 0.9, depth: 0.2
  }, scene);
  frontPanel.material = MAT.yellow;
  frontPanel.position.set(0, 1.05, 1.2);
  frontPanel.parent = root;
  shadowGenerator.addShadowCaster(frontPanel);
  
  var frontCabin = BABYLON.MeshBuilder.CreateBox('frontCabin', {
    width: 1.36, height: 0.9, depth: 1.05
  }, scene);
  frontCabin.material = MAT.yellow;
  frontCabin.position.set(0, 1.05, 0.65);
  frontCabin.parent = root;
  shadowGenerator.addShadowCaster(frontCabin);
  
  // غطاء
  var hood = BABYLON.MeshBuilder.CreateBox('hood', {
    width: 1.36, height: 0.1, depth: 0.55
  }, scene);
  hood.material = MAT.yellowDark;
  hood.position.set(0, 1.52, 1.05);
  hood.rotation.x = -0.08;
  hood.parent = root;
  
  // خط أحمر
  for (var s = -1; s <= 1; s += 2) {
    var stripe = BABYLON.MeshBuilder.CreateBox('redStripe_' + s, {
      width: 0.05, height: 0.4, depth: 2.3
    }, scene);
    var redMat = new BABYLON.StandardMaterial('red_' + s, scene);
    redMat.diffuseColor = new BABYLON.Color3(0.85, 0.15, 0.15);
    stripe.material = redMat;
    stripe.position.set(s * 0.69, 1.1, 0.05);
    stripe.parent = root;
  }
  
  // الكابينة الخلفية
  var rearCabin = BABYLON.MeshBuilder.CreateBox('rearCabin', {
    width: 1.4, height: 1.6, depth: 1.5
  }, scene);
  rearCabin.material = MAT.yellow;
  rearCabin.position.set(0, 1.35, -0.6);
  rearCabin.parent = root;
  shadowGenerator.addShadowCaster(rearCabin);
  
  // السقف
  var roof = BABYLON.MeshBuilder.CreateBox('roof', {
    width: 1.5, height: 0.15, depth: 2.7
  }, scene);
  roof.material = MAT.black;
  roof.position.set(0, 2.25, 0);
  roof.parent = root;
  shadowGenerator.addShadowCaster(roof);
  
  // أعمدة
  var pillarPositions = [
    [-0.68, 1.35, -1.3], [0.68, 1.35, -1.3],
    [-0.68, 1.35, -0.05], [0.68, 1.35, -0.05],
    [-0.68, 1.35, 1.15], [0.68, 1.35, 1.15]
  ];
  for (var i = 0; i < pillarPositions.length; i++) {
    var pillar = BABYLON.MeshBuilder.CreateCylinder('pillar_' + i, {
      height: 1.85, diameter: 0.1, tessellation: 6
    }, scene);
    pillar.material = MAT.black;
    pillar.position.set(pillarPositions[i][0], pillarPositions[i][1], pillarPositions[i][2]);
    pillar.parent = root;
  }
  
  // الزجاج
  var windshield = BABYLON.MeshBuilder.CreateBox('windshield', {
    width: 1.3, height: 0.9, depth: 0.05
  }, scene);
  windshield.material = MAT.glass;
  windshield.position.set(0, 1.95, 1.18);
  windshield.parent = root;
  
  for (var s = -1; s <= 1; s += 2) {
    var sg = BABYLON.MeshBuilder.CreateBox('sg_' + s, {
      width: 0.05, height: 0.85, depth: 0.95
    }, scene);
    sg.material = MAT.glass;
    sg.position.set(s * 0.69, 1.9, 0.65);
    sg.parent = root;
  }
  
  // الشبكة
  var grill = BABYLON.MeshBuilder.CreateBox('grill', {
    width: 0.95, height: 0.4, depth: 0.08
  }, scene);
  grill.material = MAT.chrome;
  grill.position.set(0, 1.05, 1.29);
  grill.parent = root;
  
  // المصابيح
  for (var s = -1; s <= 1; s += 2) {
    var hl = BABYLON.MeshBuilder.CreateCylinder('hl_' + s, {
      height: 0.12, diameter: 0.28, tessellation: 12
    }, scene);
    hl.material = MAT.headlight;
    hl.rotation.x = Math.PI / 2;
    hl.position.set(s * 0.48, 1.25, 1.3);
    hl.parent = root;
  }
  
  // الفوانيس الخلفية
  for (var s = -1; s <= 1; s += 2) {
    var tl = BABYLON.MeshBuilder.CreateBox('tl_' + s, {
      width: 0.15, height: 0.28, depth: 0.08
    }, scene);
    tl.material = MAT.taillight;
    tl.position.set(s * 0.52, 1, -1.39);
    tl.parent = root;
  }
  
  // المقود
  var steerRoot = new BABYLON.TransformNode('steerRoot', scene);
  steerRoot.position.set(0, 1.65, 0.9);
  steerRoot.rotation.x = -0.4;
  steerRoot.parent = root;
  
  var steerRing = BABYLON.MeshBuilder.CreateTorus('steerRing', {
    diameter: 0.34, thickness: 0.05, tessellation: 12
  }, scene);
  steerRing.material = MAT.black;
  steerRing.parent = steerRoot;
  
  // المقاعد
  var seatMat = new BABYLON.StandardMaterial('seatMat', scene);
  seatMat.diffuseColor = new BABYLON.Color3(0.15, 0.15, 0.15);
  
  var seatDriver = BABYLON.MeshBuilder.CreateBox('seatDriver', {
    width: 0.65, height: 0.15, depth: 0.6
  }, scene);
  seatDriver.material = seatMat;
  seatDriver.position.set(0, 0.85, 0.45);
  seatDriver.parent = root;
  
  var backDriver = BABYLON.MeshBuilder.CreateBox('backDriver', {
    width: 0.65, height: 0.65, depth: 0.1
  }, scene);
  backDriver.material = seatMat;
  backDriver.position.set(0, 1.2, 0.18);
  backDriver.parent = root;
  
  var rearSeat = BABYLON.MeshBuilder.CreateBox('rearSeat', {
    width: 1.3, height: 0.15, depth: 0.65
  }, scene);
  rearSeat.material = seatMat;
  rearSeat.position.set(0, 0.85, -0.75);
  rearSeat.parent = root;
  
  // العجلات
  function makeWheel(wx, wz, isFront) {
    var wg = new BABYLON.TransformNode('wheel_' + Math.random(), scene);
    wg.parent = root;
    wg.position.set(wx, 0.32, wz);
    
    var tire = BABYLON.MeshBuilder.CreateTorus('tire', {
      diameter: 0.65, thickness: 0.22, tessellation: 12
    }, scene);
    tire.material = MAT.black;
    tire.rotation.z = Math.PI / 2;
    tire.parent = wg;
    shadowGenerator.addShadowCaster(tire);
    
    var rim = BABYLON.MeshBuilder.CreateCylinder('rim', {
      height: 0.18, diameter: 0.4, tessellation: 12
    }, scene);
    rim.material = MAT.chrome;
    rim.rotation.z = Math.PI / 2;
    rim.parent = wg;
    
    wg.metadata = { isFront: isFront, tire: tire };
    wheels.push(wg);
    return wg;
  }
  
  var frontWheel = makeWheel(0, 1.2, true);
  makeWheel(-0.68, -0.85, false);
  makeWheel(0.68, -0.85, false);
  
  // ═══ مشرط ═══
  var driver = new BABYLON.TransformNode('driver', scene);
  driver.parent = root;
  driver.position.set(0, 0, 0.45);
  driver.rotation.y = Math.PI;
  
  var galabeyaMat = new BABYLON.StandardMaterial('galabeya', scene);
  galabeyaMat.diffuseColor = new BABYLON.Color3(0.95, 0.94, 0.9);
  
  var torso = BABYLON.MeshBuilder.CreateBox('driverTorso', {
    width: 0.5, height: 0.65, depth: 0.35
  }, scene);
  torso.material = galabeyaMat;
  torso.position.y = 1.15;
  torso.parent = driver;
  shadowGenerator.addShadowCaster(torso);
  
  var neck = BABYLON.MeshBuilder.CreateCylinder('driverNeck', {
    height: 0.1, diameter: 0.18, tessellation: 6
  }, scene);
  neck.material = MAT.skin[2];
  neck.position.y = 1.53;
  neck.parent = driver;
  
  var head = BABYLON.MeshBuilder.CreateSphere('driverHead', {
    diameter: 0.4, segments: 8
  }, scene);
  head.material = MAT.skin[2];
  head.position.y = 1.72;
  head.parent = driver;
  shadowGenerator.addShadowCaster(head);
  
  // عيون
  var eyeMat = new BABYLON.StandardMaterial('eyeMat', scene);
  eyeMat.emissiveColor = new BABYLON.Color3(0.1, 0.1, 0.1);
  eyeMat.disableLighting = true;
  
  for (var s = -1; s <= 1; s += 2) {
    var eye = BABYLON.MeshBuilder.CreateSphere('eye_' + s, {
      diameter: 0.06, segments: 6
    }, scene);
    eye.material = eyeMat;
    eye.position.set(s * 0.07, 1.74, 0.17);
    eye.parent = driver;
  }
  
  // شنب
  var mustacheMat = new BABYLON.StandardMaterial('mustacheMat', scene);
  mustacheMat.diffuseColor = new BABYLON.Color3(0.08, 0.08, 0.08);
  var mustache = BABYLON.MeshBuilder.CreateBox('mustache', {
    width: 0.18, height: 0.04, depth: 0.05
  }, scene);
  mustache.material = mustacheMat;
  mustache.position.set(0, 1.66, 0.19);
  mustache.parent = driver;
  
  // عمة
  var turban = BABYLON.MeshBuilder.CreateSphere('turban', {
    diameter: 0.45, segments: 8
  }, scene);
  turban.material = galabeyaMat;
  turban.position.y = 1.78;
  turban.scaling.y = 0.55;
  turban.parent = driver;
  
  // الذراعين
  var armR = BABYLON.MeshBuilder.CreateBox('driverArmR', {
    width: 0.14, height: 0.6, depth: 0.14
  }, scene);
  armR.material = galabeyaMat;
  armR.position.set(0.32, 1.15, 0.2);
  armR.rotation.x = -0.7;
  armR.parent = driver;
  
  var armL = BABYLON.MeshBuilder.CreateBox('driverArmL', {
    width: 0.14, height: 0.6, depth: 0.14
  }, scene);
  armL.material = galabeyaMat;
  armL.position.set(-0.32, 1.15, 0.05);
  armL.rotation.x = -0.4;
  armL.parent = driver;
  
  return {
    root: root,
    wheels: wheels,
    steeringWheel: steerRoot,
    driver: driver
  };
}

var tukTukObj = createTukTuk();
var tukTuk = tukTukObj.root;
tukTuk.position.set(0, 0, 100);

/* ═══════════════════════════════════════════════════════════
   الركاب - مع مؤشرات
   ═══════════════════════════════════════════════════════════ */
var passengers = [];
var activeDestination = null;

var DESTINATIONS_DATA = [
  { name: 'محطة قطار كفر الدوار', x: -300, z: -120, color: new BABYLON.Color3(0.63, 0.32, 0.17) },
  { name: 'مسجد الثورة', x: -120, z: 180, color: new BABYLON.Color3(0.09, 0.63, 0.52) },
  { name: 'شركة الغزل والنسيج', x: 450, z: -280, color: new BABYLON.Color3(0.58, 0.65, 0.65) },
  { name: 'موقف عزيز المصري', x: 200, z: 80, color: new BABYLON.Color3(0.9, 0.3, 0.24) },
  { name: 'مستشفى كفر الدوار', x: -450, z: 130, color: new BABYLON.Color3(0.2, 0.6, 0.86) },
  { name: 'سوق الأربعاء', x: 120, z: 240, color: new BABYLON.Color3(0.61, 0.35, 0.71) },
  { name: 'كورنيش الترعة', x: 450, z: -30, color: new BABYLON.Color3(0.16, 0.5, 0.72) },
  { name: 'عزبة بولضو', x: 550, z: 100, color: new BABYLON.Color3(0.54, 0.72, 0.29) },
  { name: 'شارع الصيدلية والفرن', x: 535, z: -60, color: new BABYLON.Color3(0.9, 0.4, 0.4) },
  { name: 'شارع عيلة نصير', x: 630, z: 60, color: new BABYLON.Color3(0.3, 0.5, 0.9) }
];

function createPassengerMesh() {
  var group = new BABYLON.TransformNode('passenger', scene);
  
  var skin = Utils.pick(MAT.skin);
  var shirt = Utils.pick(MAT.shirt);
  var pants = Utils.pick(MAT.pants);
  
  var torso = BABYLON.MeshBuilder.CreateBox('p_torso', {
    width: 0.5, height: 0.7, depth: 0.32
  }, scene);
  torso.material = shirt;
  torso.position.y = 1.15;
  torso.parent = group;
  shadowGenerator.addShadowCaster(torso);
  
  var head = BABYLON.MeshBuilder.CreateSphere('p_head', {
    diameter: 0.4, segments: 8
  }, scene);
  head.material = skin;
  head.position.y = 1.7;
  head.parent = group;
  shadowGenerator.addShadowCaster(head);
  
  var legs = BABYLON.MeshBuilder.CreateBox('p_legs', {
    width: 0.5, height: 0.85, depth: 0.32
  }, scene);
  legs.material = pants;
  legs.position.y = 0.42;
  legs.parent = group;
  
  var armGeo = { width: 0.14, height: 0.62, depth: 0.14 };
  var armL = BABYLON.MeshBuilder.CreateBox('p_armL', armGeo, scene);
  armL.material = shirt;
  armL.position.set(-0.32, 1.15, 0);
  armL.parent = group;
  
  var armR = BABYLON.MeshBuilder.CreateBox('p_armR', armGeo, scene);
  armR.material = shirt;
  armR.position.set(0.32, 1.15, 0);
  armR.parent = group;
  
  // الهالة الأرضية
  var ring = BABYLON.MeshBuilder.CreateTorus('p_ring', {
    diameter: 2.4, thickness: 0.3, tessellation: 16
  }, scene);
  ring.material = MAT.marker;
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.15;
  ring.parent = group;
  
  // السهم
  var arrow = BABYLON.MeshBuilder.CreateCylinder('p_arrow', {
    height: 1, diameterTop: 0, diameterBottom: 0.6, tessellation: 4
  }, scene);
  arrow.material = MAT.marker;
  arrow.position.y = 3.2;
  arrow.parent = group;
  
  // عمود ضوء
  var beam = BABYLON.MeshBuilder.CreateCylinder('p_beam', {
    height: 6, diameterTop: 0.2, diameterBottom: 0.6, tessellation: 8
  }, scene);
  beam.material = MAT.marker;
  beam.position.y = 5;
  beam.parent = group;
  
  group.metadata = { ring: ring, arrow: arrow, beam: beam };
  return group;
}

function getPassengerSpawnPoint() {
  var candidates = [];
  
  for (var i = 0; i < ROADS_DATA.length; i++) {
    var rd = ROADS_DATA[i];
    for (var j = 0; j < 4; j++) {
      var off = Utils.rand(-rd.length / 2 + 50, rd.length / 2 - 50);
      var side = Math.random() > 0.5 ? 1 : -1;
      var so = side * (rd.width / 2 + 3);
      var x = rd.x + Math.sin(rd.rotation) * off + Math.cos(rd.rotation) * so;
      var z = rd.z + Math.cos(rd.rotation) * off - Math.sin(rd.rotation) * so;
      
      if (Math.abs(z) < CONFIG.canalWidth / 2 + 6) continue;
      
      var dx = x - tukTuk.position.x;
      var dz = z - tukTuk.position.z;
      var dist = Math.sqrt(dx * dx + dz * dz);
      if (dist < 40 || dist > 280) continue;
      
      candidates.push({ x: x, z: z });
    }
  }
  
  if (candidates.length === 0) return null;
  return Utils.pick(candidates);
}

function spawnPassenger() {
  if (passengers.length >= CONFIG.maxPassengers) return;
  if (player.hasPassenger) return;
  
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
  
  UI.showToast('👤 راكب ينتظر', 1500);
  updateMissionUI();
}

function createDestinationMarker(destination) {
  var group = new BABYLON.TransformNode('dest', scene);
  group.position.set(destination.x, 0, destination.z);
  
  var mat = new BABYLON.StandardMaterial('destMat', scene);
  mat.emissiveColor = destination.color;
  mat.disableLighting = true;
  mat.alpha = 0.85;
  
  var ring = BABYLON.MeshBuilder.CreateTorus('destRing', {
    diameter: 8, thickness: 0.6, tessellation: 20
  }, scene);
  ring.material = mat;
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.15;
  ring.parent = group;
  
  var beam = BABYLON.MeshBuilder.CreateCylinder('destBeam', {
    height: 14, diameterTop: 1.5, diameterBottom: 4, tessellation: 10
  }, scene);
  beam.material = mat;
  beam.position.y = 7;
  beam.parent = group;
  
  var icon = BABYLON.MeshBuilder.CreateSphere('destIcon', {
    diameter: 2, segments: 8
  }, scene);
  icon.material = mat;
  icon.position.y = 12;
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
      
      var riderMesh = createPassengerMesh();
      riderMesh.scaling.set(0.7, 0.7, 0.7);
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
    UI.showToast('🎉 +' + reward + ' جنيه', 2500);
    
    activeDestination.getChildMeshes().forEach(function(m) { m.dispose(); });
    activeDestination.dispose();
    activeDestination = null;
    
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
   الناس
   ═══════════════════════════════════════════════════════════ */
var people = [];

function createPerson(x, z) {
  var person = new BABYLON.TransformNode('person', scene);
  person.position.set(x, 0, z);
  person.rotation.y = Math.random() * Math.PI * 2;
  
  var skin = Utils.pick(MAT.skin);
  var shirt = Utils.pick(MAT.shirt);
  var pants = Utils.pick(MAT.pants);
  
  var torso = BABYLON.MeshBuilder.CreateBox('ptorso', {
    width: 0.42, height: 0.65, depth: 0.26
  }, scene);
  torso.material = shirt;
  torso.position.y = 1.08;
  torso.parent = person;
  
  var head = BABYLON.MeshBuilder.CreateSphere('phead', {
    diameter: 0.34, segments: 6
  }, scene);
  head.material = skin;
  head.position.y = 1.6;
  head.parent = person;
  
  var legs = BABYLON.MeshBuilder.CreateBox('plegs', {
    width: 0.42, height: 0.8, depth: 0.26
  }, scene);
  legs.material = pants;
  legs.position.y = 0.4;
  legs.parent = person;
  
  person.metadata = {
    direction: Math.random() * Math.PI * 2,
    speed: Utils.rand(0.6, 1.2),
    walkPhase: Math.random() * Math.PI * 2,
    homeX: x,
    homeZ: z,
    wanderTimer: Utils.rand(1, 3),
    isScared: false,
    scaredTimer: 0
  };
  
  return person;
}

function createPeople() {
  var count = isMobile ? 12 : 25;
  for (var i = 0; i < count; i++) {
    var rd = Utils.pick(ROADS_DATA);
    var off = Utils.rand(-rd.length / 2 + 40, rd.length / 2 - 40);
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
  }
}

/* ═══════════════════════════════════════════════════════════
   حالة اللعبة
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
  cafeSceneTimer: 0
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

/* ═══════════════════════════════════════════════════════════
   المدخلات
   ═══════════════════════════════════════════════════════════ */
var keys = {};
var mobileInput = { accel: false, brake: false, left: false, right: false };

document.addEventListener('keydown', function(e) {
  keys[e.code] = true;
  if (e.code === 'Space') player.handbrake = true;
  if (e.code === 'KeyE') {
    player.engineOn = !player.engineOn;
    AudioSystem.setEngine(player.engineOn);
  }
  if (e.code === 'KeyH') {
    AudioSystem.playHorn();
    UI.showToast('📢 كلاكس', 800);
  }
  if (e.code === 'KeyR') radio.toggle();
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
  var buttons = { btnAccel: 'accel', btnBrake: 'brake', btnLeft: 'left', btnRight: 'right' };
  
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
    hbBtn.addEventListener('touchstart', function(e) { 
      e.preventDefault(); 
      player.handbrake = true;
      hbBtn.classList.add('pressed');
    }, { passive: false });
    hbBtn.addEventListener('touchend', function(e) { 
      e.preventDefault(); 
      player.handbrake = false;
      hbBtn.classList.remove('pressed');
    }, { passive: false });
  }
  
  var hornBtn = document.getElementById('btnHorn');
  if (hornBtn) {
    hornBtn.addEventListener('touchstart', function(e) {
      e.preventDefault();
      AudioSystem.playHorn();
      UI.showToast('📢 كلاكس', 800);
    }, { passive: false });
  }
}

/* ═══════════════════════════════════════════════════════════
   فيزياء التوك توك
   ═══════════════════════════════════════════════════════════ */
function updateTukTukPhysics(dt) {
  if (!gameState.running || gameState.paused) return;
  
  var throttle = (keys.KeyW || keys.ArrowUp || mobileInput.accel) ? 1 : 0;
  var brake = (keys.KeyS || keys.ArrowDown || mobileInput.brake) ? 1 : 0;
  
  if (!player.engineOn) {
    player.speed *= (1 - 4 * dt);
    if (Math.abs(player.speed) < 0.1) player.speed = 0;
  } else if (player.handbrake) {
    player.speed *= (1 - 15 * dt);
    if (Math.abs(player.speed) < 0.1) player.speed = 0;
  } else {
    if (throttle && !brake) {
      player.speed += CONFIG.acceleration * dt;
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
  
  if (Math.abs(player.speed) > 0.1) {
    var speedFactor = Math.min(Math.abs(player.speed) / 6, 1.4);
    var direction = player.speed >= 0 ? 1 : -1;
    var turnRate = player.currentWheelAngle * speedFactor * dt * 3.5 * direction;
    tukTuk.rotation.y -= turnRate;
  }
  
  var forwardX = Math.sin(tukTuk.rotation.y);
  var forwardZ = Math.cos(tukTuk.rotation.y);
  
  var newX = tukTuk.position.x + forwardX * player.speed * dt;
  var newZ = tukTuk.position.z + forwardZ * player.speed * dt;
  
  var inCanalX = !(newX > 88 && newX < 112);
  var nearCanal = Math.abs(newZ) < CONFIG.canalWidth / 2 + 1.5;
  
  if (nearCanal && inCanalX) {
    player.speed *= -0.3;
  } else if (Math.abs(newX) < 800 && Math.abs(newZ) < 800) {
    tukTuk.position.x = newX;
    tukTuk.position.z = newZ;
  } else {
    player.speed *= -0.3;
  }
  
  // العجلات
  var wheelRoll = (player.speed * dt) / 0.3;
  for (var i = 0; i < tukTukObj.wheels.length; i++) {
    var w = tukTukObj.wheels[i];
    if (w.metadata) {
      if (w.metadata.tire) w.metadata.tire.rotation.x += wheelRoll;
      if (w.metadata.isFront) w.rotation.y = player.currentWheelAngle;
    }
  }
  
  if (tukTukObj.steeringWheel) {
    tukTukObj.steeringWheel.rotation.z = -player.steering * Math.PI * 0.85;
  }
  
  // الكاميرا
  updateCamera(dt);
  
  // الاصطدام
  checkPeopleCollision();
}

function updateCamera(dt) {
  var camDist = 9;
  var camHeight = 5;
  
  var forwardX = Math.sin(tukTuk.rotation.y);
  var forwardZ = Math.cos(tukTuk.rotation.y);
  
  var targetX = tukTuk.position.x - forwardX * camDist;
  var targetY = camHeight;
  var targetZ = tukTuk.position.z - forwardZ * camDist;
  
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

function checkPeopleCollision() {
  if (Math.abs(player.speed) < 1) return;
  
  for (var i = 0; i < people.length; i++) {
    var p = people[i];
    var dx = p.position.x - tukTuk.position.x;
    var dz = p.position.z - tukTuk.position.z;
    var dist = Math.sqrt(dx * dx + dz * dz);
    
    if (dist < 1.5 && !p.metadata.isScared) {
      p.metadata.isScared = true;
      p.metadata.scaredTimer = 3;
      p.metadata.direction = Math.random() * Math.PI * 2;
      
      gameState.ratingSum -= 1;
      gameState.ratingCount += 1;
      player.bumpCount++;
      
      AudioSystem.playAngry();
      UI.showToast('⚠️ ' + Utils.pick(DIALOGS.angry), 2000);
    }
  }
}

/* ═══════════════════════════════════════════════════════════
   HUD
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
    UI.missionPanel.textContent = '🎯 رايح لـ: ' + player.currentPassenger.name;
    UI.missionPanel.style.borderRightColor = '#00ff88';
  } else if (passengers.length > 0) {
    UI.missionPanel.textContent = '👤 ' + passengers.length + ' راكب ينتظر';
    UI.missionPanel.style.borderRightColor = '#00ff88';
  } else {
    UI.missionPanel.textContent = '🔍 بيدوّر على راكب...';
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
          var pulse = 1 + Math.sin(now * 0.006) * 0.2;
          md.ring.scaling.set(pulse, pulse, 1);
        }
        if (md.arrow) {
          md.arrow.position.y = 3.2 + Math.sin(now * 0.005) * 0.4;
          md.arrow.rotation.y += dt * 2;
        }
      }
    }
  }
  
  if (activeDestination) {
    var dm = activeDestination.metadata;
    var time = (now - dm.startTime) / 1000;
    var pulse = 1 + Math.sin(time * 3) * 0.15;
    dm.ring.scaling.set(pulse, pulse, 1);
    dm.icon.rotation.y += dt * 2;
    dm.icon.position.y = 12 + Math.sin(time * 2) * 0.8;
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
   ربط الراديو
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
   📊 Progress Bar - تحميل حقيقي خطوة بخطوة
   ═══════════════════════════════════════════════════════════ */
async function buildCityWithProgress() {
  var steps = [
    { name: 'جاري تحضير المواد...', weight: 8, fn: createMaterials },
    { name: 'بناء الأرضية...', weight: 5, fn: createGround },
    { name: 'رصف الشوارع...', weight: 15, fn: createRoads },
    { name: 'بناء الترعة...', weight: 8, fn: createCanal },
    { name: 'بناء عزبة بولضو...', weight: 15, fn: createEzbetBoldu },
    { name: 'بناء المباني...', weight: 25, fn: createBuildings },
    { name: 'توليد الناس...', weight: 12, fn: createPeople },
    { name: 'تحضير الراديو...', weight: 12, fn: function() {
      radio.init();
      setupRadio();
    }}
  ];
  
  var totalWeight = steps.reduce(function(s, st) { return s + st.weight; }, 0);
  var accumulated = 0;
  
  for (var i = 0; i < steps.length; i++) {
    var step = steps[i];
    var pct = Math.round((accumulated / totalWeight) * 100);
    UI.updateLoading(pct, step.name);
    
    // نعمل yield للـ UI
    await new Promise(function(resolve) {
      setTimeout(resolve, 50);
    });
    
    try {
      step.fn();
    } catch (e) {
      console.error('خطأ في', step.name, e);
    }
    
    accumulated += step.weight;
    
    // تحديث نهائي للخطوة
    pct = Math.round((accumulated / totalWeight) * 100);
    UI.updateLoading(pct, step.name);
    
    await new Promise(function(resolve) {
      setTimeout(resolve, 30);
    });
  }
  
  UI.updateLoading(100, 'جاهز! 🚀');
  await new Promise(function(resolve) { setTimeout(resolve, 400); });
}

/* ═══════════════════════════════════════════════════════════
   بدء اللعبة
   ═══════════════════════════════════════════════════════════ */
var isInitialized = false;

async function startGame() {
  console.log('🎬 بدء اللعبة...');
  
  AudioSystem.init();
  
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
    return;
  }
  
  UI.startBtn.disabled = true;
  UI.startBtn.textContent = '⏳ جاري التحميل...';
  UI.loadingScreen.classList.remove('hidden');
  UI.startScreen.classList.remove('visible');
  
  try {
    await buildCityWithProgress();
    
    // إنشاء التوك توك
    setupMobileButtons();
    
    isInitialized = true;
    
    // إخفاء شاشة التحميل، إظهار شاشة البداية
    UI.loadingScreen.classList.add('hidden');
    UI.startScreen.classList.add('visible');
    UI.startBtn.disabled = false;
    UI.startBtn.textContent = '🚀 ابدأ الشغل';
    
    console.log('✅ اللعبة جاهزة!');
    
  } catch (error) {
    console.error('❌ خطأ:', error);
    UI.updateLoading(0, '❌ حدث خطأ - حاول تحدّث الصفحة');
    UI.startBtn.disabled = false;
    UI.startBtn.textContent = '🚀 ابدأ الشغل';
  }
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
  
  for (var i = 0; i < passengers.length; i++) {
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
  
  // إرجاع الناس للوضع العادي
  for (var i = 0; i < people.length; i++) {
    people[i].metadata.isScared = false;
    people[i].position.set(people[i].metadata.homeX, 0, people[i].metadata.homeZ);
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
   الحلقة الرئيسية
   ═══════════════════════════════════════════════════════════ */
var lastTime = performance.now();

engine.runRenderLoop(function() {
  var now = performance.now();
  var dt = (now - lastTime) / 1000;
  lastTime = now;
  dt = Math.min(dt, 0.05);
  
  if (!gameState.running || gameState.paused) {
    scene.render();
    return;
  }
  
  gameState.elapsedTime += dt;
  gameState.timeLeft -= dt;
  
  if (gameState.timeLeft <= 0) {
    gameState.timeLeft = 0;
    endGame();
    scene.render();
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
  updatePassengers(dt);
  updatePeople(dt);
  
  var isAccel = !!(keys.KeyW || keys.ArrowUp || mobileInput.accel);
  AudioSystem.updateEngine(Math.abs(player.speed), CONFIG.maxSpeed, isAccel);
  
  sunLight.position.x = tukTuk.position.x + 200;
  sunLight.position.z = tukTuk.position.z + 150;
  
  updateHUD();
  
  scene.render();
});

window.addEventListener('resize', function() {
  engine.resize();
});

/* ═══════════════════════════════════════════════════════════
   ربط الأزرار
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
    } else {
      if (document.exitFullscreen) document.exitFullscreen().catch(function() {});
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
   تصدير
   ═══════════════════════════════════════════════════════════ */
window.buildCity = buildCityWithProgress;
window.startGame = startGame;
window.togglePause = togglePause;
window.gameState = gameState;
window.radio = radio;
window.gameStarted = true;
window.gameInitialized = true;

console.log('✅ اللعبة محمّلة - اضغط "🚀 ابدأ الشغل"');
