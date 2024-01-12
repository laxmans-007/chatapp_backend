import {Socket} from "socket.io";
import http from "http";
import express from "express";
import cors from "cors";

export default class SocketLib {
    constructor() {
        this.app = express();
        this.app.use(cors);
        this.server = http.createServer(this.app);
        this.io = new Socket(this.server, {
            cors: {
                origin: 'http://localhost:3000',
                methods: ['GET', 'POST']
            }
        });
    }

    process() {
// Connection event for Socket.IO
        this.io.on('connection', (socket) => {
            console.log('A user connected');
        
            // Handle events specific to this route
            // socket.on('customEvent', (data) => {
            // console.log('Custom event received:', data);
            // // Broadcast the data to all clients in the specific route
            // io.to('/specific-route').emit('customEventResponse', data);
            // });
        
            // // Disconnect event
            // socket.on('disconnect', () => {
            // console.log('User disconnected');
            // });
        });
    }
}