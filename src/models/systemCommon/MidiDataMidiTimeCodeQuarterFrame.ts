import {MidiData} from "@/models/base/MidiData.ts";
const MtcMessageTypes = [
    "Frame (LSB)",
    "Frame (MSB)",
    "Seconds (LSB)",
    "Seconds (MSB)",
    "Minutes (LSB)",
    "Minutes (MSB)",
    "Hours (LSB)",
    "Hours (MSB & Format)"
] as const;

export class MidiDataMidiTimeCodeQuarterFrame extends MidiData {

    private constructor(
        public bytes: [number],
        public type: typeof MtcMessageTypes[number],
        public value: number
    ) {
        super(bytes);
    }

    static fromBytes(bytes: [number]): MidiDataMidiTimeCodeQuarterFrame {
        super.validate(bytes);
        const dataByte = bytes[0];
        const messageType = (dataByte >> 4) & 0x07;
        const value = dataByte & 0x0F;
        const messageTypeString = MtcMessageTypes[messageType];
        return new MidiDataMidiTimeCodeQuarterFrame(bytes, messageTypeString, value);

    }

}