import type { IncomingMessage, ServerResponse } from "node:http";
import { morphismService } from "../lib/container";

function sendJson(response: ServerResponse, statusCode: number, payload: unknown) {
  response.writeHead(statusCode, { "content-type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload, null, 2));
}

async function readBody<T>(request: IncomingMessage): Promise<T> {
  const chunks: Buffer[] = [];
  for await (const chunk of request) {
    chunks.push(Buffer.from(chunk));
  }

  return JSON.parse(Buffer.concat(chunks).toString("utf-8"));
}

export function createRouteHandler(service = morphismService) {
  return async function routeRequest(request: IncomingMessage, response: ServerResponse) {
    const url = new URL(request.url ?? "/", "http://localhost");
    const method = request.method ?? "GET";
    const parts = url.pathname.split("/").filter(Boolean);

    try {
      if (method === "GET" && url.pathname === "/morphisms") {
        return sendJson(response, 200, service.listMorphisms());
      }

      if (method === "POST" && url.pathname === "/morphisms") {
        const input = await readBody<{
          title: string;
          input: string;
          output: string;
          tags: string[];
          content?: string;
        }>(request);
        return sendJson(response, 201, service.createMorphism(input));
      }

      if (parts[0] === "morphisms" && parts[1] && method === "GET" && parts.length === 2) {
        return sendJson(response, 200, service.getMorphism(parts[1]));
      }

      if (parts[0] === "morphisms" && parts[1] && method === "PATCH" && parts.length === 2) {
        const input = await readBody<{
          title: string;
          input: string;
          output: string;
          tags: string[];
          content?: string;
        }>(request);
        return sendJson(response, 200, service.updateMorphism(parts[1], input));
      }

      if (parts[0] === "morphisms" && parts[1] && parts[2] === "connections" && method === "POST") {
        const input = await readBody<{ targetMorphismId: string }>(request);
        return sendJson(
          response,
          200,
          service.addConnection(parts[1], input.targetMorphismId)
        );
      }

      if (parts[0] === "morphisms" && parts[1] && parts[2] === "related-candidates" && method === "GET") {
        return sendJson(response, 200, service.getRelatedCandidates(parts[1]));
      }

      if (parts[0] === "morphisms" && parts[1] && parts[2] === "compose-candidates" && method === "GET") {
        return sendJson(response, 200, service.getComposeCandidates(parts[1]));
      }

      if (method === "POST" && url.pathname === "/composites") {
        const input = await readBody<{ sourceId: string; targetId: string }>(request);
        return sendJson(response, 201, service.createComposite(input.sourceId, input.targetId));
      }

      if (parts[0] === "composites" && parts[1] && method === "PATCH" && parts.length === 2) {
        const input = await readBody<{ title: string; content?: string }>(request);
        return sendJson(response, 200, service.updateComposite(parts[1], input));
      }

      return sendJson(response, 404, { message: "Route not found" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return sendJson(response, 400, { message });
    }
  };
}

export const routeRequest = createRouteHandler();
