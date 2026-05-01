function mapUser(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    username: row.username,
    email: row.email,
    displayName: row.display_name || row.username,
    organization: row.organization || "",
    passwordHash: row.password_hash,
    passwordSalt: row.password_salt,
    createdAt: Number(row.created_at) || 0,
    updatedAt: Number(row.updated_at) || 0,
    banned: Number(row.banned) === 1,
    role: row.role || "normal user",
    profileImage: row.profile_image || "",
    otpSecret: row.otp_secret || "",
    otpEnabled: Number(row.otp_enabled) === 1,
  };
}

const TOTAL_SEARCH_QUERIES_METRIC_KEY = "total_search_queries";

function mapAuthEvent(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    eventType: row.event_type,
    username: row.username || "",
    userId: row.user_id || "",
    ipAddress: row.ip_address || "",
    state: row.state || "",
    city: row.city || "",
    zip: row.zip || "",
    userRole: row.user_role || "",
    userAgent: row.user_agent || "",
    createdAt: Number(row.created_at) || 0,
    message: row.message || "",
  };
}

export async function createUser(db, user) {
  await db
    .prepare(
      `
        INSERT INTO app_users (
          id,
          username,
          email,
          display_name,
          organization,
          password_hash,
          password_salt,
          created_at,
          updated_at,
          banned,
          role,
          profile_image,
          otp_secret,
          otp_enabled
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
    )
    .bind(
      user.id,
      user.username,
      user.email,
      user.displayName,
      user.organization,
      user.passwordHash,
      user.passwordSalt,
      user.createdAt,
      user.updatedAt,
      user.banned ? 1 : 0,
      user.role,
      user.profileImage || "",
      user.otpSecret || "",
      user.otpEnabled ? 1 : 0,
    )
    .run();

  return getUserById(db, user.id);
}

export async function getUserById(db, id) {
  const row = await db
    .prepare(
      `
        SELECT
          id,
          username,
          email,
          display_name,
          organization,
          password_hash,
          password_salt,
          created_at,
          updated_at,
          banned,
          role,
          profile_image,
          otp_secret,
          otp_enabled
        FROM app_users
        WHERE id = ?
      `,
    )
    .bind(id)
    .first();

  return mapUser(row);
}

export async function getUserByEmail(db, email) {
  const row = await db
    .prepare(
      `
        SELECT
          id,
          username,
          email,
          display_name,
          organization,
          password_hash,
          password_salt,
          created_at,
          updated_at,
          banned,
          role,
          profile_image,
          otp_secret,
          otp_enabled
        FROM app_users
        WHERE email = ?
      `,
    )
    .bind(email)
    .first();

  return mapUser(row);
}

export async function getUserByUsername(db, username) {
  const row = await db
    .prepare(
      `
        SELECT
          id,
          username,
          email,
          display_name,
          organization,
          password_hash,
          password_salt,
          created_at,
          updated_at,
          banned,
          role,
          profile_image,
          otp_secret,
          otp_enabled
        FROM app_users
        WHERE username = ?
      `,
    )
    .bind(username)
    .first();

  return mapUser(row);
}

export async function getUserCount(db) {
  const row = await db.prepare(`SELECT COUNT(*) AS count FROM app_users`).first();
  return Number(row?.count || 0);
}

export async function listUsers(db) {
  const { results } = await db
    .prepare(
      `
        SELECT
          id,
          username,
          email,
          display_name,
          organization,
          password_hash,
          password_salt,
          created_at,
          updated_at,
          banned,
          role,
          profile_image,
          otp_secret,
          otp_enabled
        FROM app_users
        ORDER BY created_at DESC
      `,
    )
    .all();

  return results.map(mapUser);
}

export async function createUserSession(db, session) {
  await db
    .prepare(
      `
        INSERT INTO app_sessions (
          token_hash,
          user_id,
          expires_at,
          created_at,
          last_seen_at
        )
        VALUES (?, ?, ?, ?, ?)
      `,
    )
    .bind(
      session.tokenHash,
      session.userId,
      session.expiresAt,
      session.createdAt,
      session.lastSeenAt,
    )
    .run();
}

export async function deleteUserSessionByTokenHash(db, tokenHash) {
  await db
    .prepare(
      `
        DELETE FROM app_sessions
        WHERE token_hash = ?
      `,
    )
    .bind(tokenHash)
    .run();
}

export async function getUserSessionByTokenHash(db, tokenHash) {
  return db
    .prepare(
      `
        SELECT
          token_hash,
          user_id,
          expires_at,
          created_at,
          last_seen_at
        FROM app_sessions
        WHERE token_hash = ?
      `,
    )
    .bind(tokenHash)
    .first();
}

export async function touchUserSession(db, tokenHash, lastSeenAt) {
  await db
    .prepare(
      `
        UPDATE app_sessions
        SET last_seen_at = ?
        WHERE token_hash = ?
      `,
    )
    .bind(lastSeenAt, tokenHash)
    .run();
}

export async function getActiveSessionCount(db, now = Date.now()) {
  const row = await db
    .prepare(
      `
        SELECT COUNT(*) AS count
        FROM app_sessions
        WHERE expires_at > ?
      `,
    )
    .bind(now)
    .first();

  return Number(row?.count || 0);
}

export async function deleteUserSessionsByUserId(db, userId, { exceptTokenHash = "" } = {}) {
  const normalizedExceptTokenHash = String(exceptTokenHash || "").trim();

  if (normalizedExceptTokenHash) {
    await db
      .prepare(
        `
          DELETE FROM app_sessions
          WHERE user_id = ?
            AND token_hash != ?
        `,
      )
      .bind(userId, normalizedExceptTokenHash)
      .run();
    return;
  }

  await db
    .prepare(
      `
        DELETE FROM app_sessions
        WHERE user_id = ?
      `,
    )
    .bind(userId)
    .run();
}

export async function recordAuthEvent(db, event) {
  await db
    .prepare(
      `
        INSERT INTO auth_events (
          id,
          event_type,
          username,
          user_id,
          ip_address,
          state,
          city,
          zip,
          user_agent,
          created_at,
          message
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
    )
    .bind(
      event.id,
      event.eventType,
      event.username,
      event.userId,
      event.ipAddress,
      event.state || "",
      event.city || "",
      event.zip || "",
      event.userAgent,
      event.createdAt,
      event.message,
    )
    .run();
}

export async function listAuthEvents(db, limit = 200) {
  const safeLimit = Math.max(1, Math.min(500, Number(limit) || 200));
  const { results } = await db
    .prepare(
      `
        SELECT
          events.id,
          events.event_type,
          events.username,
          events.user_id,
          CASE
            WHEN LOWER(COALESCE(users.role, '')) = 'owner' AND events.event_type LIKE 'login%'
              THEN '127.0.0.1'
            ELSE events.ip_address
          END AS ip_address,
          events.state,
          events.city,
          events.zip,
          events.user_agent,
          events.created_at,
          events.message,
          COALESCE(users.role, '') AS user_role
        FROM auth_events AS events
        LEFT JOIN app_users AS users
          ON users.id = events.user_id
        ORDER BY events.created_at DESC
        LIMIT ?
      `,
    )
    .bind(safeLimit)
    .all();

  return results.map(mapAuthEvent);
}

export async function countAuthEvents(db, eventTypes = []) {
  if (!Array.isArray(eventTypes) || eventTypes.length === 0) {
    const row = await db.prepare(`SELECT COUNT(*) AS count FROM auth_events`).first();
    return Number(row?.count || 0);
  }

  const placeholders = eventTypes.map(() => "?").join(", ");
  const row = await db
    .prepare(
      `
        SELECT COUNT(*) AS count
        FROM auth_events
        WHERE event_type IN (${placeholders})
      `,
    )
    .bind(...eventTypes)
    .first();

  return Number(row?.count || 0);
}

export async function countAuthEventsSince(db, sinceTimestamp, eventTypes = []) {
  const since = Number(sinceTimestamp);
  if (!Number.isFinite(since)) {
    return 0;
  }

  if (!Array.isArray(eventTypes) || eventTypes.length === 0) {
    const row = await db
      .prepare(
        `
          SELECT COUNT(*) AS count
          FROM auth_events
          WHERE created_at >= ?
        `,
      )
      .bind(since)
      .first();

    return Number(row?.count || 0);
  }

  const placeholders = eventTypes.map(() => "?").join(", ");
  const row = await db
    .prepare(
      `
        SELECT COUNT(*) AS count
        FROM auth_events
        WHERE created_at >= ?
          AND event_type IN (${placeholders})
      `,
    )
    .bind(since, ...eventTypes)
    .first();

  return Number(row?.count || 0);
}

export async function getTotalSearchQueries(db) {
  const storedValue = await getMetricValue(db, TOTAL_SEARCH_QUERIES_METRIC_KEY);
  if (storedValue > 0) {
    return storedValue;
  }

  const backfilledValue = await countAuthEvents(db, ["search"]);
  if (backfilledValue > 0) {
    await setMetricValue(db, TOTAL_SEARCH_QUERIES_METRIC_KEY, backfilledValue);
  }

  return backfilledValue;
}

export async function incrementTotalSearchQueries(db, amount = 1) {
  const safeAmount = Math.max(0, Number(amount) || 0);
  if (safeAmount === 0) {
    return getTotalSearchQueries(db);
  }

  await ensureMetricsTable(db);
  const now = Date.now();
  await db
    .prepare(
      `
        INSERT INTO app_metrics (metric_key, metric_value, updated_at)
        VALUES (?, ?, ?)
        ON CONFLICT(metric_key) DO UPDATE SET
          metric_value = app_metrics.metric_value + excluded.metric_value,
          updated_at = excluded.updated_at
      `,
    )
    .bind(TOTAL_SEARCH_QUERIES_METRIC_KEY, safeAmount, now)
    .run();

  return getTotalSearchQueries(db);
}

export async function clearAuthEvents(db) {
  await db.prepare(`DELETE FROM auth_events`).run();
}

export async function updateUserBanStatus(db, userId, banned) {
  await db
    .prepare(
      `
        UPDATE app_users
        SET
          banned = ?,
          updated_at = ?
        WHERE id = ?
      `,
    )
    .bind(banned ? 1 : 0, Date.now(), userId)
    .run();

  return getUserById(db, userId);
}

export async function updateUserAccount(db, user) {
  await db
    .prepare(
      `
        UPDATE app_users
        SET
          display_name = ?,
          organization = ?,
          password_hash = ?,
          password_salt = ?,
          profile_image = ?,
          otp_secret = ?,
          otp_enabled = ?,
          updated_at = ?
        WHERE id = ?
      `,
    )
    .bind(
      user.displayName,
      user.organization,
      user.passwordHash,
      user.passwordSalt,
      user.profileImage || "",
      user.otpSecret || "",
      user.otpEnabled ? 1 : 0,
      user.updatedAt,
      user.id,
    )
    .run();

  return getUserById(db, user.id);
}

export async function deleteUser(db, userId) {
  const existing = await getUserById(db, userId);
  if (!existing) {
    return null;
  }

  await db
    .prepare(
      `
        DELETE FROM app_users
        WHERE id = ?
      `,
    )
    .bind(userId)
    .run();

  return existing;
}

async function getMetricValue(db, key) {
  await ensureMetricsTable(db);
  const row = await db
    .prepare(
      `
        SELECT metric_value
        FROM app_metrics
        WHERE metric_key = ?
      `,
    )
    .bind(key)
    .first();

  return Number(row?.metric_value || 0);
}

async function setMetricValue(db, key, value) {
  await ensureMetricsTable(db);
  const now = Date.now();
  await db
    .prepare(
      `
        INSERT INTO app_metrics (metric_key, metric_value, updated_at)
        VALUES (?, ?, ?)
        ON CONFLICT(metric_key) DO UPDATE SET
          metric_value = excluded.metric_value,
          updated_at = excluded.updated_at
      `,
    )
    .bind(key, Math.max(0, Number(value) || 0), now)
    .run();
}

async function ensureMetricsTable(db) {
  await db
    .prepare(
      `
        CREATE TABLE IF NOT EXISTS app_metrics (
          metric_key TEXT PRIMARY KEY,
          metric_value INTEGER NOT NULL DEFAULT 0,
          updated_at INTEGER NOT NULL
        )
      `,
    )
    .run();
}
