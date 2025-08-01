const express = require('express');
const router = express.Router();
const { db } = require('../firebase/firebase');
/**
 * @openapi
 * /telemetry/{type}:
 *   get:
 *     summary: Lấy danh sách telemetry theo loại thiết bị
 *     description: Trả về tối đa 200 bản ghi telemetry mới nhất cho thiết bị thuộc loại chỉ định.
 *     tags:
 *       - Device
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *         description: "Loại thiết bị (ví dụ: sensor, actuator, ...)"
 *     responses:
 *       200:
 *         description: Danh sách telemetry của thiết bị
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   temperature:
 *                     type: number
 *                     nullable: true
 *                     example: 28.5
 *                   deviceId:
 *                     type: string
 *                     nullable: true
 *                     example: "dev001"
 *                   model:
 *                     type: string
 *                     nullable: true
 *                     example: "XJ-2024"
 *                   type:
 *                     type: string
 *                     nullable: true
 *                     example: "sensor"
 *                   topic:
 *                     type: string
 *                     nullable: true
 *                     example: "sensors/room01"
 *                   timestamp:
 *                     type: string
 *                     format: date-time
 *                     nullable: true
 *                     example: "2025-08-01T09:30:00Z"
 *       500:
 *         description: Lỗi server
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Lỗi server
 */
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
    console.error('Err when fetching telemetry:', e);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
