const NoteNameList = [
    "C",
    "C#,Db",
    "D",
    "D#,Eb",
    "E",
    "F",
    "F#,Gb",
    "G",
    "G#,Ab",
    "A",
    "A#,Bb",
    "B"
] as const;

type NoteNameUnion = {
    [K in typeof NoteNameList[number]]: K extends `${infer A},${infer B}` ? A | B : K
}[typeof NoteNameList[number]];

export type NoteName = NoteNameUnion;

export type Octave = -1 | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

/**
 * Get MIDI key information (note names and octave) from a MIDI byte.
 * @param byte MIDI note byte (0-127)
 * @returns Object containing note names and octave.
 */
export const getMidiKey = (byte: number): { notes: [NoteName, NoteName] | [NoteName], octave: Octave } => {
    if (byte < 0 || byte > 127) {
        throw new Error("Invalid MIDI key: must be between 0 and 127");
    }

    // Calculate note index and fetch note names
    const noteIndex = byte % 12;
    const noteName = NoteNameList[noteIndex];
    const noteNameList = noteName.split(",").map(name => name.trim()) as NoteName[];

    // Calculate octave
    const octave = (Math.floor(byte / 12) - 1) as Octave;

    return {
        notes: noteNameList as [NoteName, NoteName] | [NoteName],
        octave,
    };
};
