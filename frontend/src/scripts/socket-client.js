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

    useItem: function(itemId, targetTeamId) {
        this.socket.emit('player_action', { action: 'USE_ITEM', payload: { item: itemId, target: targetTeamId } });
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
    
    socket.on('item_used', (data) => {
        if (typeof window.ItemSystem !== 'undefined' && window.ItemSystem.receiveItemEffect) {
            window.ItemSystem.receiveItemEffect(data);
        }
    });
    
    socket.on('receive_item', () => {
        if (typeof window.ItemSystem !== 'undefined' && window.ItemSystem.simulateDrop) {
            window.ItemSystem.simulateDrop();
        }
    });

    socket.on('team_answered', (data) => {
        window.dispatchEvent(new CustomEvent('teamAnswered', { detail: data }));
    });
    
    socket.on('totem_activated', () => {
        const audio = new Audio('../../assets/Totem_of_Undying.mp3');
        audio.play().catch(e => console.log('Audio play failed', e));

        const img = document.createElement('img');
        img.src = '../../assets/Totem_of_Undying.png';
        img.style.position = 'fixed';
        img.style.top = '50%';
        img.style.left = '50%';
        img.style.transform = 'translate(-50%, -50%) scale(0.1)';
        img.style.zIndex = '99999';
        img.style.transition = 'transform 1s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 1s linear 2s';
        img.style.width = '300px';
        img.style.filter = 'drop-shadow(0 0 50px rgba(234, 179, 8, 0.8))';
        document.body.appendChild(img);
        
        // Minecraft Particles Effect
        for (let i = 0; i < 40; i++) {
            const p = document.createElement('div');
            p.style.position = 'fixed';
            p.style.top = '50%';
            p.style.left = '50%';
            // Minecraft totem particles are small greenish-yellow squares
            p.style.width = Math.random() * 8 + 4 + 'px';
            p.style.height = p.style.width;
            p.style.backgroundColor = Math.random() > 0.5 ? '#a3e635' : '#facc15';
            p.style.zIndex = '99998';
            p.style.pointerEvents = 'none';
            p.style.opacity = '1';
            p.style.transition = 'transform 1.5s ease-out, opacity 1.5s ease-out';
            
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 200 + 100;
            const tx = Math.cos(angle) * distance;
            const ty = Math.sin(angle) * distance - 50; // slightly upward
            
            p.style.transform = `translate(-50%, -50%)`;
            document.body.appendChild(p);

            // Trigger reflow & animate
            setTimeout(() => {
                p.style.transform = `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) rotate(${Math.random()*360}deg)`;
                p.style.opacity = '0';
            }, 50);
            
            setTimeout(() => p.remove(), 1600);
        }

        // Trigger reflow for main totem
        img.offsetHeight;
        img.style.transform = 'translate(-50%, -50%) scale(1.5)';
        
        // Add screen shake
        document.body.style.animation = 'pulse 0.5s infinite';
        setTimeout(() => document.body.style.animation = '', 1000);

        setTimeout(() => { img.style.opacity = '0'; }, 3000);
        setTimeout(() => { img.remove(); }, 4000);
    });

    socket.on('connect', () => {
        console.log("Connected to server", socket.id);
        window.GameClient.init();
    });
}
