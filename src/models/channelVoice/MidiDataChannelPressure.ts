import {MidiData} from "@/models/base/MidiData.ts";

export class MidiDataChannelPressure extends MidiData{

    private constructor(
        public bytes: [number],
        public value: number,
    ) {
        super(bytes);
    }

    static fromBytes(bytes: [number]): MidiDataChannelPressure {
        super.validate(bytes);
        const value = bytes[0];
        return new MidiDataChannelPressure(bytes, value);
    }
}