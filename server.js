const express = require('express');
const http = require('http');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const users = {};

io.on('connection', (socket) => {
    console.log('New user connected:', socket.id);

    // Room join
    socket.on('joinRoom', (data) => {
        const { username, room } = data;
        socket.join(room);
        users[socket.id] = { username, room };

        // Welcome message
        socket.emit('message', {
            username: 'System',
            text: `${username}, welcome to ${room}!`,
            time: new Date().toLocaleTimeString()
        });

        // Doosron ko batao
        socket.to(room).emit('message', {
            username: 'System',
            text: `${username} has joined`,
            time: new Date().toLocaleTimeString()
        });

        // Room users update
        const roomUsers = Object.values(users)
            .filter(u => u.room === room);
        io.to(room).emit('roomUsers', { 
            room, 
            users: roomUsers 
        });
    });

    // Chat message
    socket.on('chatMessage', (data) => {
        io.to(data.room).emit('message', {
            username: data.username,
            text: data.text,
            time: data.time
        });
    });

    // Disconnect
    socket.on('disconnect', () => {
        const user = users[socket.id];
        if (user) {
            io.to(user.room).emit('message', {
                username: 'System',
                text: `${user.username} has left`,
                time: new Date().toLocaleTimeString()
            });
            delete users[socket.id];
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
