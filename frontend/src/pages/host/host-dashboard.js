// Host Dashboard Logic - Chuyên xử lý Hiệu ứng UI & Âm thanh
// Dữ liệu thời gian thực đã được xử lý bằng WebSocket trong file HTML.

document.addEventListener('DOMContentLoaded', () => {
    console.log("🎬 Host Dashboard Active - Real-time UI & SFX Engine Ready!");
    
    let previousState = '';

    // =========================================================
    // 1. HIỆU ỨNG KHI TRẠNG THÁI GAME THAY ĐỔI
    // =========================================================
    window.addEventListener('gameStateUpdate', (e) => {
        const state = e.detail;
        
        // Chỉ chạy hiệu ứng khi state thực sự chuyển sang giai đoạn mới
        if (previousState !== state.state) {
            
            // TRƯỜNG HỢP 1: Chốt điểm - Hiển thị kết quả (ROUND_RESULT)
            if (state.state === 'ROUND_RESULT') {
                // Phát âm thanh ting ting / Tada chốt điểm
                if (typeof window.playSuccess === 'function') window.playSuccess();
                
                // Bảng xếp hạng lóe sáng ánh Vàng (Gold) cực rực rỡ
                const leaderboardCard = document.querySelector('.card.ch');
                if (leaderboardCard) {
                    leaderboardCard.style.transition = "box-shadow 0.3s ease-out, transform 0.2s";
                    leaderboardCard.style.transform = "scale(1.01)";
                    leaderboardCard.style.boxShadow = "0 0 50px rgba(251, 191, 36, 0.6), inset 0 0 20px rgba(251, 191, 36, 0.2)";
                    
                    // Trả về bình thường sau 1 giây
                    setTimeout(() => {
                        leaderboardCard.style.transform = "scale(1)";
                        leaderboardCard.style.boxShadow = "none";
                    }, 1000);
                }
            } 
            
            // TRƯỜNG HỢP 2: Bắt đầu cho cược hoặc Đếm ngược câu hỏi
            else if (state.state === 'BETTING' || state.state === 'QUESTION') {
                // Tiếng click báo hiệu bắt đầu thời gian căng thẳng
                if (typeof window.playClick === 'function') window.playClick();
            }
            
            previousState = state.state;
        }
    });


    // =========================================================
    // 2. HIỆU ỨNG KHI CÓ ĐỘI GIAN LẬN (Cheat Alert)
    // =========================================================
    window.addEventListener('cheatAlert', (e) => {
        // Phát tiếng "Bíp bíp" báo lỗi
        if (typeof window.playError === 'function') window.playError();
        
        // Hộp Cheat Detector giật nảy lên và nháy sáng ĐỎ (Red)
        const anticheatCard = document.querySelector('.hd-right .card.cj');
        if (anticheatCard) {
            // Chỉnh CSS động để nháy đỏ
            anticheatCard.style.transition = "all 0.1s ease-in-out";
            anticheatCard.style.transform = "scale(1.03) rotate(1deg)";
            anticheatCard.style.boxShadow = "0 0 60px rgba(230, 57, 70, 0.9), inset 0 0 30px rgba(230, 57, 70, 0.5)";
            anticheatCard.style.border = "2px solid #E63946";
            
            // Hiệu ứng giật lắc trái phải nhanh (Shake)
            setTimeout(() => { anticheatCard.style.transform = "scale(1.03) rotate(-1deg)"; }, 50);
            setTimeout(() => { anticheatCard.style.transform = "scale(1.03) rotate(1deg)"; }, 100);
            setTimeout(() => { anticheatCard.style.transform = "scale(1.03) rotate(-1deg)"; }, 150);

            // Gỡ hiệu ứng sau nửa giây
            setTimeout(() => {
                anticheatCard.style.transform = "scale(1) rotate(0)";
                anticheatCard.style.boxShadow = "none";
                anticheatCard.style.border = "none";
            }, 500);
        }
    });
});