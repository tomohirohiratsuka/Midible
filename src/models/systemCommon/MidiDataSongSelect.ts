import {MidiData} from "@/models/base/MidiData.ts";


export class MidiDataSongSelect extends MidiData {

    private constructor(
        public bytes: [number],
        public value: number,
    ) {
        super(bytes);
    }

    static fromBytes(bytes: [number]): MidiDataSongSelect {
        super.validate(bytes);
        const value = bytes[0];
        return new MidiDataSongSelect(bytes, value);
    }

}