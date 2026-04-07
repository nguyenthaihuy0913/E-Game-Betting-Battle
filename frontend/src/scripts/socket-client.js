// Auto-connect to Socket.io via the same host
const socket = window.io ? io() : null;

// Unique session ID for MPA player persistence
let pid = sessionStorage.getItem('playerId');
if(!pid) {
    pid = Math.random().toString(36).substring(2, 12);
    sessionStorage.setItem('playerId', pid);
}

window.GameClient = {
    socket: socket,
    playerId: pid,
    playerName: sessionStorage.getItem('playerName') || '',
    roomId: sessionStorage.getItem('roomId') || '',
    isHost: sessionStorage.getItem('isHost') === 'true',
    team: null,
    isLeader: false,
    
    init: function() {
        if (!this.socket) return;
        
        // If we are on a game page and have a roomId, auto re-join
        if (this.roomId && window.location.pathname.includes('/pages/')) {
            if (this.isHost) {
                this.socket.emit('rebind_host', { roomId: this.roomId }, (res) => {
                    if(!res.success) {
                        console.error('Room destroyed or invalid');
                    }
                });
            } else {
                this.socket.emit('join_room', { roomId: this.roomId, playerId: this.playerId, playerName: this.playerName, avatar: sessionStorage.getItem('avatar') || '👻' }, (res) => {
                    if(!res.success) console.error("Failed to rejoin room");
                    else {
                        this.team = res.player.team;
                        this.isLeader = res.player.isLeader;
                    }
                });
            }
        }
    },

    createRoom: function(hostName, callback) {
        this.socket.emit('create_room', { hostName }, (res) => {
            if(res.success) {
                this.roomId = res.roomId;
                this.isHost = true;
                sessionStorage.setItem('roomId', res.roomId);
                sessionStorage.setItem('isHost', 'true');
                if(callback) callback(res.roomId);
            }
        });
    },

    joinRoom: function(roomId, playerName, avatar, callback) {
        this.socket.emit('join_room', { roomId, playerId: this.playerId, playerName, avatar }, (res) => {
            if (res.success) {
                this.roomId = roomId;
                this.playerName = playerName;
                this.team = res.player.team;
                this.isLeader = res.player.isLeader;
                sessionStorage.setItem('roomId', roomId);
                sessionStorage.setItem('playerName', playerName);
                sessionStorage.setItem('avatar', avatar);
                if(callback) callback(true);
            } else {
                if(callback) callback(false, res.error);
            }
        });
    },

    submitBet: function(betAmount) {
        if (this.isLeader) {
            this.socket.emit('player_action', { action: 'SUBMIT_BET', payload: { bet: betAmount } });
        }
    },

    submitAnswer: function(answer) {
        this.socket.emit('player_action', { action: 'SUBMIT_ANSWER', payload: { answer } });
    },

    hostAction: function(action, payload={}) {
        if (this.isHost) {
            this.socket.emit('host_action', { roomId: this.roomId, action, payload });
        }
    }
};

if (socket) {
    socket.on('game_state', (state) => {
        window.dispatchEvent(new CustomEvent('gameStateUpdate', { detail: state }));
    });
    
    socket.on('cheat_alert', (data) => {
        window.dispatchEvent(new CustomEvent('cheatAlert', { detail: data }));
    });
    
    socket.on('timer_sync', (data) => {
        window.dispatchEvent(new CustomEvent('timerSync', { detail: data }));
    });
    
    socket.on('receive_item', () => {
        if (typeof window.ItemSystem !== 'undefined' && window.ItemSystem.simulateDrop) {
            window.ItemSystem.simulateDrop();
        }
    });

    socket.on('connect', () => {
        console.log("Connected to server", socket.id);
        window.GameClient.init();
    });
}
