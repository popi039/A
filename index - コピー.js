import * as THREE from 'https://cdn.jsdelivr.net/npm/three/build/three.module.js';
import { GLTFLoader } from "GLTFLoader";
import { OrbitControls } from "OrbitControls";


// 画面サイズの取得
const windowWidth = window.innerWidth;
const windowHeight = window.innerHeight;

// レンダラーの作成
const canvas = document.getElementById('canvas')
const renderer = new THREE.WebGLRenderer({ canvas: canvas });
renderer.setSize(windowWidth, windowHeight);

// シーンの作成
const scene = new THREE.Scene();
// 背景色の設定(水色)
scene.background = new THREE.Color('#00bfff');

// 見やすいようにヘルパー（網目）を設定
let gridHelper = new THREE.GridHelper();
scene.add(gridHelper);

// カメラを作成
const camera = new THREE.PerspectiveCamera(75, windowWidth / windowHeight, 0.1, 1000);
camera.position.set(5, 2, 0);
camera.lookAt(0, 0, 0);

// ライトの作成
const light = new THREE.PointLight(0xffffff, 1, 100);
light.position.set(10, 20, 5);
scene.add(light);

// マウス制御
const controls = new OrbitControls(camera, renderer.domElement);

// 3Dモデルの読み込み
const loader = new GLTFLoader();
//loader.load('Yukidaruma.glb', function (gltf) {
//loader.load('/Bee.glb', function (gltf) {
loader.load('hachi.glb', function (gltf) {
    const model = gltf.scene;
    model.scale.set(0.1, 0.1, 0.1);
    scene.add(model);
});

// アニメーション
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

// アニメーション実行
animate();



