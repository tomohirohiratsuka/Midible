import {BleMidiHeader} from "@/models/ble/BleMidiHeader.ts";
import {BleMidiTimestamp} from "@/models/ble/BleMidiTimestamp.ts";
import {MidiStatus} from "@/models/MidiStatus.ts";
import {MidiMessageData} from "@/types/MidiMessageData.ts";

export class MidiMessage {
    constructor(
        public bytes: Uint8Array,// [header, timestamp, status, data, data] | [header, timestamp, status, data] | [header, timestamp, status]
        public header: BleMidiHeader,
        public timestamp: BleMidiTimestamp,
        public timestampMs: number,
        public status: MidiStatus,
        public data: MidiMessageData[],
        public createdAt: Date = new Date()
    ) {}
}