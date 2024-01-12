import express from 'express';
import http from 'http';
import { Server as SocketIoServer } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new SocketIoServer(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST']
    }
});

// app.get('/chatpanel', (req, res, next) => {
    io.on('connection', (socket) => {
        console.log('A user connected - '+ socket.id);
      
        // Handle events when a client sends data
        socket.on('chat message', (message) => {
          console.log(`Message from client: ${message}`);
          // Broadcast the message to all connected clients
          
          io.emit('chat message', JSON.stringify({ id: socket.id, message}));
        });
      
        // Handle disconnection
        socket.on('disconnect', () => {
          console.log('User disconnected');
        });
      });
      
// });


const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});