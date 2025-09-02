const express = require('express');
const router = express.Router();
const { db } = require('../firebase/firebase');
/**
 * @openapi
 * /telemetry:
 *   get:
 *     summary: Get telemetry list
 *     description: |
 *       Returns the latest telemetry list from Firestore.  
 *       You can filter by:
 *       - Device type (`type`)
 *       - Device ID (`deviceId`)
 *       - Time range (`fromDate`, `toDate`) in milliseconds since 1/1/1970 UTC  
 *       - Record limit (`limit`)
 *       
 *       If `fromDate` and `toDate` are not provided:
 *       - `fromDate` defaults to 00:00 today
 *       - `toDate` defaults to the current time
 *       
 *       If `limit` is not provided, all records will be returned.
 *     tags:
 *       - Device
 *     parameters:
 *       - in: query
 *         name: type
 *         required: false
 *         schema:
 *           type: string
 *         description: "Device type (e.g., sensor, actuator, ...)"
 *       - in: query
 *         name: deviceId
 *         required: false
 *         schema:
 *           type: string
 *         description: "Device ID (e.g., dev001)"
 *       - in: query
 *         name: fromDate
 *         required: false
 *         schema:
 *           type: integer
 *           format: int64
 *         description: |
 *           Start time for filtering (milliseconds since 1/1/1970 UTC).  
 *           Default: 00:00 today.
 *           Example: 1735689600000
 *       - in: query
 *         name: toDate
 *         required: false
 *         schema:
 *           type: integer
 *           format: int64
 *         description: |
 *           End time for filtering (milliseconds since 1/1/1970 UTC).  
 *           Default: Current time.
 *           Example: 1754326800000
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *          description: "Limit the number of returned records. If not provided, all records will be returned."
 *     responses:
 *       200:
 *         description: Telemetry list
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
 *         description: Server error
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
  let { type, deviceId, fromDate, toDate, limit } = req.query;
  try {
    let query = db.collection('mqtt_data');

    // Add where condition if fromDate is provided
    if (fromDate) {
      query = query.where('timestamp', '>=', new Date(Number(fromDate)));
    }
    // Add where condition if toDate is provided
    if (toDate) {
      query = query.where('timestamp', '<=', new Date(Number(toDate)));
    }

    // Order by
    query = query.orderBy('timestamp', 'desc');

    // Only apply limit if it's provided and greater than 0
     if (limit && Number(limit) > 0) {
      query = query.limit(Number(limit));
    }

    const snapshot = await query.get();
    let results = snapshot.docs.map(doc => doc.data());
    // Filter by type and deviceId in JS if provided
    if (type) {
      results = results.filter(entry => entry?.data?.device?.type === type);
    }
    if (deviceId) {
      results = results.filter(entry => entry?.data?.device?.id === deviceId);
    }

    const result = results.map(entry => ({
      humidity: entry?.data?.data?.humidity ?? null,
      temperature: entry?.data?.data?.temperature ?? null,
      deviceId: entry?.data?.device?.id ?? null,
      model: entry?.data?.device?.model ?? null,
      type: entry?.data?.device?.type ?? null,
      topic: entry.topic ?? null,
      timestamp: entry.timestamp?.toDate?.() ?? entry.processedAt ?? null,
    }));

    res.status(200).json(result);
  } catch (e) {
    res.status(500).json({ message: e.message, stack: e.stack });
  }
});

module.exports = router;
