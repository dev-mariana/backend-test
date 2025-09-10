import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../src/app", () => ({
  app: {
    log: {
      info: vi.fn(),
    },
  },
}));

vi.mock("../../src/helpers/read-csv-file", () => ({
  readCSVLines: vi.fn(),
}));

import { parseCSVFile, parseLine } from "../../src/helpers/parse-csv-file";
import { readCSVLines } from "../../src/helpers/read-csv-file";

describe("parseLine", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should parse a valid CSV line correctly", () => {
    const line =
      '16777216,16777471,"AU","Australia","South Australia","Adelaide"';
    const result = parseLine(line, 1);

    expect(result).toEqual({
      lowerIpId: 16777216,
      upperIpId: 16777471,
      countryCode: "AU",
      countryName: "Australia",
      stateRegion: "South Australia",
      city: "Adelaide",
    });
  });

  it("should handle CSV line with quotes", () => {
    const line =
      '"1000","2000","US","United States","California","Los Angeles"';
    const result = parseLine(line, 1);

    expect(result).toEqual({
      lowerIpId: 1000,
      upperIpId: 2000,
      countryCode: "US",
      countryName: "United States",
      stateRegion: "California",
      city: "Los Angeles",
    });
  });

  it("should handle CSV line with mixed quotes and spaces", () => {
    const line = ' 5000 , 6000 ,"GB", "United Kingdom" , "England" , "London" ';
    const result = parseLine(line, 1);

    expect(result).toEqual({
      lowerIpId: 5000,
      upperIpId: 6000,
      countryCode: "GB",
      countryName: "United Kingdom",
      stateRegion: "England",
      city: "London",
    });
  });

  it("should return null for line with insufficient columns", () => {
    const line = "1000,2000,US";
    const result = parseLine(line, 1);

    expect(result).toBeNull();
  });

  it("should return null for line with invalid IP IDs", () => {
    const line = "invalid,2000,US,United States,California,Los Angeles";
    const result = parseLine(line, 1);

    expect(result).toBeNull();
  });

  it("should return null for line with NaN upper IP ID", () => {
    const line = "1000,invalid,US,United States,California,Los Angeles";
    const result = parseLine(line, 1);

    expect(result).toBeNull();
  });

  it("should handle empty string values", () => {
    const line = '1000,2000,"","","",""';
    const result = parseLine(line, 1);

    expect(result).toEqual({
      lowerIpId: 1000,
      upperIpId: 2000,
      countryCode: "",
      countryName: "",
      stateRegion: "",
      city: "",
    });
  });

  it("should handle lines with extra columns (ignoring them)", () => {
    const line =
      "1000,2000,US,United States,California,Los Angeles,extra1,extra2,extra3,extra4";
    const result = parseLine(line, 1);

    expect(result).toEqual({
      lowerIpId: 1000,
      upperIpId: 2000,
      countryCode: "US",
      countryName: "United States",
      stateRegion: "California",
      city: "Los Angeles",
    });
  });
});

describe("parseCSVFile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should parse multiple CSV lines correctly", async () => {
    const mockLines = [
      "1000,2000,US,United States,California,Los Angeles",
      "5000,6000,GB,United Kingdom,England,London",
      "invalid,line,should,be,ignored",
      "10000,15000,FR,France,Île-de-France,Paris",
    ];

    vi.mocked(readCSVLines).mockResolvedValue(mockLines);

    const result = await parseCSVFile("/fake/path.csv");

    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({
      lowerIpId: 1000,
      upperIpId: 2000,
      countryCode: "US",
      countryName: "United States",
      stateRegion: "California",
      city: "Los Angeles",
    });
    expect(result[1]).toEqual({
      lowerIpId: 5000,
      upperIpId: 6000,
      countryCode: "GB",
      countryName: "United Kingdom",
      stateRegion: "England",
      city: "London",
    });
    expect(result[2]).toEqual({
      lowerIpId: 10000,
      upperIpId: 15000,
      countryCode: "FR",
      countryName: "France",
      stateRegion: "Île-de-France",
      city: "Paris",
    });
  });

  it("should handle empty file", async () => {
    vi.mocked(readCSVLines).mockResolvedValue([]);

    const result = await parseCSVFile("/fake/empty.csv");

    expect(result).toHaveLength(0);
  });

  it("should filter out all invalid lines", async () => {
    const mockLines = [
      "invalid,line",
      "another,invalid,line",
      "not,enough,columns,here,too",
    ];

    vi.mocked(readCSVLines).mockResolvedValue(mockLines);

    const result = await parseCSVFile("/fake/invalid.csv");

    expect(result).toHaveLength(0);
  });
});
