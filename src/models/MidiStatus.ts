import {
    MidiStatusGroup, MidiStatusGroupRange,
    StatusMessageKey,
    StatusMessageType,
    StatusMessageTypeMap
} from "@/const/StatusMessageTypeMap.ts";

export class MidiStatus {
    private constructor(
        public byte: number,
        public group: MidiStatusGroup | null,
        public name: StatusMessageType | null,
        public channel: number | null // System Common & Real-Time メッセージにはチャンネルがない
    ) {
    }

    static fromByte(byte: number): MidiStatus {
        MidiStatus.validate(byte);

        // detect group
        const group = MidiStatus.determineGroup(byte);

        // detect status message type
        const key = group === "Channel Voice" ? (byte >> 4) as StatusMessageKey : (byte as StatusMessageKey);
        const name = StatusMessageTypeMap[key] || null;

        // extract channel when group is Channel Voice
        const channel = group === "Channel Voice" ? byte & 0x0F : null;

        return new MidiStatus(byte, group, name, channel);
    }

    private static validate(byte: number): void {
        if ((byte & 0x80) === 0) {
            throw new Error("Invalid MIDI status byte: bit 7 must be 1");
        }
    }

    private static determineGroup(byte: number): MidiStatusGroup | null {
        for (const [group, range] of Object.entries(MidiStatusGroupRange)) {
            if (byte >= range.min && byte <= range.max) {
                return group as MidiStatusGroup;
            }
        }
        return null;
    }
}