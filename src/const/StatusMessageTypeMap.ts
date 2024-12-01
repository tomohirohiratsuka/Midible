export const StatusMessageTypeMap = {
    // Channel Voice Messages
    0x8:  "Note Off" ,
    0x9:  "Note On" ,
    0xA:  "Polyphonic Key Pressure" ,
    0xB:  "Control Change" ,
    0xC:  "Program Change" ,
    0xD:  "Channel Pressure" ,
    0xE:  "Pitch Bend Change" ,
    // System Common Messages
    0xF0: "System Exclusive" ,
    0xF1: "MIDI Time Code Quarter Frame" ,
    0xF2: "Song Position Pointer" ,
    0xF3: "Song Select" ,
    0xF6: "Tune Request",
    0xF7: "End of Exclusive" ,
    // System Real-Time Messages
    0xF8:  "Timing Clock" ,
    0xFA:  "Start",
    0xFB:  "Continue" ,
    0xFC:  "Stop" ,
    0xFE:  "Active Sensing" ,
    0xFF:  "Reset" ,
} as const;

export type StatusMessageKey = keyof typeof StatusMessageTypeMap;
export type StatusMessageType = typeof StatusMessageTypeMap[StatusMessageKey];

// グループ範囲の定義
export const MidiStatusGroupRange = {
    "Channel Voice": { min: 0x80, max: 0xEF },
    "System Common": { min: 0xF0, max: 0xF7 },
    "System Real-Time": { min: 0xF8, max: 0xFF },
} as const;

export type MidiStatusGroup = keyof typeof MidiStatusGroupRange