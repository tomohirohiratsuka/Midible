import {MidiStatus} from "@/models/MidiStatus.ts";
import {isBit7Set} from "@/utils/isBit7Set.ts";
import {MidiPacketQueue} from "@/analyzers/MidiPacketQueue.ts";
import {BleMidiHeader} from "@/models/ble/BleMidiHeader.ts";
import {BleMidiTimestamp} from "@/models/ble/BleMidiTimestamp.ts";
import {MidiMessage} from "@/models/MidiMessage.ts";
import {MidiMessageData} from "@/types/MidiMessageData.ts";
import {MidiDataSystemExclusive} from "@/models/systemExclusive/MidiDataSystemExclusive.ts";
import {MidiDataParser} from "@/analyzers/MidiDataParser.ts";
import {toDataBytesTuple} from "@/utils/toDataBytesTuple.ts";


export class MidiPacketParser {
    private failed: Uint8Array[] = [];
    private processed: MidiMessage[] = [];
    private queue: MidiPacketQueue;
    private sysExBuffer: number[] = [];

    constructor() {
        this.queue = new MidiPacketQueue();
    }

    /**
     * Get processed messages
     */
    get processedMessages(): MidiMessage[] {
        return this.processed;
    }

    /**
     * Get failed messages
     */
    get failedMessages(): Uint8Array[] {
        return this.failed;
    }

    /**
     * Get remaining SysEx buffer
     */
    get remainingSysExBuffer(): number[] {
        return this.sysExBuffer;
    }

    /**
     * Set packets to be processed
     * @param packets
     */
    set packets(packets: DataView[]) {
        for (const packet of packets) {
            this.queue.enqueue(packet);
        }
    }

    /**
     * Append packet to the queue
     * @param packet
     */
    set append(packet: DataView) {
        this.queue.enqueue(packet);
    }

    /**
     * Clear all states
     */
    clear() {
        this.queue.clear();
        this.failed = [];
        this.processed = [];
        this.sysExBuffer = [];
    }

    /**
     * Process midi packets
     */
    processPackets() {
        while (!this.queue.isEmpty()) {
            const packet = this.queue.dequeue();
            if (packet) {
                try {
                    this.parse(packet);
                } catch (e) {
                    console.error(`Error while parsing packet: ${e}, you can find the packet in failed getter`);
                    this.failed.push(packet);
                }
            }
        }
    }


    /**
     * Parse midi packet
     * @param byteArray
     */
    parse(byteArray: Uint8Array) {
        const header = BleMidiHeader.fromByte(byteArray[0]);
        let processIndex = 1;

        // If there's a SysEx buffer, process it first
        if (this.sysExBuffer.length > 0) {
            const leftByteArray = byteArray.slice(processIndex);
            this.handleSysEx(leftByteArray, header);
            return; // Skip further processing if SysEx is being handled
        }

        while (processIndex < byteArray.length) {
            let timestamp: BleMidiTimestamp;
            let status: MidiStatus;
            const lastProcessedPacket = this.processed[this.processed.length - 1];

            if (!isBit7Set(byteArray[processIndex]) && lastProcessedPacket) {
                // Case: Running Status
                timestamp = lastProcessedPacket.timestamp;
                status = lastProcessedPacket.status;
            } else {
                // Case: New Status with timestamp or running status with new timestamp
                const hasBoth = byteArray.slice(processIndex, processIndex + 2).every(isBit7Set);
                if (hasBoth) {
                    // Case: New Status with Timestamp
                    timestamp = BleMidiTimestamp.fromByte(byteArray[processIndex]);
                    processIndex++;
                    status = MidiStatus.fromByte(byteArray[processIndex]);
                    processIndex++;
                } else {
                    // Case: running status with new timestamp
                    timestamp = BleMidiTimestamp.fromByte(byteArray[processIndex]);
                    processIndex++;
                    status = lastProcessedPacket.status;
                }
            }

            const leftByteArray = byteArray.slice(processIndex);

            if (status.name === "System Exclusive") {
                this.handleSysEx(leftByteArray, header);
                return;
            }

            // Case: Normal MIDI Message
            const {nextIndex, data} = this.processMidiData(leftByteArray, status, 0);
            this.processed.push(
                new MidiMessage(
                    new Uint8Array([header.byte, timestamp.byte, status.byte, ...leftByteArray.slice(0, nextIndex)]),
                    header,
                    timestamp,
                    status,
                    data
                )
            );
            processIndex += nextIndex;
        }
    }

