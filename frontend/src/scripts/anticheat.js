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

    // 3. PHÁT HIỆN CHUYỂN TAB HOẶC RỜI MÀN HÌNH (Chỉ áp dụng trong giao diện trả lời. Định nghĩa là folder có url chứa play-)
    const isTestInterface = window.location.pathname.includes('play-');

    if (isTestInterface) {
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                document.body.classList.add('blurred-screen');
                showAntiCheatWarning("Tab switching or leaving the screen detected! This action will be recorded and a warning will be sent to the host.");
            } else {
                document.body.classList.remove('blurred-screen');
            }
        });

        window.addEventListener('blur', () => {
            // Làm mờ nội dung để ngăn chặn việc chụp màn hình
            document.body.classList.add('blurred-screen');
        });

        window.addEventListener('focus', () => {
            // Khi quay lại, bỏ hiệu ứng làm mờ
            document.body.classList.remove('blurred-screen');
        });
    }

    // Modal chức năng cảnh báo
    function showAntiCheatWarning(message) {
        if (window.GameClient && window.GameClient.socket) {
            window.GameClient.socket.emit('player_action', { action: 'CHEAT_ALERT', payload: { reason: message } });
        }
        
        let modal = document.getElementById('anticheat-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'anticheat-modal';
            // Z-index cao để đè lên mọi màn hình
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
            
            // Hover effect cho button
            let btn = document.getElementById('anticheat-btn');
            btn.onmouseover = () => { btn.style.transform = "translateY(-2px)"; btn.style.boxShadow = "0 6px 20px rgba(230, 57, 70, 0.5)"};
            btn.onmouseout = () => { btn.style.transform = "translateY(0)"; btn.style.boxShadow = "0 4px 15px rgba(230, 57, 70, 0.4)" };
        } else {
            document.getElementById('anticheat-msg').textContent = message;
            modal.style.display = 'flex';
        }
    }
    
    // Inject animation css nếu chưa có
    if(!document.getElementById('anticheat-style')) {
        let style = document.createElement('style');
        style.id = 'anticheat-style';
        style.innerHTML = `
            @keyframes anticheat-shake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-5px) rotate(-5deg); }
                75% { transform: translateX(5px) rotate(5deg); }
            }
        `;
        document.head.appendChild(style);
    }
});
