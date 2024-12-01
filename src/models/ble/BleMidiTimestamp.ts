/**
 * This class represents the timestamp byte of a BLE MIDI packet.
 * reference: https://www.hangar42.nl/wp-content/uploads/2017/10/BLE-MIDI-spec.pdf
 */
export class BleMidiTimestamp {
    private constructor(public byte: number, public timestampLow: number) {}

    static fromByte(byte: number): BleMidiTimestamp {
        BleMidiTimestamp.validate(byte);
        const timestampHigh = BleMidiTimestamp.extractTimestampLow(byte);
        return new BleMidiTimestamp(byte, timestampHigh);
    }

    private static validate(byte: number): void {
        if ((byte & 0x80) === 0) {
            throw new Error('Invalid BLE MIDI header: bit 7 must be 1');
        }

        const timestampLow = BleMidiTimestamp.extractTimestampLow(byte);
        if (timestampLow < 0 || timestampLow > 127) {
            throw new Error('Invalid BLE MIDI header: timestampLow must be between 0 and 127');
        }
    }

    private static extractTimestampLow(byte: number): number {
        return byte & 0x7F; // Lower 7 bits
    }
}
