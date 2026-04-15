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

### ⚙️ Cấu trúc Hệ thống

- `backend/`: Trái tim của ứng dụng sử dụng **Node.js** và **Socket.io** giúp điều phối trạng thái mọi phòng chơi, người chơi và duy trì kết nối theo thời gian thực một cách ổn định nhất.
- `frontend/`: Giao diện ứng dụng web được tối ưu hiển thị gồm hai thành phần riêng biệt dành cho người chơi (`player/`) và màn hình tổng điều khiển (`host/`), đi kèm bộ hoạt ảnh và âm thanh sống động (HTML/CSS/JS).

### 🚀 Cài đặt & Chạy ứng dụng

1. **Yêu cầu hệ thống:** Hãy chắc chắn bạn đã cài đặt [Node.js](https://nodejs.org/).
2. **Cài đặt các gói thư viện:**
   Mở terminal tại thư mục gốc của dự án và chạy:
   ```bash
   npm install
   ```
3. **Khởi động Máy chủ (Server):**
   ```bash
   npm start
   ```
4. **Truy cập Giao diện:**
   - **Giao diện dành cho Quản trò (Host):** `http://localhost:3000/host`
   - **Giao diện truy cập cho Người chơi (Player):** `http://localhost:3000/`

<div align="right">
  <a href="#top">⬆️ Về đầu trang (Back to top)</a>
</div>

---

<a name="english"></a>
## 🇬🇧 English

**E-Game Betting Battle** is a real-time multiplayer interactive quiz game system explicitly built for competitive team gameplay. It introduces a challenging balance between solid knowledge and pure risk with its integrated scoring and betting mechanism.

### 🌟 Key Features
- **💸 The Betting Battle Mechanism**: Before locking in their answers, teams must decide on their wagers. A correct answer rewards the team with points equalling their total bet, while a wrong answer subtracts their wager directly from their current score. High stakes, high rewards!
- **🗿 Totem of Undying Revival**: An ultimate safety-net feature. Should a team's points plummet to $\le 10$ following a tragic miscalculation, the system dramatically activates the Totem of Undying. It instantly triggers a revival animation, granting the team a vital 10-point emergency lifeline. It also wisely suspends their betting privileges and halts any future point deductions until they prove their worth by getting the next answer right.
- **👁️ Anti-Cheat Troll System**: Thinking of searching the web for an answer? Think again! The application permanently monitors browser tab focus. Any team that switches tabs or minimizes the window during a live game gets ambushed by a loud, flashing "troll" trap on their screen upon returning. Simultaneously, their team instantly gets highlighted as cheating on the Host's live screen.
- **👑 Dedicated Host Dashboard & Leaderboard**: A sophisticated control center allowing the game master to seamlessly:
    - Orchestrate interactive matches easily.
    - Synchronize & visualize real-time point-shifts across all participating teams via websockets.
    - Maintain lobby integrity by carefully vetting joining players.

### ⚙️ Project Architecture

- `backend/`: Constructed using **Node.js** and **Socket.io**. Houses the internal intelligence overseeing vital game states, user administration, scoring validation, and maintaining robust real-time bi-directional events.
- `frontend/`: Powered by pristine standard web components (HTML/CSS/Native JavaScript). Logically partitioned into immersive `player/` interactive layouts and an all-seeing `host/` master dashboard alongside dynamic graphical + sound overlays.

### 🚀 Setup & Execution Guide

1. **Requirement Check:** Ensure [Node.js](https://nodejs.org/) is properly installed on your machine.
2. **Retrieve Dependencies:**
   Launch a terminal at the project root and enter:
   ```bash
   npm install
   ```
3. **Ignite the Server:**
   ```bash
   npm start
   ```
4. **Enter the Game Interfaces:**
   - **Launch Host Master-Control:** `http://localhost:3000/host`
   - **Load Player Portal:** `http://localhost:3000/`

<div align="right">
  <a href="#top">⬆️ Back to top</a>
</div>
