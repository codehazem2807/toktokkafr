/* ============================================================
   🛺 لعبة توك توك كفر الدوار - 3D
   الجزء 1: الإعداد + بناء المدينة + الأدوات الأساسية
   ============================================================ */

import * as THREE from 'three';

/* ============================================================
   إعدادات اللعبة العامة
   ============================================================ */
const CONFIG = {
  // حجم المدينة
  citySize: 2000,
  canalWidth: 25,
  roadWidth: 24,
  sidewalkWidth: 3,
  
  // أبعاد التوك توك
  tukTukWidth: 1.4,
  tukTukLength: 2.6,
  tukTukHeight: 2.2,
  
  // إعدادات الكاميرا
  cameraHeight: 1.55,
  cameraForwardOffset: 0.35,
  cameraSideOffset: 0,
  
  // إعدادات الفيزياء
  maxSpeed: 16,           // أقصى سرعة (م/ث)
  maxReverseSpeed: 5,
  acceleration: 7,
  braking: 14,
  friction: 0.8,
  steeringSpeed: 3.2,
  maxWheelAngle: 0.55,
  
  // اللعبة
  gameDuration: 180,      // 3 دقائق
  maxPassengers: 3,
  
  // الجودة
  shadowQuality: 2048,
  enableShadows: true,
};

/* ============================================================
   ألوان هوية كفر الدوار
   ============================================================ */
const COLORS = {
  sky: 0x87CEEB,
  skyTop: 0x4a90e2,
  ground: 0x5a8a4a,
  road: 0x3a3a3a,
  sidewalk: 0xa0a0a0,
  building1: 0xc9b8a8,
  building2: 0xa8927a,
  building3: 0x8b7355,
  canal: 0x1a4a6a,
  tukTuk: 0xffc800,
  tukTukDark: 0x111111,
};

/* ============================================================
   المشهد والكاميرا والمصير
   ============================================================ */
const scene = new THREE.Scene();
scene.background = new THREE.Color(COLORS.sky);
scene.fog = new THREE.Fog(COLORS.sky, 250, 1000);

const camera = new THREE.PerspectiveCamera(
  72,
  window.innerWidth / window.innerHeight,
  0.05,
  3000
);

const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById('gameCanvas'),
  antialias: true,
  powerPreference: 'high-performance',
  stencil: false,
  alpha: false,
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = CONFIG.enableShadows;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
renderer.outputColorSpace = THREE.SRGBColorSpace;

/* ============================================================
   الإضاءة
   ============================================================ */
// ضوء الشمس
const sunLight = new THREE.DirectionalLight(0xfff5e0, 2.6);
sunLight.position.set(200, 300, 150);
sunLight.castShadow = CONFIG.enableShadows;
if (CONFIG.enableShadows) {
  sunLight.shadow.mapSize.width = CONFIG.shadowQuality;
  sunLight.shadow.mapSize.height = CONFIG.shadowQuality;
  sunLight.shadow.camera.near = 1;
  sunLight.shadow.camera.far = 700;
  sunLight.shadow.camera.left = -180;
  sunLight.shadow.camera.right = 180;
  sunLight.shadow.camera.top = 180;
  sunLight.shadow.camera.bottom = -180;
  sunLight.shadow.bias = -0.0003;
  sunLight.shadow.normalBias = 0.02;
}
scene.add(sunLight);
scene.add(sunLight.target);

// الإضاءة المحيطة
const ambientLight = new THREE.AmbientLight(0x8899bb, 1.0);
scene.add(ambientLight);

// إضاءة نصف كروية (سماء + أرض)
const hemiLight = new THREE.HemisphereLight(0x87CEEB, 0x3a4a3a, 1.2);
scene.add(hemiLight);

/* ============================================================
   واجهة المستخدم - الكائن الرئيسي
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
  
  updateLoading(pct, text) {
    this.loadingFill.style.width = pct + '%';
    if (text) this.loadingText.textContent = text;
  },
  
  showToast(message, duration = 1800) {
    this.toast.textContent = message;
    this.toast.classList.add('show');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => {
      this.toast.classList.remove('show');
    }, duration);
  },
  
  showHint(text, duration = 5000) {
    this.hint.textContent = text;
    this.hint.classList.remove('hidden');
    clearTimeout(this._hintTimer);
    if (duration > 0) {
      this._hintTimer = setTimeout(() => {
        this.hint.classList.add('hidden');
      }, duration);
    }
  },
  
  hideHint() {
    this.hint.classList.add('hidden');
  },
};

/* ============================================================
   كشف الجهاز (موبايل / كمبيوتر)
   ============================================================ */
const isMobile = (() => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    || (navigator.maxTouchPoints && navigator.maxTouchPoints > 2 && /MacIntel/.test(navigator.platform))
    || window.matchMedia('(pointer: coarse)').matches;
})();

console.log('📱 الجهاز:', isMobile ? 'موبايل/تابلت' : 'كمبيوتر');

/* ============================================================
   مواد مشتركة (لتحسين الأداء)
   ============================================================ */
const MATERIALS = {
  road: new THREE.MeshStandardMaterial({ 
    color: COLORS.road, 
    roughness: 0.95,
    metalness: 0.05
  }),
  sidewalk: new THREE.MeshStandardMaterial({ 
    color: COLORS.sidewalk, 
    roughness: 0.9 
  }),
  roadMark: new THREE.MeshBasicMaterial({ color: 0xffcc00 }),
  roadMarkWhite: new THREE.MeshBasicMaterial({ color: 0xffffff }),
  treeTrunk: new THREE.MeshStandardMaterial({ color: 0x5a3a20, roughness: 1 }),
  treeLeaf: new THREE.MeshStandardMaterial({ color: 0x2d5a2d, roughness: 1 }),
  treeLeafDark: new THREE.MeshStandardMaterial({ color: 0x1d4a1d, roughness: 1 }),
  palmTrunk: new THREE.MeshStandardMaterial({ color: 0x8b6a3a, roughness: 1 }),
  palmLeaf: new THREE.MeshStandardMaterial({ color: 0x3a7a3a, roughness: 0.9, side: THREE.DoubleSide }),
  streetLightPole: new THREE.MeshStandardMaterial({ 
    color: 0xcccccc, 
    roughness: 0.4, 
    metalness: 0.7 
  }),
  streetLightLamp: new THREE.MeshStandardMaterial({ 
    color: 0xffffee, 
    emissive: 0xffee88,
    emissiveIntensity: 0.8
  }),
  glass: new THREE.MeshPhysicalMaterial({
    color: 0xaaddff,
    roughness: 0.05,
    metalness: 0.1,
    transmission: 0.85,
    transparent: true,
    opacity: 0.55,
    thickness: 0.05,
    ior: 1.5,
  }),
  chrome: new THREE.MeshStandardMaterial({
    color: 0xcccccc,
    roughness: 0.15,
    metalness: 0.95,
  }),
  black: new THREE.MeshStandardMaterial({
    color: 0x111111,
    roughness: 0.7,
    metalness: 0.15,
  }),
};

/* ============================================================
   خريطة الشوارع الحقيقية لكفر الدوار
   (بناءً على البيانات المتاحة للوحدة المحلية)
   ============================================================ */
const ROADS_DATA = [
  // === الشوارع الشريانية ===
  {
    name: 'شارع أحمد عرابي',
    // يمتد من شرق المدينة لغربها على الجسر الأيسر لترعة المحمودية
    x: 0, z: -15,
    width: CONFIG.roadWidth,
    length: CONFIG.citySize,
    rotation: 0,
    isMain: true,
  },
  {
    name: 'مدخل الكوبري الجديد',
    // يربط الطريق الزراعي بشارع أحمد عرابي
    x: 700, z: 150,
    width: CONFIG.roadWidth * 0.9,
    length: 500,
    rotation: Math.PI / 2,
    isMain: true,
  },
  
  // === الشوارع المجمعة الرئيسة ===
  {
    name: 'شارع بورسعيد',
    // جنوب ترعة المحمودية
    x: 0, z: 25,
    width: CONFIG.roadWidth * 0.85,
    length: CONFIG.citySize,
    rotation: 0,
  },
  {
    name: 'شارع الجيش',
    // المدخل الجنوبي - فيه سوق يومي وورش سيارات
    x: 300, z: 100,
    width: CONFIG.roadWidth * 0.8,
    length: 800,
    rotation: Math.PI / 2,
  },
  {
    name: 'شارع الجمهورية',
    x: -400, z: 0,
    width: CONFIG.roadWidth * 0.75,
    length: 750,
    rotation: Math.PI / 2,
  },
  {
    name: 'شارع جلال الدسوقي',
    x: -150, z: 500,
    width: CONFIG.roadWidth * 0.7,
    length: 700,
    rotation: Math.PI / 2,
  },
  {
    name: 'شارع سيدي عبد القادر',
    // المدخل الغربي - يؤدي لمستشفى كفر الدوار العام
    x: -700, z: 100,
    width: CONFIG.roadWidth * 0.75,
    length: 500,
    rotation: Math.PI / 2,
  },
  {
    name: 'شارع الحدائق',
    // محور مروري جديد
    x: 100, z: 400,
    width: CONFIG.roadWidth * 0.65,
    length: 600,
    rotation: Math.PI / 2,
  },
  {
    name: 'شارع المحور',
    x: 600, z: 400,
    width: CONFIG.roadWidth * 0.65,
    length: 500,
    rotation: Math.PI / 2,
  },
  
  // === الشوارع المجمعة (Collectors) ===
  { name: 'شارع سيدي شحاته', x: -800, z: -400, width: 16, length: 400, rotation: 0 },
  { name: 'شارع الرحمة', x: -200, z: -500, width: 16, length: 300, rotation: 0 },
  { name: 'شارع مجمع المحاكم', x: 500, z: -300, width: 16, length: 400, rotation: 0 },
  { name: 'شارع صلاح الدين الأيوبي', x: 900, z: -500, width: 16, length: 300, rotation: 0 },
  { name: 'شارع الإدكاوي', x: -600, z: 600, width: 16, length: 400, rotation: Math.PI / 2 },
  { name: 'شارع العروبة', x: 200, z: 700, width: 16, length: 300, rotation: Math.PI / 2 },
  { name: 'شارع النصر', x: 700, z: 600, width: 16, length: 400, rotation: Math.PI / 2 },
];

/* ============================================================
   الأدوات المساعدة
   ============================================================ */
const Utils = {
  // توليد رقم عشوائي بين حدين
  rand(min, max) {
    return Math.random() * (max - min) + min;
  },
  
  // اختيار عنصر عشوائي من مصفوفة
  pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  },
  
  // تحويل زاوية من راديان لدرجة
  toDeg(rad) {
    return rad * 180 / Math.PI;
  },
  
  // تبسيط الوقت إلى MM:SS
  formatTime(seconds) {
    const m = Math.floor(Math.max(0, seconds) / 60);
    const s = Math.floor(Math.max(0, seconds) % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  },
  
  // clamp للقيم
  clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  },
  
  // lerp (linear interpolation)
  lerp(a, b, t) {
    return a + (b - a) * t;
  },
};

/* ============================================================
   إنشاء الأرضية
   ============================================================ */
function createGround() {
  const groundGeo = new THREE.PlaneGeometry(6000, 6000, 1, 1);
  const groundMat = new THREE.MeshStandardMaterial({
    color: COLORS.ground,
    roughness: 1,
    metalness: 0,
  });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);
  return ground;
}

/* ============================================================
   إنشاء ترعة المحمودية
   (تخترق المدينة من الشرق للغرب - بطول 5.6 كم)
   ============================================================ */
