let scene, camera, renderer, handMesh;

function initThreeJS() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const geometry = new THREE.BoxGeometry();
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  handMesh = new THREE.Mesh(geometry, material);
  scene.add(handMesh);

  camera.position.z = 5;

  animate();
  initMediaPipe();
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

function initMediaPipe() {
  if (typeof Hands === 'undefined') {
    console.error('MediaPipe Hands não está disponível.');
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
  if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
    const landmarks = results.multiHandLandmarks[0];
    const indexFingerTip = landmarks[8];
    handMesh.position.x = (indexFingerTip.x - 0.5) * 10;
    handMesh.position.y = -(indexFingerTip.y - 0.5) * 10;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    initThreeJS();
  }, 1000);
});
