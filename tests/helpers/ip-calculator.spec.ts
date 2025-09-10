import { describe, expect, it } from "vitest";
import { ipToID } from "../../src/helpers/ip-calculator";

describe("ipToID", () => {
  it("should convert basic IP addresses correctly", () => {
    expect(ipToID("0.0.0.0")).toBe(0);
    expect(ipToID("0.0.0.1")).toBe(1);
    expect(ipToID("0.0.1.0")).toBe(256);
    expect(ipToID("0.1.0.0")).toBe(65536);
    expect(ipToID("1.0.0.0")).toBe(16777216);
  });

  it("should convert complex IP addresses correctly", () => {
    expect(ipToID("192.168.1.1")).toBe(3232235777);
    expect(ipToID("10.0.0.1")).toBe(167772161);
    expect(ipToID("172.16.0.1")).toBe(2886729729);
  });

  it("should handle maximum IP address", () => {
    expect(ipToID("255.255.255.255")).toBe(4294967295);
  });

  it("should handle edge cases", () => {
    expect(ipToID("127.0.0.1")).toBe(2130706433);
    expect(ipToID("8.8.8.8")).toBe(134744072);
  });

  it("should match the exact formula from instructions", () => {
    const ip = "1.2.3.4";
    const expected = 16777216 * 1 + 65536 * 2 + 256 * 3 + 4;
    expect(ipToID(ip)).toBe(expected);
  });
});