function createCanal() {
  const group = new THREE.Group();
  group.name = 'canal';
  
  // المياه (بموجات واقعية)
  const waterGeo = new THREE.PlaneGeometry(
    CONFIG.citySize * 1.2,
    CONFIG.canalWidth,
    80, 8
  );
  const waterMat = new THREE.MeshStandardMaterial({
    color: COLORS.canal,
    roughness: 0.15,
    metalness: 0.65,
    transparent: true,
    opacity: 0.9,
  });
  const water = new THREE.Mesh(waterGeo, waterMat);
  water.rotation.x = -Math.PI / 2;
  water.position.y = -0.5;
  water.receiveShadow = true;
  group.add(water);
  group.userData.water = water;
  group.userData.waterBasePositions = waterGeo.attributes.position.array.slice();
  
  // ضفاف الترعة
  const bankMat = new THREE.MeshStandardMaterial({ 
    color: 0x8b7355, 
    roughness: 1 
  });
  const bankGeo = new THREE.BoxGeometry(
    CONFIG.citySize * 1.2, 
    2, 
    4
  );
  
  // الضفة الشمالية
  const northBank = new THREE.Mesh(bankGeo, bankMat);
  northBank.position.set(0, 1, -(CONFIG.canalWidth / 2 + 2));
  northBank.castShadow = true;
  northBank.receiveShadow = true;
  group.add(northBank);
  
  // الضفة الجنوبية
  const southBank = new THREE.Mesh(bankGeo, bankMat);
  southBank.position.set(0, 1, (CONFIG.canalWidth / 2 + 2));
  southBank.castShadow = true;
  southBank.receiveShadow = true;
  group.add(southBank);
  
  // درابزين على الضفتين
  const railMat = new THREE.MeshStandardMaterial({
    color: 0xeeeeee,
    roughness: 0.5,
    metalness: 0.4,
  });
  
  for (let side = -1; side <= 1; side += 2) {
    const railHeight = 1.1;
    for (let x = -CONFIG.citySize * 0.6; x < CONFIG.citySize * 0.6; x += 8) {
      // عمود
      const postGeo = new THREE.CylinderGeometry(0.08, 0.08, railHeight);
      const post = new THREE.Mesh(postGeo, railMat);
      post.position.set(
        x, 
        railHeight / 2 + 1, 
        side * (CONFIG.canalWidth / 2 + 3.8)
      );
      post.castShadow = true;
      group.add(post);
    }
    // سلك علوي
    const wireGeo = new THREE.BoxGeometry(CONFIG.citySize * 1.2, 0.06, 0.06);
    const wire = new THREE.Mesh(wireGeo, railMat);
    wire.position.set(
      0, 
      railHeight + 1, 
      side * (CONFIG.canalWidth / 2 + 3.8)
    );
    wire.castShadow = true;
    group.add(wire);
  }
  
  // === جسر أحمد عرابي ===
  const bridgeX = 0; // يمتد عرضياً
  const bridgeGeo = new THREE.BoxGeometry(
    30, 
    3, 
    CONFIG.canalWidth + 20
  );
  const bridgeMat = new THREE.MeshStandardMaterial({ 
    color: 0x555555, 
    roughness: 0.9 
  });
  const bridge = new THREE.Mesh(bridgeGeo, bridgeMat);
  bridge.position.set(bridgeX, 2, 0);
  bridge.castShadow = true;
  bridge.receiveShadow = true;
  group.add(bridge);
  
  // درابزين الجسر
  for (let side = -1; side <= 1; side += 2) {
    const railGeo = new THREE.BoxGeometry(
      2, 
      1.2, 
      CONFIG.canalWidth + 20
    );
    const rail = new THREE.Mesh(railGeo, railMat);
    rail.position.set(bridgeX + (side * 14), 3.6, 0);
    rail.castShadow = true;
    group.add(rail);
  }
  
  // أعمدة الجسر
  const pillarGeo = new THREE.CylinderGeometry(1.5, 1.5, 8, 12);
  const pillarMat = new THREE.MeshStandardMaterial({ 
    color: 0x666666, 
    roughness: 0.95 
  });
  for (let side = -1; side <= 1; side += 2) {
    for (let z = -1; z <= 1; z += 2) {
      const pillar = new THREE.Mesh(pillarGeo, pillarMat);
      pillar.position.set(
        bridgeX + (side * 12),
        -2,
        z * (CONFIG.canalWidth / 2)
      );
      pillar.castShadow = true;
      group.add(pillar);
    }
  }
  
  scene.add(group);
  return group;
}

/* ============================================================
   إنشاء الشوارع الرئيسية
   ============================================================ */
function createRoads() {
  const group = new THREE.Group();
  group.name = 'roads';
  
  ROADS_DATA.forEach((roadData, index) => {
    const { x, z, width, length, rotation = 0 } = roadData;
    
    // جسم الشارع
    const roadGeo = new THREE.BoxGeometry(width, 0.2, length);
    const road = new THREE.Mesh(roadGeo, MATERIALS.road);
    road.position.set(x, 0.1, z);
    road.rotation.y = rotation;
    road.receiveShadow = true;
    road.userData.roadName = roadData.name;
    road.userData.isMain = roadData.isMain || false;
    group.add(road);
    
    // الأرصفة (على الجانبين)
    const sideGeo = new THREE.BoxGeometry(
      CONFIG.sidewalkWidth, 
      0.4, 
      length
    );
    
    for (let side = -1; side <= 1; side += 2) {
      const sidewalk = new THREE.Mesh(sideGeo, MATERIALS.sidewalk);
      // حساب الموقع بناءً على الدوران
      const sideOffset = side * (width / 2 + CONFIG.sidewalkWidth / 2);
      const dx = Math.cos(rotation) * sideOffset;
      const dz = -Math.sin(rotation) * sideOffset;
      sidewalk.position.set(x + dx, 0.3, z + dz);
      sidewalk.rotation.y = rotation;
      sidewalk.receiveShadow = true;
      sidewalk.castShadow = true;
      group.add(sidewalk);
    }
    
    // خطوط الطريق
    if (width >= 18) {
      // خطان للاتجاهين
      const markCount = Math.floor(length / 25);
      for (let i = 0; i < markCount; i++) {
        const offset = -length / 2 + i * 25 + 12.5;
        const markGeo = new THREE.BoxGeometry(0.35, 0.08, 10);
        const mark = new THREE.Mesh(markGeo, MATERIALS.roadMark);
        
        const mx = x + Math.sin(rotation) * offset;
        const mz = z + Math.cos(rotation) * offset;
        mark.position.set(mx, 0.22, mz);
        mark.rotation.y = rotation;
        group.add(mark);
      }
    } else if (width >= 14) {
      // خط واحد في المنتصف
      const markCount = Math.floor(length / 30);
      for (let i = 0; i < markCount; i++) {
        const offset = -length / 2 + i * 30 + 15;
        const markGeo = new THREE.BoxGeometry(0.3, 0.08, 8);
        const mark = new THREE.Mesh(markGeo, MATERIALS.roadMark);
        const mx = x + Math.sin(rotation) * offset;
        const mz = z + Math.cos(rotation) * offset;
        mark.position.set(mx, 0.22, mz);
        mark.rotation.y = rotation;
        group.add(mark);
      }
    }
  });
  
  scene.add(group);
  return group;
}

/* ============================================================
   إنشاء خط السكة الحديد
   (يمر بجانب المدينة باتجاه القاهرة/الإسكندرية)
   ============================================================ */
function createRailway() {
  const group = new THREE.Group();
  group.name = 'railway';
  
  const railMat = new THREE.MeshStandardMaterial({
    color: 0x808080,
    metalness: 0.9,
    roughness: 0.35,
  });
  
  const sleeperMat = new THREE.MeshStandardMaterial({
    color: 0x4a3a2a,
    roughness: 1,
  });
  
  const railX = -350; // موقع السكة
  
  // القضبان
  for (let side = -1; side <= 1; side += 2) {
    const railGeo = new THREE.BoxGeometry(0.18, 0.35, CONFIG.citySize);
    const rail = new THREE.Mesh(railGeo, railMat);
    rail.position.set(railX + (side * 1.5), 0.55, 0);
    rail.castShadow = true;
    group.add(rail);
  }
  
  // العوارض (كل 1.5 متر)
  const sleeperGeo = new THREE.BoxGeometry(4.2, 0.2, 0.35);
  for (let z = -CONFIG.citySize / 2; z < CONFIG.citySize / 2; z += 1.5) {
    const sleeper = new THREE.Mesh(sleeperGeo, sleeperMat);
    sleeper.position.set(railX, 0.4, z);
    sleeper.receiveShadow = true;
    sleeper.castShadow = true;
    group.add(sleeper);
  }
  
  // حصى السكة
  const gravelGeo = new THREE.BoxGeometry(6, 0.15, CONFIG.citySize);
  const gravelMat = new THREE.MeshStandardMaterial({
    color: 0x707070,
    roughness: 1,
  });
  const gravel = new THREE.Mesh(gravelGeo, gravelMat);
  gravel.position.set(railX, 0.3, 0);
  gravel.receiveShadow = true;
  group.add(gravel);
  
  // حواجز حماية على جانبي السكة
  const barrierMat = new THREE.MeshStandardMaterial({
    color: 0xdddddd,
    roughness: 0.6,
    metalness: 0.3,
  });
  
  for (let side = -1; side <= 1; side += 2) {
    for (let z = -CONFIG.citySize / 2; z < CONFIG.citySize / 2; z += 10) {
      const postGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.9);
      const post = new THREE.Mesh(postGeo, barrierMat);
      post.position.set(railX + (side * 5), 0.85, z);
      post.castShadow = true;
      group.add(post);
    }
  }
  
  scene.add(group);
  return group;
}

/* ============================================================
   إنشاء الأشجار والنخيل
   ============================================================ */
function createTree(x, z, scale = 1) {
  const tree = new THREE.Group();
  
  // الجذع
  const trunkGeo = new THREE.CylinderGeometry(0.2 * scale, 0.28 * scale, 2.5 * scale, 6);
  const trunk = new THREE.Mesh(trunkGeo, MATERIALS.treeTrunk);
  trunk.position.y = 1.25 * scale;
  trunk.castShadow = true;
  trunk.receiveShadow = true;
  tree.add(trunk);
  
  // الأوراق (3 طبقات)
  const leafMat = Math.random() > 0.5 ? MATERIALS.treeLeaf : MATERIALS.treeLeafDark;
  
  const leaf1Geo = new THREE.SphereGeometry(1.2 * scale, 8, 6);
  const leaf1 = new THREE.Mesh(leaf1Geo, leafMat);
  leaf1.position.y = 3 * scale;
  leaf1.castShadow = true;
  tree.add(leaf1);
  
  const leaf2Geo = new THREE.SphereGeometry(1 * scale, 8, 6);
  const leaf2 = new THREE.Mesh(leaf2Geo, leafMat);
  leaf2.position.set(0.5 * scale, 3.6 * scale, 0.3 * scale);
  leaf2.castShadow = true;
  tree.add(leaf2);
  
  const leaf3Geo = new THREE.SphereGeometry(0.9 * scale, 8, 6);
  const leaf3 = new THREE.Mesh(leaf3Geo, leafMat);
  leaf3.position.set(-0.4 * scale, 3.8 * scale, -0.3 * scale);
  leaf3.castShadow = true;
  tree.add(leaf3);
  
  tree.position.set(x, 0, z);
  return tree;
}

function createPalm(x, z, scale = 1) {
  const palm = new THREE.Group();
  
  // الجذع (مقسم لعدة أجزاء للانحناء الطبيعي)
  const segments = 5;
  const trunkHeight = 6 * scale;
  let prevPos = new THREE.Vector3(0, 0, 0);
  
  for (let i = 0; i < segments; i++) {
    const segHeight = trunkHeight / segments;
    const segGeo = new THREE.CylinderGeometry(
      0.15 * scale * (1 - i * 0.05),
      0.2 * scale * (1 - i * 0.05),
      segHeight,
      8
    );
    const seg = new THREE.Mesh(segGeo, MATERIALS.palmTrunk);
    const y = prevPos.y + segHeight / 2;
    const bendX = Math.sin(i * 0.3) * 0.15 * scale * i;
    seg.position.set(bendX, y, 0);
    seg.castShadow = true;
    palm.add(seg);
    prevPos.set(bendX, y + segHeight / 2, 0);
  }
  
  // أوراق النخيل (7 أوراق)
  const leafCount = 7;
  for (let i = 0; i < leafCount; i++) {
    const angle = (i / leafCount) * Math.PI * 2;
    const leafGeo = new THREE.PlaneGeometry(0.8 * scale, 3 * scale);
    const leaf = new THREE.Mesh(leafGeo, MATERIALS.palmLeaf);
    
    leaf.position.set(
      prevPos.x + Math.cos(angle) * 0.5 * scale,
      prevPos.y + 0.2 * scale,
      Math.sin(angle) * 0.5 * scale
    );
    
    leaf.rotation.z = Math.PI / 2.2;
    leaf.rotation.y = angle;
    leaf.castShadow = true;
    palm.add(leaf);
  }
  
  palm.position.set(x, 0, z);
  return palm;
}

function createFoliage() {
  const group = new THREE.Group();
  group.name = 'foliage';
  
  // نخيل على طول ترعة المحمودية
  for (let x = -CONFIG.citySize * 0.55; x < CONFIG.citySize * 0.55; x += 30) {
    if (Math.random() > 0.4) {
      // ضفة شمالية
      const palm1 = createPalm(x + Utils.rand(-5, 5), -(CONFIG.canalWidth / 2 + 6), Utils.rand(0.85, 1.15));
      group.add(palm1);
    }
    if (Math.random() > 0.4) {
      // ضفة جنوبية
      const palm2 = createPalm(x + Utils.rand(-5, 5), (CONFIG.canalWidth / 2 + 6), Utils.rand(0.85, 1.15));
      group.add(palm2);
    }
  }
  
  // أشجار على الأرصفة
  ROADS_DATA.forEach(road => {
    if (road.width < 16) return; // فقط الشوارع الكبيرة
    
    const treeSpacing = 40;
    const treeCount = Math.floor(road.length / treeSpacing);
    
    for (let i = 0; i < treeCount; i++) {
      const offset = -road.length / 2 + i * treeSpacing + treeSpacing / 2;
      
      // الجانب الأول
      if (Math.random() > 0.3) {
        const sideOffset = road.width / 2 + CONFIG.sidewalkWidth + 2;
        const tx = road.x + Math.sin(road.rotation) * offset + Math.cos(road.rotation) * sideOffset;
        const tz = road.z + Math.cos(road.rotation) * offset - Math.sin(road.rotation) * sideOffset;
        
        // تجنب الأشجار داخل الترعة
        if (Math.abs(tz) > CONFIG.canalWidth / 2 + 8) {
          group.add(createTree(tx, tz, Utils.rand(0.85, 1.2)));
        }
      }
      
      // الجانب الثاني
      if (Math.random() > 0.3) {
        const sideOffset = -(road.width / 2 + CONFIG.sidewalkWidth + 2);
        const tx = road.x + Math.sin(road.rotation) * offset + Math.cos(road.rotation) * sideOffset;
        const tz = road.z + Math.cos(road.rotation) * offset - Math.sin(road.rotation) * sideOffset;
        
        if (Math.abs(tz) > CONFIG.canalWidth / 2 + 8) {
          group.add(createTree(tx, tz, Utils.rand(0.85, 1.2)));
        }
      }
    }
  });
  
  scene.add(group);
  return group;
}

