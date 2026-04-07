const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const cors = require('cors');

const GameManager = require('./backend/GameManager');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.static(path.join(__dirname, 'frontend')));

// Fallback to index.html for frontend routing
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// Initialize Game Manager with Socket.io
const gameManager = new GameManager(io);
gameManager.initialize();

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`\n==========================================`);
    console.log(`E-Game Betting Battle Server Active`);
    console.log(`Listening on http://localhost:${PORT}`);
    console.log(`==========================================\n`);
});
