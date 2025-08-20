// File: routes/devices.js
const express = require('express');
const router = express.Router();
const { db } = require('../../firebase/firebase');

/**
 * @openapi
 * /devices:
 *   get:
 *     summary: Get all registered telemetry devices
 *     description: Returns a list of all unique devices from the 'devices' collection.
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
 *                   id:
 *                     type: string
 *                     example: "device_123"
 *                   model:
 *                     type: string
 *                     example: "ESP32"
 *                   firmware:
 *                     type: string
 *                     example: "v1.0.5"
 *                   type:
 *                     type: string
 *                     example: "temperature_sensor"
 *                   topic:
 *                     type: string
 *                     example: "sensors/temperature/device_123"
 *                   lastActive:
 *                     type: integer
 *                     example: 1691576900000
 */
router.get('/', async (req, res) => {
    try {
        const snapshot = await db.collection('devices').get();

        const devices = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                model: data.model || null,
                firmware: data.firmware || null,
                type: data.type || null,
                topic: data.topic || null,
                lastActive: data.lastActive || null
            };
        });

        res.status(200).json(devices);
    } catch (e) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
