const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKeys.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // databaseURL: 'https://your-project-id.firebaseio.com'
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

// async function insertTelemetry(telemetry, device) {
//   try {
//     // Save telemetry data to Firestore
//     const telemetryRef = db.collection('telemetry').doc();
//     await telemetryRef.set({
//       date: admin.firestore.FieldValue.serverTimestamp(),
//       light: telemetry.light,
//       temperature: telemetry.temperature,
//       deviceId: device.channel
//     });

//     // Save to Realtime Database
//     if (telemetry.temperature > 37 || telemetry.temperature < 10) {
//       const alertsRef = realtimeDb.ref(`alerts/${device.channel}`);
//       await alertsRef.set({
//         temperature: telemetry.temperature,
//         timestamp: Date.now(),
//         message: `Cảnh báo nhiệt độ: ${telemetry.temperature}°C`
//       });
//     }

//     return true;
//   } catch (e) {
//     console.error('Lỗi khi lưu dữ liệu:', e);
//     return false;
//   }
// }

// function setupRealtimeListeners() {
//   const alertsRef = realtimeDb.ref('alerts');

//   alertsRef.on('child_added', (snapshot) => {
//     const alert = snapshot.val();
//     console.log('Cảnh báo mới:', alert);

//   });
// }

const db = admin.firestore();
// const realtimeDb = admin.database();

module.exports = { admin, db, insertDevice };