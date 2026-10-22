const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys')
const pino = require('pino')
const fs = require('fs')

async function Connect() {
  const { state, saveCreds } = await useMultiFileAuthState('./session')
  const { version } = await fetchLatestBaileysVersion()
  
  const sock = makeWASocket({
    version,
    auth: state,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false,
    browser: ["Ubuntu", "Chrome", "20.0.04"]
  })
  
  global.sockInstance = sock

  sock.ev.on('creds.update', saveCreds)
  
  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update
    if(connection === 'open') {
      console.log('✅ KICKBOT CONNECTED')
      global.qrData = "CONNECTED"
      global.pairCode = "CONNECTED"
    }
    if(connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut
      if(shouldReconnect) Connect()
    }
  })

  sock.ev.on('messages.upsert', async ({messages}) => {
    const m = messages[0]
    if(!m.message || m.key.fromMe) return
    const msg = m.message.conversation || m.message.extendedTextMessage?.text || ""
    const from = m.key.remoteJid
    if(!msg.startsWith('.')) return
    
    const args = msg.slice(1).trim().split(/ +/)
    const cmd = args.shift().toLowerCase()
    
    fs.readdirSync('./plugins').forEach(file => {
      if(file.endsWith('.js')) {
        delete require.cache[require.resolve(`./plugins/${file}`)]
        const plugin = require(`./plugins/${file}`)
        if(plugin.command.includes(cmd)) {
          plugin.run(sock, m, from, msg, args)
        }
      }
    })
  })
}

module.exports = Connect
