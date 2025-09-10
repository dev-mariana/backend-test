import { app } from "../app";
import type { IPLocationRow } from "../models/ip-location-row";
import { readCSVLines } from "./read-csv-file";

export function parseLine(
  line: string,
  lineNumber: number
): IPLocationRow | null {
  if (lineNumber % 100000 === 0) {
    app.log.info(`Processing line ${lineNumber}...`);
  }

  const columns = line.split(",");

  if (columns.length < 6) return null;

  const trimmedColumns = columns.map((col) => col.trim().replace(/^"|"$/g, ""));
  const lowerIpId = parseInt(trimmedColumns[0], 10);
  const upperIpId = parseInt(trimmedColumns[1], 10);

  if (isNaN(lowerIpId) || isNaN(upperIpId)) return null;

  return {
    lowerIpId,
    upperIpId,
    countryCode: trimmedColumns[2],
    countryName: trimmedColumns[3],
    stateRegion: trimmedColumns[4],
    city: trimmedColumns[5],
  };
}

export async function parseCSVFile(filePath: string): Promise<IPLocationRow[]> {
  app.log.info("Starting CSV parsing process...");

  const lines = await readCSVLines(filePath);

  const validRows: IPLocationRow[] = [];

  for (let i = 0; i < lines.length; i++) {
    const row = parseLine(lines[i], i + 1);

    if (row) {
      validRows.push(row);
    }
  }

  app.log.info(`Successfully parsed: ${validRows.length} rows`);
  return validRows;
}
