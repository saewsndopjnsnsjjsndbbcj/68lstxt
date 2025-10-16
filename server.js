import express from "express";
import WebSocket from "ws";
import fetch from "node-fetch";
import { TextDecoder } from "util";

const dbUrl = "https://gb-8e4c1-default-rtdb.firebaseio.com";
const PORT = process.env.PORT || 10000;

const app = express();
app.get("/", (req, res) => {
  res.send("✅ Server Node.js đang hoạt động trên Render!");
});
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại cổng ${PORT}`);
});

console.log("🟢 Đang khởi động WebSocket listener...");

// ================== PHẦN XỬ LÝ WEBSOCKET ==================
const targetUrl = "wss://example.com/endpoint"; // <--- Thay bằng URL WebSocket thật của bạn

const ws = new WebSocket(targetUrl);

ws.on("open", () => {
  console.log("🔗 Đã kết nối tới WebSocket server:", targetUrl);
});

ws.on("message", async (data) => {
  try {
    let text;
    if (data instanceof Buffer) {
      text = new TextDecoder("utf-8").decode(data);
    } else if (typeof data === "string") {
      text = data;
    } else {
      return;
    }

    if (text.includes("mnmdsbgamestart") || text.includes("mnmdsbgameend")) {
      const dicesMatch = text.match(/\{(\d+)\s*-\s*(\d+)\s*-\s*(\d+)\}/);
      if (!dicesMatch) return;

      const [_, d1, d2, d3] = dicesMatch;
      const total = +d1 + +d2 + +d3;
      const result = total > 10 ? "Tài" : "Xỉu";

      const sessionMatch = text.match(/#(\d+)[_\-]/);
      const sessionNumber = sessionMatch ? parseInt(sessionMatch[1], 10) : null;
      if (!sessionNumber) return;

      const now = new Date();
      const payload = {
        "Phien": sessionNumber,
        "xuc_xac_1": +d1,
        "xuc_xac_2": +d2,
        "xuc_xac_3": +d3,
        "tong": total,
        "ket_qua": result,
        "thoi_gian": now.toLocaleString("vi-VN", { hour12: false }),
      };

      console.log(`
━━━━━━━━━━━━━━━━━━━━━━
📌 Phiên:     ${payload.Phien}
🎲 Xúc xắc 1: ${payload.xuc_xac_1}
🎲 Xúc xắc 2: ${payload.xuc_xac_2}
🎲 Xúc xắc 3: ${payload.xuc_xac_3}
➕ Tổng:      ${payload.tong}
✅ Kết quả:   ${payload.ket_qua}
⏰ Thời gian: ${payload.thoi_gian}
━━━━━━━━━━━━━━━━━━━━━━
      `);

      const res = await fetch(`${dbUrl}/taixiu_sessions/current.json`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        console.log("✅ Đã ghi đè phiên mới vào Firebase (current)");
      } else {
        console.error("❌ Lỗi lưu phiên:", res.status);
      }
    }
  } catch (err) {
    console.error("❌ Lỗi khi xử lý dữ liệu WS:", err);
  }
});

ws.on("close", () => {
  console.log("⚠️ WebSocket bị ngắt, sẽ thử kết nối lại sau 5s...");
  setTimeout(() => process.exit(1), 5000); // Render sẽ tự restart app
});

ws.on("error", (err) => {
  console.error("❌ Lỗi WebSocket:", err);
});
