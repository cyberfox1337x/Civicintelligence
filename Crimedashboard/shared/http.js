export class HttpError extends Error {
  constructor(status, message, code = "") {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.code = String(code || "").trim();
  }
}

export function jsonResponse(payload, status = 200, headers = {}) {
  return new Response(JSON.stringify(payload, null, 2), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...headers,
    },
  });
}

export function emptyResponse(status = 204) {
  return new Response(null, { status });
}

export function handleOptions() {
  return emptyResponse();
}

export async function readJsonBody(request) {
  const contentType = request.headers.get("content-type") || "";

  if (!contentType.includes("application/json")) {
    throw new HttpError(400, "Expected application/json request body.");
  }

  try {
    return await request.json();
  } catch {
    throw new HttpError(400, "Request body must be valid JSON.");
  }
}

export function respondWithError(error) {
  if (error instanceof HttpError) {
    const payload = { error: error.message };
    if (error.code) {
      payload.code = error.code;
    }

    return jsonResponse(payload, error.status);
  }

  console.error("Unhandled Pages Function error", error);
  return jsonResponse({ error: "Unexpected server error." }, 500);
}

export function getRouteRemainder(request, prefixSegments) {
  const segments = new URL(request.url)
    .pathname
    .replace(/^\/+|\/+$/g, "")
    .split("/")
    .filter(Boolean);

  return segments.slice(prefixSegments.length);
}
