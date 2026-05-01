import { requireOwnerUser } from "../../../auth.js";
import { clearAuthEvents } from "../../../users.js";
import { handleOptions, HttpError, jsonResponse, respondWithError } from "../../../shared/http.js";

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method === "OPTIONS") {
    return handleOptions();
  }

  try {
    await requireOwnerUser(request, env.DB);

    if (request.method === "DELETE") {
      await clearAuthEvents(env.DB);
      return jsonResponse({ success: true, cleared: true });
    }

    throw new HttpError(405, "Method not allowed.");
  } catch (error) {
    return respondWithError(error);
  }
}