    /**
     * Handles System Exclusive (SysEx) processing with or without a buffer
     */
    private handleSysEx(byteArray: Uint8Array, header: BleMidiHeader): void {
        const endIndex = this.getIndexOfSysExEndStatus(byteArray);

        if (endIndex === -1) {
            // Case: middle of sending SysEx data
            this.processSysExDataWithoutEnd(byteArray, header);
        } else {
            // Case: end of SysEx data
            this.processSysExDataWithEnd(byteArray, header, endIndex);
        }
    }

    /**
     * Process SysEx data without an end status (e.g., in the middle of transmission)
     */
    private processSysExDataWithoutEnd(byteArray: Uint8Array, header: BleMidiHeader): void {
        const {dataArray, realTimeStatuses} = this.extractSysExDataWithRealTimeStatuses(byteArray);
        this.sysExBuffer.push(...dataArray);
        this.processInsertedRealTimeStatus(realTimeStatuses, header);
    }

    /**
     * Process SysEx data with an end status (e.g., completes the SysEx message)
     */
    private processSysExDataWithEnd(byteArray: Uint8Array, header: BleMidiHeader, endIndex: number): void {
        const timestamp = BleMidiTimestamp.fromByte(byteArray[endIndex - 1]);
        const sysExDataBytes = byteArray.slice(0, endIndex - 1); // Exclude timestamp
        const {dataArray, realTimeStatuses} = this.extractSysExDataWithRealTimeStatuses(sysExDataBytes);
        this.processInsertedRealTimeStatus(realTimeStatuses, header);

        const finalDataArray = new Uint8Array([...this.sysExBuffer, ...dataArray]);
        const sysExData = MidiDataSystemExclusive.fromBytes(finalDataArray);
        const endSysExStatus = MidiStatus.fromByte(0xF7);

        this.processed.push(
            new MidiMessage(
                new Uint8Array([
                    header.byte,
                    timestamp.byte,
                    endSysExStatus.byte,
                    ...finalDataArray,
                ]),
                header,
                timestamp,
                endSysExStatus,
                sysExData
            )
        );
        this.sysExBuffer = [];
    }


    /**
     * Handles System Exclusive (SysEx) processing
     * @param realTimeStatuses
     * @param header
     * @private
     */
    private processInsertedRealTimeStatus(
        realTimeStatuses: {
            timestamp: BleMidiTimestamp;
            status: MidiStatus
        }[],
        header: BleMidiHeader
    ) {
        for (const {timestamp, status} of realTimeStatuses) {
            this.processed.push(
                new MidiMessage(
                    new Uint8Array([header.byte, timestamp.byte, status.byte]),
                    header,
                    timestamp,
                    status,
                    //since real-time status doesn't have data
                ));
        }
    }



    /**
     * Process midi data
     * @param byteArray
     * @param status
     * @param startIndex
     */
    private processMidiData(
        byteArray: Uint8Array,
        status: MidiStatus,
        startIndex: number
    ): {
        nextIndex: number,
        data?: MidiMessageData
    } {
        const dataLength = MidiDataParser.getDataBytesLength(status);
        if (dataLength === 0) {
            return {nextIndex: startIndex};
        }
        const dataBytes = byteArray.slice(startIndex, startIndex + dataLength);
        const tupleDataBytes = toDataBytesTuple([...dataBytes]);
        const data = MidiDataParser.parseData(status, tupleDataBytes);
        return {nextIndex: startIndex + dataLength, data};
    }


    /**
     * Get the index of the system exclusive end status
     * @param byteArray
     */
    private getIndexOfSysExEndStatus(byteArray: Uint8Array): number {
        return byteArray.indexOf(0xF7)
    }

    /**
     * Extract system exclusive data with real-time statuses
     * @param byteArray
     */
    private extractSysExDataWithRealTimeStatuses(byteArray: Uint8Array): {
        dataArray: Uint8Array,
        realTimeStatuses: { timestamp: BleMidiTimestamp, status: MidiStatus; }[]
    } {
        let index = 0;
        const dataArray = []
        const realTimeStatuses: { timestamp: BleMidiTimestamp, status: MidiStatus; }[] = [];

        while (index < byteArray.length) {
            const byte = byteArray[index];
            if (isBit7Set(byte)) {
                // since sys ex data may include only real-time status, and real-time status is preceded by timestamp
                const timestamp = BleMidiTimestamp.fromByte(byte);
                const status = MidiStatus.fromByte(byteArray[index + 1]);
                realTimeStatuses.push({timestamp, status});
                index += 2
            } else {
                // sys ex data
                dataArray.push(byte);
                index++;
            }
        }

        return {dataArray: new Uint8Array(dataArray), realTimeStatuses};
    }

}