/* ============================================================
   إنشاء أعمدة النور
   ============================================================ */
function createStreetLight(x, z, rotation = 0) {
  const light = new THREE.Group();
  
  // العمود
  const poleGeo = new THREE.CylinderGeometry(0.1, 0.12, 6);
  const pole = new THREE.Mesh(poleGeo, MATERIALS.streetLightPole);
  pole.position.y = 3;
  pole.castShadow = true;
  light.add(pole);
  
  // ذراع منحني
  const armGeo = new THREE.CylinderGeometry(0.06, 0.06, 1.2);
  const arm = new THREE.Mesh(armGeo, MATERIALS.streetLightPole);
  arm.rotation.z = Math.PI / 2;
  arm.position.set(0.6, 6, 0);
  arm.castShadow = true;
  light.add(arm);
  
  // اللمبة
  const lampGeo = new THREE.BoxGeometry(0.6, 0.15, 0.3);
  const lamp = new THREE.Mesh(lampGeo, MATERIALS.streetLightLamp);
  lamp.position.set(1.2, 5.95, 0);
  light.add(lamp);
  
  light.position.set(x, 0, z);
  light.rotation.y = rotation;
  return light;
}

function createStreetLights() {
  const group = new THREE.Group();
  group.name = 'streetLights';
  
  ROADS_DATA.forEach(road => {
    if (road.width < 14) return;
    
    const spacing = 50;
    const count = Math.floor(road.length / spacing);
    
    for (let i = 0; i < count; i++) {
      const offset = -road.length / 2 + i * spacing + spacing / 2;
      const sideOffset = road.width / 2 + CONFIG.sidewalkWidth - 0.5;
      
      // جانب واحد فقط عشان الأداء
      const side = i % 2 === 0 ? 1 : -1;
      
      const lx = road.x + Math.sin(road.rotation) * offset + Math.cos(road.rotation) * sideOffset * side;
      const lz = road.z + Math.cos(road.rotation) * offset - Math.sin(road.rotation) * sideOffset * side;
      
      if (Math.abs(lz) > CONFIG.canalWidth / 2 + 6) {
        group.add(createStreetLight(lx, lz, road.rotation + (side > 0 ? Math.PI : 0)));
      }
    }
  });
  
  scene.add(group);
  return group;
}

/* ============================================================
   توليد المباني السكنية والتجارية
   ============================================================ */
function createBuilding(x, z, width, depth, height, type = 'residential') {
  const group = new THREE.Group();
  
  // اختيار اللون
  let color;
  if (type === 'commercial') {
    color = Utils.pick([0xccb89a, 0xd4c4a8, 0xbca888]);
  } else {
    color = Utils.pick([
      COLORS.building1,
      COLORS.building2,
      COLORS.building3,
      0xb8a898,
      0xa89888,
    ]);
  }
  
  const wallMat = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.85,
    metalness: 0.05,
  });
  
  // جسم المبنى
  const boxGeo = new THREE.BoxGeometry(width, height, depth);
  const box = new THREE.Mesh(boxGeo, wallMat);
  box.position.y = height / 2;
  box.castShadow = true;
  box.receiveShadow = true;
  group.add(box);
  
  // السطح (بلون مختلف)
  const roofMat = new THREE.MeshStandardMaterial({
    color: 0x5a4a3a,
    roughness: 0.95,
  });
  const roofGeo = new THREE.BoxGeometry(width + 0.4, 0.3, depth + 0.4);
  const roof = new THREE.Mesh(roofGeo, roofMat);
  roof.position.y = height + 0.15;
  roof.castShadow = true;
  group.add(roof);
  
  // النوافذ (على الجدران الأربعة)
  const windowMat = new THREE.MeshStandardMaterial({
    color: 0x88ccff,
    emissive: 0x4477aa,
    emissiveIntensity: 0.4,
    roughness: 0.1,
    metalness: 0.5,
  });
  
  const windowFrameMat = new THREE.MeshStandardMaterial({
    color: 0x333333,
    roughness: 0.8,
  });
  
  const floors = Math.floor(height / 3);
  const windowsPerFloor = Math.floor(width / 2.5);
  
  // الجدران الأمامية والخلفية
  for (let face = -1; face <= 1; face += 2) {
    for (let floor = 0; floor < floors; floor++) {
      for (let w = 0; w < windowsPerFloor; w++) {
        // إطار النافذة
        const frameGeo = new THREE.BoxGeometry(1.2, 1.5, 0.15);
        const frame = new THREE.Mesh(frameGeo, windowFrameMat);
        frame.position.set(
          -width / 2 + 1.5 + w * 2.5,
          1.5 + floor * 3,
          (depth / 2) * face + 0.05 * face
        );
        group.add(frame);
        
        // الزجاج
        const glassGeo = new THREE.BoxGeometry(1, 1.3, 0.05);
        const glass = new THREE.Mesh(glassGeo, windowMat);
        glass.position.set(
          -width / 2 + 1.5 + w * 2.5,
          1.5 + floor * 3,
          (depth / 2) * face + 0.1 * face
        );
        group.add(glass);
      }
    }
  }
  
  // الجدران الجانبية
  const windowsPerSide = Math.floor(depth / 2.5);
  for (let face = -1; face <= 1; face += 2) {
    for (let floor = 0; floor < floors; floor++) {
      for (let w = 0; w < windowsPerSide; w++) {
        const frameGeo = new THREE.BoxGeometry(0.15, 1.5, 1.2);
        const frame = new THREE.Mesh(frameGeo, windowFrameMat);
        frame.position.set(
          (width / 2) * face + 0.05 * face,
          1.5 + floor * 3,
          -depth / 2 + 1.5 + w * 2.5
        );
        group.add(frame);
        
        const glassGeo = new THREE.BoxGeometry(0.05, 1.3, 1);
        const glass = new THREE.Mesh(glassGeo, windowMat);
        glass.position.set(
          (width / 2) * face + 0.1 * face,
          1.5 + floor * 3,
          -depth / 2 + 1.5 + w * 2.5
        );
        group.add(glass);
      }
    }
  }
  
  // باب المدخل (على الجانب الأمامي)
  const doorMat = new THREE.MeshStandardMaterial({
    color: 0x4a2a1a,
    roughness: 0.7,
  });
  const doorGeo = new THREE.BoxGeometry(1.4, 2.4, 0.15);
  const door = new THREE.Mesh(doorGeo, doorMat);
  door.position.set(0, 1.2, depth / 2 + 0.05);
  group.add(door);
  
  // لافتة تجارية (لو المبنى تجاري)
  if (type === 'commercial') {
    const signMat = new THREE.MeshStandardMaterial({
      color: Utils.pick([0xff5555, 0x55ff55, 0x5588ff, 0xffaa00, 0xff55ff]),
      emissive: 0x000000,
      emissiveIntensity: 0.3,
    });
    const signGeo = new THREE.BoxGeometry(width * 0.7, 0.8, 0.15);
    const sign = new THREE.Mesh(signGeo, signMat);
    sign.position.set(0, 2.8, depth / 2 + 0.2);
    group.add(sign);
  }
  
  group.position.set(x, 0, z);
  return group;
}

/* ============================================================
   توليد كل المباني (تجنب الشوارع والترعة)
   ============================================================ */
function isOnRoad(x, z, padding = 0) {
  for (const road of ROADS_DATA) {
    const halfW = road.width / 2 + CONFIG.sidewalkWidth + padding;
    const halfL = road.length / 2 + padding;
    
    // تحويل النقطة لنظام إحداثيات الشارع
    const dx = x - road.x;
    const dz = z - road.z;
    const cos = Math.cos(-road.rotation);
    const sin = Math.sin(-road.rotation);
    const localX = dx * cos - dz * sin;
    const localZ = dx * sin + dz * cos;
    
    // التحقق من التصادم
    if (Math.abs(localX) < halfW && Math.abs(localZ) < halfL) {
      return true;
    }
  }
  return false;
}

function isNearCanal(x, z, padding = 5) {
  return Math.abs(z) < CONFIG.canalWidth / 2 + padding;
}

function isNearRailway(x, z, padding = 8) {
  return Math.abs(x - (-350)) < 5 + padding;
}

function createBuildings() {
  const group = new THREE.Group();
  group.name = 'buildings';
  
  const gridSize = 50;
  const halfCity = CONFIG.citySize / 2;
  
  for (let gx = -halfCity; gx < halfCity; gx += gridSize) {
    for (let gz = -halfCity; gz < halfCity; gz += gridSize) {
      const x = gx + gridSize / 2;
      const z = gz + gridSize / 2;
      
      // تخطي الشوارع
      if (isOnRoad(x, z, 5)) continue;
      
      // تخطي الترعة
      if (isNearCanal(x, z, 10)) continue;
      
      // تخطي السكة الحديد
      if (isNearRailway(x, z, 12)) continue;
      
      // تخطي منطقة الجسر
      if (Math.abs(x) < 20 && Math.abs(z) < 25) continue;
      
      // نسبة توليد المبنى
      if (Math.random() > 0.75) continue;
      
      // أبعاد عشوائية
      const width = Utils.rand(12, 22);
      const depth = Utils.rand(12, 22);
      
      // ارتفاع حسب النوع
      const rand = Math.random();
      let height, type;
      
      if (rand < 0.6) {
        // سكني
        height = Utils.rand(6, 14);
        type = 'residential';
      } else if (rand < 0.9) {
        // سكني عالي
        height = Utils.rand(14, 24);
        type = 'residential';
      } else {
        // تجاري
        height = Utils.rand(4, 8);
        type = 'commercial';
      }
      
      const building = createBuilding(x, z, width, depth, height, type);
      group.add(building);
    }
  }
  
  scene.add(group);
  return group;
}

/* ============================================================
   موجات الترعة المتحركة
   ============================================================ */
let canalRef = null;

function animateCanal(time) {
  if (!canalRef || !canalRef.userData.water) return;
  
  const water = canalRef.userData.water;
  const basePositions = canalRef.userData.waterBasePositions;
  const pos = water.geometry.attributes.position;
  const t = time * 0.0008;
  
  for (let i = 0; i < pos.count; i++) {
    const baseX = basePositions[i * 3];
    const baseY = basePositions[i * 3 + 1];
    
    // موجات متعددة الطبقات
    const wave1 = Math.sin(baseX * 0.05 + t) * 0.25;
    const wave2 = Math.cos(baseY * 0.1 + t * 1.3) * 0.15;
    const wave3 = Math.sin((baseX + baseY) * 0.03 + t * 0.7) * 0.2;
    
    pos.setZ(i, wave1 + wave2 + wave3);
  }
  
  pos.needsUpdate = true;
  water.geometry.computeVertexNormals();
}

/* ============================================================
   دالة بناء المدينة الرئيسية
   ============================================================ */
async function buildCity(onProgress) {
  const steps = [
    { name: 'إنشاء الأرضية...', fn: createGround, weight: 5 },
    { name: 'بناء ترعة المحمودية...', fn: () => {
      canalRef = createCanal();
      return canalRef;
    }, weight: 15 },
    { name: 'رصف الشوارع...', fn: createRoads, weight: 20 },
    { name: 'مد خط السكة الحديد...', fn: createRailway, weight: 10 },
    { name: 'زراعة النخيل والأشجار...', fn: createFoliage, weight: 15 },
    { name: 'ترك أعمدة النور...', fn: createStreetLights, weight: 10 },
    { name: 'بناء المنازل والمحلات...', fn: createBuildings, weight: 25 },
  ];
  
  let accumulated = 0;
  const totalWeight = steps.reduce((sum, s) => sum + s.weight, 0);
  
  for (const step of steps) {
    if (onProgress) onProgress(
      Math.round((accumulated / totalWeight) * 100),
      step.name
    );
    
    // نستخدم requestAnimationFrame عشان نسمح للـ UI بالتحديث
    await new Promise(resolve => {
      requestAnimationFrame(() => {
        try {
          step.fn();
        } catch (e) {
          console.error('خطأ في', step.name, e);
        }
        resolve();
      });
    });
    
    accumulated += step.weight;
  }
  
  if (onProgress) onProgress(100, 'جاهز للانطلاق! 🚀');
}

/* ============================================================
   تصدير للاستخدام في الأجزاء التالية
   ============================================================ */
