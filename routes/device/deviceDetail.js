// File: routes/deviceDetail.js
const express = require('express');
const router = express.Router();
const { db } = require('../../firebase/firebase');

/**
 * @openapi
 * /devices/{id}:
 *   get:
 *     summary: Get device details and recent telemetry
 *     description: Returns metadata of a device and its 20 most recent telemetry entries.
 *     tags:
 *       - Device
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The device ID
 *     responses:
 *       200:
 *         description: Device info and telemetry history
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 device:
 *                   type: object
 *                   properties:
 *                     deviceId:
 *                       type: string
 *                       example: "device_123"
 *                     model:
 *                       type: string
 *                       example: "ESP32"
 *                     type:
 *                       type: string
 *                       example: "temperature_sensor"
 *                     topic:
 *                       type: string
 *                       example: "sensors/temperature/device_123"
 *                     lastActive:
 *                       type: integer
 *                       example: 1691576900000
 *                 telemetry:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       temperature:
 *                         type: number
 *                         example: 28.3
 *                       humidity:
 *                         type: number
 *                         example: 65.4
 *                       timestamp:
 *                         type: integer
 *                         example: 1691576888123
 *       404:
 *         description: Device not found
 *       500:
 *         description: Server error
 */
router.get('/:id', async (req, res) => {
  try {
    const deviceId = req.params.id;

    const deviceDoc = await db.collection('devices').doc(deviceId).get();

    if (!deviceDoc.exists) {
      return res.status(404).json({ message: 'Device not found' });
    }

    const deviceData = deviceDoc.data();

    const telemetrySnapshot = await db
      .collection('devices')
      .doc(deviceId)
      .collection('telemetry')
      .orderBy('timestamp', 'desc')
      .limit(20)
      .get();

    const telemetry = telemetrySnapshot.docs.map(doc => ({
      temperature: doc.data().data?.temperature ?? null,
      humidity: doc.data().data?.humidity ?? null,
      timestamp: doc.data().timestamp ?? doc.data().savedAt ?? null
    }));

    res.status(200).json({
      device: {
        deviceId: deviceId,
        model: deviceData.model || null,
        type: deviceData.type || null,
        topic: deviceData.topic || null,
        lastActive: deviceData.lastActive || null
      },
      telemetry
    });
  } catch (e) {
    console.error('Error fetching device detail:', e);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
