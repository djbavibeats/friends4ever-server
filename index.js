import express, { Router } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()

const PORT = 5000

const app = express()
app.use(cors())
app.use(express.json({ limit: '50mb' }))

app.get('/api', (req, res) => {
    res.json({
        message: 'hi from the server!'
    })
})

app.listen(PORT, () => {
    console.log(`server is up at port ${PORT}`)
})
// import { createServer } from 'node:http'
// import { Server } from 'socket.io'

// const app = express()
// const router = Router()
// router.get('/hello', (req, res) => res.send('hey!'))

// app.use('/api/', router)
// const PORT = process.env.PORT || 5500
// ViteExpress.config({ mode: 'production' })

// app.get("/message", (_, res) => {
//     res.json({ 'message': 'oh shit!' })
// })


// const server = createServer(app)
// const io = new Server(server, {
//     cors: {
//         origin: [ 'http://localhost:5173' ]
//     }
// })
// app.use(cors())

// io.use((socket, next) => {
//     const username = socket.handshake.auth.username
//     if (!username) {
//         return next(new Error('invalid username'))
//     }
//     socket.username = username
//     next()
// })

// io.on('connection', (socket) => {
//     console.log(`connect: ${socket.id}`)

//     const users = []
//     for (let [ id, socket ] of io.of('/').sockets) {
//         users.push({
//             userId: id,
//             username: socket.username
//         })
//     }
//     socket.emit('users', users)
    

//     socket.broadcast.emit('user connected', {
//         userId: socket.id,
//         username: socket.username,
//     })

//     // Uncomment to listen to any event (custom named!)
//     // socket.onAny((event, ...args) => {
//     //     console.log("any " + event)
//     // })

//     socket.on('private message', ({ message, to }) => {
//         socket.to(to).emit('private message', {
//             message,
//             from: socket.id
//         })
//     })

//     socket.on('disconnect', () => {
//         socket.broadcast.emit('user disconnected', socket.id)
//     })
// })

