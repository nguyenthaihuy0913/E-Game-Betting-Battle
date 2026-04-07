// Anti-cheat functionality

document.addEventListener('DOMContentLoaded', () => {
    // 1. NGĂN COPY, CẮT, PASTE, CHUỘT PHẢI
    document.addEventListener('contextmenu', e => {
        e.preventDefault();
    });

    document.addEventListener('copy', e => {
        e.preventDefault();
        showAntiCheatWarning("Copying content is not allowed!");
    });

    document.addEventListener('cut', e => {
        e.preventDefault();
        showAntiCheatWarning("Cutting content is not allowed!");
    });

    // Ngăn bôi đen bằng JS bên cạnh CSS
    document.addEventListener('selectstart', e => {
        // Chỉ cho phép bôi đen trong các thẻ input
        const target = e.target;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
            e.preventDefault();
        }
    });

    // 2. NGĂN MỞ DEVELOPER TOOLS (F12, Ctrl+Shift+I, v.v...)
    document.addEventListener('keydown', (e) => {
        if (
            e.key === 'F12' ||
            (e.ctrlKey && e.shiftKey && e.key === 'I') ||
            (e.ctrlKey && e.shiftKey && e.key === 'J') ||
            (e.ctrlKey && e.shiftKey && e.key === 'C') ||
            (e.ctrlKey && e.key === 'U')
        ) {
            e.preventDefault();
            showAntiCheatWarning("Warning: Opening Developer Tools is not allowed!");
        }
    });

    // 3. PHÁT HIỆN CHUYỂN TAB HOẶC RỜI MÀN HÌNH (MEME ĐỘ MIXI TROLL)
    const isTestInterface = window.location.pathname.includes('play-');
    let hasTabCheated = false; // Cờ theo dõi hành vi chuyển tab

    if (isTestInterface) {
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                // Người chơi vừa chuyển tab hoặc thu nhỏ trình duyệt để tra Google
                document.body.classList.add('blurred-screen');
                hasTabCheated = true; // Đánh dấu tội trạng
                
                // Gửi báo cáo ngầm lên Host ngay lập tức
                if (window.GameClient && window.GameClient.socket) {
                    window.GameClient.socket.emit('player_action', { action: 'CHEAT_ALERT', payload: { reason: "Tab switching or leaving the screen detected!" } });
                }
            } else {
                // KHÚC NÀY LÀ LÚC NGƯỜI CHƠI QUAY LẠI TAB GAME
                document.body.classList.remove('blurred-screen');
                if (hasTabCheated) {
                    // Kích hoạt Meme trừng phạt
                    showTrollModal();
                    hasTabCheated = false; // Reset lại cờ sau khi đã dọa xong
                }
            }
        });

        window.addEventListener('blur', () => {
            document.body.classList.add('blurred-screen');
        });

        window.addEventListener('focus', () => {
            document.body.classList.remove('blurred-screen');
        });
    }

    // Modal chức năng cảnh báo mặc định (Dành cho F12, Copy Paste...)
    function showAntiCheatWarning(message) {
        if (window.GameClient && window.GameClient.socket) {
            window.GameClient.socket.emit('player_action', { action: 'CHEAT_ALERT', payload: { reason: message } });
        }
        
        let modal = document.getElementById('anticheat-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'anticheat-modal';
            modal.style.cssText = "position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.85); z-index: 999999; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(5px);";
            modal.innerHTML = `
                <div style="background: white; padding: 30px; border-radius: 20px; text-align: center; max-width: 450px; box-shadow: 0 10px 40px rgba(0,0,0,0.5); font-family: 'Nunito', sans-serif; margin: 0 20px;">
                    <div style="font-size: 50px; margin-bottom: 10px; animation: anticheat-shake 0.5s ease-in-out;">🚨</div>
                    <h2 style="color: #E63946; font-family: 'Fredoka One', cursive; margin-bottom: 15px; font-size: 28px;">CHEATING DETECTED</h2>
                    <p id="anticheat-msg" style="font-size: 16px; color: #444; margin-bottom: 25px; line-height: 1.5; font-weight: 600;">${message}</p>
                    <button id="anticheat-btn" style="background: linear-gradient(135deg, #E63946, #D90429); color: white; border: none; padding: 12px 30px; border-radius: 12px; font-family: 'Fredoka One', cursive; font-size: 16px; letter-spacing: 0.5px; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; box-shadow: 0 4px 15px rgba(230, 57, 70, 0.4);">
                        I Understand
                    </button>
                </div>
            `;
            document.body.appendChild(modal);

            document.getElementById('anticheat-btn').addEventListener('click', () => {
                modal.style.display = 'none';
            });
            
            let btn = document.getElementById('anticheat-btn');
            btn.onmouseover = () => { btn.style.transform = "translateY(-2px)"; btn.style.boxShadow = "0 6px 20px rgba(230, 57, 70, 0.5)"};
            btn.onmouseout = () => { btn.style.transform = "translateY(0)"; btn.style.boxShadow = "0 4px 15px rgba(230, 57, 70, 0.4)" };
        } else {
            document.getElementById('anticheat-msg').textContent = message;
            modal.style.display = 'flex';
        }
    }

    // 🚨 HÀM MỚI: HIỆN MEME ĐỘ MIXI TROLL KẺ GIAN LẬN 🚨
    function showTrollModal() {
        let teamNumber = window.GameClient && window.GameClient.team ? window.GameClient.team : "Hacker";
        
        // CẬP NHẬT ĐƯỜNG DẪN TƯƠNG ĐỐI TRỎ ĐẾN THƯ MỤC CHỨA FILE CỦA BẠN (VD: ../assets/sound/cheatingtroll.mp3)
        let trollAudio = new Audio('../../assets/cheatingtroll.mp3'); 
        trollAudio.play().catch(e => console.log("Audio play prevented", e));

        let modal = document.getElementById('troll-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'troll-modal';
            // Phủ nền đen kịt để tăng độ sợ hãi
            modal.style.cssText = "position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.98); z-index: 9999999; display: flex; align-items: center; justify-content: center; flex-direction: column; backdrop-filter: blur(15px); padding: 20px;";
            
            // CẬP NHẬT ĐƯỜNG DẪN TƯƠNG ĐỐI TRỎ ĐẾN THƯ MỤC CHỨA ẢNH
            modal.innerHTML = `
                <img src="../../assets/cheatingtroll.jpg" alt="Troll Face" style="max-width: 90%; max-height: 50vh; border-radius: 20px; border: 6px solid #E63946; box-shadow: 0 0 80px rgba(230, 57, 70, 0.8); animation: anticheat-shake 0.15s ease-in-out infinite alternate;">
                <h1 style="color: #FFF; font-family: 'Fredoka One', cursive; font-size: 32px; text-align: center; margin-top: 40px; line-height: 1.5; text-shadow: 3px 3px 0 #E63946;">
                    Hello Team ${teamNumber}, Team ${teamNumber},<br>I know everything you've done, don't deny it!
                </h1>
                <button id="troll-btn" style="margin-top: 40px; background: #E63946; color: white; border: none; padding: 18px 40px; border-radius: 12px; font-family: 'Fredoka One', cursive; font-size: 20px; cursor: pointer; box-shadow: 0 5px 20px rgba(230, 57, 70, 0.6);">
                    I'm so sorry 😭
                </button>
            `;
            document.body.appendChild(modal);

            document.getElementById('troll-btn').addEventListener('click', () => {
                modal.style.display = 'none';
                trollAudio.pause();      // Tắt tiếng khi bấm xin lỗi
                trollAudio.currentTime = 0; 
            });
        } else {
            modal.querySelector('h1').innerHTML = `Hello Team ${teamNumber}, Team ${teamNumber},<br>I know everything you've done, don't deny it!`;
            modal.style.display = 'flex';
            trollAudio.currentTime = 0;
            trollAudio.play().catch(e => console.log("Audio play prevented", e));
        }
    }
    
    // Inject animation css nếu chưa có
    if(!document.getElementById('anticheat-style')) {
        let style = document.createElement('style');
        style.id = 'anticheat-style';
        style.innerHTML = `
            @keyframes anticheat-shake {
                0%, 100% { transform: translateX(0) rotate(0); }
                25% { transform: translateX(-8px) rotate(-3deg); }
                75% { transform: translateX(8px) rotate(3deg); }
            }
        `;
        document.head.appendChild(style);
    }
});