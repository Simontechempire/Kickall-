module.exports = {
  command: ['kickall','kickball','kick'],
  run: async (sock, m, from, text, args) => {
    try {
      if(!from.endsWith('@g.us')) return sock.sendMessage(from, {text: "❌ Group only!"})
      
      const groupMeta = await sock.groupMetadata(from)
      const senderId = m.key.participant || m.key.remoteJid
      const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net'
      
      const isSenderAdmin = groupMeta.participants.find(p=>p.id===senderId)?.admin
      const isBotAdmin = groupMeta.participants.find(p=>p.id===botId || p.id===sock.user.id)?.admin
      
      if(!isSenderAdmin) return sock.sendMessage(from, {text: "❌ You must be admin"})
      if(!isBotAdmin) return sock.sendMessage(from, {text: "❌ Make bot admin first"})

      const mentioned = m.message.extendedTextMessage?.contextInfo?.mentionedJid || []
      
      // If .kick @user - kick mentioned
      if(mentioned.length > 0){
        await sock.groupParticipantsUpdate(from, mentioned, "remove")
        return sock.sendMessage(from, {text: `✅ Kicked ${mentioned.length} user(s)`})
      }

      // If .kickall - kick all
      if(text.includes('kickall') || text.includes('kickball')){
        await sock.sendMessage(from, {text: "💀 Kicking all non-admins..."})
        let count = 0
        for(let p of groupMeta.participants){
          if(!p.admin && p.id !== botId && p.id !== senderId){
            await sock.groupParticipantsUpdate(from, [p.id], "remove")
            count++
            await new Promise(r=>setTimeout(r,1500))
          }
        }
        return sock.sendMessage(from, {text: `✅ Done! Kicked ${count} members`})
      }

    } catch(e){
      sock.sendMessage(from, {text: "Error: "+e.message})
    }
  }
              }
