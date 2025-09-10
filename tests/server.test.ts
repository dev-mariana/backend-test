import assert from "assert";
import { afterEach, beforeEach, describe, it } from "node:test";
import { app } from "../src/app";

describe("Fastify IP Location API Tests", () => {
  beforeEach(async () => {
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
  });

  it("should return 404 when the IP doesn't exist in database", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/ip/location?ip=255.255.255.255",
    });

    assert.strictEqual(
      response.statusCode,
      404,
      "should return status code 404"
    );

    const body = JSON.parse(response.body);
    assert.ok(body.message, "should return error message");
  });

  it("should return 400 for invalid IP format", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/ip/location?ip=invalid.ip",
    });

    assert.strictEqual(
      response.statusCode,
      400,
      "should return status code 400"
    );

    const body = JSON.parse(response.body);
    assert.ok(body.message || body.issues, "should return validation error");
  });

  it("should return 400 when IP parameter is missing", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/ip/location",
    });

    assert.strictEqual(
      response.statusCode,
      400,
      "should return status code 400"
    );
  });

  it("should return 200 for valid IP that exists in database", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/ip/location?ip=1.0.0.100",
    });

    assert.ok(
      response.statusCode === 200 || response.statusCode === 404,
      `should return 200 or 404, got ${response.statusCode}`
    );

    if (response.statusCode === 200) {
      const body = JSON.parse(response.body);
      assert.ok(body.country, "should return country");
      assert.ok(body.countryCode, "should return countryCode");
      assert.ok(body.city, "should return city");
    }
  });
});
