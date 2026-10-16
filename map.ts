import {
  Scene, MeshBuilder, Vector3,
  StandardMaterial, Color3
} from '@babylonjs/core';

export function buildMap(scene: Scene): void {
  buildGround(scene);
  buildMainStreets(scene);
  buildBolduVillage(scene);
  buildHaggMahmoudHouse(scene);
}

function buildGround(scene: Scene): void {
  const ground = MeshBuilder.CreateGround('ground', { width: 1000, height: 1000 }, scene);
  const mat = new StandardMaterial('groundMat', scene);
  mat.diffuseColor = new Color3(0.45, 0.4, 0.32);
  ground.material = mat;
}

interface RoadDef {
  name: string;
  length: number;
  width: number;
  x: number;
  z: number;
  rotY?: number;
}

function buildMainStreets(scene: Scene): void {
  // الشوارع الشريانية الرئيسية في كفر الدوار
  const roads: RoadDef[] = [
    // شارع أحمد عرابي (الشريان الرئيسي)
    { name: 'ahmed_oraby', length: 400, width: 24, x: 0, z: 0 },
    // شارع بورسعيد
    { name: 'portsaid', length: 350, width: 22, x: 0, z: 100 },
    // شارع الجيش
    { name: 'el_geish', length: 260, width: 15, x: -120, z: 0, rotY: Math.PI / 2 },
    // شارع الرحمة
    { name: 'el_rahma', length: 260, width: 12, x: 120, z: 0, rotY: Math.PI / 2 },
    // شارع الجلاء (جلال الدسوقي)
    { name: 'el_galaa', length: 220, width: 14, x: 0, z: -100 },
    // المحور
    { name: 'el_mahwar', length: 300, width: 25, x: 200, z: 0, rotY: Math.PI / 2 },
    // شارع الجمهورية
    { name: 'el_gomhoria', length: 200, width: 12, x: -200, z: 0 },
    // شارع سيدي عبدالقادر
    { name: 'sidi_abdelkader', length: 180, width: 12, x: 0, z: 180 },
    // شارع الحدائق
    { name: 'el_hadaiq', length: 180, width: 12, x: -60, z: 180 },
    // شارع صلاح الدين الأيوبي
    { name: 'salah_eldin', length: 160, width: 12, x: 60, z: 180 },
    // شارع مجمع المحاكم
    { name: 'mahkama', length: 150, width: 12, x: -150, z: -150, rotY: Math.PI / 2 },
    // شارع الإدكاوي
    { name: 'el_idkawy', length: 150, width: 10, x: 150, z: -150, rotY: Math.PI / 2 }
  ];

  roads.forEach(r => createRoad(scene, r));
}

function createRoad(scene: Scene, r: RoadDef): void {
  const road = MeshBuilder.CreateBox(r.name, {
    width: r.width,
    height: 0.2,
    depth: r.length
  }, scene);
  road.position = new Vector3(r.x, 0.1, r.z);
  if (r.rotY) road.rotation.y = r.rotY;

  const mat = new StandardMaterial(`${r.name}_mat`, scene);
  mat.diffuseColor = new Color3(0.15, 0.15, 0.15);
  road.material = mat;

  // خط منتصف الطريق
  const line = MeshBuilder.CreateBox(`${r.name}_line`, {
    width: 0.4,
    height: 0.02,
    depth: r.length * 0.95
  }, scene);
  line.position = new Vector3(r.x, 0.22, r.z);
  if (r.rotY) line.rotation.y = r.rotY;
  const lineMat = new StandardMaterial(`${r.name}_lineMat`, scene);
  lineMat.diffuseColor = new Color3(1, 1, 1);
  line.material = lineMat;
}

