import {MidiData} from "@/models/base/MidiData.ts";
import {ProgramChangeKey, ProgramChangeMap, ProgramChangeValue} from "@/const/ProgramChangeMap.ts";


export class MidiDataProgramChange extends MidiData {

    private constructor(
        public bytes: [number],
        public program: ProgramChangeValue,
    ) {
        super(bytes);
    }

    static fromBytes(bytes: [number]) {
        super.validate(bytes);
        const program = ProgramChangeMap[bytes[0] as ProgramChangeKey];
        return new MidiDataProgramChange(bytes, program);
    }


}