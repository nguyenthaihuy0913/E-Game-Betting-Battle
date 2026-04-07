document.addEventListener('DOMContentLoaded', () => {
    let previousState = '';

    window.addEventListener('gameStateUpdate', (e) => {
        const state = e.detail;
        if (previousState !== state.state) {
            if (state.state === 'ROUND_RESULT') {
                if (typeof window.playSuccess === 'function') window.playSuccess();
                const leaderboardCard = document.querySelector('.card.ch');
                if (leaderboardCard) {
                    leaderboardCard.style.transition = "box-shadow 0.3s ease-out, transform 0.2s";
                    leaderboardCard.style.transform = "scale(1.01)";
                    leaderboardCard.style.boxShadow = "0 0 50px rgba(251, 191, 36, 0.6), inset 0 0 20px rgba(251, 191, 36, 0.2)";
                    setTimeout(() => {
                        leaderboardCard.style.transform = "scale(1)";
                        leaderboardCard.style.boxShadow = "none";
                    }, 1000);
                }
            } 
            else if (state.state === 'BETTING' || state.state === 'QUESTION') {
                if (typeof window.playClick === 'function') window.playClick();
            }
            previousState = state.state;
        }
    });

    window.addEventListener('cheatAlert', (e) => {
        const alert = e.detail;
        if (typeof window.playError === 'function') window.playError();
        
        // 1. IN LOG CHỮ RA MÀN HÌNH
        const logBox = document.getElementById('anticheatLogs');
        const emptyMsg = document.getElementById('emptyLogMsg');
        if(emptyMsg) emptyMsg.style.display = 'none';
        
        const li = document.createElement('div');
        li.className = 'hd-log-item';
        const time = new Date(alert.time).toLocaleTimeString();
        li.innerHTML = `
          <div class="hd-log-time">${time}</div>
          <div class="hd-log-msg"><strong>${alert.playerName}</strong> (Team ${alert.team}): <span style="color:#E63946">${alert.reason}</span></div>
        `;
        logBox.prepend(li);
        
        // 2. HIỆU ỨNG RUNG LẮC + NHÁY ĐỎ
        const anticheatCard = document.querySelector('.hd-right .card.cj');
        if (anticheatCard) {
            anticheatCard.style.transition = "all 0.1s ease-in-out";
            anticheatCard.style.transform = "scale(1.03) rotate(1deg)";
            anticheatCard.style.boxShadow = "0 0 60px rgba(230, 57, 70, 0.9), inset 0 0 30px rgba(230, 57, 70, 0.5)";
            anticheatCard.style.border = "2px solid #E63946";
            
            setTimeout(() => { anticheatCard.style.transform = "scale(1.03) rotate(-1deg)"; }, 50);
            setTimeout(() => { anticheatCard.style.transform = "scale(1.03) rotate(1deg)"; }, 100);
            setTimeout(() => { anticheatCard.style.transform = "scale(1.03) rotate(-1deg)"; }, 150);

            setTimeout(() => {
                anticheatCard.style.transform = "scale(1) rotate(0)";
                anticheatCard.style.boxShadow = "none";
                anticheatCard.style.border = "none";
            }, 500);
        }
    });
});