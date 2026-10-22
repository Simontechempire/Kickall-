const express = require('express')
const path = require('path')
const Connect = require('./connection')

global.qrData = ""
const app = express()
const PORT = process.env.PORT || 3000

app.use(express.static(__dirname))
app.get('/qr', (req,res)=> res.json({qr: global.qrData}))
app.get('/', (req,res)=> res.sendFile(path.join(__dirname, 'index.html')))

app.listen(PORT, ()=> {
  console.log(`Server running on port ${PORT}`)
  Connect()
})