export {
  CONFIG,
  COLORS,
  scene,
  camera,
  renderer,
  sunLight,
  ambientLight,
  hemiLight,
  UI,
  Utils,
  MATERIALS,
  ROADS_DATA,
  isMobile,
  buildCity,
  animateCanal,
  createTree,
  createPalm,
  createStreetLight,
};

/* ============================================================
   التعامل مع تغيير حجم الشاشة
   ============================================================ */
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

/* ============================================================
   التعامل مع اتجاه الشاشة
   ============================================================ */
window.addEventListener('orientationchange', () => {
  setTimeout(() => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }, 200);
});

console.log('✅ الجزء 1 جاهز - المدينة والأدوات');
/* ============================================================
   🛺 الجزء 2: التوك توك + نظام القيادة
   ============================================================ */

/* ============================================================
   إنشاء موديل التوك توك ثلاثي الأبعاد
   ============================================================ */
function createTukTuk() {
  const tukTuk = new THREE.Group();
  tukTuk.name = 'tukTuk';

  // ============ المواد الخاصة ============
  const yellowBody = new THREE.MeshStandardMaterial({
    color: 0xffc800,
    roughness: 0.35,
    metalness: 0.35,
  });

  const yellowDark = new THREE.MeshStandardMaterial({
    color: 0xe6a800,
    roughness: 0.4,
    metalness: 0.3,
  });

  const blackPart = new THREE.MeshStandardMaterial({
    color: 0x0a0a0a,
    roughness: 0.85,
    metalness: 0.1,
  });

  const rubberMat = new THREE.MeshStandardMaterial({
    color: 0x1a1a1a,
    roughness: 0.95,
    metalness: 0.0,
  });

  const rimMat = new THREE.MeshStandardMaterial({
    color: 0xdddddd,
    roughness: 0.2,
    metalness: 0.95,
  });

  const chromeMat = new THREE.MeshStandardMaterial({
    color: 0xcccccc,
    roughness: 0.15,
    metalness: 0.98,
  });

  const headlightMat = new THREE.MeshStandardMaterial({
    color: 0xffffcc,
    emissive: 0xffee88,
    emissiveIntensity: 1.2,
    roughness: 0.2,
    metalness: 0.1,
  });

  const taillightMat = new THREE.MeshStandardMaterial({
    color: 0xff2222,
    emissive: 0xcc0000,
    emissiveIntensity: 0.8,
    roughness: 0.4,
  });

  const seatMat = new THREE.MeshStandardMaterial({
    color: 0x2a2a2a,
    roughness: 0.95,
  });

  const dashMat = new THREE.MeshStandardMaterial({
    color: 0x151515,
    roughness: 0.9,
  });

  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xaaddff,
    roughness: 0.02,
    metalness: 0.05,
    transmission: 0.92,
    transparent: true,
    opacity: 0.45,
    thickness: 0.05,
    ior: 1.5,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
  });

  // ============ الهيكل السفلي (Chassis) ============
  const chassisGeo = new THREE.BoxGeometry(1.35, 0.12, 2.5);
  const chassis = new THREE.Mesh(chassisGeo, blackPart);
  chassis.position.y = 0.42;
  chassis.castShadow = true;
  chassis.receiveShadow = true;
  tukTuk.add(chassis);

  // أرضية المقصورة الأمامية
  const floorFrontGeo = new THREE.BoxGeometry(1.3, 0.08, 1.1);
  const floorFront = new THREE.Mesh(floorFrontGeo, blackPart);
  floorFront.position.set(0, 0.52, 0.7);
  floorFront.castShadow = true;
  floorFront.receiveShadow = true;
  tukTuk.add(floorFront);

  // أرضية المقصورة الخلفية
  const floorRearGeo = new THREE.BoxGeometry(1.3, 0.08, 1.4);
  const floorRear = new THREE.Mesh(floorRearGeo, blackPart);
  floorRear.position.set(0, 0.52, -0.65);
  floorRear.castShadow = true;
  floorRear.receiveShadow = true;
  tukTuk.add(floorRear);

  // ============ الجزء الأمامي (المقدمة) ============
  // الوجه الأمامي
  const frontPanelGeo = new THREE.BoxGeometry(1.32, 0.85, 0.15);
  const frontPanel = new THREE.Mesh(frontPanelGeo, yellowBody);
  frontPanel.position.set(0, 0.98, 1.28);
  frontPanel.castShadow = true;
  frontPanel.receiveShadow = true;
  tukTuk.add(frontPanel);

  // الغطاء الأمامي
  const hoodGeo = new THREE.BoxGeometry(1.32, 0.08, 0.5);
  const hood = new THREE.Mesh(hoodGeo, yellowDark);
  hood.position.set(0, 1.42, 1.05);
  hood.rotation.x = -0.08;
  hood.castShadow = true;
  tukTuk.add(hood);

  // الرفرف الأمامي (Fender)
  const fenderGeo = new THREE.BoxGeometry(0.5, 0.25, 1.15);
  const fender = new THREE.Mesh(fenderGeo, yellowBody);
  fender.position.set(0, 0.72, 1.15);
  fender.castShadow = true;
  tukTuk.add(fender);

  // ============ المقصورة الأمامية (السائق) ============
  const frontCabinGeo = new THREE.BoxGeometry(1.35, 0.95, 1.1);
  const frontCabin = new THREE.Mesh(frontCabinGeo, yellowBody);
  frontCabin.position.set(0, 1.0, 0.7);
  frontCabin.castShadow = true;
  frontCabin.receiveShadow = true;
  tukTuk.add(frontCabin);

  // ============ المقصورة الخلفية (الركاب) ============
  const rearCabinGeo = new THREE.BoxGeometry(1.4, 1.55, 1.5);
  const rearCabin = new THREE.Mesh(rearCabinGeo, yellowBody);
  rearCabin.position.set(0, 1.28, -0.65);
  rearCabin.castShadow = true;
  rearCabin.receiveShadow = true;
  tukTuk.add(rearCabin);

  // خط أسود فاصل
  const stripeGeo = new THREE.BoxGeometry(1.42, 0.08, 1.52);
  const stripeL = new THREE.Mesh(stripeGeo, blackPart);
  stripeL.position.set(0, 1.35, -0.65);
  tukTuk.add(stripeL);

  // ============ السقف ============
  const roofGeo = new THREE.BoxGeometry(1.5, 0.12, 2.7);
  const roof = new THREE.Mesh(roofGeo, blackPart);
  roof.position.set(0, 2.15, 0);
  roof.castShadow = true;
  tukTuk.add(roof);

  // حافة السقف (Chrome trim)
  const roofTrimGeo = new THREE.BoxGeometry(1.52, 0.04, 2.72);
  const roofTrim = new THREE.Mesh(roofTrimGeo, chromeMat);
  roofTrim.position.set(0, 2.09, 0);
  tukTuk.add(roofTrim);

  // ============ أعمدة السقف (6 أعمدة) ============
  const pillarGeo = new THREE.CylinderGeometry(0.05, 0.05, 1.85, 8);
  const pillarPositions = [
    [-0.68, 1.25, -1.35],
    [0.68, 1.25, -1.35],
    [-0.68, 1.25, -0.1],
    [0.68, 1.25, -0.1],
    [-0.68, 1.25, 1.15],
    [0.68, 1.25, 1.15],
  ];
  pillarPositions.forEach(pos => {
    const pillar = new THREE.Mesh(pillarGeo, blackPart);
    pillar.position.set(pos[0], pos[1], pos[2]);
    pillar.castShadow = true;
    tukTuk.add(pillar);
  });

  // ============ الزجاج ============
  // الزجاج الأمامي (Windshield)
  const windshieldGeo = new THREE.BoxGeometry(1.28, 0.9, 0.04);
  const windshield = new THREE.Mesh(windshieldGeo, glassMat);
  windshield.position.set(0, 1.88, 1.28);
  windshield.rotation.x = -0.1;
  tukTuk.add(windshield);

  // زجاج المقصورة الأمامية (يمين وشمال)
  const sideGlassGeo = new THREE.BoxGeometry(0.04, 0.85, 1.0);
  const sideGlassL = new THREE.Mesh(sideGlassGeo, glassMat);
  sideGlassL.position.set(-0.69, 1.85, 0.7);
  tukTuk.add(sideGlassL);

  const sideGlassR = new THREE.Mesh(sideGlassGeo, glassMat);
  sideGlassR.position.set(0.69, 1.85, 0.7);
  tukTuk.add(sideGlassR);

  // زجاج المقصورة الخلفية
  const rearGlassSideGeo = new THREE.BoxGeometry(0.04, 1.0, 1.35);
  const rearGlassL = new THREE.Mesh(rearGlassSideGeo, glassMat);
  rearGlassL.position.set(-0.71, 1.75, -0.65);
  tukTuk.add(rearGlassL);

  const rearGlassR = new THREE.Mesh(rearGlassSideGeo, glassMat);
  rearGlassR.position.set(0.71, 1.75, -0.65);
  tukTuk.add(rearGlassR);

  // الزجاج الخلفي
  const rearWindowGeo = new THREE.BoxGeometry(1.35, 1.05, 0.04);
  const rearWindow = new THREE.Mesh(rearWindowGeo, glassMat);
  rearWindow.position.set(0, 1.75, -1.41);
  tukTuk.add(rearWindow);

  // ============ الشبكة الأمامية ============
  const grillFrameGeo = new THREE.BoxGeometry(0.9, 0.35, 0.06);
  const grillFrame = new THREE.Mesh(grillFrameGeo, chromeMat);
  grillFrame.position.set(0, 1.0, 1.37);
  tukTuk.add(grillFrame);

  // شرائح الشبكة
  for (let i = 0; i < 5; i++) {
    const slatGeo = new THREE.BoxGeometry(0.85, 0.04, 0.04);
    const slat = new THREE.Mesh(slatGeo, blackPart);
    slat.position.set(0, 0.88 + i * 0.06, 1.4);
    tukTuk.add(slat);
  }

  // ============ المصابيح الأمامية ============
  const headlightGeo = new THREE.CylinderGeometry(0.13, 0.13, 0.1, 20);
  
  const hl1 = new THREE.Mesh(headlightGeo, chromeMat);
  hl1.rotation.x = Math.PI / 2;
  hl1.position.set(-0.48, 1.2, 1.35);
  hl1.castShadow = true;
  tukTuk.add(hl1);

  const hl1Glass = new THREE.Mesh(headlightGeo, headlightMat);
  hl1Glass.rotation.x = Math.PI / 2;
  hl1Glass.position.set(-0.48, 1.2, 1.38);
  tukTuk.add(hl1Glass);

  const hl2 = new THREE.Mesh(headlightGeo, chromeMat);
  hl2.rotation.x = Math.PI / 2;
  hl2.position.set(0.48, 1.2, 1.35);
  hl2.castShadow = true;
  tukTuk.add(hl2);

  const hl2Glass = new THREE.Mesh(headlightGeo, headlightMat);
  hl2Glass.rotation.x = Math.PI / 2;
  hl2Glass.position.set(0.48, 1.2, 1.38);
  tukTuk.add(hl2Glass);

  // ============ الفوانيس الخلفية ============
  const taillightGeo = new THREE.BoxGeometry(0.14, 0.22, 0.06);
  
  const tl1 = new THREE.Mesh(taillightGeo, taillightMat);
  tl1.position.set(-0.52, 0.95, -1.42);
  tukTuk.add(tl1);

  const tl2 = new THREE.Mesh(taillightGeo, taillightMat);
  tl2.position.set(0.52, 0.95, -1.42);
  tukTuk.add(tl2);

  // ============ لوحة الأرقام ============
  const plateGeo = new THREE.BoxGeometry(0.55, 0.16, 0.03);
  const plateMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.5,
    metalness: 0.1,
  });
  const plate = new THREE.Mesh(plateGeo, plateMat);
  plate.position.set(0, 0.68, -1.43);
  tukTuk.add(plate);

  // لوحة أمامية
  const frontPlate = new THREE.Mesh(plateGeo, plateMat);
  frontPlate.position.set(0, 0.68, 1.42);
  frontPlate.rotation.y = Math.PI;
  tukTuk.add(frontPlate);

  // ============ الزخارف ============
  // خطوط كروم على الجانبين
  const trimGeo = new THREE.BoxGeometry(0.02, 0.06, 2.3);
  const trimL = new THREE.Mesh(trimGeo, chromeMat);
  trimL.position.set(-0.71, 1.5, -0.1);
  tukTuk.add(trimL);

  const trimR = new THREE.Mesh(trimGeo, chromeMat);
  trimR.position.set(0.71, 1.5, -0.1);
  tukTuk.add(trimR);

  // ============ المقود ============
  const steeringGroup = new THREE.Group();
  
  // حلقة المقود
  const steeringRingGeo = new THREE.TorusGeometry(0.16, 0.022, 8, 24);
  const steeringRing = new THREE.Mesh(steeringRingGeo, blackPart);
  steeringRing.castShadow = true;
  steeringGroup.add(steeringRing);

  // 3 أذرع
  for (let i = 0; i < 3; i++) {
    const spokeGeo = new THREE.BoxGeometry(0.025, 0.15, 0.02);
    const spoke = new THREE.Mesh(spokeGeo, blackPart);
    spoke.rotation.z = (i / 3) * Math.PI * 2;
    steeringGroup.add(spoke);
  }

  // المركز
  const hubGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.04);
  const hub = new THREE.Mesh(hubGeo, blackPart);
  hub.rotation.x = Math.PI / 2;
  steeringGroup.add(hub);

  // عمود المقود
  const columnGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.35);
  const column = new THREE.Mesh(columnGeo, blackPart);
  column.rotation.x = -0.55;
  column.position.set(0, -0.14, 0.12);
  steeringGroup.add(column);

  steeringGroup.position.set(0, 1.55, 0.9);
  steeringGroup.rotation.x = -0.35;
  tukTuk.add(steeringGroup);

  // ============ لوحة القيادة ============
  const dashGeo = new THREE.BoxGeometry(1.25, 0.22, 0.35);
  const dashboard = new THREE.Mesh(dashGeo, dashMat);
  dashboard.position.set(0, 1.32, 1.08);
  dashboard.castShadow = true;
  tukTuk.add(dashboard);

  // العدادات
  const gaugeMat = new THREE.MeshStandardMaterial({
    color: 0x111111,
    roughness: 0.3,
    metalness: 0.5,
  });
  const gaugeGeo = new THREE.CircleGeometry(0.07, 20);
  for (let i = 0; i < 3; i++) {
    const gauge = new THREE.Mesh(gaugeGeo, gaugeMat);
    gauge.position.set(-0.35 + i * 0.35, 1.36, 1.26);
    tukTuk.add(gauge);
  }

  // ============ المرايا الجانبية ============
  const mirrorCaseMat = new THREE.MeshStandardMaterial({
    color: 0x333333,
    roughness: 0.6,
    metalness: 0.4,
  });
  const mirrorGlassMat = new THREE.MeshStandardMaterial({
    color: 0xaaccdd,
    roughness: 0.05,
    metalness: 0.95,
  });

  // المرآة اليمنى
  const mirrorRGroup = new THREE.Group();
  const mirrorStemR = new THREE.Mesh(
    new THREE.CylinderGeometry(0.015, 0.015, 0.25),
    blackPart
  );
  mirrorStemR.rotation.z = Math.PI / 3;
  mirrorStemR.position.set(-0.1, 0.05, 0);
  mirrorRGroup.add(mirrorStemR);
  
  const mirrorCaseR = new THREE.Mesh(
    new THREE.BoxGeometry(0.14, 0.1, 0.03),
    mirrorCaseMat
  );
  mirrorCaseR.position.set(-0.2, 0.15, 0);
  mirrorRGroup.add(mirrorCaseR);
  
  const mirrorGlassR = new THREE.Mesh(
    new THREE.BoxGeometry(0.11, 0.08, 0.01),
    mirrorGlassMat
  );
  mirrorGlassR.position.set(-0.2, 0.15, 0.02);
  mirrorRGroup.add(mirrorGlassR);
  
  mirrorRGroup.position.set(0.7, 1.9, 1.15);
  tukTuk.add(mirrorRGroup);

  // المرآة اليسرى
  const mirrorLGroup = mirrorRGroup.clone();
  mirrorLGroup.position.set(-0.7, 1.9, 1.15);
  mirrorLGroup.scale.x = -1;
  tukTuk.add(mirrorLGroup);

  // ============ المقاعد ============
  // مقعد السائق
  const seatDriverGeo = new THREE.BoxGeometry(0.55, 0.12, 0.5);
  const seatDriver = new THREE.Mesh(seatDriverGeo, seatMat);
  seatDriver.position.set(0, 0.8, 0.4);
  seatDriver.castShadow = true;
  tukTuk.add(seatDriver);

  // مسند ظهر السائق
  const backDriverGeo = new THREE.BoxGeometry(0.55, 0.55, 0.08);
  const backDriver = new THREE.Mesh(backDriverGeo, seatMat);
  backDriver.position.set(0, 1.12, 0.16);
  backDriver.castShadow = true;
  tukTuk.add(backDriver);

  // المقعد الخلفي (عريض)
  const rearSeatGeo = new THREE.BoxGeometry(1.25, 0.12, 0.55);
  const rearSeat = new THREE.Mesh(rearSeatGeo, seatMat);
  rearSeat.position.set(0, 0.8, -0.75);
  rearSeat.castShadow = true;
  tukTuk.add(rearSeat);

  // مسند ظهر المقعد الخلفي
  const rearBackGeo = new THREE.BoxGeometry(1.25, 0.65, 0.08);
  const rearBack = new THREE.Mesh(rearBackGeo, seatMat);
  rearBack.position.set(0, 1.18, -1.05);
  rearBack.castShadow = true;
  tukTuk.add(rearBack);

  // ============ العجلات ============
  const wheels = [];
  
  function createWheel(x, z, isFront) {
    const wheelGroup = new THREE.Group();
    wheelGroup.userData.isFront = isFront;

    // الإطار (Torus)
    const tireGeo = new THREE.TorusGeometry(0.26, 0.11, 12, 24);
    const tire = new THREE.Mesh(tireGeo, rubberMat);
    tire.rotation.y = Math.PI / 2;
    tire.castShadow = true;
    tire.receiveShadow = true;
    wheelGroup.add(tire);

    // الجنط
    const rimGeo = new THREE.CylinderGeometry(0.17, 0.17, 0.13, 12);
    const rim = new THREE.Mesh(rimGeo, rimMat);
    rim.rotation.z = Math.PI / 2;
    rim.castShadow = true;
    wheelGroup.add(rim);

    // براغي الجنط
    const boltGeo = new THREE.SphereGeometry(0.025, 6, 6);
    for (let i = 0; i < 5; i++) {
      const bolt = new THREE.Mesh(boltGeo, blackPart);
      const angle = (i / 5) * Math.PI * 2;
      bolt.position.set(0, Math.cos(angle) * 0.08, Math.sin(angle) * 0.08);
      bolt.castShadow = true;
      wheelGroup.add(bolt);
    }

    // مركز الجنط
    const centerCap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 0.15, 12),
      chromeMat
    );
    centerCap.rotation.z = Math.PI / 2;
    wheelGroup.add(centerCap);

    wheelGroup.position.set(x, 0.26, z);
    tukTuk.add(wheelGroup);
    wheels.push(wheelGroup);

    return wheelGroup;
  }

  // العجلة الأمامية الواحدة
  const frontWheel = createWheel(0, 1.25, true);
  
  // العجلتان الخلفيتان
  const rearLeftWheel = createWheel(-0.68, -0.85, false);
  const rearRightWheel = createWheel(0.68, -0.85, false);

  // ============ الإضاءة الفعلية للمصابيح ============
  const headlight = new THREE.SpotLight(
    0xfff5cc,    // اللون
    4,           // الشدة
    35,          // المدى
    Math.PI / 5, // زاوية المخروط
    0.4,         // Penumbra
    1.5          // Decay
  );
  headlight.position.set(0, 1.2, 1.3);
  headlight.target.position.set(0, 0.3, 15);
  headlight.castShadow = false;
  tukTuk.add(headlight);
  tukTuk.add(headlight.target);

  // ============ تخزين المراجع ============
  tukTuk.userData = {
    wheels,
    frontWheel,
    rearLeftWheel,
    rearRightWheel,
    steeringWheel: steeringGroup,
    headlight,
  };

  // حجم التوك توك الفعلي
  tukTuk.scale.set(1, 1, 1);

  return tukTuk;
}

