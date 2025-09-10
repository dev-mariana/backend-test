import { beforeEach, describe, expect, it, vi } from "vitest";
import type { IPLocationRow } from "../../src/models/ip-location-row";

vi.mock("../../src/app", () => ({
  app: {
    log: {
      info: vi.fn(),
    },
  },
}));

vi.mock("../../src/helpers/parse-csv-file", () => ({
  parseCSVFile: vi.fn(),
}));

vi.mock("../../src/helpers/find-rows-for-ip", () => ({
  findRowsForIP: vi.fn(),
}));

import { ResourceNotFoundError } from "../../src/errors/resource-not-found";
import { findRowsForIP } from "../../src/helpers/find-rows-for-ip";
import { parseCSVFile } from "../../src/helpers/parse-csv-file";
import { FindIPLocationService } from "../../src/services/find-ip-location.service";

describe("FindIPLocationService", () => {
  let service: FindIPLocationService;
  const mockData: IPLocationRow[] = [
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
    service = new FindIPLocationService();
  });

  describe("loadData", () => {
    it("should load and sort CSV data correctly", async () => {
      const unsortedData = [mockData[2], mockData[0], mockData[1]];
      vi.mocked(parseCSVFile).mockResolvedValue(unsortedData);

      await service.loadData("/fake/path.csv");

      expect(parseCSVFile).toHaveBeenCalledWith("/fake/path.csv");
      expect(service.isLoadedData()).toBe(true);
    });

    it("should not reload data if already loaded", async () => {
      vi.mocked(parseCSVFile).mockResolvedValue(mockData);

      await service.loadData("/fake/path.csv");
      await service.loadData("/fake/path.csv");

      expect(parseCSVFile).toHaveBeenCalledTimes(1);
    });

    it("should handle empty CSV file", async () => {
      vi.mocked(parseCSVFile).mockResolvedValue([]);

      await service.loadData("/fake/empty.csv");

      expect(service.isLoadedData()).toBe(true);
    });

    it("should handle CSV parsing errors", async () => {
      const error = new Error("CSV parsing failed");
      vi.mocked(parseCSVFile).mockRejectedValue(error);

      await expect(service.loadData("/fake/path.csv")).rejects.toThrow(
        "CSV parsing failed"
      );
      expect(service.isLoadedData()).toBe(false);
    });
  });

  describe("isLoadedData", () => {
    it("should return false initially", () => {
      expect(service.isLoadedData()).toBe(false);
    });

    it("should return true after successful data load", async () => {
      vi.mocked(parseCSVFile).mockResolvedValue(mockData);

      await service.loadData("/fake/path.csv");

      expect(service.isLoadedData()).toBe(true);
    });

    it("should return false after failed data load", async () => {
      vi.mocked(parseCSVFile).mockRejectedValue(new Error("Load failed"));

      try {
        await service.loadData("/fake/path.csv");
      } catch {
        // Expected to fail
      }

      expect(service.isLoadedData()).toBe(false);
    });
  });

  describe("findLocation", () => {
    beforeEach(async () => {
      vi.mocked(parseCSVFile).mockResolvedValue(mockData);
      await service.loadData("/fake/path.csv");
    });

    it("should find and return location for matching IP ID", async () => {
      const matchingRow = mockData[0];
      vi.mocked(findRowsForIP).mockReturnValue([matchingRow]);

      const result = await service.findLocation(1500);

      expect(findRowsForIP).toHaveBeenCalledWith(expect.any(Array), 1500);
      expect(result).toEqual({
        country: "United States",
        countryCode: "US",
        city: "Los Angeles",
      });
    });

    it("should return first matching row when multiple matches found", async () => {
      const matchingRows = [mockData[0], mockData[1]];
      vi.mocked(findRowsForIP).mockReturnValue(matchingRows);

      const result = await service.findLocation(1500);

      expect(result).toEqual({
        country: "United States",
        countryCode: "US",
        city: "Los Angeles",
      });
    });

    it("should throw ResourceNotFoundError when no matches found", async () => {
      vi.mocked(findRowsForIP).mockReturnValue([]);

      await expect(service.findLocation(9999)).rejects.toThrow(
        ResourceNotFoundError
      );
      await expect(service.findLocation(9999)).rejects.toThrow(
        "Resource not found."
      );
    });

    it("should handle edge case IP IDs", async () => {
      vi.mocked(findRowsForIP).mockReturnValue([]);

      await expect(service.findLocation(0)).rejects.toThrow(
        ResourceNotFoundError
      );
      await expect(service.findLocation(-1)).rejects.toThrow(
        ResourceNotFoundError
      );
      await expect(service.findLocation(4294967295)).rejects.toThrow(
        ResourceNotFoundError
      );
    });

    it("should work with boundary IP IDs", async () => {
      const matchingRow = mockData[0];
      vi.mocked(findRowsForIP).mockReturnValue([matchingRow]);

      const result = await service.findLocation(1000);

      expect(result).toEqual({
        country: "United States",
        countryCode: "US",
        city: "Los Angeles",
      });
    });

    it("should handle rows with empty location data", async () => {
      const emptyLocationRow: IPLocationRow = {
        lowerIpId: 3000,
        upperIpId: 4000,
        countryCode: "",
        countryName: "",
        stateRegion: "",
        city: "",
      };
      vi.mocked(findRowsForIP).mockReturnValue([emptyLocationRow]);

      const result = await service.findLocation(3500);

      expect(result).toEqual({
        country: "",
        countryCode: "",
        city: "",
      });
    });
  });

  describe("integration scenarios", () => {
    it("should work end-to-end with realistic data flow", async () => {
      vi.mocked(parseCSVFile).mockResolvedValue(mockData);
      vi.mocked(findRowsForIP).mockReturnValue([mockData[1]]);

      await service.loadData("/fake/realistic.csv");
      const result = await service.findLocation(5500);

      expect(service.isLoadedData()).toBe(true);
      expect(result).toEqual({
        country: "United Kingdom",
        countryCode: "GB",
        city: "London",
      });
    });

    it("should handle service reuse after data loading", async () => {
      vi.mocked(parseCSVFile).mockResolvedValue(mockData);

      await service.loadData("/fake/path.csv");

      vi.mocked(findRowsForIP)
        .mockReturnValueOnce([mockData[0]])
        .mockReturnValueOnce([mockData[2]]);

      const result1 = await service.findLocation(1500);
      const result2 = await service.findLocation(12000);

      expect(result1.city).toBe("Los Angeles");
      expect(result2.city).toBe("Paris");
      expect(parseCSVFile).toHaveBeenCalledTimes(1);
    });
  });
});
