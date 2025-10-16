import fetch from "node-fetch";
import http from "http";

const dbUrl = "https://gb-8e4c1-default-rtdb.firebaseio.com"; // Firebase của bạn
const PORT = process.env.PORT || 10000;

let lastPhien = null; // Lưu lại phiên cuối cùng để tránh ghi trùng

async function getCurrentSession() {
  try {
    const res = await fetch(`${dbUrl}/taixiu_sessions/current.json`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data || !data.Phien) return;

    // Nếu là phiên mới thì xử lý
    if (data.Phien !== lastPhien) {
      lastPhien = data.Phien; // Cập nhật phiên mới nhất

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

      // Ghi vào /history/<số phiên>
      try {
        const save = await fetch(`${dbUrl}/taixiu_sessions/history/${data.Phien}.json`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (save.ok) {
          console.log(`✅ Đã lưu phiên ${data.Phien} vào /history`);
        } else {
          console.error(`❌ Lỗi lưu lịch sử: ${save.status}`);
        }
      } catch (err) {
        console.error("❌ Lỗi khi ghi lịch sử:", err.message);
      }
    }
  } catch (err) {
    console.error("❌ Lỗi đọc Firebase:", err.message);
  }
}

// Kiểm tra Firebase mỗi 5 giây
setInterval(getCurrentSession, 5000);

// Tạo HTTP server để Render giữ tiến trình sống
http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("🔥 Đang theo dõi phiên mới từ Firebase và lưu lịch sử...");
}).listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại cổng ${PORT}`);
});
