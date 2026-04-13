class Room {
    constructor(id, io, hostId) {
        this.id = id;
        this.io = io;
        this.hostId = hostId;
        this.players = new Map();
        this.teams = new Map();
        this.state = 'LOBBY';

        this.round = 1;
        this.currentQuestionIdx = 0;
        this.timer = null;
        this.stateStartTime = null;

        this.TOTAL_MCQ = 20;
        this.TOTAL_GAP = 10;
        this.TIME_BET = 15;
        this.TIME_QUESTION = 30;
        this.TIME_FORM = 60;
    }

    addPlayer(socketId, playerId, name, avatar) {
        if (this.state !== 'LOBBY' && !this.players.has(playerId)) return { error: 'Game already started' };

        if (this.players.has(playerId)) {
            const p = this.players.get(playerId);
            p.socketId = socketId;
            p.avatar = avatar || p.avatar;
            p.connected = true;
            this.broadcastState();
            return { success: true, player: p };
        }

        const player = { socketId: socketId, id: playerId, name: name, avatar: avatar || '👻', team: null, isLeader: false, connected: true };
        this.players.set(playerId, player);
        this.broadcastState();
        return { success: true, player };
    }

    removePlayer(socketId) {
        const p = Array.from(this.players.values()).find(p => p.socketId === socketId);
        if (p) {
            p.connected = false;
            if (this.state === 'LOBBY') {
                this.players.delete(p.id);
            }
            this.broadcastState();
        }
    }

    handleHostAction(action, payload) {
        switch (action) {
            case 'START_MATCHMAKING': this.assignTeams(); break;
            case 'FORCE_START_GAME':
                if (this.timer) clearTimeout(this.timer);
                this.startRound();
                break;
            case 'NEXT_QUESTION': this.nextQuestion(); break;
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
                        // FIX TẠI ĐÂY: Hỗ trợ bắt chuẩn số tiền cược từ Client gửi lên
                        let rawBet = (payload && payload.bet !== undefined) ? payload.bet : payload;
                        const betAmount = parseInt(rawBet, 10);

                        team.currentBet = Math.min(isNaN(betAmount) ? 0 : betAmount, team.score);
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

                        team.members.forEach(m => {
                            if (m.id !== player.id) {
                                this.io.to(m.socketId).emit('team_answered', { submittor: player.name });
                            }
                        });
                        this.broadcastState();
                        this.checkAllAnswersIn();
                    }
                }
                break;

            case 'CHEAT_ALERT':
                this.io.to(this.id).emit('cheat_alert', {
                    playerName: player.name,
                    team: player.team,
                    reason: payload.reason,
                    time: Date.now()
                });
                break;

            case 'USE_ITEM': {
                const userTeam = this.teams.get(player.team);
                let targetTeam = this.teams.get(payload.target);
                const targetedItems = ['thief', 'snipper', 'bomb', 'freeze', 'blur', 'brokenkeyboard', 'shuffle', 'faketypo'];

                if (targetTeam && targetedItems.includes(payload.item)) {
                    if (targetTeam.hasShield) {
                        targetTeam.hasShield = false;
                        this.io.to(this.id).emit('item_used', { team: player.team, item: payload.item, target: payload.target, blocked: true });
                        return; // Blocks execution
                    } else if (payload.item === 'snipper' && targetTeam.hasBetlock) {
                        this.io.to(this.id).emit('item_used', { team: player.team, item: payload.item, target: payload.target, blocked: true });
                        return; // Blocks execution
                    } else if (payload.item === 'bomb' && targetTeam.hasSafetynet) {
                        this.io.to(this.id).emit('item_used', { team: player.team, item: payload.item, target: payload.target, blocked: true });
                        return; // Blocks execution
                    } else if (targetTeam.hasMirror) {
                        targetTeam.hasMirror = false;
                        this.io.to(this.id).emit('item_used', { team: player.team, item: payload.item, originalTarget: payload.target, target: userTeam.id, reflected: true });
                        targetTeam = userTeam;
                        payload.target = userTeam.id;
                    }
                }

                switch (payload.item) {
                    case 'thief':
                        if (targetTeam && userTeam) {
                            targetTeam.score = Math.max(0, targetTeam.score - 15);
                            userTeam.score += 15;
                        }
                        break;
                    case 'tax':
                        let taxTop = Array.from(this.teams.values()).sort((a, b) => b.score - a.score)[0];
                        if (taxTop) taxTop.score -= Math.floor(taxTop.score * 0.1);
                        break;
                    case 'snipper':
                        if (targetTeam && !targetTeam.hasBetlock) targetTeam.currentBet = Math.floor(targetTeam.currentBet / 2);
                        break;
                    case 'bomb':
                        if (targetTeam) targetTeam.doubleJeopardy = true;
                        break;
                    case 'robinhood':
                        let rSorted = Array.from(this.teams.values()).filter(t => t.members.length > 0).sort((a, b) => b.score - a.score);
                        if (rSorted.length > 1) {
                            let top = rSorted[0];
                            let bottom = rSorted[rSorted.length - 1];
                            if (top !== bottom) {
                                let amount = Math.min(10, top.score);
                                top.score -= amount;
                                bottom.score += amount;
                            }
                        }
                        break;
                    case 'shield':
                        if (userTeam) userTeam.hasShield = true;
                        break;
                    case 'mirror':
                        if (userTeam) userTeam.hasMirror = true;
                        break;
                    case 'safetynet':
                        if (userTeam) userTeam.hasSafetynet = true;
                        break;
                    case 'betlock':
                        if (userTeam) userTeam.hasBetlock = true;
                        break;
                    case 'aura':
                        if (userTeam) userTeam.hasAura = true;
                        break;
                    case 'speedboots':
                        if (userTeam) userTeam.hasSpeedboots = true;
                        break;
                    case 'multiplier':
                        if (userTeam) userTeam.hasMultiplier = true;
                        break;
                    case 'uprising':
                        if (userTeam) {
                            let uSorted = Array.from(this.teams.values()).filter(t => t.members.length > 0).sort((a, b) => b.score - a.score);
                            let userRank = uSorted.findIndex(t => t.id === userTeam.id);
                            uSorted.forEach((t, idx) => {
                                if (idx < userRank) {
                                    let drain = Math.min(3, t.score);
                                    t.score = Math.max(0, t.score - drain);
                                    userTeam.score += drain;
                                }
                            });
                        }
                        break;
                }

                this.broadcastState();

                // Emit standard (reflected/blocked handled early)
                this.io.to(this.id).emit('item_used', { team: player.team, item: payload.item, target: payload.target });
                break;
            }
        }
    }

    assignTeams() {
        const pArray = Array.from(this.players.values());
        pArray.sort(() => Math.random() - 0.5);
        const NUM_TEAMS = Math.min(7, Math.max(2, pArray.length || 2));

        for (let i = 1; i <= NUM_TEAMS; i++) {
            this.teams.set(i, {
                id: i, score: 50, currentBet: 0, hasBet: false, hasAnswered: false, timeTaken: 0, lastAnswer: null, members: [],
                hasShield: false, hasMirror: false, doubleJeopardy: false,
                hasSafetynet: false, hasBetlock: false, hasAura: false, hasSpeedboots: false, hasMultiplier: false,
                isUndying: false
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
            t.hasAnswered = false; t.timeTaken = 0; t.lastAnswer = null; t.hasBet = false; t.currentBet = 0;
            t.hasShield = false; t.doubleJeopardy = false; t.hasMirror = false;
            t.hasSafetynet = false; t.hasBetlock = false; t.hasAura = false; t.hasSpeedboots = false; t.hasMultiplier = false;
            if (t.isUndying) {
                t.hasBet = true; // Lock betting!
                t.currentBet = 0;
            }
        });
        this.state = 'BETTING';
        this.broadcastState();
        this.startTimer(this.TIME_BET, () => {
            this.teams.forEach(t => {
                if (!t.hasBet) { t.currentBet = t.score; t.hasBet = true; }
            });
            this.startQuestion();
        });
    }

    checkAllBetsIn() {
        let allIn = true;
        this.teams.forEach(t => { if (t.members.length > 0 && !t.hasBet) allIn = false; });
        if (allIn) { clearTimeout(this.timer); this.startQuestion(); }
    }

    startQuestion() {
        this.state = 'QUESTION';
        this.stateStartTime = Date.now();
        this.broadcastState();
        this.startTimer(this.TIME_QUESTION, () => { this.evaluateRound(); });
    }

    checkAllAnswersIn() {
        let allIn = true;
        this.teams.forEach(t => { if (t.members.length > 0 && !t.hasAnswered) allIn = false; });
        if (allIn) { clearTimeout(this.timer); this.evaluateRound(); }
    }

    evaluateRound() {
        this.state = 'ROUND_RESULT';
        const multipliers = [2.0, 1.8, 1.6, 1.5, 1.4, 1.3, 1.2];

        // --- FIX ĐỌC ĐÁP ÁN JSON TẠI ĐÂY ---
        let correctAnswerText = "mock_correct";
        try {
            const data = require('../frontend/src/data/questions.json');
            if (this.round === 1) {
                // Dùng đúng key multiple_choice theo JSON của bạn
                const q = data.multiple_choice[this.currentQuestionIdx];
                // Cắt bỏ "A. " ở đầu để lấy text thuần so sánh
                correctAnswerText = q.correct_answer_text.replace(/^[A-D][.\s]+/, '').trim().toLowerCase();
            } else {
                // Dùng đúng key gap_fill theo JSON của bạn
                const q = data.gap_fill[this.currentQuestionIdx];
                correctAnswerText = q.correct_answer.trim().toLowerCase();
            }
        } catch (e) {
            console.error("Lỗi đọc JSON đáp án:", e.message);
        }

        const activeTeams = Array.from(this.teams.values()).filter(t => t.members.length > 0);

        const correctTeams = [];
        const wrongTeams = [];
        activeTeams.forEach(t => {
            if (!t.hasAnswered || !t.lastAnswer) {
                wrongTeams.push(t);
                return;
            }
            const submitted = t.lastAnswer.trim().toLowerCase();
            if (submitted === correctAnswerText || submitted === "mock_correct") {
                correctTeams.push(t);
            } else {
                wrongTeams.push(t);
            }
        });

        // Apply SpeedBoots to modify effective time Taken
        correctTeams.forEach(t => {
            if (t.hasSpeedboots) {
                t.effectiveTime = Math.max(0, t.timeTaken - 3000);
            } else {
                t.effectiveTime = t.timeTaken;
            }
        });

        correctTeams.sort((a, b) => a.effectiveTime - b.effectiveTime);

        correctTeams.forEach((t, idx) => {
            const multi = multipliers[Math.min(idx, multipliers.length - 1)];
            let bonus = Math.floor(t.currentBet * multi);
            if (t.hasMultiplier) bonus *= 2;
            t.score += bonus;

            if (t.isUndying) t.isUndying = false; // Lift curse!

            t.members.forEach(m => { if (m.socketId) this.io.to(m.socketId).emit('receive_item') });
        });

        // Take snapshot of score before deducting penalty
        const PREVIOUS_SCORES = new Map();
        activeTeams.forEach(t => PREVIOUS_SCORES.set(t.id, t.score));

        wrongTeams.forEach(t => {
            let penalty = t.currentBet;
            if (t.doubleJeopardy && !t.hasSafetynet) {
                penalty *= 2;
            }
            if (!t.isUndying) { // Only deduct if not undying
                t.score = Math.max(0, t.score - penalty);
            }
        });

        // Evaluate Totem
        activeTeams.forEach(t => {
            if (t.score <= 10 && !t.isUndying) {
                t.isUndying = true;
                t.score = 10;
                t.members.forEach(m => {
                    if (m.socketId) this.io.to(m.socketId).emit('totem_activated');
                });
            }
        });

        this.broadcastState();
        this.startTimer(5, () => this.nextQuestion()); // Chờ 5s xem kết quả rồi nhảy câu
    }

    nextQuestion() {
        this.currentQuestionIdx++;
        const totalQ = this.round === 1 ? this.TOTAL_MCQ : this.TOTAL_GAP;

        if (this.currentQuestionIdx >= totalQ) {
            if (this.round === 1) {
                // Chuyển sang Round 2 (Gap Fill)
                this.round = 2;
                this.currentQuestionIdx = 0;
                this.state = 'ROUND_TRANSITION';
                this.broadcastState();

                // Đợi 3 giây để giao diện người chơi kịp chuyển trang, sau đó bắt đầu cược Round 2
                setTimeout(() => {
                    this.startRound();
                }, 3000);

            } else {
                // Kết thúc toàn bộ game
                this.state = 'ENDGAME';
                this.broadcastState();
            }
        } else {
            // Tiếp tục câu tiếp theo trong cùng Round
            this.startRound();
        }
    }

    startTimer(seconds, callback) {
        if (this.timer) clearTimeout(this.timer);
        this.io.to(this.id).emit('timer_sync', { seconds, phase: this.state });
        this.timer = setTimeout(callback, seconds * 1000);
    }

    broadcastState() {
        const statePayload = {
            state: this.state,
            players: Array.from(this.players.values()),
            teams: Array.from(this.teams.values()).map(t => {
                return {
                    id: t.id, score: t.score, currentBet: t.currentBet, hasBet: t.hasBet,
                    hasAnswered: t.hasAnswered, memberCount: t.members.length,
                    leaderId: t.members.find(m => m.isLeader)?.id,
                    lastAnswer: this.state === 'ROUND_RESULT' ? t.lastAnswer : null,
                    hasAura: t.hasAura,
                    isUndying: t.isUndying
                };
            }),
            round: this.round, currentQuestionIdx: this.currentQuestionIdx, hostId: this.hostId
        };
        this.io.to(this.id).emit('game_state', statePayload);
    }
}
module.exports = Room;