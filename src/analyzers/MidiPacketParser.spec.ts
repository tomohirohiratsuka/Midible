import {MidiPacketParser} from "@/analyzers/MidiPacketParser";
import {MidiMessage} from "@/models/MidiMessage";
import {BleMidiHeader} from "@/models/ble/BleMidiHeader";
import {BleMidiTimestamp} from "@/models/ble/BleMidiTimestamp";
import {MidiStatus} from "@/models/MidiStatus";
import {MidiDataNoteOn} from "@/models/channelVoice/MidiDataNoteOn";
import {MidiDataNoteOff} from "@/models/channelVoice/MidiDataNoteOff";
import {MidiDataPolyphonicKeyPressure} from "@/models/channelVoice/MidiDataPolyphonicKeyPressure";
import {MidiDataControlChange} from "@/models/channelVoice/MidiDataControlChange";
import {MidiDataProgramChange} from "@/models/channelVoice/MidiDataProgramChange";
import {MidiDataChannelPressure} from "@/models/channelVoice/MidiDataChannelPressure";
import {MidiDataPitchBendChange} from "@/models/channelVoice/MidiDataPitchBendChange";
import {MidiDataMidiTimeCodeQuarterFrame} from "@/models/systemCommon/MidiDataMidiTimeCodeQuarterFrame";
import {MidiDataSongPositionPointer} from "@/models/systemCommon/MidiDataSongPositionPointer";
import {MidiDataSongSelect} from "@/models/systemCommon/MidiDataSongSelect";
import {MidiMessageData} from "@/types/MidiMessageData";
import {MidiDataSystemExclusive} from "src/models/systemExclusive/MidiDataSystemExclusive";

