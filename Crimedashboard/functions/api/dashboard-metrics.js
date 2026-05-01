import { requireAuthenticatedUser } from "../../auth.js";
import { countAuthEventsSince, getTotalSearchQueries, getUserCount } from "../../users.js";
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

    const [usersRegistered, totalQueries, recentSearchCount] = await Promise.all([
      getUserCount(env.DB),
      getTotalSearchQueries(env.DB),
      countAuthEventsSince(env.DB, getSearchQuotaWindowStart(), ["search"]),
    ]);

    return jsonResponse({
      usersRegistered,
      totalQueries,
      quota: getRemainingSearchQuota(recentSearchCount),
      syncedAt: new Date().toISOString(),
    });
  } catch (error) {
    return respondWithError(error);
  }
}
