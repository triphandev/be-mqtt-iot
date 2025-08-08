// app.js
const express = require('express');
const app = express();
const telemetryRoutes = require('./routes/telemetryRoutes');
const deviceListRoutes = require('./routes/device/devices');
const deviceDetailRoutes = require('./routes/device/deviceDetail');
const getNotifications = require('./routes/notification/getNotifications');
const markAsRead = require('./routes/notification/markAsRead');
require('./mqtt/mqttClient');

const { swaggerUi, specs } = require('./swagger');

app.use(express.json());
app.use('/api/telemetry', telemetryRoutes);

//device routes
app.use('/api/devices', deviceListRoutes);
app.use('/api/devices', deviceDetailRoutes);

//notification routes
app.use('/api/notifications', getNotifications);
app.use('/api/notifications', markAsRead);

// Swagger config
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Documentation available at /api-docs`);
});
