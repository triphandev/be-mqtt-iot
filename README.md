# MQTT with MongoDB

This Node.js project connects to an MQTT broker, captures data from specific topics, and saves it into a MongoDB database. The Node.js project also provides API endpoints for specific queries. This project use Docker container.

## Prerequisites

- Node.js (v20 or higher)

- Firebase Project (Firestore + Realtime Database enabled)

- MQTT Broker (e.g. Mosquitto)

- Docker (optional)

- Docker Compose (optional)

If you are going to run the project with Docker, it is not necessary to install Node.js and MongoDB, the containers already use images with the necessary installations.

## Clone

1. Clone the repository:

 ```bash
 git clone https://github.com/triphandev/be-mqtt-iot.git
 cd be-mqtt-iot
 ```

1. Install dependencies (only if you intend to run without Docker):

 ```bash
 npm install
 ```

1. Configure environment variables by creating a `.env` file in the root of the project with the following content:

 ```ini
 # MQTT
MQTT_URL=mqtt://test.mosquitto.org
MQTT_PORT=1883
MQTT_TOPIC=mqtt-firebase
MQTT_USERNAME=
MQTT_PASSWORD=

# Firebase Service Account (use ENV for security)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY\n-----END PRIVATE KEY-----\n"

FIREBASE_DB_URL=https://your-project-id-default-rtdb.asia-southeast1.firebasedatabase.app
 ```

1. Run project (only if you intend to run without Docker):

```bash
npm install
npm run dev
```

## Project Structure
```plaintext
- - mqtt-firebase/
  |- mqtt/
     |- mqttClient.js          # MQTT connection and message processing
  |- firebase/
     |- firebase.js            # Firebase Admin SDK initialization
  |- routes/
     |- telemetryRoutes.js     # API for telemetry data
     |- deviceRoutes.js        # API for device management
  |- .env
  |- .gitignore
  |- app.js
  |- config.js
  |- docker-compose.yml
  |- Dockerfile
  |- LICENCE
  |- package-lock.json
  |- package.json
  |- swagger.js

  
```

## Usage with Docker

To start the project, run:

```bash
sudo docker-compose -p telemetry up -d
```

If you are running docker compose on a personal computer locally, you can access the API documentation and interact with it through the following address: `localhost:3001/api-docs`. If you are running on a server, you must use the IP to access and perform the necessary firewall configurations.

![API Doc with Swagger](images/doc.png)

> ⚠️ **Warning:** Before you can send messages to the brocker intended for a certain channel, you first need to use the API endpoint to create a device with that channel.

If you are running docker compose on a personal computer locally, you can connect to the database (e.g. with NoSQL Booster) at the following address: `localhost:27018`. If you are running on a server, you must use the IP to access and perform the necessary firewall configurations.

![NoSQL Booster for MongoDB](images/db.png)

If you want to test and don't have an IoT device, you can use the MQTTX app to create a connection to the Mosquitto test brocker and send messages to the channel registered to your device.

![Creating a connection on MQTTX](images/mqttx-connection.png)
![Sending messages on MQTTX](images/mqttx-messages.png)

To stop the project, run:

```bash
sudo docker-compose -p telemetry down
```

To rebuild after changes if you change Dockerfile (need start again after):
```bash
sudo docker-compose -p telemetry build
```

If you wish, you can access the application container in interactive mode and use PM2 to monitor the application logs:
```bash
docker exec -it app-telemetry bash
pm2 monit
```

If you wish, you can access the database container in interactive mode and use mongosh to query the collections documents.
```bash
docker exec -it db-telemetry bash
mongosh
use iot
```

## Database:

The telemetry collection in the database should be named `telemetry` and have the following structure:

# Devices (Firestore)
```javascript
use iot
// Collection: devices
{
  "channel": "mqtt-firebase",
  "description": "Environmental light and temperature monitoring system",
  "status": true,
  "createdAt": <server timestamp>,
  "updatedAt": <server timestamp>
}
```
# Telemetry (Firestore)
// Collection: mqtt_data
{
  "topic": "device/sensor/temp_007",
  "data": {
    "temperature": 25.7,
    "device": {
      "firmware": "v2.1.8",
      "id": "temp_007",
      "model": "TI_SENSORTAG",
      "type": "sensor"
    },
    "network": {
      "latency": 120,
      "rssi": -53
    }
  },
  "timestamp": <server timestamp>,
  "processedAt": "2025-08-01T03:42:34.795Z"
}

# Alerts (Realtime Database)
"alerts": {
  "temp_007": {
    "-OABC12345": {
      "temperature": 38,
      "timestamp": 1690954320000,
      "message": "Nhiệt độ bất thường: 38°C",
      "deviceModel": "TI_SENSORTAG",
      "deviceType": "sensor",
      "deviceId": "temp_007"
    }
  }
}
# Firestore (Client read-only, Server full access)
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read: if true;
      allow write: if false;
    }
  }
}

# Realtime Database (Client read-only, Server full access)
{
  "rules": {
    ".read": true,
    ".write": false
  }
}