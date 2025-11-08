// Variáveis para elementos e contexto de desenho
const videoElement = document.getElementById('input_video');
const canvasElement = document.getElementById('output_canvas');
const canvasCtx = canvasElement.getContext('2d');

// Redimensionar o canvas para preencher a tela
function resizeCanvas() {
    canvasElement.width = window.innerWidth;
    canvasElement.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);


// --- 1. CONFIGURAÇÃO E INICIALIZAÇÃO DO MEDIAPIPE HANDS ---

// Cria a instância do Hands
const hands = new Hands({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469408/${file}`
});

// Define as opções do modelo
hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.7,
    minTrackingConfidence: 0.5
});

// Função chamada quando o MediaPipe retorna os resultados
hands.onResults(onResults);


// --- 2. FUNÇÃO PRINCIPAL DE RASTREAMENTO E DESENHO ---

function onResults(results) {
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    if (results.multiHandLandmarks) {
        for (const landmarks of results.multiHandLandmarks) {
            // Desenha as bolinhas nos pontos da mão (landmarks)
            // drawConnectors e drawLandmarks são funções globais do MediaPipe
            drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, { color: '#00FF00', lineWidth: 5 });
            drawLandmarks(canvasCtx, landmarks, { color: '#FF0000', lineWidth: 2 });
        }
    }
    canvasCtx.restore();
}


// --- 3. INICIALIZAÇÃO DA CÂMERA (COM CORREÇÃO DE TIMEOUT) ---

const camera = new Camera(videoElement, {
    onFrame: async () => {
        await hands.send({ image: videoElement });
    },
    width: 1280,
    height: 720,
    // 🟢 CORREÇÃO: Aumenta o tempo limite para 5 segundos
    timeout: 5000 
});
camera.start();
