import { HttpError } from "./http.js";

let rateLimitSchemaReady = false;

export async function enforceRateLimit(
  db,
  { key, limit, windowMs, message = "Too many requests. Please try again later." },
) {
  const normalizedKey = String(key || "").trim();
  const safeLimit = Math.max(1, Number(limit) || 1);
  const safeWindowMs = Math.max(1000, Number(windowMs) || 1000);

  if (!normalizedKey) {
    throw new HttpError(500, "Rate limit key is invalid.");
  }

  await ensureRateLimitTable(db);

  const now = Date.now();
  const resetAt = now + safeWindowMs;

  await db
    .prepare(
      `
        INSERT INTO app_rate_limits (bucket_key, bucket_count, reset_at, updated_at)
        VALUES (?, 1, ?, ?)
        ON CONFLICT(bucket_key) DO UPDATE SET
          bucket_count = CASE
            WHEN app_rate_limits.reset_at <= excluded.updated_at THEN 1
            ELSE app_rate_limits.bucket_count + 1
          END,
          reset_at = CASE
            WHEN app_rate_limits.reset_at <= excluded.updated_at THEN excluded.reset_at
            ELSE app_rate_limits.reset_at
          END,
          updated_at = excluded.updated_at
      `,
    )
    .bind(normalizedKey, resetAt, now)
    .run();

  const row = await db
    .prepare(
      `
        SELECT bucket_count, reset_at
        FROM app_rate_limits
        WHERE bucket_key = ?
      `,
    )
    .bind(normalizedKey)
    .first();

  if (Number(row?.bucket_count || 0) > safeLimit) {
    throw new HttpError(429, message, "RATE_LIMITED");
  }
}

async function ensureRateLimitTable(db) {
  if (rateLimitSchemaReady) {
    return;
  }

  await db
    .prepare(
      `
        CREATE TABLE IF NOT EXISTS app_rate_limits (
          bucket_key TEXT PRIMARY KEY,
          bucket_count INTEGER NOT NULL DEFAULT 0,
          reset_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL
        )
      `,
    )
    .run();

  await db
    .prepare(
      `
        CREATE INDEX IF NOT EXISTS idx_app_rate_limits_reset_at
        ON app_rate_limits(reset_at)
      `,
    )
    .run();

  rateLimitSchemaReady = true;
}
