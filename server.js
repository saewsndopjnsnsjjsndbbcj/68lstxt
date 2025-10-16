import fetch from "node-fetch";
import express from "express";

const app = express();
const dbUrl = "https://gb-8e4c1-default-rtdb.firebaseio.com"; // 🔥 Firebase của bạn
const PORT = process.env.PORT || 10000;

let lastPhien = null;

// 🔁 Theo dõi phiên mới
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

      // 🧾 Lưu vào lịch sử (tránh trùng)
      await fetch(`${dbUrl}/taixiu_sessions/history/${data.Phien}.json`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    }
  } catch (err) {
    console.error("❌ Lỗi đọc Firebase:", err.message);
  }
}

setInterval(getCurrentSession, 5000);

// 📂 Route /history hiển thị kiểu log Render
app.get("/history", async (req, res) => {
  try {
    const resp = await fetch(`${dbUrl}/taixiu_sessions/history.json`);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const history = await resp.json();

    if (!history) return res.send("⚠️ Chưa có lịch sử nào.");

    const sorted = Object.keys(history).sort((a, b) => b - a);
    let output = "";

    for (const key of sorted) {
      const item = history[key];
      output += `
━━━━━━━━━━━━━━━━━━━━━━
📌 Phiên:     ${item.Phien}
🎲 Xúc xắc 1: ${item.xuc_xac_1}
🎲 Xúc xắc 2: ${item.xuc_xac_2}
🎲 Xúc xắc 3: ${item.xuc_xac_3}
➕ Tổng:      ${item.tong}
✅ Kết quả:   ${item.ket_qua}
⏰ Thời gian: ${item.thoi_gian}
━━━━━━━━━━━━━━━━━━━━━━
`;
    }

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.send(output.trim());
  } catch (err) {
    res.status(500).send(`❌ Lỗi tải lịch sử: ${err.message}`);
  }
});

// 🔥 Route mặc định
app.get("/", (req, res) => {
  res.send("🔥 Tool đang theo dõi Firebase. Truy cập /history để xem lịch sử.");
});

app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại cổng ${PORT}`);
});
