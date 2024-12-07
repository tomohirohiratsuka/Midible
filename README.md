# Midible

**Midible** is a lightweight JavaScript library for handling MIDI over Bluetooth Low Energy (BLE) in the browser. It enables you to connect, record, and play MIDI events using BLE MIDI devices, providing a seamless experience for MIDI interaction directly in the browser.

---

## Features

- Connect to BLE MIDI devices easily.
- Parse and handle MIDI messages, including System Exclusive (SysEx).
- Record MIDI events with timestamps.
- Supports real-time MIDI message handling.

---

## Installation

Install via NPM:

```bash
npm install midible
```

Or include the ES module directly:

```html
<script type="module" src="path-to/midible.es.js"></script>
```

---

## Getting Started

### Prerequisites

- A BLE MIDI-compatible device.
- A browser that supports Web Bluetooth API (e.g., Chrome, Edge).

---

## Usage

### 1. Connect to a BLE MIDI Device

Use `DeviceConnector` to connect to a BLE MIDI device.

```javascript
import { DeviceConnector } from 'midible';

async function connectToDevice() {
    try {
        const device = await DeviceConnector.connect();
        console.log(`Connected to: ${device.name || 'Unknown Device'}`);
    } catch (error) {
        console.error(`Failed to connect: ${error.message}`);
    }
}
```

---

### 2. Handling MIDI Messages

Use `MidiPacketParser` to parse and process MIDI messages.

```javascript
import { MidiPacketParser } from 'midible';

const parser = new MidiPacketParser();

// Handle incoming BLE characteristic notifications
characteristic.addEventListener('characteristicvaluechanged', (event) => {
    const midiData = new Uint8Array(event.target.value.buffer);
    parser.parse(midiData);

    console.log('Processed MIDI Messages:', parser.processedMessages);
});
```

---



### 3. Handling System Exclusive (SysEx) Messages
Since SysEx messages can be large and span multiple packets, `MidiPacketParser` handles them correctly in que.
It buffers SysEx messages until the termination packet is received, then processes the entire message.


```javascript
parser.parse(midiData);
// Check for remaining SysEx buffer and processed messages
console.log('SysEx Buffer:', parser.remainingSysExBuffer);
// Processed SysEx messages will be added to the processedMessages array
console.log('Processed SysEx Messages:', parser.processedMessages);
```

---

## API Reference

### **`DeviceConnector`**
- **`static async connect(options?: RequestDeviceOptions): Promise<BluetoothDevice>`**
  - Connects to a BLE MIDI device using the Web Bluetooth API.

---

### **`MidiPacketParser`**
The `MidiPacketParser` class provides functionality to parse, process, and manage MIDI packets, including System Exclusive (SysEx) messages. Below is a detailed explanation of the public methods and properties:

---

#### **Getters**

- **`processedMessages: MidiMessage[]`**
  - **Description**: Returns a list of successfully processed MIDI messages.
  - **Use Case**: Use this to access all MIDI messages that have been parsed and are ready for further handling, such as playback or logging.

- **`failedMessages: Uint8Array[]`**
  - **Description**: Returns a list of packets that failed during parsing.
  - **Use Case**: Use this to debug or log any packets that couldn't be parsed due to errors or incomplete data.

- **`remainingSysExBuffer: number[]`**
  - **Description**: Returns the current state of the buffer for System Exclusive (SysEx) messages.
  - **Use Case**: Use this to monitor or clear incomplete SysEx data that is awaiting completion.

---

#### **Setters**

- **`packets: DataView[]`**
  - **Description**: Accepts an array of `DataView` objects representing MIDI packets and adds them to the internal queue for processing.
  - **Use Case**: Use this to enqueue multiple MIDI packets at once, especially in batch processing scenarios.

- **`append: DataView`**
  - **Description**: Accepts a single `DataView` packet and appends it to the internal queue.
  - **Use Case**: Use this to add individual packets dynamically, such as when receiving real-time data from a BLE MIDI device.

---

#### **Methods**

- **`clear(): void`**
  - **Description**: Clears all internal states, including processed messages, failed messages, and the SysEx buffer.
  - **Use Case**: Use this when starting a new session or resetting the parser to a clean state.

- **`processPackets(): void`**
  - **Description**: Processes all queued packets, parsing each one and handling MIDI messages, including SysEx and real-time statuses.
  - **Use Case**: Call this method after enqueuing packets to process and populate `processedMessages` with parsed data.

- **`parse(byteArray: Uint8Array): void`**
  - **Description**: Parses a single MIDI packet represented as a `Uint8Array` and processes its data. Handles both normal MIDI messages and SysEx messages.
  - **Use Case**: Use this for real-time parsing of MIDI packets as they are received from a BLE MIDI device.

---

---

### Constants

- **`MIDI_SERVICE_UID`**
  - UUID for the MIDI BLE service.
- **`MIDI_IO_CHARACTERISTIC_UID`**
  - UUID for the MIDI I/O characteristic.

---

## Example Project

Here’s a simple example project to get started:
1. Clone the repository.
2. Run `npm install` to install dependencies.
3. Run `npm run build` to build the project.
4. Open `example/index.html` in a browser that supports Web Bluetooth API.

---

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

---

## License

This project is licensed under the [MIT License](LICENSE).

Enjoy using **Midible**! 🎹🎶
