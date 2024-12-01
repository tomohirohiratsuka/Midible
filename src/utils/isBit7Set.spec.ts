import {isBit7Set} from "@/utils/isBit7Set";

describe('isBit7Set', () => {
    it('should return true if bit 7 is set', () => {
        expect(isBit7Set(0b10000000)).toBe(true)
    })
    it('should return false if bit 7 is not set', () => {
        expect(isBit7Set(0b01111111)).toBe(false)
    })
})