
export class MidiDataSystemExclusive {
    private constructor(
        public bytes: Uint8Array,
    ) {
    }

    static fromBytes(bytes: Uint8Array) {
        return new MidiDataSystemExclusive(bytes);
    }

    static validate(bytes: Uint8Array) {
        if (bytes.length === 0) {
            throw new Error('System Exclusive message must have at least one byte');
        }
    }
}