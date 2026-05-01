import { requireAuthenticatedUser } from "../../auth.js";
import { countAuthEventsSince } from "../../users.js";
import { handleOptions, HttpError, jsonResponse, respondWithError } from "../../shared/http.js";
import { getRemainingSearchQuota, getSearchQuotaWindowStart } from "../../shared/quota.js";

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method === "OPTIONS") {
    return handleOptions();
  }

  try {
    await requireAuthenticatedUser(request, env.DB);

    if (request.method !== "GET") {
      throw new HttpError(405, "Method not allowed.");
    }

    const recentSearchCount = await countAuthEventsSince(
      env.DB,
      getSearchQuotaWindowStart(),
      ["search"],
    );

    return jsonResponse({
      provider: "LeakCheck",
      quota: getRemainingSearchQuota(recentSearchCount),
      syncedAt: new Date().toISOString(),
    });
  } catch (error) {
    return respondWithError(error);
  }
}
