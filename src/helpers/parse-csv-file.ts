import { app } from "../app";
import type { IPLocationRow } from "../models/ip-location-row";
import { readCSVFile, splitIntoLines } from "./read-csv-file";

export function parseLine(
  line: string,
  lineNumber: number
): IPLocationRow | null {
  app.log.info(`Parsing line ${lineNumber}: ${line.substring(0, 50)}...`);

  const columns = line.split(",");

  if (columns.length < 6) {
    app.log.warn(
      `Line ${lineNumber} has only ${columns.length} columns, skipping...`
    );

    return null;
  }

  const trimmedColumns = columns.map((col) => col.trim());

  const lowerIpId = parseInt(trimmedColumns[0], 10);
  const upperIpId = parseInt(trimmedColumns[1], 10);

  if (isNaN(lowerIpId) || isNaN(upperIpId)) {
    app.log.warn(`Line ${lineNumber} has invalid numeric values, skipping...`);
    return null;
  }

  const row: IPLocationRow = {
    lowerIpId,
    upperIpId,
    countryCode: trimmedColumns[2],
    countryName: trimmedColumns[3],
    stateRegion: trimmedColumns[4],
    city: trimmedColumns[5],
  };

  app.log.info(`Parsed: ${row.city}, ${row.countryName} (${row.countryCode})`);

  return row;
}

export function parseCSVFile(filePath: string): IPLocationRow[] {
  app.log.info("Starting CSV parsing process...");

  const fileContent = readCSVFile(filePath);

  const lines = splitIntoLines(fileContent);

  app.log.info("Parsing individual lines...");

  const validRows: IPLocationRow[] = [];
  const invalidRows: number[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const row = parseLine(line, i + 1);

    if (row) {
      validRows.push(row);
    } else {
      invalidRows.push(i + 1);
    }
  }

  app.log.info(`Successfully parsed: ${validRows.length} rows`);
  app.log.info(`Failed to parse: ${invalidRows.length} rows`);

  if (invalidRows.length > 0) {
    app.log.info(
      `Invalid rows: ${invalidRows.slice(0, 5).join(", ")}${
        invalidRows.length > 5 ? "..." : ""
      }`
    );
  }

  return validRows;
}
