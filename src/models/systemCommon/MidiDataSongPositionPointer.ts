import {MidiData} from "@/models/base/MidiData.ts";


export class MidiDataSongPositionPointer extends MidiData {

    private constructor(
        public bytes: [number, number],
        public position: number,
    ) {
        super(bytes);
    }

    static fromBytes(bytes: [number, number]): MidiDataSongPositionPointer {
        super.validate(bytes);
        const lsb = bytes[0];
        const msb = bytes[1];
        const midiBeatPosition = (msb << 7) | lsb;
        return new MidiDataSongPositionPointer(bytes, midiBeatPosition);
    }

}