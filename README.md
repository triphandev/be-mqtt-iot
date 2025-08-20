# MQTT with MongoDB

Node.js app connects to MQTT broker, gets data from topics and saves to **Firebase** (Firestore or Realtime Database). The project also provides API for querying and has Swagger UI available. Can be run natively or with Docker.

## Prerequisites

- Node.js v20+
- Firebase Account and Service Account JSON
- MQTT Broker (e.g. Mosquitto, can use `test.mosquitto.org`)
- Docker and Docker Compose (optional)

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
MQTT_TOPIC=mqtt-topic
MQTT_USERNAME=
MQTT_PASSWORD=

# Select DB type: firestore or rtdb
FIREBASE_DB=firestore

# Service account information (environment variable recommended)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project-id.iam.gserviceaccount.com
# Note: replace \n correctly when setting in .env
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nABC...xyz\n-----END PRIVATE KEY-----\n"

# If using Realtime Database, need more
FIREBASE_DATABASE_URL=https://your-project-id.firebaseio.com
 ```

1. Run project (only if you intend to run without Docker):

```bash
npm run dev
```

## Project Structure
```plaintext
- mqtt-mongo/
|- images/
  |- mqtt/
  |   |- mqttClient.js
  |   |- mqttMessageHandler.js
  |- routes/
  |   |- telemetryRoutes.js
  |   |- device/
  |   |   |- devices.js
  |   |   |- deviceDetail.js
  |   |- notification/
  |       |- getNotifications.js
  |       |- markAsRead.js
  |- .env
  |- .gitignore
  |- app.js
  |- config.js
  |- docker-compose.yml
  |- Dockerfile
  |- LICENSE
  |- package.json
  |- package-lock.json
  |- README.md
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
