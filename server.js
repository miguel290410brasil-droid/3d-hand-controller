// server.js
// Uso:
//   npm init -y
//   npm install ws
//   node server.js

const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws, req) => {
  const addr = req.socket.remoteAddress;
  console.log(`[WS] cliente conectado: ${addr}`);

  ws.on('message', (msg) => {
    let data = null;
    try {
      data = JSON.parse(msg.toString());
    } catch (e) {
      console.log('[WS] mensagem nao-json:', msg.toString().slice(0,200));
      return;
    }
    // log resumido
    if (data.landmarks) {
      console.log(`[WS] pkt ${data.t} landmarks:${data.landmarks.length}`);
    } else if (data.raw) {
      console.log(`[WS] pkt ${data.t || ''} raw:${(data.raw.length||0)}`);
    } else {
      console.log('[WS] pkt recebido:', Object.keys(data));
    }
    // opcional: enviar ack
    ws.send(JSON.stringify({ ok: true, t: Date.now() }));
  });

  ws.on('close', () => console.log('[WS] cliente desconectado:', addr));
  ws.on('error', (err) => console.log('[WS] erro:', err.message));
});

console.log('WebSocket servidor rodando em ws://localhost:8080');
