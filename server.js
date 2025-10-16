import fetch from "node-fetch";
import express from "express";

const app = express();
const dbUrl = "https://gb-8e4c1-default-rtdb.firebaseio.com"; // Firebase của bạn
const PORT = process.env.PORT || 10000;

let lastPhien = null;

// 🔁 Theo dõi Firebase
async function getCurrentSession() {
  try {
    const res = await fetch(`${dbUrl}/taixiu_sessions/current.json`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data || !data.Phien) return;

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

      // Lưu vào /history/last.json để truy cập nhanh
      await fetch(`${dbUrl}/taixiu_sessions/history/last.json`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Phien: data.Phien,
          Xuc_xac_1: data.xuc_xac_1,
          Xuc_xac_2: data.xuc_xac_2,
          Xuc_xac_3: data.xuc_xac_3,
          Tong: data.tong,
          Ket_qua: data.ket_qua,
          Thoi_gian: data.thoi_gian,
        }),
      });
    }
  } catch (err) {
    console.error("❌ Lỗi đọc Firebase:", err.message);
  }
}

// Cập nhật mỗi 5s
setInterval(getCurrentSession, 5000);

// 📂 Route /history hiển thị đúng 1 khung JSON (phiên mới nhất)
app.get("/history", async (req, res) => {
  try {
    const resp = await fetch(`${dbUrl}/taixiu_sessions/history/last.json`);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();

    if (!data) {
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      return res.send(JSON.stringify({ message: "Chưa có dữ liệu phiên nào." }, null, 2));
    }

    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.send(JSON.stringify(data, null, 2));
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

// 🔥 Route mặc định
app.get("/", (req, res) => {
  res.send("🔥 Tool đang theo dõi Firebase. Truy cập /history để xem phiên mới nhất.");
});

// 🚀 Khởi động server
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại cổng ${PORT}`);
});
