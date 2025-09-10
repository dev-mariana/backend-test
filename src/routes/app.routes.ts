import type { FastifyInstance } from "fastify";
import { FindIPLocationController } from "../controllers/find-ip-location.controller";

export async function appRoutes(app: FastifyInstance) {
  app.get("/ip/location", FindIPLocationController);
}
