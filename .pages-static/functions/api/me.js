import { getAuthenticatedActiveUser } from "../../auth.js";
import { handleOptions, HttpError, jsonResponse, respondWithError } from "../../shared/http.js";

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method === "OPTIONS") {
    return handleOptions();
  }

  try {
    if (request.method !== "GET") {
      throw new HttpError(405, "Method not allowed.");
    }

    const user = await getAuthenticatedActiveUser(request, env.DB);
    return jsonResponse({ user: user || null });
  } catch (error) {
    return respondWithError(error);
  }
}