type StatusTestCase = {
    description: string;
    bytes: number[];
    expectedData?: MidiMessageData;
    compareDataKeys: string[]; // Keys to compare in data object
};
const testCases: StatusTestCase[] = [
    {
        description: "Note On",
        bytes: [0x82, 0xAC, 0x90, 0x3C, 0x64], // Example: Note On for C4 with velocity 100
        expectedData: MidiDataNoteOn.fromBytes([0x3C, 0x64]),
        compareDataKeys: ['bytes', 'notes', 'octave', 'velocity']
    },
    {
        description: "Note Off",
        bytes: [0x82, 0xAC, 0x80, 0x3C, 0x40], // Example: Note Off for C4 with velocity 64
        expectedData: MidiDataNoteOff.fromBytes([0x3C, 0x40]),
        compareDataKeys: ['bytes','notes', 'octave', 'velocity']
    },
    {
        description: "Polyphonic Key Pressure",
        bytes: [0x82, 0xAC, 0xA0, 0x3C, 0x40], // Example: Polyphonic Key Pressure for C4 with pressure 64
        expectedData: MidiDataPolyphonicKeyPressure.fromBytes([0x3C, 0x40]),
        compareDataKeys: ['bytes','notes', 'octave', 'value']
    },
    {
        description: "Control Change",
        bytes: [0x82, 0xAC, 0xB0, 0x07, 0x40], // Example: Control Change for volume with value 64
        expectedData: MidiDataControlChange.fromBytes([0x07, 0x40]),
        compareDataKeys: ['bytes','controller', 'value']
    },
    {
        description: "Program Change",
        bytes: [0x82, 0xAC, 0xC0, 0x07], // Example: Program Change to program 7
        expectedData: MidiDataProgramChange.fromBytes([0x07]),
        compareDataKeys: ['bytes', 'program']
    },
    {
        description: "Channel Pressure",
        bytes: [0x82, 0xAC, 0xD0, 0x40], // Example: Channel Pressure with pressure 64
        expectedData: MidiDataChannelPressure.fromBytes([0x40]),
        compareDataKeys: ['bytes', 'value']
    },
    {
        description: "Pitch Bend",
        bytes: [0x82, 0xAC, 0xE0, 0x40, 0x40], // Example: Pitch Bend with value 0x4040
        expectedData: MidiDataPitchBendChange.fromBytes([0x40, 0x40]),
        compareDataKeys: ['bytes', 'value']
    },
    {
        description: 'Midi Time Code Quarter Frame',
        bytes: [0x82, 0xAC, 0xF1, 0x40], // Example: Midi Time Code Quarter Frame with value 0x40
        expectedData: MidiDataMidiTimeCodeQuarterFrame.fromBytes([0x40]),
        compareDataKeys: ['bytes', 'type',  'value']
    },
    {
        description: 'Song Position Pointer',
        bytes: [0x82, 0xAC, 0xF2, 0x40, 0x40], // Example: Song Position Pointer with value 0x4040
        expectedData: MidiDataSongPositionPointer.fromBytes([0x40, 0x40]),
        compareDataKeys: ['bytes', 'position']
    },
    {
        description: 'Song Select',
        bytes: [0x82, 0xAC, 0xF3, 0x40], // Example: Song Select with value 0x40
        expectedData: MidiDataSongSelect.fromBytes([0x40]),
        compareDataKeys: ['bytes', 'value']
    },
    {
        description: 'Tune Request',
        bytes: [0x82, 0xAC, 0xF6], // Example: Tune Request
        expectedData: undefined,
        compareDataKeys: []
    },
    {
        description: 'Timing Clock',
        bytes: [0x82, 0xAC, 0xF8], // Example: Timing Clock
        expectedData: undefined,
        compareDataKeys: []
    },
    {
        description: 'Start',
        bytes: [0x82, 0xAC, 0xFA], // Example: Start
        expectedData: undefined,
        compareDataKeys: []
    },
    {
        description: 'Continue',
        bytes: [0x82, 0xAC, 0xFB], // Example: Continue
        expectedData: undefined,
        compareDataKeys: []
    },
    {
        description: 'Stop',
        bytes: [0x82, 0xAC, 0xFC], // Example: Stop
        expectedData: undefined,
        compareDataKeys: []
    },
    {
        description: 'Active Sensing',
        bytes: [0x82, 0xAC, 0xFE], // Example: Active Sensing
        expectedData: undefined,
        compareDataKeys: []
    },
    {
        description: 'System Reset',
        bytes: [0x82, 0xAC, 0xFF], // Example: System Reset
        expectedData: undefined,
        compareDataKeys: []
    }
];
describe('MidiPacketParser', () => {
    describe('unit tests', () => {
        it('should instantiate', () => {
            const parser = new MidiPacketParser()
            expect(parser).toBeDefined()
            expect(parser).toBeInstanceOf(MidiPacketParser)
            expect(parser.failedMessages).toEqual([])
            expect(parser.processedMessages).toEqual([])
            expect(parser.remainingSysExBuffer).toEqual([])
        })
    })
    describe('parse', () => {
        it.each(testCases)("should parse simple full midi message: $description", ({ bytes, expectedData,compareDataKeys }) => {
            const parser = new MidiPacketParser();
            const message = new Uint8Array(bytes);
            parser.parse(message);

            const expectedMidiMessage = new MidiMessage(
                message,
                BleMidiHeader.fromByte(bytes[0]),
                BleMidiTimestamp.fromByte(bytes[1]),
                MidiStatus.fromByte(bytes[2]),
                expectedData
            );

            expect(parser.failedMessages).toEqual([]);
            const processed = parser.processedMessages;
            expect(processed).toHaveLength(1);
            const processedMessage = processed[0];
            expect(processedMessage.bytes).toEqual(expectedMidiMessage.bytes);
            expect(processedMessage.header.timestampHigh).toEqual(expectedMidiMessage.header.timestampHigh);
            expect(processedMessage.timestamp.timestampLow).toEqual(expectedMidiMessage.timestamp.timestampLow);
            expect(processedMessage.status.name).toEqual(expectedMidiMessage.status.name);
            expect(processedMessage.data).toEqual(expectedMidiMessage.data);
            for (const key of compareDataKeys) {
                expect((processedMessage.data as any)[key]).toEqual((expectedMidiMessage.data as any)[key]);
            }
            expect(processedMessage.createdAt).toBeInstanceOf(Date);
            expect(parser.remainingSysExBuffer).toEqual([]);
        });
        it('should parse multiple full midi messages', () => {
            const parser = new MidiPacketParser();
            const message = new Uint8Array([0x82, 0xAC, 0x90, 0x3C, 0x64, 0xAC, 0x80, 0x3C, 0x40]); // Note On for C4 with velocity 100 and Note Off for C4 with velocity 64
            parser.parse(message);
            expect(parser.failedMessages).toEqual([]);
            const processed = parser.processedMessages;
            expect(processed).toHaveLength(2);
            expect(processed[0].status.name).toEqual('Note On');
            expect(processed[1].status.name).toEqual('Note Off');
        })
        it('should parse multiple running status midi messages', () => {
            const parser = new MidiPacketParser();
            const message = new Uint8Array([0x82, 0xAC, 0x90, 0x3C, 0x64, 0x3C, 0x40]);
            parser.parse(message);
            expect(parser.failedMessages).toEqual([]);
            const processed = parser.processedMessages;
            expect(processed).toHaveLength(2);
            expect(processed[0].status.name).toEqual('Note On');
            expect((processed[0].data as MidiDataNoteOn).notes).toEqual(['C'])
            expect(processed[1].status.name).toEqual('Note On');
            expect((processed[1].data as MidiDataNoteOn).notes).toEqual(['C'])
        })
        it('should parse multiple running status midi messages with timestamp', () => {
            const parser = new MidiPacketParser();
            const message = new Uint8Array([0x82, 0xAC, 0x90, 0x3C, 0x64, 0xAD, 0x3C, 0x40]);
            parser.parse(message);
            expect(parser.failedMessages).toEqual([]);
            const processed = parser.processedMessages;
            expect(processed).toHaveLength(2);
            expect(processed[0].timestamp.byte).toEqual(0xAC);
            expect(processed[0].status.name).toEqual('Note On');
            expect((processed[0].data as MidiDataNoteOn).notes).toEqual(['C'])
            expect(processed[1].timestamp.byte).toEqual(0xAD);
            expect(processed[1].status.name).toEqual('Note On');
            expect((processed[1].data as MidiDataNoteOn).notes).toEqual(['C'])
        })
        it('should parse system exclusive start to end midi messages', () => {
            const parser = new MidiPacketParser();
            const message = new Uint8Array([0x80, 0xAC, 0xF0, 0x01, 0x02, 0x03, 0xAD, 0xF7])
            parser.parse(message);
            expect(parser.failedMessages).toEqual([]);
            const processed = parser.processedMessages;
            expect(processed).toHaveLength(1);
            expect(processed[0].status.name).toEqual('End of Exclusive');
            expect((processed[0].data as MidiDataSystemExclusive).bytes).toEqual(new Uint8Array([0x01, 0x02, 0x03]))
            expect(processed[0].timestamp.byte).toEqual(0xAD);
        })
        it('should parse system exclusive start to end midi messages with real-time statuses', () => {
            const parser = new MidiPacketParser()
            const message = [
                0x80,             // Header
                0x91,             // Timestamp1
                0xF0,             // SysEx Start
                0x01, 0x02,       // Data1, Data2
                0xA3,             // Timestamp2
                0xF8,             // Real-Time Status (Timing Clock)
                0x03,             // Data3
                0xB5,             // Timestamp3
                0xF7              // SysEx End
            ]
            parser.parse(new Uint8Array(message))
            expect(parser.failedMessages).toEqual([])
            const processed = parser.processedMessages
            expect(processed).toHaveLength(2)
            expect(processed[0].status.name).toEqual('Timing Clock')
            expect(processed[0].timestamp.byte).toEqual(0xA3)
            expect(processed[1].status.name).toEqual('End of Exclusive')
            expect((processed[1].data as MidiDataSystemExclusive).bytes).toEqual(new Uint8Array([0x01, 0x02, 0x03]))
            expect(processed[1].timestamp.byte).toEqual(0xB5)
        })
        it('should hold SysEx data in buffer', () => {
            const parser = new MidiPacketParser()
            const message = new Uint8Array([0x80, 0xAC, 0xF0, 0x01, 0x02, 0x03])
            parser.parse(message)
            expect(parser.failedMessages).toEqual([])
            expect(parser.processedMessages).toEqual([])
            expect(parser.remainingSysExBuffer).toEqual([0x01, 0x02, 0x03])
        })
        it('should process real-time status message and hold SysEx data in buffer', () => {
            const parser = new MidiPacketParser()
            const message = new Uint8Array([
                0x80,
                0xAC,
                0xF0,
                0x01,
                0xA3, // Timestamp
                0xF8, // Real-Time Status (Timing Clock)
                0x02,
                0x03
            ])
            parser.parse(message)
            expect(parser.failedMessages).toEqual([])
            expect(parser.processedMessages).toHaveLength(1)
            expect(parser.processedMessages[0].status.name).toEqual('Timing Clock')
            expect(parser.remainingSysExBuffer).toEqual([0x01, 0x02, 0x03])
        })
        it('should append sysex data when buffer exists', () => {
            const parser = new MidiPacketParser()
            const message1 = new Uint8Array([0x80, 0xAC, 0xF0, 0x01, 0x02])
            const message2 = new Uint8Array([0x80, 0x03])
            parser.parse(message1)
            parser.parse(message2)
            expect(parser.failedMessages).toEqual([])
            expect(parser.processedMessages).toEqual([])
            expect(parser.remainingSysExBuffer).toEqual([0x01, 0x02, 0x03])
        })
        it('should append SysEx data when buffer exists and real-time status message is received', () => {
            const parser = new MidiPacketParser()
            const message1 = new Uint8Array([
                0x80,
                0xAC,
                0xF0,
                0x01,
                0x02,
                0xA3, // Timestamp
                0xF8, // Real-Time Status (Timing Clock)
            ])
            const message2 = new Uint8Array([
                0x80,
                0xA3, // Timestamp
                0xF8, // Real-Time Status (Timing Clock)
                0x03
            ])
            parser.parse(message1)
            parser.parse(message2)
            expect(parser.failedMessages).toEqual([])
            expect(parser.processedMessages).toHaveLength(2)
            expect(parser.processedMessages[0].status.name).toEqual('Timing Clock')
            expect(parser.processedMessages[1].status.name).toEqual('Timing Clock')
            expect(parser.remainingSysExBuffer).toEqual([0x01, 0x02, 0x03])
        })
        it('should process SysEx message when SysEx end is received', () => {
            const parser = new MidiPacketParser()
            const message1 = new Uint8Array([
                0x80,
                0xAC,
                0xF0,
                0x01,
                0x02,
            ])
            const message2 = new Uint8Array([
                0x80,
                0x03,
                0x04,
                0xAD,
                0xF7
            ])
            parser.parse(message1)
            parser.parse(message2)
            expect(parser.failedMessages).toEqual([])
            expect(parser.processedMessages).toHaveLength(1)
            expect(parser.processedMessages[0].status.name).toEqual('End of Exclusive')
            expect(parser.processedMessages[0].timestamp.byte).toEqual(0xAD)
            expect((parser.processedMessages[0].data as MidiDataSystemExclusive).bytes).toEqual(new Uint8Array([0x01, 0x02, 0x03, 0x04]))
            expect(parser.remainingSysExBuffer).toEqual([])
        })
        it('should process SysEx message when SysEx end is received with real-time status message', () => {
            const parser = new MidiPacketParser()
            const message1 = new Uint8Array([
                0x80,
                0xAC,
                0xF0,
                0x01,
                0x02,
            ])
            const message2 = new Uint8Array([
                0x80,
                0x03,
                0x04,
                0xAD,
                0xF8,
                0x05,
                0xAE,
                0xF7
            ])
            parser.parse(message1)
            parser.parse(message2)
            expect(parser.failedMessages).toEqual([])
            expect(parser.processedMessages).toHaveLength(2)
            expect(parser.processedMessages[0].status.name).toEqual('Timing Clock')
            expect(parser.processedMessages[1].status.name).toEqual('End of Exclusive')
            expect(parser.processedMessages[1].timestamp.byte).toEqual(0xAE)
            expect((parser.processedMessages[1].data as MidiDataSystemExclusive).bytes).toEqual(new Uint8Array([0x01, 0x02, 0x03, 0x04, 0x05]))
            expect(parser.remainingSysExBuffer).toEqual([])
        })
        it('should parse SysEx start message after full midi message', () => {
            const parser = new MidiPacketParser()
            const message = new Uint8Array([
                0x82,
                0xAC,
                0x90, // Note On
                0x3C,
                0x64,
                0xAD,
                0xF0, // SysEx Start
                0x01,
            ])
            parser.parse(message)
            expect(parser.failedMessages).toEqual([])
            expect(parser.processedMessages).toHaveLength(1)
            expect(parser.processedMessages[0].status.name).toEqual('Note On')
            expect(parser.remainingSysExBuffer).toEqual([0x01])
        })
    })
    describe('processQueue', () => {

    })
})