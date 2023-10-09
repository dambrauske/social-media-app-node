const express = require('express')
const app = express()
const cors = require('cors')
const router= require('./router/mainRouter')
const mongoose = require('mongoose')
const {createServer} = require("node:http");

require('dotenv').config()

mongoose?.connect(process.env.DB_KEY)
    .then(() => {
        console.log('connection successful')
    }).catch(e => {
    console.log('error', e)
})

app.get('/', (req, res) => {
    res.send('Hello, this is the root path!');
});

const server = createServer(app)

app.use(cors())
app.use(express.json())
app.use('/', router)


const portApp = 8000
const portSocket = 8001

server.listen(portSocket, () => {
    console.log('Socket.IO server running at http://localhost:' + portSocket)
})

app.listen(portApp, () => {
    console.log('Express app running at http://localhost:' + portApp)
})

