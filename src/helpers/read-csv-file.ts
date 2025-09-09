import { readFileSync } from "fs";
import { app } from "../app";

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
