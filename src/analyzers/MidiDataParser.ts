import {MidiStatus} from "@/models/MidiStatus.ts";
import {MidiDataChangeControl} from "@/models/MidiDataControlChange.ts";

export class MidiDataParser {
    static parse(status: MidiStatus, bytes: [number, number]) {
        switch (status.type.name) {
            case "Note On":
                //todo
                break;
            case "Note Off":
                //todo
                break;
            case "Polyphonic Key Pressure":
                //todo
                break;
            case "Control Change":
                return MidiDataChangeControl.fromBytes(bytes);
            case "Program Change":
                //todo
                break;
            case "Channel Pressure":
                //todo
                break;
            case "Pitch Bend Change":
                //todo
                break;
            case "System Message":
                //todo
                break;
            default:
                throw new Error("Invalid MIDI status type");
        }
    }
}