const express = require('express');
const router = express.Router();
const { db } = require('../firebase/firebase');

router.get('/:type', async (req, res) => {
  const { type } = req.params;

  try {
    const snapshot = await db.collection('mqtt_data')
      .orderBy('timestamp', 'desc')
      .limit(200)
      .get();

    const filtered = snapshot.docs
      .map(doc => doc.data())
      .filter(entry => entry?.data?.device?.type === type)
      .map(entry => {
        return {
          temperature: entry?.data?.data?.temperature || null,
          deviceId: entry?.data?.device?.id || null,
          model: entry?.data?.device?.model || null,
          type: entry?.data?.device?.type || null,
          topic: entry.topic || null,
          timestamp: entry.timestamp?.toDate?.() || entry.processedAt || null
        };
      });

    res.status(200).json(filtered);
  } catch (e) {
    console.error('❌ Lỗi khi lấy telemetry theo loại thiết bị:', e);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

module.exports = router;
