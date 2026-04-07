class Room {
    constructor(id, io, hostId) {
        this.id = id;
        this.io = io;
        this.hostId = hostId;
        this.players = new Map(); // playerId -> { socketId, id: playerId, name, team, isLeader, ... }
        this.teams = new Map(); 
        this.state = 'LOBBY'; 
        
        this.round = 1; 
        this.currentQuestionIdx = 0;
        this.timer = null;
        this.stateStartTime = null;
        
        // Config
        this.TOTAL_MCQ = 20;
        this.TOTAL_GAP = 10;
        this.TIME_BET = 15;
        this.TIME_QUESTION = 30;
        this.TIME_FORM = 60; // 1 minute to find team
    }

    addPlayer(socketId, playerId, name, avatar) {
        if (this.state !== 'LOBBY' && !this.players.has(playerId)) return { error: 'Game already started' };
        
        if (this.players.has(playerId)) {
            // Reconnecting an existing player
            const p = this.players.get(playerId);
            p.socketId = socketId;
            p.avatar = avatar || p.avatar; // Update avatar if provided
            p.connected = true;
            this.broadcastState();
            return { success: true, player: p };
        }
        
        // Brand new player
        const player = { socketId: socketId, id: playerId, name: name, avatar: avatar || '👻', team: null, isLeader: false, connected: true };
        this.players.set(playerId, player);
        this.broadcastState();
        return { success: true, player };
    }

    removePlayer(socketId) {
        // Find player by socketId and mark disconnected
        const p = Array.from(this.players.values()).find(p => p.socketId === socketId);
        if (p) {
            p.connected = false;
            // Only strictly delete if in LOBBY. If in game, keep their team slot alive
            if (this.state === 'LOBBY') {
                this.players.delete(p.id);
            }
            this.broadcastState();
        }
    }

    handleHostAction(action, payload) {
        switch(action) {
            case 'START_MATCHMAKING':
                this.assignTeams();
                break;
            case 'FORCE_START_GAME': 
                if(this.timer) clearTimeout(this.timer);
                this.startRound();
                break;
            case 'NEXT_QUESTION':
                this.nextQuestion();
                break;
        }
    }

    handlePlayerAction(socketId, action, payload) {
        const player = Array.from(this.players.values()).find(p => p.socketId === socketId);
        if (!player) return;

        switch (action) {
            case 'SUBMIT_BET':
                if (this.state === 'BETTING' && player.isLeader) {
                    const team = this.teams.get(player.team);
                    if (team && !team.hasBet) {
                        team.currentBet = Math.min(payload.bet, team.score); // validate
                        team.hasBet = true;
                        this.broadcastState();
                        this.checkAllBetsIn();
                    }
                }
                break;
            
            case 'SUBMIT_ANSWER':
                if (this.state === 'QUESTION') {
                    const team = this.teams.get(player.team);
                    if (team && !team.hasAnswered) {
                        team.hasAnswered = true;
                        team.timeTaken = Date.now() - this.stateStartTime;
                        team.lastAnswer = payload.answer;
                        
                        // Notify teammates that someone answered
                        team.members.forEach(m => {
                            if(m.id !== player.id) {
                                this.io.to(m.socketId).emit('team_answered', { submittor: player.name });
                            }
                        });

                        this.broadcastState();
                        this.checkAllAnswersIn();
                    }
                }
                break;

            case 'CHEAT_ALERT':
                this.io.to(this.hostId).emit('cheat_alert', {
                    playerName: player.name,
                    team: player.team,
                    reason: payload.reason,
                    time: Date.now()
                });
                break;
            
            case 'USE_ITEM': // Pass to item system mock
                const teamItem = this.teams.get(player.team);
                this.io.to(this.id).emit('item_used', { team: player.team, item: payload.item, target: payload.target });
                break;
        }
    }

    assignTeams() {
        const pArray = Array.from(this.players.values());
        pArray.sort(() => Math.random() - 0.5);

        const NUM_TEAMS = Math.min(7, Math.max(2, pArray.length || 2)); 
        
        for (let i = 1; i <= NUM_TEAMS; i++) {
            this.teams.set(i, { 
                id: i, 
                score: 50, 
                currentBet: 0, 
                hasBet: false, 
                hasAnswered: false, 
                timeTaken: 0, 
                lastAnswer: null,
                members: []
            });
        }

        pArray.forEach((p, idx) => {
            const teamNum = (idx % NUM_TEAMS) + 1;
            p.team = teamNum;
            this.teams.get(teamNum).members.push(p);
        });

        this.teams.forEach(t => {
            if (t.members.length > 0) {
                const leaderIdx = Math.floor(Math.random() * t.members.length);
                t.members[leaderIdx].isLeader = true;
            }
        });

        this.state = 'TEAM_FORMATION';
        this.broadcastState();

        this.startTimer(this.TIME_FORM, () => this.startRound());
    }

    startRound() {
        this.teams.forEach(t => {
            t.hasAnswered = false;
            t.timeTaken = 0;
            t.lastAnswer = null;
            t.hasBet = false;
            t.currentBet = 0;
        });

        this.state = 'BETTING';
        this.broadcastState();
        
        this.startTimer(this.TIME_BET, () => {
            this.teams.forEach(t => {
                if(!t.hasBet) {
                    t.currentBet = t.score; 
                    t.hasBet = true;
                }
            });
            this.startQuestion();
        });
    }

    checkAllBetsIn() {
        let allIn = true;
        this.teams.forEach(t => { if(t.members.length > 0 && !t.hasBet) allIn = false; });
        if(allIn) {
            clearTimeout(this.timer);
            this.startQuestion();
        }
    }

    startQuestion() {
        this.state = 'QUESTION';
        this.stateStartTime = Date.now();
        this.broadcastState();
        
        this.startTimer(this.TIME_QUESTION, () => {
            this.evaluateRound();
        });
    }

    checkAllAnswersIn() {
        let allIn = true;
        this.teams.forEach(t => { if(t.members.length > 0 && !t.hasAnswered) allIn = false; });
        if(allIn) {
            clearTimeout(this.timer);
            this.evaluateRound();
        }
    }

    evaluateRound() {
        this.state = 'ROUND_RESULT';
        // Hệ số nhân điểm theo rank: 1->7
        const multipliers = [2.0, 1.8, 1.6, 1.5, 1.4, 1.3, 1.2];
        
        // Mặc định đang gán cứng là A, bạn cần thay logic đọc đáp án thật từ DB sau nha!
        const correctAnswer = "A"; 
        
        const activeTeams = Array.from(this.teams.values()).filter(t => t.members.length > 0);
        
        // Lọc ra các đội ĐÃ TRẢ LỜI và TRẢ LỜI ĐÚNG
        const answeringTeams = activeTeams.filter(t => t.hasAnswered && (t.lastAnswer === correctAnswer || t.lastAnswer === "mock_correct"));
        
        // Xếp hạng tốc độ (Ai có timeTaken nhỏ hơn tức là nhanh hơn -> đứng đầu mảng)
        answeringTeams.sort((a,b) => a.timeTaken - b.timeTaken);

        answeringTeams.forEach((t, idx) => {
            // Lấy hệ số nhân dựa trên thứ hạng
            const multi = multipliers[Math.min(idx, multipliers.length - 1)];
            
            // Công thức: Điểm cược * Hệ số -> Cộng thẳng vào điểm của đội
            const bonus = Math.floor(t.currentBet * multi);
            t.score += bonus; 
            
            // Thả item cho đội
            t.members.forEach(m => {
               if(m.socketId) this.io.to(m.socketId).emit('receive_item')
            });
        });

        // Nếu trả lời SAI -> Giữ nguyên điểm (không cộng, không trừ) theo đúng luật!

        this.broadcastState();
        
        // Dừng 5 giây ở màn hình kết quả để học sinh nghỉ ngơi & xem điểm, sau đó tự nhảy câu mới
        this.startTimer(5, () => this.nextQuestion());
    }

    nextQuestion() {
        this.currentQuestionIdx++;
        
        const totalQ = this.round === 1 ? this.TOTAL_MCQ : this.TOTAL_GAP;
        
        if (this.currentQuestionIdx >= totalQ) {
           if (this.round === 1) {
               this.round = 2;
               this.currentQuestionIdx = 0;
               this.state = 'ROUND_TRANSITION';
               this.broadcastState();
           } else {
               this.state = 'ENDGAME';
               this.broadcastState();
           }
        } else {
           this.startRound();
        }
    }

    startTimer(seconds, callback) {
        if(this.timer) clearTimeout(this.timer);
        this.io.to(this.id).emit('timer_sync', { seconds, phase: this.state });
        this.timer = setTimeout(callback, seconds * 1000);
    }

    broadcastState() {
        const statePayload = {
            state: this.state,
            players: Array.from(this.players.values()),
            teams: Array.from(this.teams.values()).map(t => {
                // omit full members object to save bandwidth, just count and leader
                return {
                    id: t.id,
                    score: t.score,
                    currentBet: t.currentBet,
                    hasBet: t.hasBet,
                    hasAnswered: t.hasAnswered,
                    memberCount: t.members.length,
                    leaderId: t.members.find(m => m.isLeader)?.id,
                    lastAnswer: this.state === 'ROUND_RESULT' ? t.lastAnswer : null // hide during question
                };
            }),
            round: this.round,
            currentQuestionIdx: this.currentQuestionIdx,
            hostId: this.hostId
        };
        this.io.to(this.id).emit('game_state', statePayload);
    }
}
module.exports = Room;