/* ============================================================
   إنشاء التوك توك وإضافته للمشهد
   ============================================================ */
const tukTuk = createTukTuk();
tukTuk.position.set(0, 0, 200);
tukTuk.rotation.y = 0;
scene.add(tukTuk);

/* ============================================================
   حالة اللاعب / السائق
   ============================================================ */
const player = {
  // فيزياء التوك توك
  speed: 0,                 // السرعة الحالية (م/ث)
  maxSpeed: CONFIG.maxSpeed,
  maxReverseSpeed: CONFIG.maxReverseSpeed,
  acceleration: CONFIG.acceleration,
  braking: CONFIG.braking,
  friction: CONFIG.friction,
  
  // المقود
  steering: 0,              // -1 إلى 1
  currentWheelAngle: 0,
  
  // حالة
  isLocked: false,
  engineOn: true,
  handbrake: false,
  
  // كاميرا
  headYaw: 0,
  headPitch: 0,
  
  // حالة إضافية
  isOnWetRoad: false,
  driftAmount: 0,
};

/* ============================================================
   إعدادات الكاميرا داخل الكابينة
   ============================================================ */
const CAMERA_OFFSET = new THREE.Vector3(
  0,      // x
  1.55,   // y - ارتفاع نظر السائق
  0.15    // z - للأمام شوي
);

/* ============================================================
   المدخلات - لوحة المفاتيح
   ============================================================ */
const keys = {};

window.addEventListener('keydown', (e) => {
  keys[e.code] = true;
  
  // منع السلوك الافتراضي
  if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.code)) {
    e.preventDefault();
  }
  
  // فرملة اليد
  if (e.code === 'Space') {
    player.handbrake = true;
  }
  
  // تشغيل/إطفاء المحرك
  if (e.code === 'KeyE') {
    player.engineOn = !player.engineOn;
    if (typeof AudioSystem !== 'undefined') {
      AudioSystem.setEngine(player.engineOn);
    }
    UI.showToast(player.engineOn ? '🔊 المحرك شغّال' : '🔇 المحرك مطفأ', 1000);
  }
  
  // إعادة تعيين الكاميرا
  if (e.code === 'KeyR') {
    player.headYaw = 0;
    player.headPitch = 0;
  }
});

window.addEventListener('keyup', (e) => {
  keys[e.code] = false;
  
  if (e.code === 'Space') {
    player.handbrake = false;
  }
});

/* ============================================================
   المدخلات - الماوس (دوران الرأس على الكمبيوتر)
   ============================================================ */
let isPointerLocked = false;

function setupPointerLock() {
  if (isMobile) return; // الموبايل يستخدم أزرار لمس
  
  document.addEventListener('pointerlockchange', () => {
    isPointerLocked = document.pointerLockElement === renderer.domElement;
    player.isLocked = isPointerLocked;
  });
  
  document.addEventListener('mousemove', (e) => {
    if (!isPointerLocked) return;
    
    player.headYaw -= e.movementX * 0.002;
    player.headPitch -= e.movementY * 0.002;
    
    // حدود دوران الرأس
    player.headYaw = Utils.clamp(player.headYaw, -Math.PI * 0.75, Math.PI * 0.75);
    player.headPitch = Utils.clamp(player.headPitch, -0.55, 0.45);
  });
}

/* ============================================================
   فيزياء التوك توك - نظام القيادة الكامل
   ============================================================ */
