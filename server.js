import fetch from "node-fetch";
import express from "express";

const app = express();
const dbUrl = "https://gb-8e4c1-default-rtdb.firebaseio.com"; // Firebase của bạn
const PORT = process.env.PORT || 10000;

let lastPhien = null;

// 🧠 Lấy dữ liệu từ Firebase
async function getCurrentSession() {
  try {
    const res = await fetch(`${dbUrl}/taixiu_sessions/current.json`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data || !data.Phien) return;

    // Nếu là phiên mới → cập nhật
    if (data.Phien !== lastPhien) {
      lastPhien = data.Phien;

      console.clear();
      console.log(`
━━━━━━━━━━━━━━━━━━━━━━
📌 Phiên:     ${data.Phien}
🎲 Xúc xắc 1: ${data.xuc_xac_1}
🎲 Xúc xắc 2: ${data.xuc_xac_2}
🎲 Xúc xắc 3: ${data.xuc_xac_3}
➕ Tổng:      ${data.tong}
✅ Kết quả:   ${data.ket_qua}
⏰ Thời gian: ${data.thoi_gian}
━━━━━━━━━━━━━━━━━━━━━━
      `);

      // Ghi lịch sử
      const save = await fetch(`${dbUrl}/taixiu_sessions/history/${data.Phien}.json`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (save.ok) console.log(`✅ Đã lưu phiên ${data.Phien} vào /history`);
      else console.error(`❌ Lỗi lưu lịch sử: ${save.status}`);
    }
  } catch (err) {
    console.error("❌ Lỗi đọc Firebase:", err.message);
  }
}

// 🔁 Cập nhật mỗi 5 giây
setInterval(getCurrentSession, 5000);

// 📂 API hiển thị lịch sử
app.get("/history", async (req, res) => {
  try {
    const resp = await fetch(`${dbUrl}/taixiu_sessions/history.json`);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const history = await resp.json();

    if (!history) return res.send("<h2>⚠️ Chưa có dữ liệu lịch sử.</h2>");

    let html = `
      <html lang="vi">
      <head>
        <meta charset="utf-8"/>
        <title>Lịch sử Tài Xỉu</title>
        <style>
          body { font-family: Arial, sans-serif; background: #111; color: #fff; padding: 20px; }
          h1 { color: #00ff99; }
          table { border-collapse: collapse; width: 100%; margin-top: 10px; }
          th, td { border: 1px solid #444; padding: 8px; text-align: center; }
          th { background: #222; color: #0f0; }
          tr:nth-child(even) { background: #1a1a1a; }
        </style>
      </head>
      <body>
        <h1>📜 Lịch sử Tài Xỉu</h1>
        <table>
          <tr>
            <th>Phiên</th>
            <th>Xúc xắc 1</th>
            <th>Xúc xắc 2</th>
            <th>Xúc xắc 3</th>
            <th>Tổng</th>
            <th>Kết quả</th>
            <th>Thời gian</th>
          </tr>
    `;

    const sortedKeys = Object.keys(history).sort((a, b) => b - a); // Phiên mới nhất lên đầu
    for (const key of sortedKeys) {
      const item = history[key];
      html += `
        <tr>
          <td>${item.Phien}</td>
          <td>${item.xuc_xac_1}</td>
          <td>${item.xuc_xac_2}</td>
          <td>${item.xuc_xac_3}</td>
          <td>${item.tong}</td>
          <td>${item.ket_qua}</td>
          <td>${item.thoi_gian}</td>
        </tr>
      `;
    }

    html += `
        </table>
      </body>
      </html>
    `;

    res.send(html);
  } catch (err) {
    res.status(500).send(`<h3>❌ Lỗi tải lịch sử: ${err.message}</h3>`);
  }
});

// 🔥 Route mặc định
app.get("/", (req, res) => {
  res.send("🔥 Đang theo dõi Firebase và lưu lịch sử phiên. Truy cập /history để xem lịch sử.");
});

// 🚀 Khởi động server
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại cổng ${PORT}`);
});
