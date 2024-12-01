import {MidiData} from "@/models/base/MidiData.ts";

export class MidiDataPitchBendChange extends MidiData {

    private constructor(
        public bytes: [number, number],
        public value: number
    ) {
        super(bytes);
    }

    static fromBytes(bytes: [number, number]) {
        super.validate(bytes);
        const lsb = bytes[0];
        const msb = bytes[1];
        const value = (msb << 7) | lsb;
        return new MidiDataPitchBendChange(bytes, value);
    }


}