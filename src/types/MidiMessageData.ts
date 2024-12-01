import {MidiDataSongSelect} from "@/models/systemCommon/MidiDataSongSelect.ts";
import {MidiDataChannelPressure} from "@/models/channelVoice/MidiDataChannelPressure.ts";
import {MidiDataControlChange} from "@/models/channelVoice/MidiDataControlChange.ts";
import {MidiDataNoteOff} from "@/models/channelVoice/MidiDataNoteOff.ts";
import {MidiDataNoteOn} from "@/models/channelVoice/MidiDataNoteOn.ts";
import {MidiDataPitchBendChange} from "@/models/channelVoice/MidiDataPitchBendChange.ts";
import {MidiDataPolyphonicKeyPressure} from "@/models/channelVoice/MidiDataPolyphonicKeyPressure.ts";
import {MidiDataProgramChange} from "@/models/channelVoice/MidiDataProgramChange.ts";
import {MidiDataMidiTimeCodeQuarterFrame} from "@/models/systemCommon/MidiDataMidiTimeCodeQuarterFrame.ts";
import {MidiDataSongPositionPointer} from "@/models/systemCommon/MidiDataSongPositionPointer.ts";
import {MidiDataSystemExclusive} from "@/models/systemExclusive/MidiDataSystemExclusive.ts";

export type MidiMessageData = MidiDataChannelPressure
| MidiDataControlChange
| MidiDataNoteOff
| MidiDataNoteOn
| MidiDataPitchBendChange
| MidiDataPolyphonicKeyPressure
| MidiDataProgramChange
| MidiDataMidiTimeCodeQuarterFrame
| MidiDataSongPositionPointer
| MidiDataSongSelect
| MidiDataSystemExclusive