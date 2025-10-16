var dbUrl = "https://gb-8e4c1-default-rtdb.firebaseio.com";

(function () {
  var OriginalWebSocket = window.WebSocket;

  window.WebSocket = function (url, protocols) {
    var ws = protocols ? new OriginalWebSocket(url, protocols) : new OriginalWebSocket(url);

    ws.addEventListener("message", async function (event) {
      try {
        var text;

        // Giải mã dữ liệu
        if (event.data instanceof ArrayBuffer) {
          text = new TextDecoder("utf-8").decode(event.data);
        } else if (typeof event.data === "string") {
          text = event.data;
        } else {
          return;
        }

        // Kiểm tra nếu chứa start hoặc end game
        if (text.includes("mnmdsbgamestart") || text.includes("mnmdsbgameend")) {
          var dicesMatch = text.match(/\{(\d+)\s*-\s*(\d+)\s*-\s*(\d+)\}/);
          if (!dicesMatch) return;

          var dice1 = parseInt(dicesMatch[1], 10);
          var dice2 = parseInt(dicesMatch[2], 10);
          var dice3 = parseInt(dicesMatch[3], 10);

          if (isNaN(dice1) || isNaN(dice2) || isNaN(dice3)) return;

          var total = dice1 + dice2 + dice3;
          var result = total > 10 ? "Tài" : "Xỉu";

          var sessionMatch = text.match(/#(\d+)[_\-]/);
          var sessionNumber = sessionMatch ? parseInt(sessionMatch[1], 10) : null;
          if (!sessionNumber) return;

          var now = new Date();
          var timeString = now.toLocaleString("vi-VN", { hour12: false });

          // Payload chuẩn
          var payload = {
            "Phien": sessionNumber,
            "xuc_xac_1": dice1,
            "xuc_xac_2": dice2,
            "xuc_xac_3": dice3,
            "tong": total,
            "ket_qua": result,
            "thoi_gian": timeString
          };

          // In ra console cho đẹp
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

          try {
            // Luôn ghi đè vào 1 node duy nhất "current"
            let res = await fetch(dbUrl + "/taixiu_sessions/current.json", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });

            if (res.ok) {
              console.log("✅ Đã ghi đè phiên mới vào Firebase (current)");
            } else {
              console.error("❌ Lỗi lưu phiên:", res.status);
            }
          } catch (err) {
            console.error("❌ Lỗi fetch lưu phiên:", err);
          }
        }
      } catch (err) {
        console.error("❌ Lỗi khi xử lý WebSocket:", err);
      }
    });

    return ws;
  };

  window.WebSocket.prototype = OriginalWebSocket.prototype;

})();
