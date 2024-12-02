import {BleMidiHeader} from "@/models/ble/BleMidiHeader.ts";
import {BleMidiTimestamp} from "@/models/ble/BleMidiTimestamp.ts";
import {MidiStatus} from "@/models/MidiStatus.ts";
import {MidiMessageData} from "@/types/MidiMessageData.ts";

export class MidiMessage {
    constructor(
        public bytes: Uint8Array,
        public header: BleMidiHeader,
        public timestamp: BleMidiTimestamp,
        public status: MidiStatus,
        public data: MidiMessageData | undefined = undefined,
        public createdAt: Date = new Date()
    ) {}

    get timestampMs(): number {
        return this.header.timestampHigh << 7 | this.timestamp.timestampLow;
    }
}