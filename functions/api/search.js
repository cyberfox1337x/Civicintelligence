import { requireAuthenticatedUser } from "../../auth.js";
import {
  countAuthEventsSince,
  getTotalSearchQueries,
  getUserCount,
  incrementTotalSearchQueries,
  recordAuthEvent,
} from "../../users.js";
import { handleOptions, HttpError, jsonResponse, respondWithError } from "../../shared/http.js";
import { getRequestMetadata } from "../../shared/request-metadata.js";
import { getRemainingSearchQuota, getSearchQuotaWindowStart } from "../../shared/quota.js";

const ALLOWED_TYPES = new Set(["email", "username", "phone", "domain", "keyword", "hash"]);
const DEFAULT_LIMIT = 25;

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method === "OPTIONS") {
    return handleOptions();
  }

  try {
    const user = await requireAuthenticatedUser(request, env.DB);

    if (request.method !== "GET") {
      throw new HttpError(405, "Method not allowed.");
    }

    const apiKey = String(env.LEAKCHECK_API_KEY || "").trim();
    if (!apiKey) {
      throw new HttpError(500, "LeakCheck API key is not configured.");
    }

    const url = new URL(request.url);
    const query = String(url.searchParams.get("query") || "").trim();
    const requestedType = String(url.searchParams.get("type") || "auto").trim().toLowerCase();
    const type = requestedType === "person" ? "keyword" : requestedType;

    if (!query) {
      throw new HttpError(400, "Search query is required.");
    }

    if (query.length < 3) {
      throw new HttpError(400, "Search query must be at least 3 characters.");
    }

    if (type !== "auto" && !ALLOWED_TYPES.has(type)) {
      throw new HttpError(400, "Search type is invalid.");
    }

    let payload;

    try {
      payload = await queryLeakCheck(apiKey, query, type);
    } catch (error) {
      if (
        type === "keyword" &&
        /\s/.test(query) &&
        error instanceof HttpError &&
        error.status === 400 &&
        /invalid characters in query/i.test(error.message)
      ) {
        payload = await queryKeywordTokens(apiKey, query);
      } else {
        throw error;
      }
    }

    const result = Array.isArray(payload?.result) ? payload.result.slice(0, DEFAULT_LIMIT) : [];
    await Promise.all([
      recordAuthEvent(env.DB, {
        id: crypto.randomUUID(),
        eventType: "search",
        username: user.username,
        userId: user.id,
        ...getRequestMetadata(request, { eventType: "search", user }),
        createdAt: Date.now(),
        message: buildSearchEventMessage(query, type, Number(payload?.found || 0)),
      }),
      incrementTotalSearchQueries(env.DB, 1),
    ]);

    const [usersRegistered, totalQueries, recentSearchCount] = await Promise.all([
      getUserCount(env.DB),
      getTotalSearchQueries(env.DB),
      countAuthEventsSince(env.DB, getSearchQuotaWindowStart(), ["search"]),
    ]);

    return jsonResponse({
      provider: "LeakCheck",
      query,
      type,
      success: Boolean(payload?.success),
      found: Number(payload?.found || 0),
      returned: result.length,
      quota: getRemainingSearchQuota(recentSearchCount),
      usersRegistered,
      totalQueries,
      result,
    });
  } catch (error) {
    if (request.method === "GET") {
      try {
        const url = new URL(request.url);
        const failedQuery = String(url.searchParams.get("query") || "").trim();
        const failedType = String(url.searchParams.get("type") || "auto").trim().toLowerCase();
        const user = await requireAuthenticatedUser(request, env.DB);
        await recordAuthEvent(env.DB, {
          id: crypto.randomUUID(),
          eventType: "search_failed",
          username: user.username,
          userId: user.id,
          ...getRequestMetadata(request, { eventType: "search_failed", user }),
          createdAt: Date.now(),
          message: buildSearchFailureMessage(failedQuery, failedType, error),
        });
      } catch {}
    }

    return respondWithError(error);
  }
}

async function queryLeakCheck(apiKey, query, type) {
  const upstreamUrl = new URL(`https://leakcheck.io/api/v2/query/${encodeURIComponent(query)}`);
  upstreamUrl.searchParams.set("limit", String(DEFAULT_LIMIT));
  if (type !== "auto") {
    upstreamUrl.searchParams.set("type", type);
  }

  const response = await fetch(upstreamUrl.toString(), {
    method: "GET",
    headers: {
      Accept: "application/json",
      "X-API-Key": apiKey,
    },
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new HttpError(response.status, payload?.error || payload?.message || "LeakCheck request failed.");
  }

  return payload;
}

async function queryKeywordTokens(apiKey, query) {
  const tokens = Array.from(
    new Set(
      query
        .split(/[^a-zA-Z0-9._@-]+/)
        .map((part) => part.trim())
        .filter((part) => part.length >= 3),
    ),
  ).slice(0, 3);

  if (tokens.length === 0) {
    throw new HttpError(400, "Search query is invalid.");
  }

  const responses = await Promise.all(tokens.map((token) => queryLeakCheck(apiKey, token, "keyword")));
  const merged = [];
  const seen = new Set();
  let quota = null;
  let found = 0;

  for (const response of responses) {
    quota = response?.quota ?? quota;
    found += Number(response?.found || 0);

    for (const item of Array.isArray(response?.result) ? response.result : []) {
      const fingerprint = JSON.stringify([
        item?.email || "",
        item?.username || "",
        item?.name || "",
        item?.phone || "",
        item?.source?.name || "",
        item?.source?.breach_date || "",
      ]);

      if (seen.has(fingerprint)) {
        continue;
      }

      seen.add(fingerprint);
      merged.push(item);
    }
  }

  return {
    success: true,
    found,
    quota,
    result: merged,
  };
}

function buildSearchEventMessage(query, type, found) {
  return `Search ${String(type || "auto").toUpperCase()}: ${truncateQuery(query)} (${found} found).`;
}

function buildSearchFailureMessage(query, type, error) {
  const baseMessage = error instanceof Error ? error.message : "Search failed.";
  return `Search ${String(type || "auto").toUpperCase()}: ${truncateQuery(query)} (${baseMessage})`;
}

function truncateQuery(query) {
  const normalized = String(query || "").trim();
  if (!normalized) {
    return "[empty]";
  }

  return normalized.length > 96 ? `${normalized.slice(0, 93)}...` : normalized;
}
