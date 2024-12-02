/**
 * Convert data bytes to tuple
 * @param dataBytes
 */
export const toDataBytesTuple = (dataBytes: number[]): [number] | [number, number] => {
    if (dataBytes.length === 1) {
        return [dataBytes[0]];
    } else if (dataBytes.length === 2) {
        return [dataBytes[0], dataBytes[1]];
    }
    throw new Error("Invalid data length");
}


