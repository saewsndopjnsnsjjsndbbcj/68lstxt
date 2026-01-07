const express = require('express');
const axios = require('axios');
const app = express();

const PORT = process.env.PORT || 3000;

const SOURCE_API_URL =
  'https://gbmd5-4a69a-default-rtdb.asia-southeast1.firebasedatabase.app/taixiu_sessions.json';

// API Tài Xỉu – phiên mới nhất
app.get('/api/taixiu', async (req, res) => {
  try {
    const response = await axios.get(SOURCE_API_URL, {
      timeout: 10000
    });

    const data = response.data;

    if (!data || typeof data !== 'object') {
      return res.status(500).json({ error: 'Dữ liệu Firebase không hợp lệ' });
    }

    const list = Object.values(data)
      .filter(item => item.type === 'end' && item.phien)
      .sort((a, b) => Number(b.phien) - Number(a.phien));

    if (list.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy phiên end' });
    }

    const latest = list[0];

    // 🔥 FORMAT ĐÚNG THEO YÊU CẦU
    res.json({
      Phien: Number(latest.phien),
      Xuc_xac_1: Number(latest.xuc_xac_1),
      Xuc_xac_2: Number(latest.xuc_xac_2),
      Xuc_xac_3: Number(latest.xuc_xac_3),
      Tong: Number(latest.tong),
      Ket_qua: latest.ket_qua,
      id: '@mrtinhios'
    });

  } catch (err) {
    res.status(503).json({
      error: 'Không lấy được dữ liệu Firebase',
      details: err.message
    });
  }
});

// Root
app.get('/', (req, res) => {
  res.send('API Tài Xỉu OK — dùng /api/taixiu');
});

app.listen(PORT, () => {
  console.log(`✅ Server chạy cổng ${PORT}`);
});
