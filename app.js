const express = require('express');
const path = require('path');
const { createServer } = require('http');
const { Server } = require("socket.io");

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 4000;

const io = new Server(httpServer, {});

// --- THE FIX IS HERE ---
// Define the path to the 'dist' folder created by Astro's build process.
const buildPath = path.join(__dirname, 'dist');

// Tell Express to serve the static files from that 'dist' folder.
app.use(express.static(buildPath));

// For any other request, serve the index.html from inside the 'dist' folder.
app.get('*', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});
// --- END OF FIX ---

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