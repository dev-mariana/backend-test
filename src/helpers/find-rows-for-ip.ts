import { app } from "../app";
import type { IPLocationRow } from "../models/ip-location-row";

export function findRowsForIP(
  rows: IPLocationRow[],
  targetIpId: number
): IPLocationRow[] {
  app.log.info(`Searching for IP ID: ${targetIpId}`);

  const matchingRows = rows.filter(
    (row) => targetIpId >= row.lowerIpId && targetIpId <= row.upperIpId
  );

  app.log.info(`Found ${matchingRows.length} matching rows`);

  return matchingRows;
}