function updateTukTukPhysics(dt) {
  // تجاهل لو اللعبة مش شغالة
  if (!player.isLocked && !isMobile) return;
  if (!gameState || !gameState.running) return;

  const mobileInput = getMobileInput();

  // ============ 1. التسارع والفرملة ============
  const throttle = (keys['KeyW'] || keys['ArrowUp'] || mobileInput.accel) ? 1 : 0;
  const brake = (keys['KeyS'] || keys['ArrowDown'] || mobileInput.brake) ? 1 : 0;

  if (!player.engineOn) {
    // المحرك مطفي - تباطؤ سريع
    player.speed *= (1 - 3 * dt);
    if (Math.abs(player.speed) < 0.1) player.speed = 0;
  } else if (player.handbrake) {
    // فرملة اليد
    player.speed *= (1 - 10 * dt);
    if (Math.abs(player.speed) < 0.1) player.speed = 0;
  } else {
    if (throttle && !brake) {
      // تسارع
      const currentAccel = player.acceleration * (1 - Math.abs(player.speed) / player.maxSpeed * 0.4);
      player.speed += currentAccel * dt;
    } else if (brake && !throttle) {
      // فرملة أو رجوع
      if (player.speed > 0.5) {
        player.speed -= player.braking * dt;
      } else {
        player.speed -= player.acceleration * 0.6 * dt;
      }
    } else {
      // احتكاك طبيعي
      if (player.speed > 0) {
        player.speed -= player.friction * dt * 4;
        if (player.speed < 0.05) player.speed = 0;
      } else if (player.speed < 0) {
        player.speed += player.friction * dt * 4;
        if (player.speed > -0.05) player.speed = 0;
      }
    }
    
    // حدود السرعة
    player.speed = Utils.clamp(player.speed, -player.maxReverseSpeed, player.maxSpeed);
  }

  // ============ 2. التحكم في المقود ============
  const leftInput = (keys['KeyA'] || keys['ArrowLeft'] || mobileInput.left) ? 1 : 0;
  const rightInput = (keys['KeyD'] || keys['ArrowRight'] || mobileInput.right) ? 1 : 0;
  const steerInput = rightInput - leftInput;

  // المقود بيتحرك بنعومة
  const steerTargetSpeed = CONFIG.steeringSpeed;
  const steerDiff = steerInput - player.steering;
  const steerStep = Math.sign(steerDiff) * Math.min(Math.abs(steerDiff), steerTargetSpeed * dt);
  player.steering += steerStep;
  player.steering = Utils.clamp(player.steering, -1, 1);

  // إذا مفيش ضغط، المقود يرجع للمنتصف تدريجياً
  if (steerInput === 0) {
    player.steering *= (1 - 2 * dt);
  }

  // زاوية العجلة الأمامية
  const speedRatio = Math.min(Math.abs(player.speed) / player.maxSpeed, 1);
  const maxAngle = CONFIG.maxWheelAngle * (1 - speedRatio * 0.55);
  player.currentWheelAngle = player.steering * maxAngle;

  // ============ 3. دوران التوك توك ============
  if (Math.abs(player.speed) > 0.1) {
    const speedFactor = Math.min(Math.abs(player.speed) / 8, 1.2);
    const direction = player.speed >= 0 ? 1 : -1;
    const turnRate = player.currentWheelAngle * speedFactor * dt * 3.2 * direction;
    tukTuk.rotation.y -= turnRate;
  }

  // ============ 4. تحديث الموقع مع التصادم ============
  const forward = new THREE.Vector3(
    Math.sin(tukTuk.rotation.y),
    0,
    Math.cos(tukTuk.rotation.y)
  );

  const velocity = forward.clone().multiplyScalar(player.speed * dt);
  const newPos = tukTuk.position.clone().add(velocity);

  // التصادم مع الترعة
  const inCanalX = !(newPos.x > -15 && newPos.x < 15); // عبر الجسر في المنتصف
  const nearCanal = Math.abs(newPos.z) < CONFIG.canalWidth / 2 + 1.5;
  
  if (nearCanal && inCanalX) {
    // اصطدام بالترعة
    player.speed *= -0.25;
    // اهتزاز بسيط
    tukTuk.position.y = 0.08;
  } else if (Math.abs(newPos.x) < CONFIG.citySize / 2 - 5 && 
             Math.abs(newPos.z) < CONFIG.citySize / 2 - 5) {
    tukTuk.position.copy(newPos);
  } else {
    // حدود المدينة
    player.speed *= -0.3;
  }

  // ============ 5. تحديث العجلات ============
  const wheelRollSpeed = (player.speed * dt) / 0.28;
  tukTuk.userData.wheels.forEach(wheel => {
    const tire = wheel.children[0];
    if (tire) {
      tire.rotation.x += wheelRollSpeed;
    }
    if (wheel.children[1]) {
      wheel.children[1].rotation.x += wheelRollSpeed;
    }
    
    // العجلة الأمامية بتلف مع المقود
    if (wheel.userData.isFront) {
      wheel.rotation.y = player.currentWheelAngle;
    }
  });

  // ============ 6. تحديث المقود ============
  tukTuk.userData.steeringWheel.rotation.z = -player.steering * Math.PI * 0.85;

  // ============ 7. الاهتزاز والإمالة ============
  // اهتزاز المحرك
  let engineShake = 0;
  if (player.engineOn) {
    engineShake = Math.sin(performance.now() * 0.015) * 0.008 * (1 + speedRatio);
  }
  tukTuk.position.y = Math.max(0, engineShake);
  
  // إمالة عند الدوران
  const targetRoll = -player.steering * 0.06 * speedRatio;
  tukTuk.rotation.z += (targetRoll - tukTuk.rotation.z) * 6 * dt;
  
  // إمالة أمامية/خلفية عند التسارع/الفرملة
  const targetPitch = (throttle - brake) * -0.015;
  tukTuk.rotation.x += (targetPitch - tukTuk.rotation.x) * 6 * dt;

  // ============ 8. انزلاق العجلات ============
  if (Math.abs(player.steering) > 0.7 && Math.abs(player.speed) > 10) {
    player.driftAmount = Math.min(player.driftAmount + dt * 2, 1);
  } else {
    player.driftAmount = Math.max(player.driftAmount - dt * 3, 0);
  }
}

/* ============================================================
   تحديث الكاميرا داخل الكابينة
   ============================================================ */
function updateCamera(dt) {
  // حساب موقع الكاميرا بناءً على موضع التوك توك
  const offset = CAMERA_OFFSET.clone();
  offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), tukTuk.rotation.y);
  
  const targetPos = tukTuk.position.clone().add(offset);
  targetPos.y += tukTuk.position.y;
  
  // ناعم الحركة
  camera.position.lerp(targetPos, 1 - Math.pow(0.001, dt));
  
  // اتجاه النظر
  const baseYaw = tukTuk.rotation.y + Math.PI;
  const totalYaw = baseYaw + player.headYaw;
  const totalPitch = player.headPitch;
  
  const lookDir = new THREE.Vector3(
    Math.sin(totalYaw) * Math.cos(totalPitch),
    Math.sin(totalPitch),
    Math.cos(totalYaw) * Math.cos(totalPitch)
  );
  
  const lookTarget = camera.position.clone().add(lookDir);
  camera.lookAt(lookTarget);
  
  // إمالة الكاميرا عند الدوران
  camera.rotation.z = -player.steering * 0.025 * speedRatio();
  
  // اهتزاز الكاميرا مع المحرك
  if (player.engineOn) {
    const shake = 0.003 * (1 + speedRatio());
    camera.position.x += Math.sin(performance.now() * 0.02) * shake;
    camera.position.y += Math.cos(performance.now() * 0.025) * shake;
  }
}

function speedRatio() {
  return Math.min(Math.abs(player.speed) / player.maxSpeed, 1);
}

/* ============================================================
   تعليمات شاشة الموبايل
   ============================================================ */
const mobileInput = {
  accel: false,
  brake: false,
  left: false,
  right: false,
  handbrake: false,
};

function getMobileInput() {
  return mobileInput;
}

/* ============================================================
   إدارة أزرار اللمس
   ============================================================ */
function setupMobileButtons() {
  const buttons = {
    btnAccel: 'accel',
    btnBrake: 'brake',
    btnSteerLeft: 'left',
    btnSteerRight: 'right',
    btnHandbrake: 'handbrake',
  };
  
  Object.entries(buttons).forEach(([id, key]) => {
    const el = document.getElementById(id);
    if (!el) return;
    
    const press = (e) => {
      e.preventDefault();
      e.stopPropagation();
      mobileInput[key] = true;
      el.classList.add('pressed');
      
      if (key === 'handbrake') {
        player.handbrake = true;
      }
    };
    
    const release = (e) => {
      e.preventDefault();
      e.stopPropagation();
      mobileInput[key] = false;
      el.classList.remove('pressed');
      
      if (key === 'handbrake') {
        player.handbrake = false;
      }
    };
    
    el.addEventListener('touchstart', press, { passive: false });
    el.addEventListener('touchend', release, { passive: false });
    el.addEventListener('touchcancel', release, { passive: false });
    el.addEventListener('mousedown', press);
    el.addEventListener('mouseup', release);
    el.addEventListener('mouseleave', release);
  });
}

/* ============================================================
   المزامنة مع حالة اللعبة (يتم تعريفها في الجزء 3)
   ============================================================ */
let gameState = null;

function setGameState(gs) {
  gameState = gs;
}

/* ============================================================
   متغير توافقي (يتم استبداله في الجزء 3)
   ============================================================ */
const AudioSystem = {
  setEngine: () => {},
};

/* ============================================================
   تصدير للجزء الثالث
   ============================================================ */
export {
  tukTuk,
  player,
  keys,
  mobileInput,
  updateTukTukPhysics,
  updateCamera,
  setupMobileButtons,
  setupPointerLock,
  setGameState,
};

console.log('✅ الجزء 2 جاهز - التوك توك ونظام القيادة');
/* ============================================================
   🛺 الجزء 3: الركاب + المهام + الأصوات + الحلقة الرئيسية
   ============================================================ */

/* ============================================================
   مواقع الوجهات الحقيقية في كفر الدوار
   (بناءً على بيانات الوحدة المحلية)
   ============================================================ */
const DESTINATIONS_DATA = [
  {
    name: 'محطة قطار كفر الدوار',
    x: -350,
    z: -50,
    icon: '🚂',
    color: 0x8b4513,
    description: 'محطة القطار الرئيسية',
  },
  {
    name: 'موقف عزيز المصري',
    x: 200,
    z: 80,
    icon: '🚌',
    color: 0xe74c3c,
    description: 'أكبر موقف في المدينة',
  },
  {
    name: 'مجمع الميزانة',
    x: -150,
    z: -60,
    icon: '🚐',
    color: 0xf39c12,
    description: 'موقف شمال الترعة',
  },
  {
    name: 'مجمع السعرانية',
    x: 450,
    z: 100,
    icon: '🚕',
    color: 0xe67e22,
    description: 'موقف شرق المدينة',
  },
  {
    name: 'مستشفى كفر الدوار العام',
    x: -700,
    z: 150,
    icon: '🏥',
    color: 0x3498db,
    description: 'المستشفى العام',
  },
  {
    name: 'شركة مصر للغزل والنسيج',
    x: 500,
    z: -400,
    icon: '🏭',
    color: 0x95a5a6,
    description: 'أكبر شركة في المدينة',
  },
  {
    name: 'المسجد الكبير',
    x: -200,
    z: 250,
    icon: '🕌',
    color: 0x16a085,
    description: 'جامع كفر الدوار الكبير',
  },
  {
    name: 'سوق كفر الدوار التجاري',
    x: 100,
    z: 200,
    icon: '🛒',
    color: 0x9b59b6,
    description: 'السوق الرئيسي',
  },
  {
    name: 'كورنيش ترعة المحمودية',
    x: 600,
    z: -20,
    icon: '🌊',
    color: 0x2980b9,
    description: 'على ضفاف الترعة',
  },
  {
    name: 'جامعة كفر الدوار',
    x: -500,
    z: -300,
    icon: '🎓',
    color: 0x8e44ad,
    description: 'الجامعة الجديدة',
  },
];

/* ============================================================
   نظام الأصوات - Web Audio API
   ============================================================ */
const AudioSystem = {
  ctx: null,
  engineOsc: null,
  engineGain: null,
  engineFilter: null,
  enabled: true,
  initialized: false,
  
  init() {
    if (this.initialized) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
      this.initialized = true;
      console.log('🔊 نظام الصوت جاهز');
    } catch (e) {
      console.warn('⚠️ فشل تشغيل الصوت:', e);
      this.enabled = false;
    }
  },
  
  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  },
  
  startEngine() {
    if (!this.enabled || !this.ctx) return;
    if (this.engineOsc) return;
    
    try {
      // صوت المحرك الأساسي
      this.engineOsc = this.ctx.createOscillator();
      this.engineOsc.type = 'sawtooth';
      this.engineOsc.frequency.value = 55;
      
      // فلتر Lowpass عشان الصوت يبقى ناعم
      this.engineFilter = this.ctx.createBiquadFilter();
      this.engineFilter.type = 'lowpass';
      this.engineFilter.frequency.value = 350;
      this.engineFilter.Q.value = 5;
      
      // التحكم في مستوى الصوت
      this.engineGain = this.ctx.createGain();
      this.engineGain.gain.value = 0.05;
      
      this.engineOsc.connect(this.engineFilter);
      this.engineFilter.connect(this.engineGain);
      this.engineGain.connect(this.ctx.destination);
      
      this.engineOsc.start();
    } catch (e) {
      console.warn('خطأ في بدء صوت المحرك:', e);
    }
  },
  
  stopEngine() {
    if (this.engineOsc) {
      try {
        this.engineOsc.stop();
      } catch (e) {}
      this.engineOsc = null;
      this.engineGain = null;
      this.engineFilter = null;
    }
  },
  
  setEngine(on) {
    if (on) {
      this.resume();
      this.startEngine();
    } else {
      this.stopEngine();
    }
  },
  
  updateEngine(speed, maxSpeed, isAccelerating) {
    if (!this.engineOsc || !this.engineGain) return;
    
    const ratio = Math.min(Math.abs(speed) / maxSpeed, 1);
    const baseFreq = 55;
    const maxFreq = 180;
    
    // تردد المحرك يزيد مع السرعة
    this.engineOsc.frequency.setTargetAtTime(
      baseFreq + ratio * (maxFreq - baseFreq),
      this.ctx.currentTime,
      0.1
    );
    
    // مستوى الصوت
    const targetGain = 0.03 + ratio * 0.12 + (isAccelerating ? 0.03 : 0);
    this.engineGain.gain.setTargetAtTime(
      targetGain,
      this.ctx.currentTime,
      0.15
    );
    
    // فلتر يتغير مع السرعة
    this.engineFilter.frequency.setTargetAtTime(
      300 + ratio * 800,
      this.ctx.currentTime,
      0.1
    );
  },
  
  playPickup() {
    if (!this.enabled || !this.ctx) return;
    this._playTone(600, 900, 0.15, 'sine', 0.15);
  },
  
  playDelivery() {
    if (!this.enabled || !this.ctx) return;
    // نغمة صاعدة جميلة
    this._playTone(523, 523, 0.1, 'sine', 0.15);
    setTimeout(() => this._playTone(659, 659, 0.1, 'sine', 0.15), 100);
    setTimeout(() => this._playTone(784, 784, 0.2, 'sine', 0.15), 200);
  },
  
  playError() {
    if (!this.enabled || !this.ctx) return;
    this._playTone(200, 150, 0.2, 'sawtooth', 0.12);
  },
  
  playHonk() {
    if (!this.enabled || !this.ctx) return;
    this._playTone(440, 440, 0.3, 'square', 0.1);
  },
  
  _playTone(startFreq, endFreq, duration, type = 'sine', volume = 0.15) {
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = type;
      osc.frequency.setValueAtTime(startFreq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(
        endFreq,
        this.ctx.currentTime + duration
      );
      
      gain.gain.setValueAtTime(volume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        this.ctx.currentTime + duration
      );
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {}
  },
};

