import {MidiData} from "@/models/base/MidiData.ts";
import {getMidiKey, NoteName, Octave} from "@/utils/getMidiKey.ts";

export class MidiDataNoteOn extends MidiData{

    private constructor(
        public bytes: [number, number],
        public notes: [NoteName] | [NoteName, NoteName],
        public octave: Octave,
        public velocity: number,
    ) {
        super(bytes);
    }

    static fromBytes(bytes: [number, number]): MidiDataNoteOn {
        super.validate(bytes);
        const {octave, notes} = getMidiKey(bytes[0]);
        const velocity = bytes[1];
        return new MidiDataNoteOn(bytes, notes, octave, velocity);
    }
}