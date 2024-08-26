import * as THREE from 'https://cdn.jsdelivr.net/npm/three@latest/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@latest/examples/jsm/loaders/GLTFLoader.js';

// シーンの作成
const scene = new THREE.Scene();

// 画面サイズの取得
const windowWidth = window.innerWidth;
const windowHeight = window.innerHeight;

// レンダラーの作成
const canvas = document.getElementById('canvas');
const renderer = new THREE.WebGLRenderer({ canvas: canvas });
renderer.setSize(windowWidth, windowHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// テクスチャの読み込みと背景設定
const textureLoader = new THREE.TextureLoader();
textureLoader.load('back.JPG', (texture) => {
    scene.background = texture;
});

// カメラの作成
const camera = new THREE.PerspectiveCamera(30, windowWidth / windowHeight, 0.1, 1000);
camera.position.set(0, 20, 50);
camera.lookAt(0, 0, 0);

// ライトの作成
const ambientLight = new THREE.AmbientLight(0x404040, 2);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 3, 100);
pointLight.position.set(15, 30, 20);
scene.add(pointLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
directionalLight.position.set(10, 20, 15).normalize();
scene.add(directionalLight);

// マウス制御
const controls = new OrbitControls(camera, renderer.domElement);
controls.zoomSpeed = 1.2;

// アニメーションミキサーの設定
const mixers = [];
let currentAction1 = null;
let loopedAction = null; // 追加: 常に動作するアクション

// GLTFLoader のインスタンス化
const loader = new GLTFLoader();
loader.load('nice.glb', function (gltf) {
    const model = gltf.scene;

    // バウンディングボックスを計算
    const boundingBox = new THREE.Box3().setFromObject(model);
    const modelCenter = boundingBox.getCenter(new THREE.Vector3());

    // カメラの位置を調整
    const distance = boundingBox.getSize(new THREE.Vector3()).length() * 1.2;
    camera.position.set(modelCenter.x, modelCenter.y + 1.5, modelCenter.z + distance * 0.8);
    camera.lookAt(modelCenter);

    scene.add(model);

    // GLTFファイル内のアニメーションの確認
    gltf.animations.forEach(function (clip) {
        const mixer = new THREE.AnimationMixer(model);
        const action = mixer.clipAction(clip);
        mixers.push(mixer);

        if (clip.name === '[保留アクション].001') {
            currentAction1 = action;
            action.loop = THREE.LoopOnce;
            action.clampWhenFinished = true;
        } else if (clip.name === '[保留アクション]') {
            loopedAction = action;
            action.loop = THREE.LoopRepeat; // 繰り返し動作
            action.play(); // アニメーションを再生
        }
    });
}, undefined, function (error) {
    console.error('An error happened:', error);
});

// 音声認識の設定
if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
    alert('このブラウザは音声認識をサポートしていません。Google Chrome を使用してください。');
    throw new Error('SpeechRecognition is not supported in this browser.');
}

const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = 'ja-JP';
recognition.interimResults = true; // 途中経過を取得する
recognition.maxAlternatives = 1;

let isRecognizing = false; // 追加: 音声認識が動作中かどうかを追跡するフラグ
let lastTriggerTime = 0; // 最後にアニメーションをトリガーした時間
const triggerDelay = 1000; // アニメーションを再トリガーするまでの遅延時間（ミリ秒）
let isAnimationTriggered = false; // アニメーションがトリガーされたかどうか
let waitingForNextTrigger = false; // 次の単語を待機しているかどうか

// 音声認識の結果処理
recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    console.log(`音声認識の結果: ${transcript}`);

    const now = Date.now();
    if (now - lastTriggerTime > triggerDelay) { // 遅延時間を超えている場合にのみトリガー
        if (transcript.includes('信じられない') || transcript.includes('心臓が止まりそう') || transcript.includes('どうしよう') || transcript.includes('実感がわかない')  || transcript.includes('嬉しい')) {
            if (!isAnimationTriggered) {
                triggerNodAnimation();
                lastTriggerTime = now; // 最後にトリガーした時間を更新
                isAnimationTriggered = true; // アニメーションがトリガーされた状態にする
                waitingForNextTrigger = true; // 次の単語を待機する状態にする
            }
        }
    }

    // 次の単語が認識されたときのリセット
    if (waitingForNextTrigger && (transcript.includes('心臓が止まりそう') || transcript.includes('どうしよう') || transcript.includes('実感がわかない') || transcript.includes('嬉しい'))) {
        isAnimationTriggered = false; // アニメーションが再度トリガー可能にする
        waitingForNextTrigger = false; // 待機状態を解除
        console.log('次の単語が認識されました。アニメーショントリガー状態がリセットされました。');
    }
};

recognition.onerror = (event) => {
    console.error(`Error: ${event.error}`);
};

recognition.onend = () => {
    console.log('音声認識が終了しました。');
    isRecognizing = false; // 音声認識が終了したことを追跡
};

// エンターキーを押している間に音声認識の開始、離すと停止
document.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !isRecognizing) {
        recognition.start();
        console.log('音声認識を開始します...');
        isRecognizing = true;
    }
});

document.addEventListener('keyup', (event) => {
    if (event.key === 'Enter' && isRecognizing) {
        recognition.stop();
        console.log('音声認識を停止しました。');
        isRecognizing = false;
    }
});

function triggerNodAnimation() {
    if (currentAction1) {
        currentAction1.reset(); // アニメーションをリセット
        currentAction1.timeScale = 5; // スピードを5倍に設定
        currentAction1.play(); // アニメーションを再生
        console.log('アニメーションがトリガーされました');
    }
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);

    mixers.forEach(function (mixer) {
        mixer.update(0.01);
    });
}

animate();
