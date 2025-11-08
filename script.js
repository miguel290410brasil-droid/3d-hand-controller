// --- 1. CONFIGURAÇÃO DA CENA 3D (THREE.JS) ---

const container = document.getElementById('container-3d');
let scene, camera, renderer, gridHelper, handMesh, cubes = [];
const RAYCASTER = new THREE.Raycaster();
const HAND_RADIUS = 0.5; // Raio da esfera que representa a mão
let cameraMediaPipe; 

function initThreeJS() {
    // 1. Cena e Câmera
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 1.5, 5);
    camera.lookAt(0, 0, 0);

    // 2. Renderizador
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    // 3. Iluminação
    const light = new THREE.DirectionalLight(0xffffff, 0.8);
    light.position.set(5, 10, 7.5);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0x404040));

    // 4. Fundo Cinza 3D e Grid
    scene.background = new THREE.Color(0x303030); 
    gridHelper = new THREE.GridHelper(20, 20, 0x555555, 0x555555);
    scene.add(gridHelper);

    // 5. Mão Virtual
    const handGeometry = new THREE.SphereGeometry(HAND_RADIUS / 2, 32, 32);
    const handMaterial = new THREE.MeshPhongMaterial({ color: 0x00c3ff, transparent: true, opacity: 0.7 });
    handMesh = new THREE.Mesh(handGeometry, handMaterial);
    scene.add(handMesh);
    handMesh.visible = false;

    // 6. Cubos Interativos
    createCubes();

    window.addEventListener('resize', onWindowResize);
    animate();
    
    // Inicia o rastreamento MediaPipe
    initMediaPipe(); 
}

function createCubes() {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const positions = [
        new THREE.Vector3(-4, 0.5, -4),
        new THREE.Vector3(-2, 0.5, -2),
        new THREE.Vector3(0, 0.5, 0),
        new THREE.Vector3(2, 0.5, 2),
        new THREE.Vector3(4, 0.5, 4)
    ];

    for (let i = 0; i < 5; i++) {
        const material = new THREE.MeshPhongMaterial({ color: Math.random() * 0xffffff });
        const cube = new THREE.Mesh(geometry, material);
        cube.position.copy(positions[i]);
        cube.initialColor = material.color.getHex();
        cube.isGrabbed = false;
        scene.add(cube);
        cubes.push(cube);
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}


// --- 2. CONFIGURAÇÃO DO RASTREAMENTO DE MÃO (MEDIAPIPE) ---

const videoElement = document.getElementById('webcam-feed');

function initMediaPipe() {
    // 🟢 CORREÇÃO: A variável 'hands' agora é declarada localmente dentro da função
    const hands = new Hands({
        locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469408/${file}`;
        }
    });

    hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.8,
        minTrackingConfidence: 0.8
    });

    hands.onResults(onResults);

    // Inicialização da Câmera (Isso deve ligar a webcam na caixa azul)
    cameraMediaPipe = new Camera(videoElement, {
        onFrame: async () => {
            await hands.send({ image: videoElement });
        },
        width: 640,
        height: 480
    });
    cameraMediaPipe.start();
}


// --- 3. LÓGICA DE INTERAÇÃO (RASTREAMENTO + 3D) ---

function onResults(results) {
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        handMesh.visible = true; // Mão virtual (esfera azul) aparece!
        const handLandmarks = results.multiHandLandmarks[0];
        
        // 8 é o índice da ponta do dedo indicador
        const tipIndexFinger = handLandmarks[8];
        
        // Mapeamento das coordenadas 2D para 3D
        const screenX = 1 - tipIndexFinger.x; 
        const screenY = tipIndexFinger.y;

        const vector = new THREE.Vector3(
            (screenX * 2 - 1) * 8, // Escala o X para a cena (-8 a 8)
            (1 - screenY) * 6,     // Escala o Y para a cena (0 a 6)
            0                      // Profundidade (fixamos em 0)
        );

        // Atualiza a posição da Mão Virtual
        handMesh.position.lerp(vector, 0.5); 
        
        // Lógica de Pegar (Grab/Pinch)
        const tipThumb = handLandmarks[4];
        const distance = Math.hypot(tipIndexFinger.x - tipThumb.x, tipIndexFinger.y - tipThumb.y);
        const isGrabbing = distance < 0.05; 

        handleCubeInteraction(isGrabbing);

    } else {
        handMesh.visible = false;
        cubes.forEach(cube => {
            if (cube.isGrabbed) {
                cube.isGrabbed = false;
                cube.material.color.setHex(cube.initialColor);
            }
        });
    }
}

function handleCubeInteraction(isGrabbing) {
    let grabbedCube = cubes.find(c => c.isGrabbed);

    if (grabbedCube) {
        grabbedCube.position.copy(handMesh.position);
        grabbedCube.material.color.setHex(0xff0000); 
        return; 
    }

    if (isGrabbing) {
        for (const cube of cubes) {
            const distance = handMesh.position.distanceTo(cube.position);
            
            if (distance < HAND_RADIUS) { 
                cube.isGrabbed = true;
                break; 
            }
        }
    } else {
        cubes.forEach(cube => {
            if (cube.isGrabbed) {
                cube.isGrabbed = false;
                cube.material.color.setHex(cube.initialColor); 
            }
        });
    }
}

// 🟢 CORREÇÃO FINAL: Garante que o Three.js comece após o carregamento total do HTML
document.addEventListener('DOMContentLoaded', (event) => {
    initThreeJS();
});
