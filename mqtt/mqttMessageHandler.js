const { db, realtimeDb } = require('../firebase/firebase');

const lastTelemetryMap = new Map();

const handleMqttMessage = async (topic, message) => {
  try {
    const MIN_INTERVAL = 5000;
    const msg = message.toString();
    let data;

    try {
      data = JSON.parse(msg);
    } catch (e) {
      data = { rawData: msg };
    }

    const deviceId = data?.device?.id || topic;
    const currentTemp = data?.data?.temperature;
    const currentHumidity = data?.data?.humidity;

    let shouldSave = true;

    if (currentTemp !== undefined || currentHumidity !== undefined) {
      const lastEntry = lastTelemetryMap.get(deviceId);

      if (lastEntry) {
        let temperatureDelta = 0;
        let humidityDelta = 0;

        if (currentTemp !== undefined) {
          temperatureDelta = Math.abs(currentTemp - lastEntry.temperature);
        }
        if (currentHumidity !== undefined) {
          humidityDelta = Math.abs(currentHumidity - lastEntry.humidity);
        }

        const timeDelta = Date.now() - lastEntry.time;

        if ((temperatureDelta < 0.1 && humidityDelta < 0.1) && timeDelta < MIN_INTERVAL) {
          shouldSave = false;
        }
      } else {
        shouldSave = true;
      }
    }

    // Save or update device information
    if (deviceId && data?.device) {
      await db.collection('devices').doc(deviceId).set({
        deviceId: deviceId,
        model: data.device.model || 'Unknown model',
        type: data.device.type || 'Unknown type',
        firmware: data.device.firmware || 'Unknown firmware',
        topic: topic,
        lastActive: Date.now()
      }, { merge: true });
    }

    if (shouldSave) {
      const now = Date.now();

      // Save to device's telemetry subcollection
      await db.collection('devices')
        .doc(deviceId)
        .collection('telemetry')
        .add({
          topic: topic,
          data: data,
          timestamp: now,
          processedAt: now
        });

      // Save summary log to mqtt_data
      await db.collection('mqtt_data').add({
        topic: topic,
        data: data,
        timestamp: now,
        processedAt: now
      });

      // Update last telemetry
      lastTelemetryMap.set(deviceId, {
        temperature: currentTemp,
        humidity: currentHumidity,
        time: now
      });

      // Temperature alert
      if (currentTemp > 37 || currentTemp < 10) {
        const alertData = {
          temperature: currentTemp,
          humidity: currentHumidity,
          message: `Abnormal temperature: ${currentTemp}°C`,
          deviceModel: data?.device?.model || 'Unknown model',
          deviceType: data?.device?.type || 'Unknown type',
          deviceId: deviceId,
          createdAt: now
        };

        await realtimeDb.ref(`alerts/${deviceId}`).push(alertData);
        await db.collection('push_history').add({ ...alertData, topic: topic, triggeredBy: 'temperature', savedAt: now, read: false });
      }

      // Humidity alert
      if (currentHumidity > 90 || currentHumidity < 20) {
        const alertData = {
          temperature: currentTemp,
          humidity: currentHumidity,
          message: `Abnormal humidity: ${currentHumidity}%`,
          deviceModel: data?.device?.model || 'Unknown model',
          deviceType: data?.device?.type || 'Unknown type',
          deviceId: deviceId,
          createdAt: now
        };

        await realtimeDb.ref(`alerts/${deviceId}`).push(alertData);
        await db.collection('push_history').add({ ...alertData, topic: topic, triggeredBy: 'humidity', savedAt: now, read: false });
      }
    }

  } catch (error) {
    console.error('Error processing MQTT message:', error);
  }
};

module.exports = { handleMqttMessage };
