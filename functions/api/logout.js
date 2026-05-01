import { clearSessionCookie, getCurrentSessionTokenHash } from "../../auth.js";
import { handleOptions, HttpError, jsonResponse, respondWithError } from "../../shared/http.js";
import { deleteUserSessionByTokenHash } from "../../users.js";

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method === "OPTIONS") {
    return handleOptions();
  }

  try {
    if (request.method !== "POST") {
      throw new HttpError(405, "Method not allowed.");
    }

    const tokenHash = await getCurrentSessionTokenHash(request);
    if (tokenHash) {
      await deleteUserSessionByTokenHash(env.DB, tokenHash);
    }

    return jsonResponse(
      {
        success: true,
      },
      200,
      {
        "Set-Cookie": clearSessionCookie(),
      },
    );
  } catch (error) {
    return respondWithError(error);
  }
}
