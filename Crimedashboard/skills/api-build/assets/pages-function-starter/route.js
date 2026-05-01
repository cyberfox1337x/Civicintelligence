function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}

async function readJsonBody(request) {
  try {
    return await request.json();
  } catch {
    throw new Error("Invalid JSON body.");
  }
}

function errorResponse(error) {
  const message = error instanceof Error ? error.message : "Request failed.";
  const status = message === "Invalid JSON body." ? 400 : 500;
  return jsonResponse({ error: message }, status);
}

export async function onRequest(context) {
  const { request } = context;

  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        Allow: "GET, POST, OPTIONS",
      },
    });
  }

  try {
    const url = new URL(request.url);

    if (request.method === "GET") {
      const id = url.searchParams.get("id");
      // TODO: replace this with a backend call that lists or fetches real data.
      return jsonResponse({ id, items: [] });
    }

    if (request.method === "POST") {
      const payload = await readJsonBody(request);
      // TODO: validate and normalize payload before calling backend code.
      return jsonResponse({ created: payload }, 201);
    }

    return jsonResponse({ error: "Method not allowed." }, 405);
  } catch (error) {
    return errorResponse(error);
  }
}
