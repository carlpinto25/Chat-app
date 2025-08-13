const express = require('express');
const path = require('path');
const { createServer } = require('http');
const { Server } = require("socket.io");

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 4000;

const io = new Server(httpServer, {});

const buildPath = path.join(__dirname, 'public'); 
app.use(express.static(buildPath));


app.get('*', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
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