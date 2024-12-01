import {isBit7Set} from "@/utils/isBit7Set.ts";

type MidiDataBytes = [number, number] | [number];
export abstract class MidiData {
    public bytes: MidiDataBytes;

    protected constructor(bytes: MidiDataBytes) {
        this.bytes = bytes;
    }

    /**
     * Abstract method for instantiating child classes
     * @param bytes
     */
    static fromBytes(bytes: MidiDataBytes): MidiData {
        throw new Error(`fromBytes must be implemented in child classes, bytes: ${bytes}`);
    }

    /**
     * Validate MIDI data bytes
     * @param bytes
     */
    protected static validate(bytes: MidiDataBytes): void {
        if (bytes.length !== 2 && bytes.length !== 1) {
            throw new Error('Invalid MIDI Data: must have 1~2 bytes');
        }
        for (const byte of bytes) {
            if (isBit7Set(byte)) {
                throw new Error('Invalid MIDI Data: bit 7 must be 0');
            }
        }
    }
}
