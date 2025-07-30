const mqtt = require('mqtt');
const { MQTT_URL, MQTT_PORT, MQTT_USERNAME, MQTT_PASSWORD, MQTT_TOPIC } = require('../config');
const { admin, db } = require('../firebase/firebase');

const options = {
    clientId: `client_${Math.random().toString(16).substr(2, 8)}`,
    clean: true,
    username: MQTT_USERNAME,
    password: MQTT_PASSWORD,
    connectTimeout: 8000,
    reconnectPeriod: 2000,
    keepalive: 30,
    protocolVersion: 4,
    rejectUnauthorized: false
};

const client = mqtt.connect(`mqtts://${MQTT_URL}:${MQTT_PORT}`, options);
const TOPICS = [
    '#',
    'mqtt-topic',
    'devices/+/status',
    'sensors/#'
];
// Connect to the MQTT broker
client.on('connect', () => {
    console.log('✅ Connected to public broker');
    TOPICS.forEach((topic) => {
        client.subscribe(topic, { qos: 0 }, (err) => {
            if (err) console.error('Subscribe error:', err);
            else {
                console.log(`Subscribed to ${topic}`);
            }
        });
    });
});
// Handle incoming messages
client.on('message', async (topic, message) => {
    try {
        const msg = message.toString();
        let data;
        try {
            data = JSON.parse(msg);
        } catch (e) {
            data = { rawData: msg };
            console.warn('Received non-JSON message, saved as raw data');
        }

        // Lưu vào Firestore
        const docRef = await db.collection('mqtt_data').add({
            topic: topic,
            data: data,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            processedAt: new Date().toISOString()
        });

        console.log(`✅ Saved to Firestore with ID: ${docRef.id}`);

        // Kiểm tra ngưỡng nhiệt độ nếu có
        if (data.temperature) {
            if (data.temperature > 37 || data.temperature < 10) {
                console.warn(`⚠️ Temperature alert: ${data.temperature}°C`);
                // Có thể thêm xử lý cảnh báo ở đây
            }
        }
    } catch (error) {
        console.error('🚨 Error processing MQTT message:', error);
    }

});
// Handle connection errors
client.on('error', (err) => {
    console.error('🚨 Connection error:', err.message);
    if (err.code === 'ECONNREFUSED') {
        console.log('1. Kiểm tra broker có đang chạy?');
        console.log('2. Đúng port (8883 cho SSL)?');
    }
});

// Handle disconnection
client.on('close', () => {
    console.log('🔌 Disconnected from broker');
});

// Test connection to MQTT broker
const testConnection = () => {
    const net = require('net');
    const socket = new net.Socket();

    socket.setTimeout(3000);
    socket.connect(8883, 'test.mosquitto.org', () => {
        console.log('✅ TCP test passed');
        socket.destroy();
    });

    socket.on('error', (err) => {
        console.error('❌ TCP test failed:', err.message);
        console.log('Kiểm tra:');
        console.log('- Firewall/antivirus chặn kết nối?');
        console.log('- Mạng công ty có chặn port?');
    });
};

testConnection();
module.exports = client;
