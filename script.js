// Exemplo de código JavaScript para confirmar que o arquivo está carregando
console.log("O script.js foi carregado com sucesso!");

// Sua lógica de ativação de webcam e detecção de mão viria aqui
// (A funcionalidade de webcam só funciona após a hospedagem!)

// Exemplo de como acessar a webcam (requer hospedagem para funcionar!)
if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(function(stream) {
            const videoElement = document.getElementById('webcam-feed');
            videoElement.srcObject = stream;
        })
        .catch(function(error) {
            console.error("Erro ao acessar a webcam: ", error);
            alert("Não foi possível iniciar a webcam. Verifique as permissões.");
        });
}