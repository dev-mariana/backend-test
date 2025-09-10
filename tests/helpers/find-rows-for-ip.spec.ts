import { beforeEach, describe, expect, it, vi } from "vitest";
import type { IPLocationRow } from "../../src/models/ip-location-row";

vi.mock("../../src/app", () => ({
  app: {
    log: {
      info: vi.fn(),
    },
  },
}));

import { findRowsForIP } from "../../src/helpers/find-rows-for-ip";

describe("findRowsForIP", () => {
  const mockRows: IPLocationRow[] = [
    {
      lowerIpId: 1000,
      upperIpId: 2000,
      countryCode: "US",
      countryName: "United States",
      stateRegion: "California",
      city: "Los Angeles",
    },
    {
      lowerIpId: 5000,
      upperIpId: 6000,
      countryCode: "GB",
      countryName: "United Kingdom",
      stateRegion: "England",
      city: "London",
    },
    {
      lowerIpId: 10000,
      upperIpId: 15000,
      countryCode: "FR",
      countryName: "France",
      stateRegion: "Île-de-France",
      city: "Paris",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should find matching rows when IP ID is within range", () => {
    const result = findRowsForIP(mockRows, 1500);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(mockRows[0]);
    expect(result[0].city).toBe("Los Angeles");
  });

  it("should find multiple matching rows if IP ID falls in overlapping ranges", () => {
    const overlappingRows: IPLocationRow[] = [
      ...mockRows,
      {
        lowerIpId: 1500,
        upperIpId: 2500,
        countryCode: "CA",
        countryName: "Canada",
        stateRegion: "Ontario",
        city: "Toronto",
      },
    ];

    const result = findRowsForIP(overlappingRows, 1800);

    expect(result).toHaveLength(2);
    expect(result.map((r) => r.city)).toContain("Los Angeles");
    expect(result.map((r) => r.city)).toContain("Toronto");
  });

  it("should return empty array when IP ID is not in any range", () => {
    const result = findRowsForIP(mockRows, 3000);

    expect(result).toHaveLength(0);
  });

  it("should handle boundary values correctly", () => {
    let result = findRowsForIP(mockRows, 1000);
    expect(result).toHaveLength(1);
    expect(result[0].city).toBe("Los Angeles");

    result = findRowsForIP(mockRows, 2000);
    expect(result).toHaveLength(1);
    expect(result[0].city).toBe("Los Angeles");

    result = findRowsForIP(mockRows, 999);
    expect(result).toHaveLength(0);

    result = findRowsForIP(mockRows, 2001);
    expect(result).toHaveLength(0);
  });

  it("should handle empty rows array", () => {
    const result = findRowsForIP([], 1500);

    expect(result).toHaveLength(0);
  });

  it("should handle zero IP ID", () => {
    const rowsWithZero: IPLocationRow[] = [
      {
        lowerIpId: 0,
        upperIpId: 100,
        countryCode: "XX",
        countryName: "Test Country",
        stateRegion: "Test Region",
        city: "Test City",
      },
    ];

    const result = findRowsForIP(rowsWithZero, 0);

    expect(result).toHaveLength(1);
    expect(result[0].city).toBe("Test City");
  });
});
