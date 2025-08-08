const express = require('express');
const router = express.Router();
const { db } = require('../../firebase/firebase');

/**
 * @openapi
 * /notifications:
 *   get:
 *     summary: Get all notification history
 *     description: Returns a list of all recorded notifications (alerts).
 *     tags:
 *       - Notification
 *     parameters:
 *       - name: deviceId
 *         in: query
 *         required: false
 *         description: "Filter notifications by device ID"
 *         schema:
 *           type: string
 *       - name: limit
 *         in: query
 *         required: false
 *         description: "Limit number of results (default: 50)"
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: List of notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   deviceId:
 *                     type: string
 *                   message:
 *                     type: string
 *                   triggeredBy:
 *                     type: string
 *                   savedAt:
 *                     type: integer
 *                   temperature:
 *                     type: number
 *                   humidity:
 *                     type: number
 *                   read:
 *                     type: boolean
 *                   status:
 *                     type: string
 *                     description: Processing status of the notification (e.g., sent, failed)
 */
router.get('/', async (req, res) => {
  try {
    const { deviceId, limit = 50 } = req.query;

    let query = db.collection('push_history').orderBy('savedAt', 'desc').limit(Number(limit));

    if (deviceId) {
      query = query.where('deviceId', '==', deviceId);
    }

    const snapshot = await query.get();
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    res.status(200).json({ status: 'success', count: data.length, data });
  } catch (e) {
    console.error('Error fetching notifications:', e);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

module.exports = router;
