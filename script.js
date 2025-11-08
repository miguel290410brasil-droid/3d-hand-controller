let scene, camera, renderer;
let handPoints = [];
let cubes = [];
let raycaster, mouse;
let selectedCube = null;

function initThreeJS() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1e1e1e);

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;

  renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('three-canvas') });
  renderer.setSize(window.innerWidth, window.innerHeight);

  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  // Cubos coloridos
  const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff];
  for (let i = 0; i < 5; i++) {
    const cube = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.5, 0.5),
      new THREE.MeshStandardMaterial({ color: colors[i] })
    );
    cube.position.set(i - 2, 0, 0);
    scene.add(cube);
    cubes.push(cube);
  }

  // Luz
  const light = new THREE.PointLight(0xffffff, 1);
  light.position.set(0, 5, 5);
  scene.add(light);

  animate();
  initMediaPipe();
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

function initMediaPipe() {
  if (typeof Hands === 'undefined' || typeof Camera === 'undefined') {
    console.error('MediaPipe Hands ou Camera não estão disponíveis.');
    return;
  }

  const videoElement = document.getElementById('input_video');
  const hands = new Hands({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
  });

  hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.7,
    minTrackingConfidence: 0.5
  });

  hands.onResults(onResults);

  const cameraFeed = new Camera(videoElement, {
    onFrame: async () => {
      await hands.send({ image: videoElement });
    },
    width: 640,
    height: 480
  });
  cameraFeed.start();
}

function onResults(results) {
  // Remove pontos anteriores
  handPoints.forEach(p => scene.remove(p));
  handPoints = [];

  if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
    const landmarks = results.multiHandLandmarks[0];

    landmarks.forEach((lm, i) => {
      const point = new THREE.Mesh(
        new THREE.SphereGeometry(0.02),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
      );
      point.position.set((lm.x - 0.5) * 6, -(lm.y - 0.5) * 6, -lm.z * 6);
      scene.add(point);
      handPoints.push(point);

      // Interação simples com cubos
      if (i === 8) { // ponta do dedo indicador
        raycaster.set(point.position, new THREE.Vector3(0, 0, -1));
        const intersects = raycaster.intersectObjects(cubes);
        if (intersects.length > 0) {
          selectedCube = intersects[0].object;
          selectedCube.rotation.y += 0.05;
        }
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    initThreeJS();
  }, 1000);
});
