import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createServer, type Server } from "node:http";
import { once } from "node:events";
import type { AddressInfo } from "node:net";
import { mkdtempSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { createMorphismService } from "../../apps/api/src/lib/container";
import { createRouteHandler } from "../../apps/api/src/routes/router";

describe("API routes", () => {
  let server: Server;
  let baseUrl = "";
  const tempDir = mkdtempSync(join(tmpdir(), "morphverse-api-routes-"));
  const storagePath = join(tempDir, "morphisms.json");

  beforeAll(async () => {
    const routeRequest = createRouteHandler(createMorphismService({ storagePath }));
    server = createServer((request, response) => {
      void routeRequest(request, response);
    });
    server.listen(0);
    await once(server, "listening");
    const address = server.address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  afterAll(async () => {
    server.close();
    await once(server, "close");
  });

  it("creates and updates a standard morphism", async () => {
    const createdResponse = await fetch(`${baseUrl}/morphisms`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        title: "New morphism",
        input: "new input",
        output: "new output",
        tags: ["draft"],
        content: "new content"
      })
    });

    expect(createdResponse.status).toBe(201);
    const created = await createdResponse.json();

    const updatedResponse = await fetch(`${baseUrl}/morphisms/${created.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        title: "Saved morphism",
        input: "saved input",
        output: "saved output",
        tags: ["saved"],
        content: "saved content"
      })
    });

    expect(updatedResponse.status).toBe(200);
    const updated = await updatedResponse.json();
    expect(updated.title).toBe("Saved morphism");
    expect(updated.output).toBe("saved output");
  });

  it("updates a composite and rejects using the standard update route", async () => {
    const compositeResponse = await fetch(`${baseUrl}/composites`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        sourceId: "morphism-1",
        targetId: "morphism-2"
      })
    });

    expect(compositeResponse.status).toBe(201);
    const composite = await compositeResponse.json();

    const updatedCompositeResponse = await fetch(`${baseUrl}/composites/${composite.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        title: "Composite note",
        content: "Composite content"
      })
    });

    expect(updatedCompositeResponse.status).toBe(200);
    const updatedComposite = await updatedCompositeResponse.json();
    expect(updatedComposite.title).toBe("Composite note");
    expect(updatedComposite.content).toBe("Composite content");

    const invalidResponse = await fetch(`${baseUrl}/morphisms/${composite.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        title: "Should fail",
        input: "x",
        output: "y",
        tags: [],
        content: ""
      })
    });

    expect(invalidResponse.status).toBe(400);
  });

  it("deletes a standard morphism and cascades linked data cleanup", async () => {
    const compositeResponse = await fetch(`${baseUrl}/composites`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        sourceId: "morphism-1",
        targetId: "morphism-2"
      })
    });

    expect(compositeResponse.status).toBe(201);
    const composite = await compositeResponse.json();

    const deleteResponse = await fetch(`${baseUrl}/morphisms/morphism-2`, {
      method: "DELETE"
    });

    expect(deleteResponse.status).toBe(204);

    const listResponse = await fetch(`${baseUrl}/morphisms`);
    expect(listResponse.status).toBe(200);
    const items = await listResponse.json();

    expect(items.find((item: { id: string }) => item.id === "morphism-2")).toBeUndefined();
    expect(items.find((item: { id: string }) => item.id === composite.id)).toBeUndefined();
    expect(items.find((item: { id: string }) => item.id === "morphism-1")).toMatchObject({
      connections: []
    });
  });
});
