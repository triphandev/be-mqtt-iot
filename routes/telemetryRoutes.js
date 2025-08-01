const express = require('express');
const router = express.Router();
const { db } = require('../firebase/firebase');
/**
 * @openapi
 * /telemetry:
 *   get:
 *     summary: Lấy danh sách telemetry
 *     description: |
 *       Trả về danh sách telemetry mới nhất từ Firestore.  
 *       Có thể lọc theo:
 *       - Loại thiết bị (`type`)
 *       - ID thiết bị (`deviceId`)
 *       - Khoảng thời gian (`fromDate`, `toDate`) dạng milliseconds kể từ 1/1/1970 UTC  
 *       - Giới hạn số bản ghi (`limit`)
 *       
 *       Nếu không truyền `fromDate` và `toDate`:
 *       - `fromDate` mặc định = 00:00 hôm nay
 *       - `toDate` mặc định = thời điểm hiện tại
 *       
 *       Nếu không truyền `limit`, mặc định là 200 bản ghi.
 *     tags:
 *       - Device
 *     parameters:
 *       - in: query
 *         name: type
 *         required: false
 *         schema:
 *           type: string
 *         description: "Loại thiết bị (ví dụ: sensor, actuator, ...)"
 *       - in: query
 *         name: deviceId
 *         required: false
 *         schema:
 *           type: string
 *         description: "ID của thiết bị (ví dụ: dev001)"
 *       - in: query
 *         name: fromDate
 *         required: false
 *         schema:
 *           type: integer
 *           format: int64
 *         description: |
 *           Thời gian bắt đầu lọc (milliseconds kể từ 1/1/1970 UTC).  
 *           Mặc định: 00:00 hôm nay.
 *           Ví dụ: 1735689600000
 *       - in: query
 *         name: toDate
 *         required: false
 *         schema:
 *           type: integer
 *           format: int64
 *         description: |
 *           Thời gian kết thúc lọc (milliseconds kể từ 1/1/1970 UTC).  
 *           Mặc định: Thời điểm hiện tại.
 *           Ví dụ: 1735776000000
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           default: 200
 *         description: "Giới hạn số bản ghi trả về (mặc định 200)."
 *     responses:
 *       200:
 *         description: Danh sách telemetry
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
 *                   deviceId:
 *                     type: string
 *                     nullable: true
 *                   model:
 *                     type: string
 *                     nullable: true
 *                   type:
 *                     type: string
 *                     nullable: true
 *                   topic:
 *                     type: string
 *                     nullable: true
 *                   timestamp:
 *                     type: string
 *                     format: date-time
 *                     nullable: true
 *       500:
 *         description: Lỗi server
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Server error"
 */

router.get('/', async (req, res) => {
  const { type, deviceId, fromDate, toDate, limit } = req.query;

  try {
    const now = new Date();
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const recordLimit = Number(limit) > 0 ? Number(limit) : 200;

    if (!fromDate) {
      fromDate = startOfToday.getTime(); // ms từ epoch
    }
    if (!toDate) {
      toDate = now.getTime();
    }

    let query = db.collection('mqtt_data').orderBy('timestamp', 'desc');

    // Filter for date range if provided
    if (fromDate) {
      query = query.where('timestamp', '>=', new Date(Number(fromDate)));
    }
    if (toDate) {
      query = query.where('timestamp', '<=', new Date(Number(toDate)));
    }

    // Limit to 200 records
    query = query.limit(recordLimit);

    const snapshot = await query.get();
    let filtered = snapshot.docs.map(doc => doc.data());

    // Filter by type if provided
    if (type) {
      filtered = filtered.filter(entry => entry?.data?.device?.type === type);
    }

    // Filter by deviceId if provided
    if (deviceId) {
      filtered = filtered.filter(entry => entry?.data?.device?.id === deviceId);
    }

    const result = filtered.map(entry => ({
      temperature: entry?.data?.data?.temperature || null,
      deviceId: entry?.data?.device?.id || null,
      model: entry?.data?.device?.model || null,
      type: entry?.data?.device?.type || null,
      topic: entry.topic || null,
      timestamp: entry.timestamp?.toDate?.() || entry.processedAt || null
    }));

    res.status(200).json(result);
  } catch (e) {
    console.error('Err when fetching telemetry:', e);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
