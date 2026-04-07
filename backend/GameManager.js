const Room = require('./Room');

class GameManager {
    constructor(io) {
        this.io = io;
        this.rooms = new Map();
    }

    initialize() {
        this.io.on('connection', (socket) => {
            console.log(`[Socket] Connected: ${socket.id}`);

            socket.on('create_room', (data, callback) => {
                const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
                let roomId = '';
                for(let i=0; i<6; i++) roomId += chars[Math.floor(Math.random() * chars.length)];
                const newRoom = new Room(roomId, this.io, socket.id);
                this.rooms.set(roomId, newRoom);
                socket.join(roomId);
                
                console.log(`[Room] Created: ${roomId} by Host ${socket.id}`);
                callback({ success: true, roomId });
            });
            
            socket.on('rebind_host', (data, callback) => {
                const room = this.rooms.get(data.roomId);
                if (room) {
                    room.hostId = socket.id;
                    room.hostConnected = true;
                    socket.join(data.roomId);
                    callback({success: true});
                    room.broadcastState();
                } else {
                    callback({success: false, error: 'Room destroyed'});
                }
            });

            socket.on('join_room', (data, callback) => {
                const { roomId, playerId, playerName, avatar } = data;
                const room = this.rooms.get(roomId);
                if (!room) {
                    return callback({ success: false, error: 'Room not found or disconnected' });
                }
                
                const res = room.addPlayer(socket.id, playerId, playerName, avatar);
                if(res && res.success) {
                    socket.join(roomId);
                }
                callback(res);
            });

            socket.on('host_action', (data) => {
                const room = this.rooms.get(data.roomId);
                if (room && room.hostId === socket.id) {
                    room.handleHostAction(data.action, data.payload);
                }
            });
            
            socket.on('player_action', (data) => {
                const room = Array.from(this.rooms.values()).find(r => r.players.has(socket.id));
                if (room) {
                    room.handlePlayerAction(socket.id, data.action, data.payload);
                }
            });

            socket.on('disconnect', () => {
                console.log(`[Socket] Disconnected: ${socket.id}`);
                const roomArray = Array.from(this.rooms.values());
                const playerRoom = roomArray.find(r => Array.from(r.players.values()).some(p => p.socketId === socket.id));
                if (playerRoom) {
                    playerRoom.removePlayer(socket.id);
                }

                this.rooms.forEach(room => {
                    if (room.hostId === socket.id) {
                        room.hostConnected = false;
                        setTimeout(() => {
                            if (!room.hostConnected) {
                                console.log(`[Room] Destroyed (Host left): ${room.id}`);
                                this.io.to(room.id).emit('room_closed');
                                this.rooms.delete(room.id);
                            }
                        }, 5000); // 5 sec grace period for MPA navigation
                    }
                });
            });
        });
    }
}
module.exports = GameManager;
