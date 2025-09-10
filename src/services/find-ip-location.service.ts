import { app } from "../app";
import { ResourceNotFoundError } from "../errors/resource-not-found";
import { findRowsForIP } from "../helpers/find-rows-for-ip";
import { parseCSVFile } from "../helpers/parse-csv-file";
import type { IPLocationRow } from "../models/ip-location-row";

interface IPLocationResponse {
  country: string;
  countryCode: string;
  city: string;
}

export class FindIPLocationService {
  private data: IPLocationRow[] = [];
  private isLoaded = false;

  async loadData(csvFilePath: string): Promise<void> {
    if (this.isLoaded) return;

    this.data = await parseCSVFile(csvFilePath);
    this.data.sort((a, b) => a.lowerIpId - b.lowerIpId);
    this.isLoaded = true;

    this.data.slice(0, 3).forEach((row, i) => {
      app.log.info(
        `  ${i + 1}: ${row.lowerIpId}-${row.upperIpId} -> ${row.city}, ${
          row.countryName
        }`
      );
    });

    app.log.info(
      `IP Range: ${this.data[0]?.lowerIpId} - ${
        this.data[this.data.length - 1]?.upperIpId
      }`
    );
  }

  isLoadedData(): boolean {
    return this.isLoaded;
  }

  async findLocation(ipId: number): Promise<IPLocationResponse> {
    app.log.info(`Looking for IP ID: ${ipId}`);
    app.log.info(`Total records in database: ${this.data.length}`);

    const nearbyRecords = this.data.filter(
      (row) =>
        Math.abs(row.lowerIpId - ipId) < 1000 ||
        Math.abs(row.upperIpId - ipId) < 1000
    );

    app.log.info(
      `Records near IP ID ${ipId}: ${JSON.stringify(nearbyRecords.slice(0, 3))}`
    );

    const matchingRows = findRowsForIP(this.data, ipId);
    app.log.info(`Found ${matchingRows.length} matching rows`);

    if (matchingRows.length === 0) {
      this.data.slice(0, 3).forEach((row, i) => {
        app.log.info(
          `  ${i + 1}: ${row.lowerIpId}-${row.upperIpId} -> ${row.city}, ${
            row.countryName
          }`
        );
      });

      throw new ResourceNotFoundError();
    }

    return {
      country: matchingRows[0].countryName,
      countryCode: matchingRows[0].countryCode,
      city: matchingRows[0].city,
    };
  }
}
