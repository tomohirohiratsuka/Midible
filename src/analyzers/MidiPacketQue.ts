export class MidiPacketQueue {
    private queue: Uint8Array[] = [];

    /**
     * Add a packet to the queue
     * @param packet
     */
    enqueue(packet: DataView) {
        const modifiedPacket = this.toUint8Array(packet);
        this.queue.push(modifiedPacket);
    }

    /**
     * Get the next packet from the queue
     */
    dequeue(): Uint8Array | null {
        return this.queue.shift() || null;
    }

    /**
     * Check if the queue is empty
     */
    isEmpty(): boolean {
        return this.queue.length === 0;
    }

    /**
     * Clear the queue
     */
    clear() {
        this.queue = [];
    }

    /**
     * Convert a MIDI packet to a Uint8Array
     * @param packet
     */
    private toUint8Array(packet: DataView) {
        return new Uint8Array(packet.buffer, packet.byteOffset, packet.byteLength);
    }
}
