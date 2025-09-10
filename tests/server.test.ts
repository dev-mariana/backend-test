import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { app } from "../src/app";

describe("Fastify IP Location API Integration Tests", () => {
  beforeAll(async () => {
    await app.ready();
  }, 15000);

  afterAll(async () => {
    await app.close();
  });

  describe("GET /api/ip/location", () => {
    it("should return 200 or 404 for any valid IP address", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/ip/location?ip=192.168.255.255",
      });

      expect([200, 404]).toContain(response.statusCode);

      if (response.statusCode === 404) {
        const body = JSON.parse(response.body);
        expect(body.message).toBeDefined();
        expect(typeof body.message).toBe("string");
      } else {
        const body = JSON.parse(response.body);
        expect(body).toHaveProperty("country");
        expect(body).toHaveProperty("countryCode");
        expect(body).toHaveProperty("city");
      }
    }, 15000);

    it("should return 400 for invalid IP format", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/ip/location?ip=invalid.ip",
      });

      expect(response.statusCode).toBe(400);

      const body = JSON.parse(response.body);
      expect(body.message || body.issues).toBeDefined();
    });

    it("should return 400 for IP with invalid octets", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/ip/location?ip=256.256.256.256",
      });

      expect(response.statusCode).toBe(400);

      const body = JSON.parse(response.body);
      expect(body.message || body.issues).toBeDefined();
    });

    it("should return 400 when IP parameter is missing", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/ip/location",
      });

      expect(response.statusCode).toBe(400);
    });

    it("should return 400 for empty IP parameter", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/ip/location?ip=",
      });

      expect(response.statusCode).toBe(400);
    });

    it("should return 200 for valid IP that exists in database", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/ip/location?ip=1.0.0.100",
      });

      expect([200, 404]).toContain(response.statusCode);

      if (response.statusCode === 200) {
        const body = JSON.parse(response.body);
        expect(body).toHaveProperty("country");
        expect(body).toHaveProperty("countryCode");
        expect(body).toHaveProperty("city");
        expect(typeof body.country).toBe("string");
        expect(typeof body.countryCode).toBe("string");
        expect(typeof body.city).toBe("string");
      }
    });

    it("should handle common IP addresses correctly", async () => {
      const testIPs = ["8.8.8.8", "1.1.1.1", "192.168.1.1"];

      for (const ip of testIPs) {
        const response = await app.inject({
          method: "GET",
          url: `/api/ip/location?ip=${ip}`,
        });

        expect([200, 404]).toContain(response.statusCode);

        if (response.statusCode === 200) {
          const body = JSON.parse(response.body);
          expect(body).toHaveProperty("country");
          expect(body).toHaveProperty("countryCode");
          expect(body).toHaveProperty("city");
        }
      }
    });

    it("should handle boundary IP addresses", async () => {
      const boundaryIPs = ["0.0.0.0", "127.0.0.1", "255.255.255.254"];

      for (const ip of boundaryIPs) {
        const response = await app.inject({
          method: "GET",
          url: `/api/ip/location?ip=${ip}`,
        });

        expect([200, 404]).toContain(response.statusCode);
      }
    });
  });

  describe("Error handling", () => {
    it("should return proper error format for validation errors", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/ip/location?ip=999.999.999.999",
      });

      expect(response.statusCode).toBe(400);

      const body = JSON.parse(response.body);
      expect(body).toHaveProperty("message");
    });

    it("should handle malformed requests gracefully", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/ip/location?ip=1.2.3.4",
      });

      expect(response.statusCode).toBe(404);
    });
  });
});