/* ============================================================
   نظام الركاب
   ============================================================ */
const passengers = [];
let activeDestination = null;

/* ============================================================
   حالة اللعبة الرئيسية
   ============================================================ */
const gameState = {
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

// ربطها مع نظام الفيزياء
setGameState(gameState);

/* ============================================================
   مواقع توليد الركاب (على الأرصفة)
   ============================================================ */
function getPassengerSpawnPoint() {
  const candidates = [];
  
  ROADS_DATA.forEach(road => {
    if (road.width < 14) return;
    
    // مواقع على الرصيف
    const steps = Math.floor(road.length / 60);
    for (let i = 0; i < steps; i++) {
      const offset = -road.length / 2 + i * 60 + 30;
      for (let side = -1; side <= 1; side += 2) {
        const sideOffset = side * (road.width / 2 + CONFIG.sidewalkWidth / 2);
        
        const x = road.x + Math.sin(road.rotation) * offset + Math.cos(road.rotation) * sideOffset;
        const z = road.z + Math.cos(road.rotation) * offset - Math.sin(road.rotation) * sideOffset;
        
        // نتجنب الترعة والسكة
        if (Math.abs(z) < CONFIG.canalWidth / 2 + 5) continue;
        if (Math.abs(x + 350) < 10) continue;
        
        // نتجنب التواجد قريب جداً من التوك توك
        const distToTuk = Math.hypot(x - tukTuk.position.x, z - tukTuk.position.z);
        if (distToTuk < 80 || distToTuk > 500) continue;
        
        candidates.push({ x, z });
      }
    }
  });
  
  if (candidates.length === 0) return null;
  return Utils.pick(candidates);
}

/* ============================================================
   إنشاء راكب 3D
   ============================================================ */
function createPassengerMesh() {
  const group = new THREE.Group();
  
  // ألوان عشوائية للراكب
  const shirtColors = [
    0xe74c3c, 0x3498db, 0x2ecc71, 0xf39c12,
    0x9b59b6, 0xe67e22, 0x1abc9c, 0x34495e,
  ];
  const pantsColors = [0x2c3e50, 0x34495e, 0x1a1a1a, 0x5a3a2a];
  const skinColors = [0xf5d5b0, 0xe0b890, 0xc89870, 0x8d5524];
  
  const shirtColor = Utils.pick(shirtColors);
  const pantsColor = Utils.pick(pantsColors);
  const skinColor = Utils.pick(skinColors);
  
  // الجسم (قميص)
  const torsoMat = new THREE.MeshStandardMaterial({
    color: shirtColor,
    roughness: 0.85,
  });
  const torsoGeo = new THREE.BoxGeometry(0.5, 0.7, 0.3);
  const torso = new THREE.Mesh(torsoGeo, torsoMat);
  torso.position.y = 1.15;
  torso.castShadow = true;
  group.add(torso);
  
  // الرأس
  const headMat = new THREE.MeshStandardMaterial({
    color: skinColor,
    roughness: 0.9,
  });
  const headGeo = new THREE.SphereGeometry(0.18, 12, 12);
  const head = new THREE.Mesh(headGeo, headMat);
  head.position.y = 1.68;
  head.castShadow = true;
  group.add(head);
  
  // البنطلون
  const pantsMat = new THREE.MeshStandardMaterial({
    color: pantsColor,
    roughness: 0.9,
  });
  const legsGeo = new THREE.BoxGeometry(0.5, 0.8, 0.3);
  const legs = new THREE.Mesh(legsGeo, pantsMat);
  legs.position.y = 0.4;
  legs.castShadow = true;
  group.add(legs);
  
  // الذراعين
  const armGeo = new THREE.BoxGeometry(0.14, 0.65, 0.14);
  const armL = new THREE.Mesh(armGeo, torsoMat);
  armL.position.set(-0.32, 1.15, 0);
  armL.castShadow = true;
  group.add(armL);
  
  const armR = new THREE.Mesh(armGeo, torsoMat);
  armR.position.set(0.32, 1.15, 0);
  armR.castShadow = true;
  group.add(armR);
  
  // هالة تحت الراكب (للتنبيه)
  const ringGeo = new THREE.RingGeometry(0.5, 0.7, 24);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0x00ff88,
    transparent: true,
    opacity: 0.6,
    side: THREE.DoubleSide,
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.05;
  group.add(ring);
  group.userData.ring = ring;
  
  // سهم فوق الرأس
  const arrowGeo = new THREE.ConeGeometry(0.2, 0.4, 4);
  const arrowMat = new THREE.MeshBasicMaterial({
    color: 0x00ff88,
  });
  const arrow = new THREE.Mesh(arrowGeo, arrowMat);
  arrow.position.y = 2.3;
  arrow.rotation.x = Math.PI; // عكس الاتجاه عشان يشاور تحت
  group.add(arrow);
  group.userData.arrow = arrow;
  
  return group;
}

/* ============================================================
   توليد راكب جديد
   ============================================================ */
function spawnPassenger() {
  if (passengers.length >= CONFIG.maxPassengers) return;
  if (player.hasPassenger) return;
  
  const spawnPoint = getPassengerSpawnPoint();
  if (!spawnPoint) return;
  
  // اختيار وجهة عشوائية (مختلفة عن مواقع الركاب الآخرين)
  let destination;
  let attempts = 0;
  do {
    destination = Utils.pick(DESTINATIONS_DATA);
    attempts++;
  } while (attempts < 10 && passengers.some(p => p.destination.name === destination.name));
  
  const mesh = createPassengerMesh();
  mesh.position.set(spawnPoint.x, 0, spawnPoint.z);
  // مواجهة عشوائية
  mesh.rotation.y = Math.random() * Math.PI * 2;
  scene.add(mesh);
  
  passengers.push({
    mesh,
    x: spawnPoint.x,
    z: spawnPoint.z,
    destination,
    spawnTime: performance.now(),
    bobPhase: Math.random() * Math.PI * 2,
  });
  
  console.log(`👤 راكب جديد في (${spawnPoint.x.toFixed(0)}, ${spawnPoint.z.toFixed(0)}) → ${destination.name}`);
  
  updateMissionUI();
}

/* ============================================================
   إنشاء علامة الوجهة (Destination Marker)
   ============================================================ */
function createDestinationMarker(destination) {
  const group = new THREE.Group();
  
  // حلقة كبيرة
  const ringGeo = new THREE.RingGeometry(2, 3, 32);
  const ringMat = new THREE.MeshBasicMaterial({
    color: destination.color,
    transparent: true,
    opacity: 0.7,
    side: THREE.DoubleSide,
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.1;
  group.add(ring);
  
  // دائرة داخلية
  const innerGeo = new THREE.CircleGeometry(1.5, 24);
  const innerMat = new THREE.MeshBasicMaterial({
    color: destination.color,
    transparent: true,
    opacity: 0.3,
    side: THREE.DoubleSide,
  });
  const inner = new THREE.Mesh(innerGeo, innerMat);
  inner.rotation.x = -Math.PI / 2;
  inner.position.y = 0.15;
  group.add(inner);
  
  // عمود ضوء
  const beamGeo = new THREE.CylinderGeometry(0.5, 1.5, 8, 16, 1, true);
  const beamMat = new THREE.MeshBasicMaterial({
    color: destination.color,
    transparent: true,
    opacity: 0.2,
    side: THREE.DoubleSide,
  });
  const beam = new THREE.Mesh(beamGeo, beamMat);
  beam.position.y = 4;
  group.add(beam);
  
  // أيقونة فوق
  const iconGeo = new THREE.SphereGeometry(0.6, 16, 16);
  const iconMat = new THREE.MeshStandardMaterial({
    color: destination.color,
    emissive: destination.color,
    emissiveIntensity: 0.8,
  });
  const icon = new THREE.Mesh(iconGeo, iconMat);
  icon.position.y = 6;
  group.add(icon);
  group.userData.icon = icon;
  group.userData.beam = beam;
  group.userData.ring = ring;
  
  // إضاءة نقطية
  const pointLight = new THREE.PointLight(destination.color, 1.5, 15);
  pointLight.position.y = 3;
  group.add(pointLight);
  
  group.position.set(destination.x, 0, destination.z);
  group.userData.destination = destination;
  group.userData.startTime = performance.now();
  
  return group;
}

/* ============================================================
   أحداث الالتقاط والتوصيل
   ============================================================ */
function checkPassengerPickup() {
  if (player.hasPassenger) return;
  
  const tukRadius = 1.8;
  
  for (let i = passengers.length - 1; i >= 0; i--) {
    const p = passengers[i];
    const dist = Math.hypot(
      p.x - tukTuk.position.x,
      p.z - tukTuk.position.z
    );
    
    if (dist < tukRadius + 0.8) {
      // التقطنا راكب!
      const dest = p.destination;
      
      // إزالة الـ mesh
      scene.remove(p.mesh);
      p.mesh.traverse(child => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(m => m.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
      
      passengers.splice(i, 1);
      
      // تعيين الراكب للتوك توك
      player.hasPassenger = true;
      player.currentPassenger = dest;
      
      // إنشاء علامة الوجهة
      activeDestination = createDestinationMarker(dest);
      scene.add(activeDestination);
      
      // أصوات وتأثيرات
      AudioSystem.playPickup();
      UI.showToast(`✅ راكب صعد! → ${dest.name}`, 2000);
      
      // صورة الراكب في التوك توك (كائن بسيط فوق المقعد)
      const passengerRider = createPassengerMesh();
      passengerRider.scale.set(0.85, 0.85, 0.85);
      passengerRider.position.set(0, 0.4, -0.75);
      passengerRider.userData.ring.visible = false;
      passengerRider.userData.arrow.visible = false;
      tukTuk.add(passengerRider);
      tukTuk.userData.passengerRider = passengerRider;
      
      updateMissionUI();
      break;
    }
  }
}

function checkDelivery() {
  if (!player.hasPassenger || !activeDestination) return;
  
  const dest = activeDestination.userData.destination;
  const dist = Math.hypot(
    dest.x - tukTuk.position.x,
    dest.z - tukTuk.position.z
  );
  
  if (dist < 4) {
    // تم التوصيل!
    const isDelayed = gameState.timeLeft < 30;
    const bonusTime = 15;
    
    // حساب المكافأة (بناءً على سرعة التوصيل)
    const tripTime = (performance.now() - player.tripStartTime) / 1000;
    let reward = 60;
    let rating = 5;
    
    if (tripTime < 20) {
      reward = 100;
      rating = 5;
    } else if (tripTime < 40) {
      reward = 80;
      rating = 4;
    } else if (tripTime < 60) {
      reward = 60;
      rating = 3;
    } else {
      reward = 40;
      rating = 2;
    }
    
    // زيادة الوقت
    gameState.timeLeft = Math.min(
      gameState.timeLeft + bonusTime,
      CONFIG.gameDuration
    );
    
    gameState.money += reward;
    gameState.deliveries++;
    gameState.ratingSum += rating;
    
    // تأثيرات
    AudioSystem.playDelivery();
    UI.showToast(`🎉 تم التوصيل! +${reward} جنيه +${bonusTime} ثانية`, 2200);
    
    // إزالة علامة الوجهة
    scene.remove(activeDestination);
    activeDestination.traverse(child => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(m => m.dispose());
        } else {
          child.material.dispose();
        }
      }
    });
    activeDestination = null;
    
    // إزالة الراكب من التوك توك
    if (tukTuk.userData.passengerRider) {
      tukTuk.remove(tukTuk.userData.passengerRider);
      tukTuk.userData.passengerRider = null;
    }
    
    player.hasPassenger = false;
    player.currentPassenger = null;
    
    // توليد راكب جديد بعد فترة قصيرة
    gameState.spawnTimer = 1.5;
    
    updateHUD();
    updateMissionUI();
  }
}

/* ============================================================
   تحديث واجهة المستخدم
   ============================================================ */
function updateHUD() {
  if (!UI.moneyValue) return;
  
  UI.moneyValue.textContent = gameState.money;
  UI.deliveriesValue.textContent = gameState.deliveries;
  UI.timeValue.textContent = Utils.formatTime(gameState.timeLeft);
  
  // تحذير الوقت
  if (gameState.timeLeft < 20) {
    UI.timeValue.classList.add('warning');
  } else {
    UI.timeValue.classList.remove('warning');
  }
  
  // السرعة
  const speedKmh = Math.abs(player.speed) * 3.6 * 3.5;
  UI.speedValue.textContent = Math.round(speedKmh);
}

function updateMissionUI() {
  if (!UI.missionPanel) return;
  
  if (player.hasPassenger && player.currentPassenger) {
    UI.missionPanel.textContent = `🎯 اوصل الراكب إلى: ${player.currentPassenger.name}`;
    UI.missionPanel.style.borderRightColor = '#00ff88';
  } else if (passengers.length > 0) {
    UI.missionPanel.textContent = `👤 ${passengers.length} راكب ينتظر — اقترب منهم لالتقاطهم`;
    UI.missionPanel.style.borderRightColor = '#ffc800';
  } else {
    UI.missionPanel.textContent = '🔍 جاري البحث عن راكب...';
    UI.missionPanel.style.borderRightColor = '#ffc800';
  }
}

/* ============================================================
   تحديث الركاب (الحركة الدورية)
   ============================================================ */
function updatePassengers(dt) {
  const now = performance.now();
  
  passengers.forEach(p => {
    // حركة صعود ونزول بسيطة (تنفس)
    p.bobPhase += dt * 3;
    const bob = Math.sin(p.bobPhase) * 0.05;
    if (p.mesh) {
      p.mesh.position.y = bob;
    }
    
    // دوران الهالة
    if (p.mesh && p.mesh.userData.ring) {
      p.mesh.userData.ring.rotation.z += dt * 0.5;
    }
    
    // السهم يطفو
    if (p.mesh && p.mesh.userData.arrow) {
      p.mesh.userData.arrow.position.y = 2.3 + Math.sin(now * 0.003 + p.bobPhase) * 0.15;
      p.mesh.userData.arrow.rotation.y += dt * 2;
    }
  });
  
  // تحديث علامة الوجهة
  if (activeDestination) {
    const ud = activeDestination.userData;
    const time = (now - ud.startTime) / 1000;
    
    // نبض
    const pulse = 1 + Math.sin(time * 3) * 0.1;
    ud.ring.scale.set(pulse, pulse, 1);
    ud.beam.material.opacity = 0.15 + Math.sin(time * 2) * 0.08;
    
    // دوران الأيقونة
    ud.icon.rotation.y += dt * 2;
    ud.icon.position.y = 6 + Math.sin(time * 2) * 0.3;
  }
  
  // تحديث الراكب الجالس في التوك توك
  if (tukTuk.userData.passengerRider) {
    const rider = tukTuk.userData.passengerRider;
    rider.position.y = 0.4 + Math.sin(now * 0.005) * 0.02;
  }
}

/* ============================================================
   الحلقة الرئيسية للعبة
   ============================================================ */
function animate() {
  requestAnimationFrame(animate);
  
  const now = performance.now();
  let dt = (now - gameState.lastTime) / 1000;
  gameState.lastTime = now;
  
  // حماية من الـ lag
  dt = Math.min(dt, 0.05);
  
  // موجات الترعة (تشغل دائماً)
  animateCanal(now);
  
  // لو اللعبة مش شغالة أو متوقفة
  if (!gameState.running || gameState.paused) {
    renderer.render(scene, camera);
    return;
  }
  
  gameState.elapsedTime += dt;
  
  // ============ الوقت ============
  gameState.timeLeft -= dt;
  if (gameState.timeLeft <= 0) {
    gameState.timeLeft = 0;
    endGame();
    return;
  }
  
  // ============ توليد الركاب ============
  gameState.spawnTimer -= dt;
  if (gameState.spawnTimer <= 0) {
    if (passengers.length < CONFIG.maxPassengers && !player.hasPassenger) {
      spawnPassenger();
    }
    gameState.spawnTimer = 2 + Math.random() * 3;
  }
  
  // ============ فيزياء التوك توك ============
  updateTukTukPhysics(dt);
  
  // ============ التحقق من الالتقاط والتوصيل ============
  checkPassengerPickup();
  checkDelivery();
  
  // ============ تحديث الكاميرا ============
  updateCamera(dt);
  
  // ============ تحديث الركاب ============
  updatePassengers(dt);
  
  // ============ الصوت ============
  const isAccelerating = !!(keys['KeyW'] || keys['ArrowUp'] || mobileInput.accel);
  AudioSystem.updateEngine(
    Math.abs(player.speed),
    player.maxSpeed,
    isAccelerating
  );
  
  // ============ تحديث الشمس ============
  sunLight.position.set(
    tukTuk.position.x + 180,
    280,
    tukTuk.position.z + 150
  );
  sunLight.target.position.copy(tukTuk.position);
  sunLight.target.updateMatrixWorld();
  
  // ============ تحديث HUD ============
  updateHUD();
  
  // ============ الرسم ============
  renderer.render(scene, camera);
}

/* ============================================================
   بدء اللعبة
   ============================================================ */
let isInitialized = false;

async function startGame() {
  console.log('🎬 محاولة بدء اللعبة...');
  
  // نهيئ الصوت (لازم بعد أول تفاعل من المستخدم)
  AudioSystem.init();
  AudioSystem.resume();
  
  // لو اللعبة اتبنت قبل كده، نعيد التشغيل بس
  if (isInitialized) {
    console.log('✅ إعادة تشغيل اللعبة');
    resetGame();
    gameState.running = true;
    gameState.paused = false;
    UI.startScreen.classList.add('hidden');
    UI.endScreen.classList.add('hidden');
    UI.hud.style.display = 'flex';
    UI.missionPanel.style.display = 'block';
    UI.pauseBtn.style.display = 'flex';
    UI.crosshair.style.display = 'block';
    
    if (isMobile) {
      UI.mobileControls.classList.add('visible');
      UI.showHint('استخدم الأزرار للقيادة — اسحب بإصبعك للنظر', 6000);
    } else {
      UI.showHint('W/A/S/D للحركة — الماوس للنظر — Space فرملة', 6000);
      renderer.domElement.requestPointerLock?.();
    }
    
    // تشغيل صوت المحرك
    if (player.engineOn) {
      AudioSystem.setEngine(true);
    }
    return;
  }
  
  // أول مرة - نبني المدينة
  UI.startBtn.disabled = true;
  UI.startBtn.textContent = '⏳ جاري التحميل...';
  
  try {
    await buildCity((pct, text) => {
      UI.updateLoading(pct, text);
    });
    
    // إعداد الأزرار
    setupMobileButtons();
    setupPointerLock();
    
    // إعداد زر الإيقاف
    UI.pauseBtn.addEventListener('click', togglePause);
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Escape' || e.code === 'KeyP') {
        if (gameState.running) togglePause();
      }
    });
    
    isInitialized = true;
    
    // شغل اللعبة
    resetGame();
    gameState.running = true;
    gameState.lastTime = performance.now();
    
    // إخفاء شاشة البداية
    UI.startScreen.classList.add('hidden');
    UI.endScreen.classList.add('hidden');
    
    // إظهار الواجهة
    UI.hud.style.display = 'flex';
    UI.missionPanel.style.display = 'block';
    UI.pauseBtn.style.display = 'flex';
    UI.crosshair.style.display = 'block';
    
    // لو موبايل، نظهر الأزرار
    if (isMobile) {
      UI.mobileControls.classList.add('visible');
      UI.showHint('استخدم الأزرار للقيادة — اسحب بإصبعك للنظر', 6000);
    } else {
      UI.showHint('W/A/S/D للحركة — الماوس للنظر — Space فرملة', 6000);
    }
    
    // تشغيل صوت المحرك
    if (player.engineOn) {
      AudioSystem.setEngine(true);
    }
    
    // نولّد راكبين في البداية
    setTimeout(() => spawnPassenger(), 500);
    setTimeout(() => spawnPassenger(), 1500);
    
    // أهلاً وسهلاً
    UI.showToast('🛺 رحلة سعيدة!', 2000);
    
    // ابدأ الحلقة
    if (!animate.started) {
      animate.started = true;
      gameState.lastTime = performance.now();
      animate();
    }
    
    console.log('✅ اللعبة بدأت!');
    
  } catch (error) {
    console.error('❌ خطأ في تحميل اللعبة:', error);
    UI.showToast('حدث خطأ أثناء التحميل، حاول مرة أخرى', 3000);
    UI.startBtn.disabled = false;
    UI.startBtn.textContent = '🚀 ابدأ الرحلة';
  }
}

