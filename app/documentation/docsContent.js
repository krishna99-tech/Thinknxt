/**
 * ThingsNXT Real Platform Documentation Content
 * Inspired by OpenAI, Claude, and Stripe developer documentation architectures.
 */

export const DOCS_CATEGORIES = [
  {
    id: 'getting-started',
    name: 'Getting Started',
    icon: 'rocket',
    items: [
      { id: 'platform-overview', title: 'Platform Overview', badge: 'Intro' },
      { id: 'architecture-quickstart', title: 'Architecture & Ports', badge: 'Services' },
      { id: 'device-credentials', title: 'Device Provisioning', badge: 'Auth' },
    ],
  },
  {
    id: 'connectivity',
    name: 'Device Connectivity',
    icon: 'cpu',
    items: [
      { id: 'mqtt-guide', title: 'MQTT Protocol', badge: '1883' },
      { id: 'http-rest-guide', title: 'HTTP REST Ingest', badge: '4001' },
      { id: 'websocket-streaming', title: 'WebSockets (Live)', badge: 'WS' },
    ],
  },
  {
    id: 'platform-features',
    name: 'Platform & Management',
    icon: 'layers',
    items: [
      { id: 'workspaces-management', title: 'Workspaces & RBAC', badge: 'Core' },
      { id: 'automations-rules', title: 'Automations & Alerts', badge: 'Rules' },
      { id: 'user-console-dashboards', title: 'Console & Dashboards', badge: 'UI' },
    ],
  },
  {
    id: 'troubleshooting',
    name: 'API Reference & Security',
    icon: 'shield',
    items: [
      { id: 'status-codes-errors', title: 'Status Codes & Errors', badge: 'HTTP' },
      { id: 'security-best-practices', title: 'Security Best Practices', badge: 'Sec' },
    ],
  },
];

