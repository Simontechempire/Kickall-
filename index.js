const express = require('express')
const path = require('path')
const Connect = require('./connection')

global.pairCode = ""
global.sockInstance = null
global.qrData = ""

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname)))

app.get('/', (req,res)=> {
  res.sendFile(path.join(__dirname, 'index.html'))
})

app.get('/qr', (req,res)=> res.json({qr: global.qrData, pairCode: global.pairCode}))

app.post('/pair', async (req,res)=>{
  try{
    let number = req.body.number.replace(/[^0-9]/g,'')
    if(!number) return res.json({error: "Enter valid number"})
    
    if(!global.sockInstance) await Connect()
    
    // Wait 2 sec for socket
    await new Promise(r=>setTimeout(r,2000))
    
    let code = await global.sockInstance.requestPairingCode(number)
    global.pairCode = code
    res.json({code: code})
  }catch(e){
    res.json({error: e.message})
  }
})

app.listen(PORT, ()=> {
  console.log(`Server running on ${PORT}`)
  Connect()
})
