const express = require('express');
const router = express.Router();
const { db } = require('../../firebase/firebase');

/**
 * @openapi
 * /notifications/{id}/read:
 *   patch:
 *     summary: Mark a notification as read
 *     tags:
 *       - Notification
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification document ID
 *     responses:
 *       200:
 *         description: Notification marked as read
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Marked as read
 *       404:
 *         description: Notification not found
 *       500:
 *         description: Server error
 */
router.patch('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    const ref = db.collection('push_history').doc(id);
    const doc = await ref.get();

    if (!doc.exists) {
      return res.status(404).json({ status: 'error', message: 'Notification not found' });
    }

    await ref.update({ read: true });
    res.status(200).json({ status: 'success', message: 'Marked as read' });
  } catch (e) {
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

module.exports = router;
