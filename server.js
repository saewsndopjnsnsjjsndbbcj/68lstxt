import fetch from "node-fetch";

const dbUrl = "https://gb-8e4c1-default-rtdb.firebaseio.com"; // ✅ Firebase của bạn

async function getCurrentSession() {
  try {
    const res = await fetch(`${dbUrl}/taixiu_sessions/current.json`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    if (!data) {
      console.log("⚠️ Chưa có dữ liệu phiên trong Firebase");
      return;
    }

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
  } catch (err) {
    console.error("❌ Lỗi đọc dữ liệu Firebase:", err.message);
  }
}

// Gọi lần đầu khi khởi động
getCurrentSession();

// Lặp lại mỗi 5 giây để cập nhật dữ liệu mới
setInterval(getCurrentSession, 5000);

// Giữ server luôn sống (Render cần port)
import http from "http";
const PORT = process.env.PORT || 10000;
http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("🔥 Server đang chạy và theo dõi Firebase...");
}).listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại cổng ${PORT}`);
});