function buildBolduVillage(scene: Scene): void {
  // بولضو في أقصى الشمال
  const villageX = -300;
  const villageZ = -300;

  // شارع عائلة محمدي (الشارع الفرعي الرئيسي في بولضو)
  const familyStreet = MeshBuilder.CreateBox('family_street', {
    width: 8, height: 0.18, depth: 120
  }, scene);
  familyStreet.position = new Vector3(villageX, 0.09, villageZ);
  const streetMat = new StandardMaterial('family_street_mat', scene);
  streetMat.diffuseColor = new Color3(0.35, 0.3, 0.25);
  familyStreet.material = streetMat;

  // بيوت بولضو على جانبي شارع عائلة محمدي
  for (let i = 0; i < 12; i++) {
    const z = villageZ - 55 + i * 10;
    createVillageHouse(scene, new Vector3(villageX - 12, 2, z), `boldu_house_left_${i}`);
    createVillageHouse(scene, new Vector3(villageX + 12, 2, z), `boldu_house_right_${i}`);
  }

  // لافتة بولضو
  createSign(scene, new Vector3(villageX, 5, villageZ + 65), 'قرية بولضو · Boldu');
}

function createVillageHouse(scene: Scene, pos: Vector3, name: string): void {
  const house = MeshBuilder.CreateBox(name, {
    width: 8, height: 4, depth: 8
  }, scene);
  house.position = pos;

  const mat = new StandardMaterial(`${name}_mat`, scene);
  // ألوان طينية متنوعة
  const colors = [
    new Color3(0.9, 0.85, 0.72),
    new Color3(0.85, 0.78, 0.65),
    new Color3(0.95, 0.9, 0.8)
  ];
  mat.diffuseColor = colors[Math.floor(Math.random() * colors.length)];
  house.material = mat;

  // سقف
  const roof = MeshBuilder.CreateBox(`${name}_roof`, {
    width: 9, height: 0.4, depth: 9
  }, scene);
  roof.position = new Vector3(pos.x, pos.y + 2.2, pos.z);
  const roofMat = new StandardMaterial(`${name}_roofMat`, scene);
  roofMat.diffuseColor = new Color3(0.4, 0.3, 0.25);
  roof.material = roofMat;
}

function buildHaggMahmoudHouse(scene: Scene): void {
  // بيت الحاج محمود محمدي — منزل مميز في شارع عائلة محمدي
  const pos = new Vector3(-300, 3, -300);

  const house = MeshBuilder.CreateBox('hagg_mahmoud_house', {
    width: 14, height: 6, depth: 12
  }, scene);
  house.position = pos;

  const mat = new StandardMaterial('hagg_mahmoud_mat', scene);
  mat.diffuseColor = new Color3(0.95, 0.92, 0.85);
  house.material = mat;

  // سقف مميز
  const roof = MeshBuilder.CreateBox('hagg_mahmoud_roof', {
    width: 15, height: 0.6, depth: 13
  }, scene);
  roof.position = new Vector3(pos.x, pos.y + 3.3, pos.z);
  const roofMat = new StandardMaterial('hagg_mahmoud_roofMat', scene);
  roofMat.diffuseColor = new Color3(0.5, 0.2, 0.15);
  roof.material = roofMat;

  // بوابة كبيرة
  const gate = MeshBuilder.CreateBox('hagg_mahmoud_gate', {
    width: 4, height: 3, depth: 0.3
  }, scene);
  gate.position = new Vector3(pos.x, 1.5, pos.z - 6.2);
  const gateMat = new StandardMaterial('gateMat', scene);
  gateMat.diffuseColor = new Color3(0.2, 0.4, 0.2);
  gate.material = gateMat;

  // لافتة البيت
  createSign(scene, new Vector3(pos.x, 7, pos.z - 6.5), 'بيت الحاج محمود محمدي');
}

function createSign(scene: Scene, pos: Vector3, text: string): void {
  // لافتة بسيطة (مستطيل ملون)
  const sign = MeshBuilder.CreateBox('sign_' + text, {
    width: 8, height: 1.2, depth: 0.2
  }, scene);
  sign.position = pos;
  const mat = new StandardMaterial('signMat_' + text, scene);
  mat.diffuseColor = new Color3(0.1, 0.3, 0.5);
  sign.material = mat;
  // ملاحظة: النص على اللافتة يحتاج DynamicTexture — سنضيفه لاحقاً
}
