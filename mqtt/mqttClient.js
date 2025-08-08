const mqtt = require('mqtt');
const { MQTT_URL, MQTT_PORT, MQTT_USERNAME, MQTT_PASSWORD } = require('../config');
const { handleMqttMessage } = require('./mqttMessageHandler');

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

client.on('connect', () => {
    TOPICS.forEach((topic) => {
        client.subscribe(topic, { qos: 0 }, (err) => {
            if (err) console.error('Subscribe error:', err);
            else console.log(`Subscribed to ${topic}`);
        });
    });
});

client.on('message', handleMqttMessage);

client.on('error', (err) => {
    console.error('Connection error:', err.message);
    if (err.code === 'ECONNREFUSED') {
        console.log('1. Kiểm tra broker có đang chạy?');
        console.log('2. Đúng port (8883 cho SSL)?');
    }
});

client.on('close', () => {
    console.log('🔌 Disconnected from broker');
});

const testConnection = () => {
    const net = require('net');
    const socket = new net.Socket();

    socket.setTimeout(3000);
    socket.connect(8883, 'test.mosquitto.org', () => {
        console.log('TCP test passed');
        socket.destroy();
    });

    socket.on('error', (err) => {
        console.error('TCP test failed:', err.message);
        console.log('Kiểm tra:');
        console.log('- Firewall/antivirus chặn kết nối?');
        console.log('- Mạng công ty có chặn port?');
    });
};

testConnection();
module.exports = client;
