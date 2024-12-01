import {MidiData} from "@/models/base/MidiData.ts";
import {getMidiKey, NoteName, Octave} from "@/utils/getMidiKey.ts";

export class MidiDataPolyphonicKeyPressure extends MidiData{

    private constructor(
        public bytes: [number, number],
        public notes: [NoteName] | [NoteName, NoteName],
        public octave: Octave,
        public value: number,
    ) {
        super(bytes);
    }

    static fromBytes(bytes: [number, number]): MidiDataPolyphonicKeyPressure {
        super.validate(bytes);
        const {octave, notes} = getMidiKey(bytes[0]);
        const value = bytes[1];
        return new MidiDataPolyphonicKeyPressure(bytes, notes, octave, value);
    }
}