import {MidiStatus} from "@/models/MidiStatus.ts";
import {MidiDataNoteOff} from "@/models/channelVoice/MidiDataNoteOff.ts";
import {MidiDataNoteOn} from "@/models/channelVoice/MidiDataNoteOn.ts";
import {MidiDataPolyphonicKeyPressure} from "@/models/channelVoice/MidiDataPolyphonicKeyPressure.ts";
import {MidiDataControlChange} from "@/models/channelVoice/MidiDataControlChange.ts";
import {MidiDataProgramChange} from "@/models/channelVoice/MidiDataProgramChange.ts";
import {MidiDataChannelPressure} from "@/models/channelVoice/MidiDataChannelPressure.ts";
import {MidiDataPitchBendChange} from "@/models/channelVoice/MidiDataPitchBendChange.ts";
import {MidiDataMidiTimeCodeQuarterFrame} from "@/models/systemCommon/MidiDataMidiTimeCodeQuarterFrame.ts";
import {MidiDataSongPositionPointer} from "@/models/systemCommon/MidiDataSongPositionPointer.ts";
import {MidiDataSongSelect} from "@/models/systemCommon/MidiDataSongSelect.ts";
import {MidiMessageData} from "@/types/MidiMessageData.ts";

export class MidiDataParser {
    /**
     * Returns the data bytes length for a given status
     * Throws an error if the status is unknown
     * @param status
     */
    static getDataBytesLength(status: MidiStatus) {
        switch (status.name) {
            case "Note Off":
            case "Note On":
            case "Polyphonic Key Pressure":
            case "Control Change":
            case "Song Position Pointer":
            case "Pitch Bend Change":
                return 2;
            case "Program Change":
            case "Channel Pressure":
            case "MIDI Time Code Quarter Frame":
            case "Song Select":
                return 1;
            case "Tune Request":
            case "Timing Clock":
            case "Start":
            case "Continue":
            case "Stop":
            case "Active Sensing":
            case "Reset": {
                return 0;
            }
            default: {
                throw new Error(`Unknown status name ${status.name}`);
            }
        }
    }

    /**
     * Parses the data bytes for a given status
     * @param status
     * @param data
     */
    static parseData(status: MidiStatus, data: [number, number] | [number]): MidiMessageData {
        switch (status.name) {
            case "Note Off": {
                if (data.length === 2) return MidiDataNoteOff.fromBytes(data);
                break;
            }
            case "Note On": {
                if (data.length === 2) return MidiDataNoteOn.fromBytes(data);
                break;
            }
            case "Polyphonic Key Pressure": {
                if (data.length === 2) return MidiDataPolyphonicKeyPressure.fromBytes(data);
                break;
            }
            case "Control Change": {
                if (data.length === 2) return MidiDataControlChange.fromBytes(data);
                break;
            }
            case "Program Change": {
                if (data.length === 1) return MidiDataProgramChange.fromBytes(data);
                break;
            }
            case "Channel Pressure": {
                if (data.length === 1) return MidiDataChannelPressure.fromBytes(data);
                break;
            }
            case "Pitch Bend Change": {
                if (data.length === 2) return MidiDataPitchBendChange.fromBytes(data);
                break;
            }
            case "MIDI Time Code Quarter Frame": {
                if (data.length === 1) return MidiDataMidiTimeCodeQuarterFrame.fromBytes(data);
                break;
            }
            case "Song Position Pointer": {
                if (data.length === 2) return MidiDataSongPositionPointer.fromBytes(data);
                break;
            }
            case "Song Select": {
                if (data.length === 1) return MidiDataSongSelect.fromBytes(data);
                break;
            }
            case "Tune Request":
            case "Timing Clock":
            case "Start":
            case "Continue":
            case "Stop":
            case "Active Sensing":
            case "Reset":
                throw new Error(`No data expected for status ${status.name}`);
            default: {
                throw new Error(`Unknown status name ${status.name}`);
            }
        }
        throw new Error(`Invalid data length ${data.length} for status ${status.name}`);
    }

}