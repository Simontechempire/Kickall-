const express = require('express')
const Connect = require('./connection')

global.pairCode = ""
global.sockInstance = null
global.qrData = ""

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/qr', (req,res)=> res.json({pairCode: global.pairCode}))

app.post('/pair', async (req,res)=>{
  try{
    let number = req.body.number.replace(/[^0-9]/g,'')
    if(!number) return res.json({error: "Enter valid number"})
    if(!global.sockInstance) await Connect()
    await new Promise(r=>setTimeout(r,3000))
    let code = await global.sockInstance.requestPairingCode(number)
    global.pairCode = code
    res.json({code: code})
  }catch(e){
    res.json({error: e.message})
  }
})

app.get('/', (req,res)=> {
  res.send(`
<!DOCTYPE html>
<html>
<head><meta name="viewport" content="width=device-width, initial-scale=1"><title>KickBot</title>
<style>body{background:#0a0a0a;color:#fff;font-family:Arial;text-align:center;padding:20px}.card{background:#1a1a1a;padding:25px;border-radius:15px;max-width:400px;margin:30px auto}h2{color:#00ff88}input{width:90%;padding:14px;border-radius:8px;border:none;background:#2a2a2a;color:#fff;font-size:16px;margin:10px 0}button{width:95%;padding:14px;border-radius:8px;border:none;background:#00ff88;color:#000;font-weight:bold;font-size:16px;cursor:pointer}#codeBox{font-size:32px;letter-spacing:4px;background:#000;padding:15px;border-radius:10px;margin:20px 0;color:#00ff88;font-weight:bold;display:none}#status{color:#888;margin-top:15px}</style>
</head>
<body>
<h2>🤖 KICKBOT PAIR</h2>
<div class="card">
<p>Enter Number with Country Code</p>
<input id="number" placeholder="2349123456789" type="text">
<button onclick="generate()">GENERATE PAIR CODE</button>
<div id="codeBox"></div>
<p id="status">Eg: 234... without +</p>
<p style="font-size:11px;color:#555">WhatsApp > Linked Devices > Link with phone number</p>
</div>
<script>
async function generate(){
  let num=document.getElementById('number').value
  if(!num) return alert('Enter number')
  document.getElementById('status').innerHTML='Generating... please wait'
  let res=await fetch('/pair',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({number:num})})
  let data=await res.json()
  if(data.error){document.getElementById('status').innerHTML='Error: '+data.error;return}
  document.getElementById('codeBox').style.display='block'
  document.getElementById('codeBox').innerHTML=data.code
  document.getElementById('status').innerHTML='✅ SUCCESS! Enter this code in WhatsApp'
}
</script>
</body>
</html>
  `)
})

app.listen(PORT, ()=> {
  console.log('Server running on '+PORT)
  Connect()
})
