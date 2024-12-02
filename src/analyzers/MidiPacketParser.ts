import {MidiStatus} from "@/models/MidiStatus.ts";
import {isBit7Set} from "@/utils/isBit7Set.ts";
import {MidiPacketQueue} from "@/analyzers/MidiPacketQue.ts";
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

    get processedMessages() {
        return this.processed;
    }

    get failedMessages() {
        return this.failed;
    }

    get remainingSysExBuffer() {
        return this.sysExBuffer;
    }

    set packets(packets: DataView[]) {
        for (const packet of packets) {
            this.queue.enqueue(packet);
        }
    }

    set append(packet: DataView) {
        this.queue.enqueue(packet);
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


    parse(byteArray: Uint8Array) {
        const header = BleMidiHeader.fromByte(byteArray[0]);
        let processIndex = 1
        //if there's sysExBuffer then should process it first
        if (this.sysExBuffer.length > 0) {
            const res = this.handleSysExWhileSending(byteArray, header);
            if (res === null) {
                return;
            }
            processIndex = res;
        }
        //if there's next byte then it can be only timestamp and status set, since no running status available
        //anyway here processStartIndex's byte must be timestamp byte
        while (processIndex < byteArray.length) {
            const timestamp = BleMidiTimestamp.fromByte(byteArray[processIndex]);
            processIndex++;
            const status = MidiStatus.fromByte(byteArray[processIndex]);
            processIndex++;
            const leftByteArray = byteArray.slice(processIndex);
            if (status.name === "System Exclusive") {
                const endIndex = this.getIndexOfSysExEndStatus(leftByteArray);
                if (endIndex === -1) {
                    //case rest of bytes are all sysEx data
                    const {dataArray, realTimeStatuses} = this.extractSysExDataWithRealTimeStatuses(leftByteArray);
                    this.sysExBuffer.push(...dataArray);
                    this.processInsertedRealTimeStatus(realTimeStatuses, header);
                    return;
                }
                //case rest of bytes include sysEx data and may other status
                const timestamp = BleMidiTimestamp.fromByte(leftByteArray[endIndex - 1]);
                const sysExDataBytes = leftByteArray.slice(0, endIndex - 1); //exclude header and timestamp
                const {dataArray, realTimeStatuses} = this.extractSysExDataWithRealTimeStatuses(sysExDataBytes);
                this.processInsertedRealTimeStatus(realTimeStatuses, header);
                const sysExData = MidiDataSystemExclusive.fromBytes(
                    new Uint8Array(dataArray)
                );
                this.processed.push(
                    new MidiMessage(
                        new Uint8Array([header.byte, timestamp.byte, status.byte, ...dataArray]),
                        header,
                        timestamp,
                        status,
                        [sysExData]
                    )
                )
                processIndex += endIndex;
            }
            //case: normal midi message
            const {nextIndex, data} = this.processMidiData(leftByteArray, status, 0);
            this.processed.push(
                new MidiMessage(
                    new Uint8Array([header.byte, timestamp.byte, status.byte, ...leftByteArray.slice(0, nextIndex)]),
                    header,
                    timestamp,
                    status,
                    data ? [data] : []
                )
            )
            processIndex += nextIndex;
        }
    }

    /**
     * Handle system exclusive
     * @param byteArray
     * @param header
     * @return next index or null
     */
    private handleSysExWhileSending(byteArray: Uint8Array, header: BleMidiHeader): number | null {
        const endIndex = this.getIndexOfSysExEndStatus(byteArray);
        if (endIndex === -1) {
            //case: middle of sending sysEx data
            const {dataArray, realTimeStatuses} = this.extractSysExDataWithRealTimeStatuses(byteArray);
            this.sysExBuffer.push(...dataArray);
            this.processInsertedRealTimeStatus(realTimeStatuses, header);
            return null
        } else {
            //case: end of sending sysEx data
            const timestamp = BleMidiTimestamp.fromByte(byteArray[endIndex - 1]);
            const sysExDataBytes = byteArray.slice(1, endIndex - 1); //exclude header and timestamp
            const {dataArray, realTimeStatuses} = this.extractSysExDataWithRealTimeStatuses(sysExDataBytes);
            this.processInsertedRealTimeStatus(realTimeStatuses, header);
            const finalDataArray = new Uint8Array([...this.sysExBuffer, ...dataArray]);
            const sysExData = MidiDataSystemExclusive.fromBytes(
                finalDataArray
            );
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
                    [sysExData]
                )
            )
            this.sysExBuffer = [];
            return endIndex + 1;
        }
    }


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
                    [] //since real-time status doesn't have data
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