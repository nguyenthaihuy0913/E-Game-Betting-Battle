// Host Dashboard Logic

document.addEventListener('DOMContentLoaded', () => {
    
    // Mock Teams Data - Exactly 7 Teams
    const teamsData = [
        { id: 1, name: "Team Alphas", points: 250, rank: 1 },
        { id: 2, name: "Team Bravo", points: 210, rank: 2 },
        { id: 3, name: "Grammar Gods", points: 180, rank: 3 },
        { id: 4, name: "Vocab Victors", points: 150, rank: 4 },
        { id: 5, name: "The Thinkers", points: 120, rank: 5 },
        { id: 6, name: "Summit Stars", points: 90, rank: 6 },
        { id: 7, name: "Last Hope", points: 50, rank: 7 }
    ];

    const leaderboardEl = document.getElementById('leaderboardList');
    
    function renderLeaderboard() {
        leaderboardEl.innerHTML = '';
        teamsData.sort((a,b) => b.points - a.points);
        
        teamsData.forEach((t, index) => {
            let item = document.createElement('div');
            item.className = `hd-team-row rank-${index + 1}`;
            item.innerHTML = `
                <div class="hd-team-info">
                    <div class="hd-team-rank">#${index + 1}</div>
                    <div class="hd-team-name">${t.name}</div>
                </div>
                <div class="hd-team-points">
                    ${t.points} <span style="font-size: 14px; filter: grayscale(1);">🪙</span>
                </div>
            `;
            leaderboardEl.appendChild(item);
        });
    }

    renderLeaderboard();

    // Mock Anticheat Logs
    const mockViolations = [
        { time: "10:24", msg: "<strong>Minh Anh (Team Alphas)</strong> detected switching tabs during question 3." },
        { time: "10:27", msg: "<strong>Khoa Nam (Vocab Victors)</strong> triggered screen blur / snipping tool prevention." },
        { time: "10:31", msg: "<strong>Duc Hai (The Thinkers)</strong> attempted to open Developer Tools." }
    ];

    const logsContainer = document.getElementById('anticheatLogs');
    const emptyMsg = document.getElementById('emptyLogMsg');

    function injectMockLogs() {
        let currentLogs = [];
        
        function addLog(logObj) {
            emptyMsg.style.display = 'none';
            if (window.playError) window.playError(); // play buzz sound on cheat detection
            
            let logEl = document.createElement('div');
            logEl.className = 'hd-log-item';
            logEl.innerHTML = `
                <div class="hd-log-time">${logObj.time}</div>
                <div class="hd-log-msg">${logObj.msg}</div>
            `;
            logsContainer.insertBefore(logEl, logsContainer.firstChild);
        }

        // Add them one by one to simulate live events
        setTimeout(() => addLog(mockViolations[0]), 2000);
        setTimeout(() => addLog(mockViolations[1]), 5500);
        setTimeout(() => addLog(mockViolations[2]), 12000);
    }

    injectMockLogs();
});
