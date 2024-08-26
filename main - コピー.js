import * as THREE from 'https://cdn.jsdelivr.net/npm/three/build/three.module.js';
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";


// ��ʃT�C�Y�̎擾
const windowWidth = window.innerWidth;
const windowHeight = window.innerHeight;

// �����_���[�̍쐬
const canvas = document.getElementById('canvas')
const renderer = new THREE.WebGLRenderer({ canvas: canvas });
renderer.setSize(windowWidth, windowHeight);

// �V�[���̍쐬
const scene = new THREE.Scene();
// �w�i�F�̐ݒ�(���F)
scene.background = new THREE.Color('#00bfff');

// ���₷���悤�Ƀw���p�[�i�Ԗځj��ݒ�
let gridHelper = new THREE.GridHelper();
scene.add(gridHelper);

// �J�������쐬
const camera = new THREE.PerspectiveCamera(75, windowWidth / windowHeight, 0.1, 1000);
camera.position.set(5, 2, 0);
camera.lookAt(0, 0, 0);

// ���C�g�̍쐬
const light = new THREE.PointLight(0xffffff, 1, 100);
light.position.set(10, 20, 5);
scene.add(light);

// �}�E�X����
const controls = new OrbitControls(camera, renderer.domElement);

// 3D���f���̓ǂݍ���
const loader = new GLTFLoader();
//loader.load('Yukidaruma.glb', function (gltf) {
loader.load('nod.glb', function (gltf) {
//loader.load('hachi.glb', function (gltf) {
    const model = gltf.scene;
    model.scale.set(0.1, 0.1, 0.1);
    scene.add(model);
});

// �A�j���[�V����
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

// �A�j���[�V�������s
animate();



