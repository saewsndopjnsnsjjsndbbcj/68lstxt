const express = require('express');
const axios = require('axios');
const app = express();

const PORT = process.env.PORT || 3000;

// Firebase API
const SOURCE_API_URL =
  'https://gbmd5-4a69a-default-rtdb.asia-southeast1.firebasedatabase.app/taixiu_sessions.json';

// Lấy phiên mới nhất
app.get('/api/lxk', async (req, res) => {
  try {
    const response = await axios.get(SOURCE_API_URL, {
      timeout: 10000
    });

    const data = response.data;

    if (!data || typeof data !== 'object') {
      return res.status(500).json({ error: 'Dữ liệu Firebase không hợp lệ' });
    }

    // Object -> Array
    const list = Object.values(data)
      .filter(item => item.type === 'end' && item.phien)
      .sort((a, b) => Number(b.phien) - Number(a.phien));

    if (list.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy phiên end' });
    }

    const latest = list[0];

    // Chuẩn hóa output
    const result = {
      Phien: latest.phien,
      Xuc_xac_1: latest.xuc_xac_1,
      Xuc_xac_2: latest.xuc_xac_2,
      Xuc_xac_3: latest.xuc_xac_3,
      Tong: latest.tong,
      Ket_qua: latest.ket_qua,
      Time: latest.time,
      id_nguon: '@firebase_taixiu'
    };

    res.json(result);

  } catch (err) {
    console.error('❌ Lỗi API:', err.message);
    res.status(503).json({
      error: 'Không lấy được dữ liệu Firebase',
      details: err.message
    });
  }
});

// Trang gốc
app.get('/', (req, res) => {
  res.send('API Tài Xỉu Firebase — dùng /api/lxk');
});

app.listen(PORT, () => {
  console.log(`✅ Server chạy tại http://localhost:${PORT}`);
});
