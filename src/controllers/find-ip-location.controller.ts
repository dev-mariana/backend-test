import type { FastifyReply, FastifyRequest } from "fastify";
import path from "path";
import { z } from "zod";
import { app } from "../app";
import { ResourceNotFoundError } from "../errors/resource-not-found";
import { ipToID } from "../helpers/ip-calculator";
import { FindIPLocationService } from "../services/find-ip-location.service";

let cachedService: FindIPLocationService | null = null;

export async function FindIPLocationController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const searchParamsSchema = z.object({
    ip: z
      .string()
      .regex(
        /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,
        "Invalid IP address format"
      )
      .refine((ip) => {
        const parts = ip.split(".");
        return parts.every((part) => {
          const num = parseInt(part, 10);
          return num >= 0 && num <= 255;
        });
      }, "IP address octets must be between 0-255"),
  });

  const { ip } = searchParamsSchema.parse(request.query);

  try {
    if (!cachedService) {
      cachedService = new FindIPLocationService();

      const csvPath = path.join(
        __dirname,
        "..",
        "config",
        "database",
        "IP2LOCATION-LITE-DB11.CSV"
      );

      await cachedService.loadData(csvPath);
    }

    const ipId = ipToID(ip);
    app.log.info(`Converting IP ${ip} to ID: ${ipId}`);

    const ipLocation = await cachedService.findLocation(ipId);
    app.log.info(`Found location: ${JSON.stringify(ipLocation)}`);

    return reply.status(200).send(ipLocation);
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: error.message });
    }

    throw error;
  }
}
