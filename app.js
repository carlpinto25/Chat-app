const express = require('express');
const { createServer } = require('http');
const { Server } = require("socket.io");

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 4000;

// It's good practice to remove the trailing slash from the origin URL.
const clientURL = "https://chat-app-frontend-kappa-black.vercel.app";

const io = new Server(httpServer, {
  cors: {
    origin: clientURL, 
    methods: ["GET", "POST"]
  }
});

let socketsConnected = new Set();

io.on('connection', (socket) => {
  console.log('Socket connected', socket.id);
  socketsConnected.add(socket.id);
  io.emit('clients-total', socketsConnected.size);

  socket.on('disconnect', () => {
    console.log('Socket disconnected', socket.id);
    socketsConnected.delete(socket.id);
    io.emit('clients-total', socketsConnected.size);
  });

  socket.on('message', (data) => {
    socket.broadcast.emit('chat-message', data);
  });

  socket.on('feedback', (data) => {
    socket.broadcast.emit('feedback', data);
  });
});

httpServer.listen(PORT, () => console.log(`💬 server on port ${PORT}`));