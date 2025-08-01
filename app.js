// app.js
const express = require('express');
const app = express();
const telemetryRoutes = require('./routes/telemetryRoutes');
const deviceRoutes = require('./routes/deviceRoutes');
require('./mqtt/mqttClient');

const { swaggerUi, specs } = require('./swagger');

app.use(express.json());
app.use('/api/telemetry', telemetryRoutes);
app.use('/api/devices', deviceRoutes);

// Swagger config
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

const port = process.env.PORT;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Documentation available at /api-docs`);
});