export const DOCS_DATA = {
  'platform-overview': {
    id: 'platform-overview',
    category: 'Getting Started',
    title: 'Platform Overview',
    subtitle: 'High-performance IoT telemetry ingestion, real-time control, and analytics infrastructure.',
    badge: 'Introduction',
    lastUpdated: 'October 2026',
    toc: [
      { id: 'core-capabilities', title: 'Core Capabilities' },
      { id: 'architecture-pipeline', title: 'Data Flow Pipeline' },
      { id: 'supported-protocols', title: 'Supported Protocols' },
      { id: 'next-steps', title: 'Next Steps' },
    ],
    prev: null,
    next: { id: 'architecture-quickstart', title: 'Architecture & Ports' },
    codeTabs: null,
    content: `
### Overview

**ThingsNXT** is an enterprise-grade IoT platform designed for sub-100ms bidirectional hardware communication, multi-tenant workspace isolation, dynamic telemetry rule evaluation, and responsive real-time dashboards.

---

### Core Capabilities {#core-capabilities}

- **Multi-Protocol Hardware Gateway**: Connect hardware using **MQTT** (standard port 1883), **HTTP REST** (Fastify gateway port 4001), or **WebSockets**.
- **High-Throughput Microservice Stack**: Built on top of **Fastify**, **Kafka Event Streams**, **Redis In-Memory Pub/Sub**, and **MongoDB**.
- **Real-Time Bidirectional Downlinks**: Transmit commands from user dashboards to field actuators (switches, relays, motors) in under 50ms.
- **Enterprise Workspaces**: Isolate devices, team members, alert rules, and telemetry records with granular Role-Based Access Control (RBAC).
- **Automation Engine**: Configure condition triggers (e.g., \`temperature > 45°C\`, \`battery < 15%\`) to fire email alerts, webhooks, or automated downlink actuator commands.

---

### Data Flow Pipeline {#architecture-pipeline}

\`\`\`text
┌─────────────────┐       MQTT (Port 1883)       ┌────────────────────────┐
│  Hardware Node  ├─────────────────────────────>│  MQTT Microservice      │──┐
│ (ESP32/Arduino) │       HTTP POST (Port 4001)  └────────────────────────┘  │
│                 ├─────────────────────────────>┌────────────────────────┐  ├──> [ Redis Pub/Sub ] ──> [ Live WebSockets ]
└─────────────────┘                              │  Fastify Ingest Gateway │──┘         │                         │
                                                 └────────────────────────┘             ▼                         ▼
                                                             │                  [ Kafka Stream ]          [ ThinkNXT Web App ]
                                                             ▼                          │
                                                    [ MongoDB / InfluxDB ]<─────────────┘
\`\`\`

---

### Supported Protocols {#supported-protocols}

| Protocol | Default Port | Best Used For | Latency |
| :--- | :--- | :--- | :--- |
| **MQTT** | \`1883\` / \`8883\` | Embedded microcontrollers, ESP32, low-bandwidth networks | < 40ms |
| **HTTP REST** | \`4001\` | Edge gateways, 4G/LTE modems, Python agents, batch uploads | ~80ms |
| **WebSockets** | \`4001 (/ws)\` | Interactive web dashboards, mobile applications, live streams | < 20ms |

---

### Next Steps {#next-steps}

Explore the system architecture or jump straight to flashing your first microcontroller:
- Read [System Architecture & Service Ports](#architecture-quickstart)
- Connect hardware via [MQTT Protocol Guide](#mqtt-guide)
- Send REST telemetry via [HTTP Ingestion Guide](#http-rest-guide)
`,
  },

  'architecture-quickstart': {
    id: 'architecture-quickstart',
    category: 'Getting Started',
    title: 'Architecture & Ports',
    subtitle: 'Comprehensive breakdown of microservices, network ports, and backend data flows.',
    badge: 'Architecture',
    lastUpdated: 'October 2026',
    toc: [
      { id: 'service-matrix', title: 'Service & Port Matrix' },
      { id: 'microservice-roles', title: 'Microservice Roles' },
      { id: 'data-guarantees', title: 'Throughput & Reliability' },
    ],
    prev: { id: 'platform-overview', title: 'Platform Overview' },
    next: { id: 'device-credentials', title: 'Device Provisioning' },
    codeTabs: null,
    content: `
### Service & Port Matrix {#service-matrix}

ThingsNXT runs as a cluster of specialized containerized services, each tailored to specific requirements:

| Service Name | Port | Protocol | Purpose & Endpoints |
| :--- | :--- | :--- | :--- |
| **Fastify Ingest Gateway** | \`4001\` | HTTP / WebSocket | High-speed telemetry ingestion (\`/api/v1/telemetry\`) & WebSocket stream (\`/ws\`) |
| **MQTT Gateway Service** | \`1883\` / \`4002\` | MQTT / HTTP | MQTT broker connection on 1883; health check & downlink bridge on 4002 |
| **Core Python API** | \`8000\` | HTTP (FastAPI) | Workspace management, user authentication, and rule engine |
| **ThinkNXT Portal** | \`3000\` | Next.js / React | Client web application, live dashboard builder, and analytics |
| **Admin Console** | \`3001\` | Next.js / TypeScript | System administrator panel, workspace and device fleet manager |
| **Redis Broker** | \`6379\` | In-Memory Pub/Sub | Sub-millisecond live broadcast and command routing |
| **Kafka Event Bus** | \`9092\` | Event Streaming | Persistent partitioned stream for high-volume analytics |
| **MongoDB** | \`27017\` | Document DB | Device metadata, user credentials, and workspace permissions |

---

### Microservice Roles {#microservice-roles}

1. **Fastify Ingest**:
   - Compiled with Ajv for microsecond payload schema validation.
   - Accepts both single pings and batch telemetry (up to 500 records per HTTP request).
   - Fans out live events into Redis channels (\`device:{id}:live\` and \`workspace:{id}:live\`).

2. **MQTT Microservice**:
   - Maintains persistent TCP sockets with field hardware.
   - Automatically validates device tokens against MongoDB with a local 60-second in-memory LRU cache.
   - Translates incoming sensor packets into canonical \`TelemetryEventV1\` schemas.
   - Listens to downlink commands on \`device:*:commands\` and immediately delivers them to devices.

3. **WebSocket Stream Server**:
   - Unified socket server at \`ws://<host>:4001/ws\`.
   - Supports scoped topic subscriptions (e.g. \`device:<id>\`, \`workspace:<id>\`, or \`*\`).
`,
  },

  'device-credentials': {
    id: 'device-credentials',
    category: 'Getting Started',
    title: 'Device Provisioning & Authentication',
    subtitle: 'How to register hardware devices and authenticate using cryptographic tokens.',
    badge: 'Security',
    lastUpdated: 'October 2026',
    toc: [
      { id: 'how-to-provision', title: 'Provisioning in Console' },
      { id: 'token-format', title: 'Token Format & Validation' },
      { id: 'embedded-storage', title: 'Secure Flash Storage' },
    ],
    prev: { id: 'architecture-quickstart', title: 'Architecture & Ports' },
    next: { id: 'mqtt-guide', title: 'MQTT Protocol' },
    codeTabs: null,
    content: `
### Provisioning in the User Console {#how-to-provision}

Before any hardware device can publish telemetry or receive commands, it must be registered within an active workspace:

1. Open the **ThinkNXT User Portal** at \`http://localhost:3000\`.
2. Select your target **Workspace** from the top header navigation.
3. In the sidebar, click on **Devices** > **"+ Add Device"**.
4. Fill out the device specification:
   - **Device Name**: e.g., \`Climate Sensor Beta-1\`
   - **Device Type**: e.g., \`ESP32\`, \`Raspberry Pi\`, \`Nordic nRF9160\`
   - **Workspace**: Assigned workspace
5. Click **Create Device**.

The console automatically generates a unique pair:
- **Device ID**: 24-character hex ID (e.g. \`69554f08de189a489d2eaba5\`)
- **Device Token**: 32-character secret string (e.g. \`3165ee79e4885b253bc9ca0674694259\`)

---

### Token Format & Validation {#token-format}

The gateway verifies hardware identity on every packet:
- For **MQTT**: Transmitted inside the root JSON body as \`"device_token": "..."\`.
- For **HTTP**: Provided either in the \`x-device-token\` HTTP header or inside the JSON payload.
- For **WebSocket**: Included as a query parameter (\`?token=...\`) or in the connection handshake.

---

### Secure Flash Storage on Embedded Devices {#embedded-storage}

Never hardcode credentials into source control. On ESP32 / ESP8266, use the non-volatile storage API (\`Preferences.h\` or \`SPIFFS\`):

\`\`\`cpp
#include <Preferences.h>

Preferences preferences;

void setup() {
  preferences.begin("thingsnxt-cfg", false);

  // Read stored credentials (or prompt via Serial / BLE if empty)
  String deviceId    = preferences.getString("dev_id", "69554f08de189a489d2eaba5");
  String deviceToken = preferences.getString("dev_token", "3165ee79e4885b253bc9ca0674694259");

  Serial.printf("Configured Device ID: %s\\n", deviceId.c_str());
}
\`\`\`
`,
  },

  'mqtt-guide': {
    id: 'mqtt-guide',
    category: 'Device Connectivity',
    title: 'Connecting Devices via MQTT',
    subtitle: 'Publish high-efficiency telemetry and receive remote actuator commands on port 1883.',
    badge: 'MQTT 1883',
    lastUpdated: 'October 2026',
    toc: [
      { id: 'broker-config', title: 'Broker Configuration' },
      { id: 'topics-structure', title: 'Topic Architecture' },
      { id: 'payload-format', title: 'Telemetry Schema' },
      { id: 'interactive-code', title: 'Firmware & Client Code' },
      { id: 'downlink-commands', title: 'Bidirectional Downlinks' },
    ],
    prev: { id: 'device-credentials', title: 'Device Provisioning' },
    next: { id: 'http-rest-guide', title: 'HTTP REST Ingest' },
    codeTabs: {
      'esp32': {
        label: 'ESP32 (C++)',
        language: 'cpp',
        code: `#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

const char* WIFI_SSID     = "YOUR_WIFI_SSID";
const char* WIFI_PASS     = "YOUR_WIFI_PASSWORD";

const char* MQTT_BROKER   = "192.168.1.103"; // ThingsNXT Host
const int   MQTT_PORT     = 1883;

const char* DEVICE_ID     = "69554f08de189a489d2eaba5";
const char* DEVICE_TOKEN  = "3165ee79e4885b253bc9ca0674694259";

WiFiClient espClient;
PubSubClient client(espClient);

// Receive downlink commands from ThingsNXT dashboard switches
void onCommandReceived(char* topic, byte* payload, unsigned int length) {
  String msg;
  for (int i = 0; i < length; i++) msg += (char)payload[i];
  Serial.printf("📥 Downlink on [%s]: %s\\n", topic, msg.c_str());

  StaticJsonDocument<256> doc;
  deserializeJson(doc, msg);
  if (doc.containsKey("v0")) {
    int state = doc["v0"];
    digitalWrite(2, state ? HIGH : LOW); // Actuate Relay / LED
    Serial.printf("Actuated Relay V0 -> %d\\n", state);
  }
}

void connectMQTT() {
  while (!client.connected()) {
    String clientId = "ThingsNXT-ESP32-" + String(DEVICE_ID);
    Serial.print("Connecting to ThingsNXT MQTT...");
    if (client.connect(clientId.c_str())) {
      Serial.println(" connected! ✅");
      // Subscribe to command channel
      String cmdTopic = "thingsnxt/device/" + String(DEVICE_ID) + "/commands";
      client.subscribe(cmdTopic.c_str(), 1);
    } else {
      Serial.printf(" failed (rc=%d), retrying in 3s...\\n", client.state());
      delay(3000);
    }
  }
}

void setup() {
  Serial.begin(115200);
  pinMode(2, OUTPUT);
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  while (WiFi.status() != WL_CONNECTED) { delay(500); Serial.print("."); }
  Serial.println("\\nWiFi Connected!");

  client.setServer(MQTT_BROKER, MQTT_PORT);
  client.setCallback(onCommandReceived);
}

void loop() {
  if (!client.connected()) connectMQTT();
  client.loop();

  static unsigned long lastTelemetry = 0;
  if (millis() - lastTelemetry > 5000) {
    lastTelemetry = millis();

    StaticJsonDocument<256> doc;
    doc["device_token"] = DEVICE_TOKEN;
    JsonObject data = doc.createNestedObject("data");
    data["temperature"] = 25.4 + (random(-10, 10) / 10.0);
    data["humidity"]    = 58.0 + random(-4, 4);
    data["v0"]          = digitalRead(2);

    char payload[256];
    serializeJson(doc, payload);

    String topic = "thingsnxt/device/" + String(DEVICE_ID) + "/telemetry";
    client.publish(topic.c_str(), payload);
    Serial.printf("🚀 Telemetry published: %s\\n", payload);
  }
}`,
      },
      'python': {
        label: 'Python (paho-mqtt)',
        language: 'python',
        code: `import json
import time
import paho.mqtt.client as mqtt

BROKER_HOST  = "localhost"
BROKER_PORT  = 1883
DEVICE_ID    = "69554f08de189a489d2eaba5"
DEVICE_TOKEN = "3165ee79e4885b253bc9ca0674694259"

TOPIC_TELEMETRY = f"thingsnxt/device/{DEVICE_ID}/telemetry"
TOPIC_COMMANDS  = f"thingsnxt/device/{DEVICE_ID}/commands"

def on_connect(client, userdata, flags, rc):
    print("Connected to ThingsNXT MQTT broker with code:", rc)
    client.subscribe(TOPIC_COMMANDS, qos=1)

def on_message(client, userdata, msg):
    payload = json.loads(msg.payload.decode())
    print("📥 Received remote command:", payload)

client = mqtt.Client(client_id=f"thingsnxt-py-{DEVICE_ID}")
client.on_connect = on_connect
client.on_message = on_message

client.connect(BROKER_HOST, BROKER_PORT, 60)
client.loop_start()

try:
    while True:
        telemetry = {
            "device_token": DEVICE_TOKEN,
            "data": {
                "temperature": 24.8,
                "humidity": 62.1,
                "status": "active"
            },
            "timestamp": int(time.time() * 1000)
        }
        client.publish(TOPIC_TELEMETRY, json.dumps(telemetry), qos=1)
        print("🚀 Published telemetry packet")
        time.sleep(5)
except KeyboardInterrupt:
    client.loop_stop()
    client.disconnect()`,
      },
      'nodejs': {
        label: 'Node.js (mqtt.js)',
        language: 'javascript',
        code: `import mqtt from 'mqtt';

const DEVICE_ID = '69554f08de189a489d2eaba5';
const DEVICE_TOKEN = '3165ee79e4885b253bc9ca0674694259';

const client = mqtt.connect('mqtt://localhost:1883', {
  clientId: \`thingsnxt-node-\${DEVICE_ID}\`,
  clean: true,
});

client.on('connect', () => {
  console.log('✅ Connected to ThingsNXT MQTT broker');
  client.subscribe(\`thingsnxt/device/\${DEVICE_ID}/commands\`, { qos: 1 });

  // Publish telemetry every 5 seconds
  setInterval(() => {
    const payload = {
      device_token: DEVICE_TOKEN,
      data: {
        temperature: (22 + Math.random() * 5).toFixed(2),
        humidity: 55,
        v0: 1,
      },
      timestamp: Date.now(),
    };

    client.publish(\`thingsnxt/device/\${DEVICE_ID}/telemetry\`, JSON.stringify(payload), { qos: 1 });
    console.log('🚀 Telemetry sent:', payload.data);
  }, 5000);
});

client.on('message', (topic, message) => {
  console.log('📥 Received downlink:', JSON.parse(message.toString()));
});`,
      },
    },
    content: `
### Broker Configuration {#broker-config}

- **Host**: \`your-server-ip\` or \`mqtt.thingsnxt.com\`
- **Port**: \`1883\` (Standard TCP), \`8883\` (TLS Encrypted)
- **Quality of Service (QoS)**: Use **QoS 1** for guaranteed at-least-once delivery.
- **Keep-Alive**: Recommended 60 seconds.

---

### Topic Architecture {#topics-structure}

All MQTT communication follows the standard ThingsNXT topic format:

| Topic Pattern | Direction | Description |
| :--- | :--- | :--- |
| \`thingsnxt/device/{device_id}/telemetry\` | Hardware ➔ Platform | Publish sensor readings and status |
| \`thingsnxt/device/{device_id}/commands\` | Platform ➔ Hardware | Receive remote downlink toggles and setpoints |
| \`thingsnxt/device/{device_id}/status\` | Hardware ➔ Platform | Device online/offline announcements |

---

### Telemetry Payload Schema {#payload-format}

Publish raw JSON strings to the telemetry topic:

\`\`\`json
{
  "device_token": "3165ee79e4885b253bc9ca0674694259",
  "data": {
    "temperature": 25.4,
    "humidity": 60.2,
    "v0": 1,
    "battery": 92
  },
  "timestamp": 1718000000000
}
\`\`\`

---

### Bidirectional Downlinks {#downlink-commands}

When a user clicks a switch on the dashboard or an automation rule fires, ThingsNXT publishes a downlink packet to:
\`thingsnxt/device/{device_id}/commands\`

Example command payload:
\`\`\`json
{
  "command": "set_state",
  "v0": 0,
  "timestamp": "2026-10-20T00:00:00.000Z"
}
\`\`\`
`,
  },

  'http-rest-guide': {
    id: 'http-rest-guide',
    category: 'Device Connectivity',
    title: 'Connecting Devices via HTTP (REST)',
    subtitle: 'High-speed REST API endpoints for telemetry ingestion and batch data uploads on port 4001.',
    badge: 'HTTP REST',
    lastUpdated: 'October 2026',
    toc: [
      { id: 'single-endpoint', title: 'Single Telemetry POST' },
      { id: 'batch-endpoint', title: 'Batch Gateway Ingest' },
      { id: 'headers-auth', title: 'Headers & Authentication' },
      { id: 'code-examples', title: 'Code Examples' },
    ],
    prev: { id: 'mqtt-guide', title: 'MQTT Protocol' },
    next: { id: 'websocket-streaming', title: 'WebSockets (Live)' },
    codeTabs: {
      'curl': {
        label: 'cURL',
        language: 'bash',
        code: `curl -X POST http://localhost:4001/api/v1/telemetry \\
  -H "Content-Type: application/json" \\
  -H "x-device-token: 3165ee79e4885b253bc9ca0674694259" \\
  -d '{
    "device_id": "69554f08de189a489d2eaba5",
    "workspace_id": "default",
    "data": {
      "temperature": 27.5,
      "humidity": 51.2,
      "v0": 1
    }
  }'`,
      },
      'esp32_http': {
        label: 'ESP32 (HTTPClient)',
        language: 'cpp',
        code: `#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

const char* API_URL     = "http://192.168.1.103:4001/api/v1/telemetry";
const char* DEVICE_ID   = "69554f08de189a489d2eaba5";
const char* DEV_TOKEN   = "3165ee79e4885b253bc9ca0674694259";

void sendTelemetry() {
  if (WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;
  http.begin(API_URL);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("x-device-token", DEV_TOKEN);

  StaticJsonDocument<256> doc;
  doc["device_id"] = DEVICE_ID;
  JsonObject data = doc.createNestedObject("data");
  data["temperature"] = 26.2;
  data["humidity"]    = 55.4;
  data["v0"]          = 1;

  String payload;
  serializeJson(doc, payload);

  int httpCode = http.POST(payload);
  if (httpCode == 202 || httpCode == 200) {
    Serial.println("✅ HTTP Telemetry Ingested!");
  } else {
    Serial.printf("❌ HTTP Error: %d\\n", httpCode);
  }
  http.end();
}`,
      },
      'python_requests': {
        label: 'Python (requests)',
        language: 'python',
        code: `import requests
import time

URL = "http://localhost:4001/api/v1/telemetry"
DEVICE_ID = "69554f08de189a489d2eaba5"
DEVICE_TOKEN = "3165ee79e4885b253bc9ca0674694259"

headers = {
    "Content-Type": "application/json",
    "x-device-token": DEVICE_TOKEN
}

payload = {
    "device_id": DEVICE_ID,
    "workspace_id": "default",
    "data": {
        "temperature": 23.4,
        "humidity": 48.0,
        "pressure": 1014.2
    },
    "timestamp": int(time.time() * 1000)
}

response = requests.post(URL, json=payload, headers=headers)
print("Status Code:", response.status_code)
print("Response JSON:", response.json())`,
      },
    },
    content: `
### Single Telemetry POST {#single-endpoint}

**Endpoint**: \`POST http://<host>:4001/api/v1/telemetry\`

Use this endpoint for real-time periodic updates from smart sensors or single IoT nodes.

#### Request Schema:
\`\`\`json
{
  "device_id": "69554f08de189a489d2eaba5",
  "device_token": "3165ee79e4885b253bc9ca0674694259",
  "workspace_id": "default",
  "data": {
    "temperature": 27.5,
    "humidity": 51.2,
    "v0": 1
  }
}
\`\`\`

#### Response:
\`\`\`json
{
  "status": "accepted",
  "device_id": "69554f08de189a489d2eaba5",
  "accepted_at": "2026-10-20T00:00:00.000Z"
}
\`\`\`

---

### Batch Gateway Ingestion {#batch-endpoint}

**Endpoint**: \`POST http://<host>:4001/api/v1/telemetry/batch\`

Ideal for multi-sensor LoRaWAN concentrators, cellular gateways, and offline logging nodes sending batched history (up to 500 items per request).

\`\`\`json
{
  "items": [
    {
      "device_id": "69554f08de189a489d2eaba5",
      "timestamp": 1718000000000,
      "data": { "temperature": 21.5, "humidity": 60 }
    },
    {
      "device_id": "69554f08de189a489d2eaba5",
      "timestamp": 1718000060000,
      "data": { "temperature": 21.9, "humidity": 59 }
    }
  ]
}
\`\`\`
`,
  },

  'websocket-streaming': {
    id: 'websocket-streaming',
    category: 'Device Connectivity',
    title: 'Real-time Streaming with WebSockets',
    subtitle: 'Sub-100ms bidirectional telemetry streaming for dashboards, mobile apps, and control surfaces.',
    badge: 'WebSocket WS',
    lastUpdated: 'October 2026',
    toc: [
      { id: 'ws-endpoints', title: 'WebSocket Endpoints' },
      { id: 'protocol-handshake', title: 'Handshake & Subscriptions' },
      { id: 'react-integration', title: 'React Hook Integration' },
    ],
    prev: { id: 'http-rest-guide', title: 'HTTP REST Ingest' },
    next: { id: 'workspaces-management', title: 'Workspaces & RBAC' },
    codeTabs: {
      'react_hook': {
        label: 'React Hook (useWebSocket)',
        language: 'javascript',
        code: `import { useEffect, useRef, useState } from 'react';

export function useLiveTelemetry(deviceId) {
  const [telemetry, setTelemetry] = useState(null);
  const [status, setStatus] = useState('disconnected');
  const wsRef = useRef(null);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:4001/ws');
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus('connected');
      // Subscribe to target device room
      ws.send(JSON.stringify({
        type: 'subscribe',
        topics: [\`device:\${deviceId}\`]
      }));
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.device_id === deviceId && msg.data) {
          setTelemetry(msg.data);
        }
      } catch (err) {
        console.error('WebSocket parse error:', err);
      }
    };

    ws.onclose = () => setStatus('disconnected');
    return () => ws.close();
  }, [deviceId]);

  return { telemetry, status };
}`,
      },
      'nodejs_ws': {
        label: 'Node.js (ws)',
        language: 'javascript',
        code: `import WebSocket from 'ws';

const ws = new WebSocket('ws://localhost:4001/ws');

ws.on('open', () => {
  console.log('Connected to ThingsNXT WebSocket Gateway');
  // Subscribe to all telemetry in the default workspace
  ws.send(JSON.stringify({
    type: 'subscribe',
    topics: ['workspace:default']
  }));
});

ws.on('message', (data) => {
  const event = JSON.parse(data.toString());
  console.log('⚡ Live Event:', event);
});`,
      },
    },
    content: `
### WebSocket Endpoints {#ws-endpoints}

- **Primary Gateway**: \`ws://<host>:4001/ws\`
- **Authenticated**: \`ws://<host>:4001/ws?token=<JWT_TOKEN>\`
- **Direct Device Room**: \`ws://<host>:4001/ws/devices/{deviceId}\`
- **Direct Workspace Room**: \`ws://<host>:4001/ws/workspaces/{workspaceId}\`

---

### Handshake & Subscriptions {#protocol-handshake}

When the client connects, the Fastify gateway returns a \`connected\` acknowledgment:

\`\`\`json
{
  "type": "connected",
  "message": "Fastify real-time streaming WebSocket connected",
  "user_id": "usr_99182",
  "timestamp": "2026-10-20T00:00:00.000Z"
}
\`\`\`

#### Dynamic Subscriptions:
Send a JSON subscription message to filter incoming traffic:
\`\`\`json
{
  "type": "subscribe",
  "topics": [
    "device:69554f08de189a489d2eaba5",
    "workspace:ws_factory_01"
  ]
}
\`\`\`

#### Heartbeat (Ping/Pong):
\`\`\`json
{ "type": "ping" }
\`\`\`
Server responds with:
\`\`\`json
{ "type": "pong", "timestamp": "2026-10-20T00:00:01.000Z" }
\`\`\`
`,
  },

  'workspaces-management': {
    id: 'workspaces-management',
    category: 'Platform & Management',
    title: 'Workspaces & Multi-Tenancy',
    subtitle: 'Enterprise isolation for devices, teams, dashboards, and role-based permissions.',
    badge: 'Workspaces',
    lastUpdated: 'October 2026',
    toc: [
      { id: 'why-workspaces', title: 'Multi-Tenant Architecture' },
      { id: 'rbac-matrix', title: 'Roles & Permissions (RBAC)' },
      { id: 'managing-workspaces', title: 'Console Operations' },
    ],
    prev: { id: 'websocket-streaming', title: 'WebSockets (Live)' },
    next: { id: 'automations-rules', title: 'Automations & Alerts' },
    codeTabs: null,
    content: `
### Multi-Tenant Architecture {#why-workspaces}

ThingsNXT enforces strict workspace boundary isolation. A **Workspace** acts as a secure boundary for:
1. **Device Fleets**: Devices belong to a single workspace. Telemetry cannot leak across workspaces.
2. **Interactive Dashboards**: Dashboards created within Workspace A can only access telemetry streams from devices in Workspace A.
3. **Alert Rules & Automations**: Rules only monitor telemetry belonging to their parent workspace.

---

### Roles & Permissions (RBAC) {#rbac-matrix}

| Role | Provision Hardware | Edit Dashboards | Trigger Actuators | Manage Members | Billing |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Owner** | Yes | Yes | Yes | Yes | Yes |
| **Admin** | Yes | Yes | Yes | Yes | No |
| **Operator / Member** | View Only | Yes | Yes | No | No |
| **Viewer** | View Only | Read-Only | Blocked | No | No |

---

### Console Operations {#managing-workspaces}

- **Switching Workspaces**: Click the workspace selector in the top navbar. The entire UI context and WebSocket subscription switches seamlessly.
- **Inviting Collaborators**: Go to **Settings** > **Workspace Members** > **Invite Member**. Select their role and enter their email address.
`,
  },

  'automations-rules': {
    id: 'automations-rules',
    category: 'Platform & Management',
    title: 'Automations & Alert Rules',
    subtitle: 'Configure real-time event triggers, sensor thresholds, and automated downlink commands.',
    badge: 'Automations',
    lastUpdated: 'October 2026',
    toc: [
      { id: 'rule-structure', title: 'Rule Anatomy' },
      { id: 'triggers-conditions', title: 'Triggers & Evaluators' },
      { id: 'automated-actions', title: 'Supported Actions' },
    ],
    prev: { id: 'workspaces-management', title: 'Workspaces & RBAC' },
    next: { id: 'user-console-dashboards', title: 'Console & Dashboards' },
    codeTabs: null,
    content: `
### Rule Anatomy {#rule-structure}

An automation rule consists of three steps:
\`\`\`text
[ TELEMETRY EVENT ] ──> [ THRESHOLD EVALUATOR ] ──> [ AUTOMATED DISPATCH ]
(temp = 48.2°C)          (is temp > 45°C for 60s)    1. Send Email Notification
                                                     2. Actuate Relay v0 = 0
                                                     3. HTTP Webhook to Slack
\`\`\`

---

### Triggers & Evaluators {#triggers-conditions}

- **Threshold Comparison**:
  - \`temperature >= 40.0\` (High temperature protection)
  - \`battery < 20\` (Low battery alert)
- **Digital Pin Transitions**:
  - \`v0 == 0\` (Pump shut off anomaly)
  - \`motion == 1\` (Security trigger)
- **Heartbeat Timeout**:
  - Device has not published a packet for > 300 seconds (Offline detection).

---

### Supported Actions {#automated-actions}

1. **Device Downlink Actuation**: Automatically publishes a command back to the device via MQTT topic \`thingsnxt/device/{id}/commands\` (e.g. \`{"v0": 0}\` to cut power).
2. **Email Alerts**: Dispatches transactional alert emails with sensor values and timestamps.
3. **HTTP Webhooks**: Posts a JSON payload to your custom server, Slack webhook, or Zapier integration.
`,
  },

  'user-console-dashboards': {
    id: 'user-console-dashboards',
    category: 'Platform & Management',
    title: 'Console & Interactive Dashboards',
    subtitle: 'Drag-and-drop dashboard builder with real-time gauges, time-series charts, and toggle switches.',
    badge: 'Console & App',
    lastUpdated: 'October 2026',
    toc: [
      { id: 'widget-library', title: 'Widget Library' },
      { id: 'dashboard-creation', title: 'Creating Dashboards' },
      { id: 'live-control', title: 'Live Control Surfaces' },
    ],
    prev: { id: 'automations-rules', title: 'Automations & Alerts' },
    next: { id: 'status-codes-errors', title: 'Status Codes & Errors' },
    codeTabs: null,
    content: `
### Widget Library {#widget-library}

The ThingsNXT User Portal features real-time visualization widgets:

- **Gauge Widget**: Visualizes speed, level, temperature, and percentage with configurable danger thresholds (green/yellow/red).
- **Time-Series Chart**: Displays historical sensor trends over 1 hour, 24 hours, 7 days, or 30 days.
- **Digital Toggle Switch**: Toggles virtual pins (\`v0\`, \`v1\`) on hardware in under 50ms via Redis and MQTT downlinks.
- **Value Card**: Shows current scalar metrics (e.g. \`24.2 °C\`, \`1013 hPa\`) with delta trend indicators.
- **GPS Map Tracker**: Renders live device coordinates and historical transit trails.

---

### Creating Dashboards {#dashboard-creation}

1. In the User Portal, navigate to **Dashboards** > Click **"+ New Dashboard"**.
2. Give the dashboard a title (e.g. \`Solar Inverter Monitor\`).
3. Click **"+ Add Widget"**:
   - Pick the target **Device**.
   - Select the telemetry data key (e.g. \`temperature\`, \`v0\`).
   - Select widget type (**Gauge**, **Switch**, **Chart**).
4. Save the dashboard. It immediately begins streaming over WebSockets!
`,
  },

  'status-codes-errors': {
    id: 'status-codes-errors',
    category: 'API Reference & Security',
    title: 'Status Codes & Error Handling',
    subtitle: 'Complete reference of HTTP and MQTT return codes with actionable resolutions.',
    badge: 'Status Codes',
    lastUpdated: 'October 2026',
    toc: [
      { id: 'http-status-codes', title: 'HTTP Return Codes' },
      { id: 'mqtt-return-codes', title: 'MQTT Return Codes' },
      { id: 'troubleshooting-tips', title: 'Connection Checklist' },
    ],
    prev: { id: 'user-console-dashboards', title: 'Console & Dashboards' },
    next: { id: 'security-best-practices', title: 'Security Best Practices' },
    codeTabs: null,
    content: `
### HTTP Return Codes {#http-status-codes}

| Code | Meaning | Root Cause & Action |
| :--- | :--- | :--- |
| **202 Accepted** | \`{"status":"accepted"}\` | Telemetry packet validated and queued into Kafka/Redis. |
| **400 Bad Request** | \`Malformed payload\` | Missing \`device_id\` or \`data\` object. Verify JSON syntax. |
| **403 Forbidden** | \`Unauthorized hardware\` | Invalid or missing \`device_token\`. Re-verify device credentials. |
| **404 Not Found** | \`Device does not exist\` | Device ID was not found in the database. |
| **429 Too Many Requests** | \`Rate limit exceeded\` | Sending too fast (> 10 req/s). Add exponential backoff delay in firmware. |
| **500 Server Error** | \`Internal ingest error\` | Database or broker connection error. Device should retry. |

---

### Connection Checklist {#troubleshooting-tips}

- [ ] Device has acquired an IP address via DHCP and can ping the gateway.
- [ ] Port \`1883\` (MQTT) or \`4001\` (HTTP) is open in host firewall.
- [ ] Token string is exactly 32 alphanumeric characters.
- [ ] MQTT topic matches \`thingsnxt/device/{device_id}/telemetry\`.
`,
  },

  'security-best-practices': {
    id: 'security-best-practices',
    category: 'API Reference & Security',
    title: 'Security Best Practices',
    subtitle: 'Hardening embedded firmware, token rotation, and transport encryption.',
    badge: 'Security',
    lastUpdated: 'October 2026',
    toc: [
      { id: 'token-isolation', title: 'Token Isolation' },
      { id: 'tls-encryption', title: 'Transport Layer Security' },
      { id: 'rate-limiting', title: 'Rate Limiting & Abuse Defense' },
    ],
    prev: { id: 'status-codes-errors', title: 'Status Codes & Errors' },
    next: null,
    codeTabs: null,
    content: `
### Token Isolation {#token-isolation}

- Each physical device must be provisioned with its own unique **Device Token**.
- Never reuse tokens across multiple devices. If a sensor node in the field is physically compromised, its token can be revoked in the console without affecting other devices.

---

### Transport Layer Security (TLS / HTTPS / MQTTS) {#tls-encryption}

- In production deployments, route traffic through **MQTTS (Port 8883)** or **HTTPS (Port 443)**.
- Load CA certificates into your firmware (ESP32 \`WiFiClientSecure\`) to prevent Man-in-the-Middle (MITM) attacks.

---

### Rate Limiting & Abuse Defense {#rate-limiting}

- The Fastify ingestion gateway and MQTT service enforce rate limits to protect backend clusters from rogue devices spamming requests.
`,
  },
};
