import { createReadStream } from "fs";
import { createInterface } from "readline";

export async function readCSVLines(filePath: string): Promise<string[]> {
  const lines: string[] = [];
  const fileStream = createReadStream(filePath);

  const rl = createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    if (line.trim()) {
      lines.push(line);
    }
  }

  return lines;
}

export function splitIntoLines(fileContent: string): string[] {
  return fileContent.split("\n").filter((line) => line.trim() !== "");
}
