import express from "express";
import { config } from "dotenv";
import dbConnection from "./config/dbConnection.js";
import authRouter from "./routes/authRouter.js";
import  userRouter from "./routes/userRouter.js";

import path from 'path';
import { fileURLToPath } from 'url';
import cors from "cors";
import http from "http";
import { Server as SocketIoServer } from 'socket.io';
import SocketHandler from "./libraries/socketHandler.js";
import logger  from "./utils/logger.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
global.ROOT_DIR = path.join(__dirname, '');

const app = express();

config();
dbConnection();
app.use(express.json());
app.use(express.text());
app.use(cors())
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

global.requestEncryptFlag = false;
global.log = logger(process.env.LOG_PREFIX);

const server = http.createServer(app);
const io = new SocketIoServer(server, {
    path: '/chat/',
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST']
    }
});

io.on('connection', async (socket) => {
    global.log.error(`Socket user Connected - ${socket.id}`);
    let validation = await SocketHandler.validateUser(socket.handshake.headers,socket.handshake.auth, true);
    if(!validation.status) {
        global.log.error(`Socket user validation failed - ${JSON.stringify(validation)}`);
        io.emit('custom_connect_error', JSON.stringify({ statusCode: 401 , message: "Unauthrised user."}));
        socket.disconnect();
    }

    if(validation.user) {
       validation.user =  await SocketHandler.updateUserStatus("connected", {_id: validation.user._id, socketID: socket.id}, socket);
    }

    // checking users undelivered messages.
    await SocketHandler.sendUndeliveredMessages(socket, validation?.user);

    // Handle events when a client sends data
    socket.on('chatMessage', async (message) => {
        const socketHandler = new SocketHandler(
            socket,
            message,
            validation.user
        );
        await socketHandler.init();
    });
    
    // Handle disconnection
    socket.on('disconnect', () => {
        SocketHandler.updateUserStatus("disconnected", {_id: validation.user._id,socketID: ''});
        global.log.error(`Socket user disconnected - ${JSON.stringify({_id: validation.user._id,socketID: socket.id })}`);
    });
});

app.use(function(req, res, next) {
    req.BASE_URL = 'http://' + req.headers.host;
    next()
})

// app.use(requestEncryption);


app.use('/api/v1', authRouter);
app.use("/api/v1/user", userRouter);

app.get("/", (req,res, next) => {
    res.send("ChatApp backed is working.");
});


  

let ip ="192.168.233.116";
const port = process.env.PORT || 4000;
server.listen(port, () => {
    global.log.error(`Server is listening on PORT ${port}`);
})