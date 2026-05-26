import mqtt from 'mqtt';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MessageHandler = (topic: string, payload: any) => void;

class MqttService {
  private client: mqtt.MqttClient | null = null;
  private handler: MessageHandler | null = null;

  connect() {
    return new Promise<void>((resolve, reject) => {
      const url = process.env.MQTT_URL || 'mqtt://127.0.0.1:1883';

      this.client = mqtt.connect(url);

      this.client.on('connect', () => {
        console.info(`MQTT connected to ${url}`);
        resolve();
      });

      this.client.on('error', (err) => {
        console.error('MQTT Error: ' + err.message);
        reject(err);
      });

      this.client.on('message', (topic, payload) => {
        const str = payload.toString();
        console.info(`MQTT incoming: ${topic} = ${payload.toString()}`);
        try {
          const parsed = JSON.parse(str);
          if (this.handler) this.handler(topic, parsed);
        } catch (error: unknown) {
          if (this.handler) this.handler(topic, str);
        }
      });
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  publish(topic: string, message: any) {
    if (!this.client) { console.warn('MQTT not connected, publish skipped'); return; };
    this.client.publish(topic, JSON.stringify(message), { qos: 1, retain: true });
  }

  subscribe(topic: string) {
    if (!this.client) return;
    this.client.subscribe(topic, (err) => {
      if (err) console.error(`MQTT subscribe ${topic} failed: ${err.message}`);
      else console.info(`MQTT subscribed to ${topic}`);
    });
  }

  setMessageHandler(handler: MessageHandler) {
    this.handler = handler;
  }

  onMessage(handler: MessageHandler) {
    this.handler = handler;
  }
}

export const mqttService = new MqttService();