/* ============================================================
   إعادة تشغيل اللعبة (بدون إعادة بناء المدينة)
   ============================================================ */
function resetGame() {
  // إعادة تعيين حالة اللعبة
  gameState.money = 0;
  gameState.deliveries = 0;
  gameState.ratingSum = 0;
  gameState.timeLeft = CONFIG.gameDuration;
  gameState.spawnTimer = 1;
  gameState.elapsedTime = 0;
  gameState.paused = false;
  
  // إعادة تعيين التوك توك
  tukTuk.position.set(0, 0, 200);
  tukTuk.rotation.set(0, 0, 0);
  
  // إعادة تعيين اللاعب
  player.speed = 0;
  player.steering = 0;
  player.currentWheelAngle = 0;
  player.headYaw = 0;
  player.headPitch = 0;
  player.hasPassenger = false;
  player.currentPassenger = null;
  player.engineOn = true;
  player.handbrake = false;
  
  // إزالة الركاب
  passengers.forEach(p => {
    scene.remove(p.mesh);
    p.mesh.traverse(child => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(m => m.dispose());
        } else {
          child.material.dispose();
        }
      }
    });
  });
  passengers.length = 0;
  
  // إزالة علامة الوجهة
  if (activeDestination) {
    scene.remove(activeDestination);
    activeDestination.traverse(child => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(m => m.dispose());
        } else {
          child.material.dispose();
        }
      }
    });
    activeDestination = null;
  }
  
  // إزالة الراكب الجالس
  if (tukTuk.userData.passengerRider) {
    tukTuk.remove(tukTuk.userData.passengerRider);
    tukTuk.userData.passengerRider = null;
  }
  
  // إعادة تعيين الكاميرا
  const offset = CAMERA_OFFSET.clone();
  offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), tukTuk.rotation.y);
  camera.position.copy(tukTuk.position).add(offset);
  camera.lookAt(tukTuk.position.x, tukTuk.position.y + 1.5, tukTuk.position.z + 10);
  
  updateHUD();
  updateMissionUI();
  
  console.log('🔄 تم إعادة تعيين اللعبة');
}

/* ============================================================
   إيقاف مؤقت
   ============================================================ */
function togglePause() {
  if (!gameState.running) return;
  
  gameState.paused = !gameState.paused;
  
  if (gameState.paused) {
    UI.pauseBtn.textContent = '▶️';
    UI.showToast('⏸️ اللعبة متوقفة', 1500);
    AudioSystem.setEngine(false);
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }
  } else {
    UI.pauseBtn.textContent = '⏸️';
    UI.showToast('▶️ استمر!', 1000);
    if (player.engineOn) AudioSystem.setEngine(true);
    if (!isMobile) {
      renderer.domElement.requestPointerLock?.();
    }
  }
}

/* ============================================================
   إنهاء اللعبة
   ============================================================ */
function endGame() {
  gameState.running = false;
  AudioSystem.setEngine(false);
  
  if (document.pointerLockElement) {
    document.exitPointerLock();
  }
  
  // حساب التقييم
  const avgRating = gameState.deliveries > 0
    ? (gameState.ratingSum / gameState.deliveries).toFixed(1)
    : '0';
  
  // عرض النتائج
  UI.endTitle.textContent = gameState.deliveries > 0 ? '🎉 رحلة رائعة!' : '⏰ انتهى الوقت!';
  UI.endMoney.textContent = `${gameState.money} جنيه`;
  UI.endDeliveries.textContent = gameState.deliveries;
  UI.endRating.textContent = `${avgRating} ⭐`;
  
  UI.endScreen.classList.remove('hidden');
  UI.mobileControls.classList.remove('visible');
  UI.pauseBtn.style.display = 'none';
  
  console.log('🏁 انتهت اللعبة', {
    money: gameState.money,
    deliveries: gameState.deliveries,
    rating: avgRating,
  });
}

/* ============================================================
   ربط زر "ابدأ الرحلة"
   ============================================================ */
UI.startBtn.addEventListener('click', startGame);
UI.startBtn.addEventListener('touchstart', (e) => {
  e.preventDefault();
  startGame();
}, { passive: false });

UI.restartBtn.addEventListener('click', () => {
  UI.endScreen.classList.add('hidden');
  startGame();
});

/* ============================================================
   زر الكلاكس (اختياري - لمس مطول)
   ============================================================ */
let honkTimer = null;
document.addEventListener('keydown', (e) => {
  if (e.code === 'KeyH' && !honkTimer) {
    AudioSystem.playHonk();
    honkTimer = setTimeout(() => { honkTimer = null; }, 500);
  }
});

/* ============================================================
   تحذير الخروج
   ============================================================ */
window.addEventListener('beforeunload', (e) => {
  if (gameState.running && gameState.deliveries > 0) {
    e.preventDefault();
    e.returnValue = '';
  }
});

/* ============================================================
   منع القائمة اليمنى على الموبايل
   ============================================================ */
document.addEventListener('contextmenu', (e) => e.preventDefault());

/* ============================================================
   جاهز!
   ============================================================ */
console.log('✅ الجزء 3 جاهز - الركاب والمهام والحلقة الرئيسية');
console.log('🎮 اللعبة جاهزة! اضغط على "ابدأ الرحلة"');
