import { readFileSync } from "fs";
import { app } from "../app";
import type { IPLocationRow } from "../models/ip-location-row";

export function readCSVFile(filePath: string): string {
  app.log.info(`Reading file: ${filePath}`);

  const fileContent = readFileSync(filePath, "utf-8");

  app.log.info(`File size: ${fileContent.length} characters`);

  return fileContent;
}

export function splitIntoLines(fileContent: string): string[] {
  app.log.info("Splitting file into lines...");

  const lines = fileContent.split("\n");

  const nonEmptyLines = lines.filter((line) => line.trim() !== "");

  app.log.info(`Total lines: ${lines.length}`);
  app.log.info(`Non-empty lines: ${nonEmptyLines.length}`);

  return nonEmptyLines;
}

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
