const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKeys.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://mqtt-iot-48280-default-rtdb.asia-southeast1.firebasedatabase.app'
});

async function insertDevice(device) {
  try {
    const devicesRef = db.collection('devices');
    const docRef = devicesRef.doc(device.channel);

    await docRef.set({
      channel: device.channel,
      description: device.description,
      status: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    return true;
  } catch (e) {
    console.error('Lỗi khi thêm thiết bị:', e);
    return false;
  }
}

const db = admin.firestore();
const realtimeDb = admin.database();

module.exports = { admin, db, realtimeDb, insertDevice };