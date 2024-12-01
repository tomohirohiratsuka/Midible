import {
    ControlChangeFunction,
    ControlChangeFunctionKey,
    ControlChangeFunctionMap
} from "@/const/ControlChangeFunctionMap.ts";
import {MidiData} from "@/models/base/MidiData.ts";

/**
 * https://midi.org/midi-1-0-control-change-messages
 */
export class MidiDataControlChange extends MidiData {

    private constructor(
        public bytes: [number, number],
        public controller: ControlChangeFunction,
        public value: number
    ) {
        super(bytes);
    }

    static fromBytes(bytes: [number, number]) {
        super.validate(bytes);
        const control = bytes[0] as ControlChangeFunctionKey;
        const controller = ControlChangeFunctionMap[control]
        const value = bytes[1]
        return new MidiDataControlChange(bytes, controller, value);
    }


}