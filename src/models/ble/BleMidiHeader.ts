/**
 * This class represents the header byte of a BLE MIDI packet.
 * reference: https://www.hangar42.nl/wp-content/uploads/2017/10/BLE-MIDI-spec.pdf
 */
export class BleMidiHeader {
    private constructor(public byte: number, public timestampHigh: number) {}

    static fromByte(byte: number): BleMidiHeader {
        BleMidiHeader.validate(byte);
        const timestampHigh = BleMidiHeader.extractTimestampHigh(byte);
        return new BleMidiHeader(byte, timestampHigh);
    }

    private static validate(byte: number): void {
        if ((byte & 0x80) === 0) {
            throw new Error('Invalid BLE MIDI header: bit 7 must be 1');
        }

        const timestampHigh = BleMidiHeader.extractTimestampHigh(byte);
        if (timestampHigh < 0 || timestampHigh > 63) {
            throw new Error('Invalid BLE MIDI header: timestampHigh must be between 0 and 63');
        }
    }

    private static extractTimestampHigh(byte: number): number {
        return byte & 0x3F; // Lower 6 bits
    }
}
