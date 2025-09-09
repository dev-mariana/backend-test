import { readFileSync } from "fs";
import { app } from "../app";

export function readCSVFile(filePath: string): string {
  app.log.info(`Reading file: ${filePath}`);

  const fileContent = readFileSync(filePath, "utf-8");

  app.log.info(`File size: ${fileContent.length} characters`);

  return fileContent;
}
