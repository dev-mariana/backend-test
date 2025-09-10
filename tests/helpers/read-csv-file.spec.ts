import { describe, expect, it } from "vitest";
import { splitIntoLines } from "../../src/helpers/read-csv-file";

describe("splitIntoLines", () => {
  it("should split file content by newlines", () => {
    const content = "line1\nline2\nline3";
    const result = splitIntoLines(content);

    expect(result).toEqual(["line1", "line2", "line3"]);
  });

  it("should handle Windows line endings", () => {
    const content = "line1\r\nline2\r\nline3";
    const result = splitIntoLines(content);

    expect(result).toEqual(["line1\r", "line2\r", "line3"]);
  });

  it("should filter out empty lines", () => {
    const content = "line1\n\nline2\n   \nline3\n";
    const result = splitIntoLines(content);

    expect(result).toEqual(["line1", "line2", "line3"]);
  });

  it("should handle content with only empty lines", () => {
    const content = "\n\n   \n\t\n";
    const result = splitIntoLines(content);

    expect(result).toEqual([]);
  });

  it("should handle empty string", () => {
    const content = "";
    const result = splitIntoLines(content);

    expect(result).toEqual([]);
  });

  it("should handle single line without newline", () => {
    const content = "single line";
    const result = splitIntoLines(content);

    expect(result).toEqual(["single line"]);
  });

  it("should preserve line content with spaces", () => {
    const content = "  line with spaces  \nanother line  ";
    const result = splitIntoLines(content);

    expect(result).toEqual(["  line with spaces  ", "another line  "]);
  });
});
