import fetch from "node-fetch";

const DB_URL = "https://api-68gb-default-rtdb.firebaseio.com";
const PATH = "taixiu_sessions";

/**
 * Lấy phiên mới nhất từ Firebase
 */
async function getLatestSession() {
  try {
    const url = `${DB_URL}/${PATH}.json?orderBy="$key"&limitToLast=1`;
    const res = await fetch(url);
    const data = await res.json();

    if (!data) {
      console.log("❌ Chưa có dữ liệu");
      return;
    }

    // Firebase trả về object → lấy key đầu tiên
    const latestKey = Object.keys(data)[0];
    const latest = data[latestKey];

    console.log("🔥 PHIÊN MỚI NHẤT");
    console.log("Phiên:", latestKey);
    console.log("Xúc xắc:", latest.d1, "-", latest.d2, "-", latest.d3);
    console.log("Tổng:", latest.tong);
    console.log("Kết quả:", latest.ketqua);
    console.log("Thời gian:", new Date(latest.time).toLocaleString());

    return latest;
  } catch (err) {
    console.error("❌ Lỗi đọc Firebase:", err.message);
  }
}

// 👉 TEST
getLatestSession();

// 👉 Nếu b muốn đọc liên tục mỗi X giây
// setInterval(getLatestSession, 3000);
