require('dotenv').config();
const admin = require('firebase-admin');
const serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DB_URL
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
    return false;
  }
}

const db = admin.firestore();
const realtimeDb = admin.database();

module.exports = { admin, db, realtimeDb, insertDevice };