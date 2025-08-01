// routes/deviceRoutes.js
const express = require('express');
const router = express.Router();
const { db } = require('../firebase/firebase');
/**
 * @openapi
 * /device:
 *   get:
 *     summary: Get all telemetry devices
 *     description: Returns a list of all registered telemetry devices in the database.
 *     tags:
 *       - Device
 *     responses:
 *       200:
 *         description: A list of devices
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   deviceId:
 *                     type: string
 *                     example: "abc123"
 *                   name:
 *                     type: string
 *                     example: "Temperature Sensor"
 */
router.get('/', async (req, res) => {
    try {
        const snapshot = await db.collection('mqtt_data')
            .orderBy('timestamp', 'desc')
            .limit(500)
            .get();

        const devicesMap = new Map();

        snapshot.docs.forEach(doc => {
            const entry = doc.data();
            const deviceData = entry.data?.device || {};
            const topic = entry.topic || 'unknown';
            const timestamp = entry.timestamp?.toDate?.() || entry.processedAt;

            // create a unique ID for the device based on the topic or id field
            const id = deviceData.id || topic.replace(/[^\w]/g, '_');

            // if this device is not already in the map, add it
            if (!devicesMap.has(id)) {
                devicesMap.set(id, {
                    id,
                    model: deviceData.model || null,
                    firmware: deviceData.firmware || null,
                    type: deviceData.type || null,
                    lastSeen: timestamp,
                    topic
                });
            }
        });

        const devices = Array.from(devicesMap.values());
        res.status(200).json(devices);
    } catch (e) {
        console.error('Err when fetching devices:', e);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
