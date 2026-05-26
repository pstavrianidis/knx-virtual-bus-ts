import dotenv from "dotenv";
import { EventEmitter } from 'events';
import { mqttService } from './mqtt.service';

type DeviceType = 'switch' | 'blind' | 'motion';

interface Device {
  name: string;
  type: DeviceType;
  value: any;
}

interface Telegram {
  address: string;
  value: any;
}

dotenv.config();

export class VirtualKNXBus extends EventEmitter {
  devices: Record<string, Device> = {
    '1/0/1': { name: 'Light 1', type: 'switch', value: false },
    '1/0/2': { name: 'Shutter 1', type: 'blind', value: 0 },
    '1/0/3': { name: 'Sensor 1', type: 'motion', value: false }
  };

  constructor() {
    super();
    mqttService.connect();
    mqttService.setMessageHandler((topic, payload) => {
      if (topic.startsWith('kvm/write/')) {
        const address = topic.replace('kvm/write/', '');
        this.write(address, payload);
      }
    });
  }

  read(address: string): any {
    return this.devices[address]?.value;
  }

  write(address: string, value: any) {
    if (this.devices[address]) {
      this.devices[address].value = value;
      console.log(`Device ${this.devices[address].name} updated:`, value);
      this.emit('telegram', { address, value } as Telegram);
    }
  }

  getStatus() {
    return this.devices;
  }
}

// --- Demo mode ---
if (require.main === module) {
  const bus = new VirtualKNXBus();
  bus.on('telegram', (msg: Telegram) => {
    console.log('Telegram:', msg);
    mqttService.publish('kvm/192.168.1.10:1.0.255', msg);
  });
  

  setInterval(() => {
    const newValue = !bus.read('1/0/1');
    bus.write('1/0/1', newValue);
  }, 60000);
}
