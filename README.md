<div align="center">
  <h1>🎮 E-Game Betting Battle</h1>
  
  <p><strong>A multiplayer interactive quiz game with a betting system and unique gameplay mechanics!</strong><br/>
  <i>Hệ thống trò chơi trắc nghiệm đấu trí nhiều đội chơi với cơ chế cược điểm độc đáo!</i></p>

  🌍 <b>Choose your language / Chọn ngôn ngữ:</b><br />
  <a href="#vietnamese">🇻🇳 <b>Tiếng Việt</b></a> &nbsp;|&nbsp; <a href="#english">🇬🇧 <b>English</b></a>
</div>

<hr/>

<a name="vietnamese"></a>
## 🇻🇳 Tiếng Việt

**E-Game Betting Battle** là một hệ thống trò chơi trắc nghiệm tương tác thời gian thực dành cho nhiều nhóm chơi (đội hình), với những cơ chế độc đáo kết hợp giữa trí tuệ và sự liều lĩnh qua hệ thống cược điểm số.

### 🌟 Tính năng Nổi bật
- **💸 Trò chơi Đặt cược (Betting Battle)**: Khi trả lời câu hỏi, các đội có thể linh hoạt thiết lập mức cược của mình. Trả lời đúng, mức cược sẽ được cộng thẳng vào điểm thưởng; trả lời sai, đội sẽ bị trừ điểm tương ứng với mức đã cược. Cơ chế rủi ro cao, phần thưởng lớn này tăng tối đa tính hấp dẫn cho các vòng thi.
- **🗿 Vật phẩm Hồi Sinh (Totem of Undying)**: Không sợ cạn kiệt hy vọng! Khi điểm số của một đội tụt xuống $\le 10$ do trả lời sai, hệ thống sẽ kích hoạt kỹ năng Totem of Undying cùng âm thanh và hoạt ảnh hoành tráng nhằm “cứu vớt” đội: ban đặc quyền +10 điểm thưởng, khóa quyền đặt cược và tạm dừng quy tắc trừ điểm cho tới khi đội đó trả lời đúng câu hỏi tiếp theo.
- **👁️ Cơ chế Chống Gian lận (Anti-Cheat Troll)**: Hệ thống "bắt bài" siêu cấp! Bất cứ đội nào cố tình chuyển đổi thẻ trình duyệt (tab) hoặc thoát khỏi màn hình game để mở tài liệu, hệ thống sẽ tự động bắt quả tang và dọa dẫm ngay lập tức bằng hình ảnh flash âm thanh lớn trên màn hình, đồng thời đánh dấu đỏ tên đội trên bảng điều khiển của quản trò.
- **👑 Quản trò & Bảng xếp hạng Trực tiếp**: Quản trò (Host) nắm giữ một Dashboard quyền lực để:
    - Bắt đầu / Kết thúc các vòng thi trơn tru.
    - Cập nhật số điểm của toàn bộ các đội ở thời gian thực (Real-time).
    - Cấp quyền cho người chơi và quản lý phòng chờ.

## Cấu trúc thư mục
- `backend/`: Xử lý logic game, tính điểm, kết nối Database (Host API).
- `frontend/`: Giao diện hiển thị (HTML, CSS, JS) cho người chơi và quản trò.
- `data/`: Nơi lưu trữ tài nguyên (Danh sách 40+ từ vựng Summit 1, cấu trúc câu hỏi).
- `docs/`: File tài liệu nộp khóa luận cho giảng viên (Rulebook, Slide thuyết trình).

## Tính năng chính
- Dành cho 7 đội tham gia (mỗi đội 2-4 thành viên).
- 5 Vòng chơi gồm các chế độ: Vocab Rush, Grammar Strike, Speed Buzzer, Elimination Bet, Final All-in.
- Tích hợp hệ thống cá cược điểm để tăng độ kịch tính.
