import {MIDI_SERVICE_UID} from "@/const/MidiUUID.ts";

export class DeviceConnector {
    /**
     * Connect to a MIDI device
     * When no options are provided, then default filters for MIDI devices are used.
     * @param options
     */
    static async connect(options?: RequestDeviceOptions): Promise<BluetoothDevice> {
        return await navigator.bluetooth.requestDevice({
            filters: [{services: [MIDI_SERVICE_UID]}],
                ...options
        });
    }
}