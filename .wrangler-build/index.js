var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// ../shared/http.js
function jsonResponse(payload, status = 200, headers = {}) {
  return new Response(JSON.stringify(payload, null, 2), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...headers
    }
  });
}
function emptyResponse(status = 204) {
  return new Response(null, { status });
}
function handleOptions() {
  return emptyResponse();
}
async function readJsonBody(request) {
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
function respondWithError(error) {
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
var HttpError;
var init_http = __esm({
  "../shared/http.js"() {
    init_functionsRoutes_0_08291424374010936();
    HttpError = class extends Error {
      static {
        __name(this, "HttpError");
      }
      constructor(status, message, code = "") {
        super(message);
        this.name = "HttpError";
        this.status = status;
        this.code = String(code || "").trim();
      }
    };
    __name(jsonResponse, "jsonResponse");
    __name(emptyResponse, "emptyResponse");
    __name(handleOptions, "handleOptions");
    __name(readJsonBody, "readJsonBody");
    __name(respondWithError, "respondWithError");
  }
});

// ../users.js
var users_exports = {};
__export(users_exports, {
  clearAuthEvents: () => clearAuthEvents,
  countAuthEvents: () => countAuthEvents,
  countAuthEventsSince: () => countAuthEventsSince,
  createUser: () => createUser,
  createUserSession: () => createUserSession,
  deleteUser: () => deleteUser,
  deleteUserSessionByTokenHash: () => deleteUserSessionByTokenHash,
  deleteUserSessionsByUserId: () => deleteUserSessionsByUserId,
  getActiveSessionCount: () => getActiveSessionCount,
  getTotalSearchQueries: () => getTotalSearchQueries,
  getUserByEmail: () => getUserByEmail,
  getUserById: () => getUserById,
  getUserByUsername: () => getUserByUsername,
  getUserCount: () => getUserCount,
  getUserSessionByTokenHash: () => getUserSessionByTokenHash,
  incrementTotalSearchQueries: () => incrementTotalSearchQueries,
  listAuthEvents: () => listAuthEvents,
  listUsers: () => listUsers,
  recordAuthEvent: () => recordAuthEvent,
  touchUserSession: () => touchUserSession,
  updateUserAccount: () => updateUserAccount,
  updateUserBanStatus: () => updateUserBanStatus
});
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
    otpEnabled: Number(row.otp_enabled) === 1
  };
}
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
    message: row.message || ""
  };
}
async function createUser(db, user) {
  await db.prepare(
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
      `
  ).bind(
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
    user.otpEnabled ? 1 : 0
  ).run();
  return getUserById(db, user.id);
}
async function getUserById(db, id) {
  const row = await db.prepare(
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
      `
  ).bind(id).first();
  return mapUser(row);
}
async function getUserByEmail(db, email) {
  const row = await db.prepare(
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
      `
  ).bind(email).first();
  return mapUser(row);
}
async function getUserByUsername(db, username) {
  const row = await db.prepare(
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
      `
  ).bind(username).first();
  return mapUser(row);
}
async function getUserCount(db) {
  const row = await db.prepare(`SELECT COUNT(*) AS count FROM app_users`).first();
  return Number(row?.count || 0);
}
async function listUsers(db) {
  const { results } = await db.prepare(
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
      `
  ).all();
  return results.map(mapUser);
}
async function createUserSession(db, session) {
  await db.prepare(
    `
        INSERT INTO app_sessions (
          token_hash,
          user_id,
          expires_at,
          created_at,
          last_seen_at
        )
        VALUES (?, ?, ?, ?, ?)
      `
  ).bind(
    session.tokenHash,
    session.userId,
    session.expiresAt,
    session.createdAt,
    session.lastSeenAt
  ).run();
}
async function deleteUserSessionByTokenHash(db, tokenHash) {
  await db.prepare(
    `
        DELETE FROM app_sessions
        WHERE token_hash = ?
      `
  ).bind(tokenHash).run();
}
async function getUserSessionByTokenHash(db, tokenHash) {
  return db.prepare(
    `
        SELECT
          token_hash,
          user_id,
          expires_at,
          created_at,
          last_seen_at
        FROM app_sessions
        WHERE token_hash = ?
      `
  ).bind(tokenHash).first();
}
async function touchUserSession(db, tokenHash, lastSeenAt) {
  await db.prepare(
    `
        UPDATE app_sessions
        SET last_seen_at = ?
        WHERE token_hash = ?
      `
  ).bind(lastSeenAt, tokenHash).run();
}
async function getActiveSessionCount(db, now = Date.now()) {
  const row = await db.prepare(
    `
        SELECT COUNT(*) AS count
        FROM app_sessions
        WHERE expires_at > ?
      `
  ).bind(now).first();
  return Number(row?.count || 0);
}
async function deleteUserSessionsByUserId(db, userId, { exceptTokenHash = "" } = {}) {
  const normalizedExceptTokenHash = String(exceptTokenHash || "").trim();
  if (normalizedExceptTokenHash) {
    await db.prepare(
      `
          DELETE FROM app_sessions
          WHERE user_id = ?
            AND token_hash != ?
        `
    ).bind(userId, normalizedExceptTokenHash).run();
    return;
  }
  await db.prepare(
    `
        DELETE FROM app_sessions
        WHERE user_id = ?
      `
  ).bind(userId).run();
}
async function recordAuthEvent(db, event) {
  await db.prepare(
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
      `
  ).bind(
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
    event.message
  ).run();
}
async function listAuthEvents(db, limit = 200) {
  const safeLimit = Math.max(1, Math.min(500, Number(limit) || 200));
  const { results } = await db.prepare(
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
      `
  ).bind(safeLimit).all();
  return results.map(mapAuthEvent);
}
async function countAuthEvents(db, eventTypes = []) {
  if (!Array.isArray(eventTypes) || eventTypes.length === 0) {
    const row2 = await db.prepare(`SELECT COUNT(*) AS count FROM auth_events`).first();
    return Number(row2?.count || 0);
  }
  const placeholders = eventTypes.map(() => "?").join(", ");
  const row = await db.prepare(
    `
        SELECT COUNT(*) AS count
        FROM auth_events
        WHERE event_type IN (${placeholders})
      `
  ).bind(...eventTypes).first();
  return Number(row?.count || 0);
}
async function countAuthEventsSince(db, sinceTimestamp, eventTypes = []) {
  const since = Number(sinceTimestamp);
  if (!Number.isFinite(since)) {
    return 0;
  }
  if (!Array.isArray(eventTypes) || eventTypes.length === 0) {
    const row2 = await db.prepare(
      `
          SELECT COUNT(*) AS count
          FROM auth_events
          WHERE created_at >= ?
        `
    ).bind(since).first();
    return Number(row2?.count || 0);
  }
  const placeholders = eventTypes.map(() => "?").join(", ");
  const row = await db.prepare(
    `
        SELECT COUNT(*) AS count
        FROM auth_events
        WHERE created_at >= ?
          AND event_type IN (${placeholders})
      `
  ).bind(since, ...eventTypes).first();
  return Number(row?.count || 0);
}
async function getTotalSearchQueries(db) {
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
async function incrementTotalSearchQueries(db, amount = 1) {
  const safeAmount = Math.max(0, Number(amount) || 0);
  if (safeAmount === 0) {
    return getTotalSearchQueries(db);
  }
  await ensureMetricsTable(db);
  const now = Date.now();
  await db.prepare(
    `
        INSERT INTO app_metrics (metric_key, metric_value, updated_at)
        VALUES (?, ?, ?)
        ON CONFLICT(metric_key) DO UPDATE SET
          metric_value = app_metrics.metric_value + excluded.metric_value,
          updated_at = excluded.updated_at
      `
  ).bind(TOTAL_SEARCH_QUERIES_METRIC_KEY, safeAmount, now).run();
  return getTotalSearchQueries(db);
}
async function clearAuthEvents(db) {
  await db.prepare(`DELETE FROM auth_events`).run();
}
async function updateUserBanStatus(db, userId, banned) {
  await db.prepare(
    `
        UPDATE app_users
        SET
          banned = ?,
          updated_at = ?
        WHERE id = ?
      `
  ).bind(banned ? 1 : 0, Date.now(), userId).run();
  return getUserById(db, userId);
}
async function updateUserAccount(db, user) {
  await db.prepare(
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
      `
  ).bind(
    user.displayName,
    user.organization,
    user.passwordHash,
    user.passwordSalt,
    user.profileImage || "",
    user.otpSecret || "",
    user.otpEnabled ? 1 : 0,
    user.updatedAt,
    user.id
  ).run();
  return getUserById(db, user.id);
}
async function deleteUser(db, userId) {
  const existing = await getUserById(db, userId);
  if (!existing) {
    return null;
  }
  await db.prepare(
    `
        DELETE FROM app_users
        WHERE id = ?
      `
  ).bind(userId).run();
  return existing;
}
async function getMetricValue(db, key) {
  await ensureMetricsTable(db);
  const row = await db.prepare(
    `
        SELECT metric_value
        FROM app_metrics
        WHERE metric_key = ?
      `
  ).bind(key).first();
  return Number(row?.metric_value || 0);
}
async function setMetricValue(db, key, value) {
  await ensureMetricsTable(db);
  const now = Date.now();
  await db.prepare(
    `
        INSERT INTO app_metrics (metric_key, metric_value, updated_at)
        VALUES (?, ?, ?)
        ON CONFLICT(metric_key) DO UPDATE SET
          metric_value = excluded.metric_value,
          updated_at = excluded.updated_at
      `
  ).bind(key, Math.max(0, Number(value) || 0), now).run();
}
async function ensureMetricsTable(db) {
  await db.prepare(
    `
        CREATE TABLE IF NOT EXISTS app_metrics (
          metric_key TEXT PRIMARY KEY,
          metric_value INTEGER NOT NULL DEFAULT 0,
          updated_at INTEGER NOT NULL
        )
      `
  ).run();
}
var TOTAL_SEARCH_QUERIES_METRIC_KEY;
var init_users = __esm({
  "../users.js"() {
    init_functionsRoutes_0_08291424374010936();
    __name(mapUser, "mapUser");
    TOTAL_SEARCH_QUERIES_METRIC_KEY = "total_search_queries";
    __name(mapAuthEvent, "mapAuthEvent");
    __name(createUser, "createUser");
    __name(getUserById, "getUserById");
    __name(getUserByEmail, "getUserByEmail");
    __name(getUserByUsername, "getUserByUsername");
    __name(getUserCount, "getUserCount");
    __name(listUsers, "listUsers");
    __name(createUserSession, "createUserSession");
    __name(deleteUserSessionByTokenHash, "deleteUserSessionByTokenHash");
    __name(getUserSessionByTokenHash, "getUserSessionByTokenHash");
    __name(touchUserSession, "touchUserSession");
    __name(getActiveSessionCount, "getActiveSessionCount");
    __name(deleteUserSessionsByUserId, "deleteUserSessionsByUserId");
    __name(recordAuthEvent, "recordAuthEvent");
    __name(listAuthEvents, "listAuthEvents");
    __name(countAuthEvents, "countAuthEvents");
    __name(countAuthEventsSince, "countAuthEventsSince");
    __name(getTotalSearchQueries, "getTotalSearchQueries");
    __name(incrementTotalSearchQueries, "incrementTotalSearchQueries");
    __name(clearAuthEvents, "clearAuthEvents");
    __name(updateUserBanStatus, "updateUserBanStatus");
    __name(updateUserAccount, "updateUserAccount");
    __name(deleteUser, "deleteUser");
    __name(getMetricValue, "getMetricValue");
    __name(setMetricValue, "setMetricValue");
    __name(ensureMetricsTable, "ensureMetricsTable");
  }
});

// ../auth.js
async function createPasswordRecord(password) {
  const salt = generateRandomHex(16);
  const passwordHash = await hashPassword(password, salt);
  return { salt, passwordHash };
}
async function verifyPassword(password, salt, expectedHash) {
  const actualHash = await hashPassword(password, salt);
  return constantTimeEqual(actualHash, expectedHash);
}
function createSessionToken() {
  return toBase64Url(crypto.getRandomValues(new Uint8Array(32)));
}
async function hashSessionToken(token) {
  const digest = await crypto.subtle.digest(PASSWORD_HASH_ALGORITHM, textEncoder.encode(token));
  return toHex(new Uint8Array(digest));
}
function getSessionExpiryDate() {
  return new Date(Date.now() + SESSION_TTL_MS);
}
function createSessionCookie(token, expiresAt) {
  const expiresValue = expiresAt instanceof Date ? expiresAt.toUTCString() : new Date(expiresAt).toUTCString();
  return [
    `${SESSION_COOKIE_NAME}=${token}`,
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
    `Expires=${expiresValue}`
  ].join("; ");
}
function clearSessionCookie() {
  return [
    `${SESSION_COOKIE_NAME}=`,
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
    "Expires=Thu, 01 Jan 1970 00:00:00 GMT"
  ].join("; ");
}
function readCookie(request, name) {
  const rawCookie = request.headers.get("cookie") || "";
  const match2 = rawCookie.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${name}=`));
  return match2 ? match2.slice(name.length + 1) : "";
}
async function getCurrentSessionTokenHash(request) {
  const token = readCookie(request, SESSION_COOKIE_NAME);
  if (!token) {
    return "";
  }
  return hashSessionToken(token);
}
function sanitizeUser(user) {
  if (!user) {
    throw new HttpError(500, "User record is missing.");
  }
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    displayName: user.displayName || user.username,
    organization: user.organization,
    role: user.role || "normal user",
    banned: Boolean(user.banned),
    profileImage: user.profileImage || "",
    otpEnabled: Boolean(user.otpEnabled),
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}
async function getAuthenticatedUser(request, db) {
  const token = readCookie(request, SESSION_COOKIE_NAME);
  if (!token) {
    return null;
  }
  const { getUserById: getUserById2, getUserSessionByTokenHash: getUserSessionByTokenHash2, touchUserSession: touchUserSession2 } = await Promise.resolve().then(() => (init_users(), users_exports));
  const tokenHash = await hashSessionToken(token);
  const session = await getUserSessionByTokenHash2(db, tokenHash);
  if (!session) {
    return null;
  }
  if (new Date(session.expires_at).getTime() <= Date.now()) {
    return null;
  }
  const user = await getUserById2(db, session.user_id);
  if (!user) {
    return null;
  }
  await touchUserSession2(db, session.token_hash, Date.now());
  return sanitizeUser(user);
}
async function getAuthenticatedActiveUser(request, db) {
  const user = await getAuthenticatedUser(request, db);
  if (!user || user.banned) {
    return null;
  }
  return user;
}
async function requireAuthenticatedUser(request, db) {
  const user = await getAuthenticatedActiveUser(request, db);
  if (!user) {
    const rawUser = await getAuthenticatedUser(request, db);
    if (rawUser?.banned) {
      throw new HttpError(403, "This account is banned.");
    }
    throw new HttpError(401, "Authentication required.");
  }
  if (user.banned) {
    throw new HttpError(403, "This account is banned.");
  }
  return user;
}
function isOwnerRole(role) {
  return String(role || "").trim().toLowerCase() === "owner";
}
function isPrivilegedRole(role) {
  const normalizedRole = String(role || "").trim().toLowerCase();
  return normalizedRole === "owner" || normalizedRole === "admin";
}
async function requirePrivilegedUserOr404(request, db) {
  const user = await getAuthenticatedUser(request, db);
  if (!user || user.banned || !isPrivilegedRole(user.role)) {
    return null;
  }
  return user;
}
async function requirePrivilegedUser(request, db) {
  const user = await requirePrivilegedUserOr404(request, db);
  if (!user) {
    throw new HttpError(404, "Not found.");
  }
  return user;
}
async function requireOwnerUserOr404(request, db) {
  const user = await getAuthenticatedUser(request, db);
  if (!user || user.banned || !isOwnerRole(user.role)) {
    return null;
  }
  return user;
}
async function requireOwnerUser(request, db) {
  const user = await requireOwnerUserOr404(request, db);
  if (!user) {
    throw new HttpError(404, "Not found.");
  }
  return user;
}
async function hashPassword(password, salt) {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    textEncoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: textEncoder.encode(salt),
      iterations: PASSWORD_ITERATIONS,
      hash: PASSWORD_HASH_ALGORITHM
    },
    keyMaterial,
    256
  );
  return toHex(new Uint8Array(derivedBits));
}
function constantTimeEqual(left, right) {
  const leftValue = String(left || "");
  const rightValue = String(right || "");
  const maxLength = Math.max(leftValue.length, rightValue.length);
  let mismatch = leftValue.length === rightValue.length ? 0 : 1;
  for (let index = 0; index < maxLength; index += 1) {
    const leftCode = leftValue.charCodeAt(index) || 0;
    const rightCode = rightValue.charCodeAt(index) || 0;
    mismatch |= leftCode ^ rightCode;
  }
  return mismatch === 0;
}
function generateRandomHex(byteLength) {
  return toHex(crypto.getRandomValues(new Uint8Array(byteLength)));
}
function toHex(bytes) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}
function toBase64Url(bytes) {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
var textEncoder, PASSWORD_ITERATIONS, PASSWORD_HASH_ALGORITHM, SESSION_COOKIE_NAME, SESSION_TTL_MS;
var init_auth = __esm({
  "../auth.js"() {
    init_functionsRoutes_0_08291424374010936();
    init_http();
    textEncoder = new TextEncoder();
    PASSWORD_ITERATIONS = 1e5;
    PASSWORD_HASH_ALGORITHM = "SHA-256";
    SESSION_COOKIE_NAME = "civic_session";
    SESSION_TTL_MS = 1e3 * 60 * 60 * 24 * 30;
    __name(createPasswordRecord, "createPasswordRecord");
    __name(verifyPassword, "verifyPassword");
    __name(createSessionToken, "createSessionToken");
    __name(hashSessionToken, "hashSessionToken");
    __name(getSessionExpiryDate, "getSessionExpiryDate");
    __name(createSessionCookie, "createSessionCookie");
    __name(clearSessionCookie, "clearSessionCookie");
    __name(readCookie, "readCookie");
    __name(getCurrentSessionTokenHash, "getCurrentSessionTokenHash");
    __name(sanitizeUser, "sanitizeUser");
    __name(getAuthenticatedUser, "getAuthenticatedUser");
    __name(getAuthenticatedActiveUser, "getAuthenticatedActiveUser");
    __name(requireAuthenticatedUser, "requireAuthenticatedUser");
    __name(isOwnerRole, "isOwnerRole");
    __name(isPrivilegedRole, "isPrivilegedRole");
    __name(requirePrivilegedUserOr404, "requirePrivilegedUserOr404");
    __name(requirePrivilegedUser, "requirePrivilegedUser");
    __name(requireOwnerUserOr404, "requireOwnerUserOr404");
    __name(requireOwnerUser, "requireOwnerUser");
    __name(hashPassword, "hashPassword");
    __name(constantTimeEqual, "constantTimeEqual");
    __name(generateRandomHex, "generateRandomHex");
    __name(toHex, "toHex");
    __name(toBase64Url, "toBase64Url");
  }
});

// api/admin/logs.js
async function onRequest(context) {
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
var init_logs = __esm({
  "api/admin/logs.js"() {
    init_functionsRoutes_0_08291424374010936();
    init_auth();
    init_users();
    init_http();
    __name(onRequest, "onRequest");
  }
});

// api/admin/overview.js
async function onRequest2(context) {
  const { request, env } = context;
  if (request.method === "OPTIONS") {
    return handleOptions();
  }
  try {
    await requirePrivilegedUser(request, env.DB);
    if (request.method !== "GET") {
      throw new HttpError(405, "Method not allowed.");
    }
    const [users, events, activeSessions, recentEvents] = await Promise.all([
      listUsers(env.DB),
      listAuthEvents(env.DB, 200),
      getActiveSessionCount(env.DB),
      countAuthEvents(env.DB)
    ]);
    return jsonResponse({
      users: users.map((user) => ({
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        organization: user.organization,
        role: user.role,
        banned: user.banned,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      })),
      events,
      stats: {
        activeSessions,
        registeredUsers: users.length,
        recentEvents
      }
    });
  } catch (error) {
    return respondWithError(error);
  }
}
var init_overview = __esm({
  "api/admin/overview.js"() {
    init_functionsRoutes_0_08291424374010936();
    init_auth();
    init_users();
    init_http();
    __name(onRequest2, "onRequest");
  }
});

// ../shared/request-metadata.js
function getRequestMetadata(request, options = {}) {
  const userAgent = request.headers.get("user-agent") || "";
  const forwardedIp = request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for") || "";
  const ipAddress = normalizeIpAddress(forwardedIp);
  const eventType = String(options.eventType || "").trim().toLowerCase();
  const user = options.user || null;
  const cf = request.cf || {};
  return {
    userAgent,
    ipAddress: shouldMaskOwnerLoginIp(eventType, user) ? "127.0.0.1" : ipAddress,
    state: normalizeLocationValue(cf.region || cf.regionCode || ""),
    city: normalizeLocationValue(cf.city || ""),
    zip: normalizeLocationValue(cf.postalCode || "")
  };
}
function normalizeIpAddress(value) {
  const normalized = String(value || "").split(",")[0].trim();
  return normalized || "";
}
function normalizeLocationValue(value) {
  return String(value || "").trim();
}
function shouldMaskOwnerLoginIp(eventType, user) {
  return eventType.startsWith("login") && Boolean(user) && isOwnerRole(user.role);
}
var init_request_metadata = __esm({
  "../shared/request-metadata.js"() {
    init_functionsRoutes_0_08291424374010936();
    init_auth();
    __name(getRequestMetadata, "getRequestMetadata");
    __name(normalizeIpAddress, "normalizeIpAddress");
    __name(normalizeLocationValue, "normalizeLocationValue");
    __name(shouldMaskOwnerLoginIp, "shouldMaskOwnerLoginIp");
  }
});

// ../shared/validators.js
function requireId(value, fieldName) {
  const normalized = normalizeString(value);
  if (!normalized) {
    throw new HttpError(400, `${fieldName} is required.`);
  }
  return normalized;
}
function validateBoardPayload(payload) {
  const name = normalizeString(payload?.name);
  const description = normalizeString(payload?.description);
  const iconEmoji = normalizeEmoji(payload?.iconEmoji);
  const accentColor = normalizeAccentColor(payload?.accentColor);
  const status = normalizeBoardStatus(payload?.status);
  if (!name) {
    throw new HttpError(400, "Board name is required.");
  }
  return {
    name: name.slice(0, 120),
    description: description.slice(0, 500),
    iconEmoji,
    accentColor,
    status
  };
}
function validateNodePayload(payload, { partial = false } = {}) {
  const result = {};
  if (!partial || payload?.type !== void 0) {
    const type = normalizeString(payload?.type).toLowerCase();
    if (!NODE_TYPES.has(type)) {
      throw new HttpError(400, "Node type is invalid.");
    }
    result.type = type;
  }
  if (!partial || payload?.label !== void 0) {
    const label = normalizeString(payload?.label);
    if (!label) {
      throw new HttpError(400, "Node label is required.");
    }
    result.label = label.slice(0, 160);
  }
  if (!partial || payload?.x !== void 0) {
    result.x = normalizeCoordinate(payload?.x, "Node x");
  }
  if (!partial || payload?.y !== void 0) {
    result.y = normalizeCoordinate(payload?.y, "Node y");
  }
  if (!partial || payload?.metadata !== void 0) {
    result.metadata = normalizeMetadata(payload?.metadata);
  }
  return result;
}
function validateEdgePayload(payload) {
  const sourceNodeId = requireId(payload?.sourceNodeId, "sourceNodeId");
  const targetNodeId = requireId(payload?.targetNodeId, "targetNodeId");
  const label = normalizeString(payload?.label).slice(0, 80);
  const metadata = normalizeMetadata(payload?.metadata);
  if (sourceNodeId === targetNodeId) {
    throw new HttpError(400, "A node cannot link to itself.");
  }
  return {
    sourceNodeId,
    targetNodeId,
    label,
    metadata
  };
}
function validateRegisterPayload(payload) {
  const username = normalizeUsername(payload?.username);
  const password = normalizePassword(payload?.password);
  return {
    username,
    email: buildInternalEmail(username),
    displayName: username,
    password,
    organization: ""
  };
}
function validateLoginPayload(payload) {
  const username = normalizeUsername(payload?.username);
  const password = normalizePassword(payload?.password);
  const otpCode = normalizeOtpCode(payload?.otpCode);
  const recaptchaToken = normalizeCaptchaToken(payload);
  return {
    username,
    password,
    otpCode,
    recaptchaToken
  };
}
function normalizeCaptchaToken(payload) {
  return normalizeString(payload?.recaptchaToken || payload?.["g-recaptcha-response"]);
}
function normalizeString(value) {
  return typeof value === "string" ? value.trim() : "";
}
function normalizeEmoji(value) {
  const normalized = normalizeString(value);
  if (!normalized) {
    return "\u{1F4C1}";
  }
  return Array.from(normalized).slice(0, 4).join("");
}
function normalizeAccentColor(value) {
  const normalized = normalizeString(value);
  const fallback = "#63b6ff";
  if (!normalized) {
    return fallback;
  }
  if (!/^#[0-9a-fA-F]{6}$/.test(normalized)) {
    throw new HttpError(400, "Board accent color must be a 6-digit hex value.");
  }
  return normalized.toLowerCase();
}
function normalizeBoardStatus(value) {
  const normalized = normalizeString(value).toLowerCase() || "active";
  if (!BOARD_STATUSES.has(normalized)) {
    throw new HttpError(400, "Board status is invalid.");
  }
  return normalized;
}
function normalizeCoordinate(value, fieldName) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    throw new HttpError(400, `${fieldName} must be a valid number.`);
  }
  return Math.round(numeric);
}
function normalizeMetadata(metadata) {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return {};
  }
  const result = {};
  for (const [key, value] of Object.entries(metadata)) {
    if (typeof value === "string") {
      const maxLength = key === "profileImage" ? 25e4 : 1e3;
      result[key] = value.trim().slice(0, maxLength);
    }
  }
  return result;
}
function normalizePassword(value) {
  const normalized = typeof value === "string" ? value : "";
  if (normalized.length < 8) {
    throw new HttpError(400, "Password must be at least 8 characters.");
  }
  return normalized.slice(0, 200);
}
function normalizeUsername(value) {
  const normalized = normalizeString(value).toLowerCase();
  const safe = normalized.replace(/[^a-z0-9._-]/g, "").slice(0, 40);
  if (!safe) {
    throw new HttpError(400, "Username is invalid.");
  }
  return safe;
}
function normalizeOtpCode(value) {
  return String(value || "").replace(/\s+/g, "").trim().slice(0, 12);
}
function buildInternalEmail(username) {
  return `${username}@users.civic.local`;
}
var NODE_TYPES, BOARD_STATUSES;
var init_validators = __esm({
  "../shared/validators.js"() {
    init_functionsRoutes_0_08291424374010936();
    init_http();
    NODE_TYPES = /* @__PURE__ */ new Set([
      "email",
      "username",
      "phone",
      "ip",
      "domain",
      "person",
      "device",
      "account",
      "hash",
      "note",
      "location"
    ]);
    BOARD_STATUSES = /* @__PURE__ */ new Set(["active", "closed"]);
    __name(requireId, "requireId");
    __name(validateBoardPayload, "validateBoardPayload");
    __name(validateNodePayload, "validateNodePayload");
    __name(validateEdgePayload, "validateEdgePayload");
    __name(validateRegisterPayload, "validateRegisterPayload");
    __name(validateLoginPayload, "validateLoginPayload");
    __name(normalizeCaptchaToken, "normalizeCaptchaToken");
    __name(normalizeString, "normalizeString");
    __name(normalizeEmoji, "normalizeEmoji");
    __name(normalizeAccentColor, "normalizeAccentColor");
    __name(normalizeBoardStatus, "normalizeBoardStatus");
    __name(normalizeCoordinate, "normalizeCoordinate");
    __name(normalizeMetadata, "normalizeMetadata");
    __name(normalizePassword, "normalizePassword");
    __name(normalizeUsername, "normalizeUsername");
    __name(normalizeOtpCode, "normalizeOtpCode");
    __name(buildInternalEmail, "buildInternalEmail");
  }
});

// api/admin/users.js
async function onRequest3(context) {
  const { request, env } = context;
  if (request.method === "OPTIONS") {
    return handleOptions();
  }
  try {
    const owner = await requireOwnerUser(request, env.DB);
    const url = new URL(request.url);
    const userId = String(url.searchParams.get("id") || "").trim();
    if (request.method === "POST") {
      const payload = await readJsonBody(request);
      const username = String(payload?.username || "").trim().toLowerCase();
      const password = normalizePassword(payload?.password);
      if (username.length < 3) {
        throw new HttpError(400, "Username must be at least 3 characters.");
      }
      const existingUser = await getUserByUsername(env.DB, username);
      if (existingUser) {
        throw new HttpError(409, "That username is already in use.");
      }
      const now = Date.now();
      const passwordRecord = await createPasswordRecord(password);
      const user = await createUser(env.DB, {
        id: crypto.randomUUID(),
        username,
        email: `${username}@users.civic.local`,
        displayName: username,
        organization: "",
        passwordHash: passwordRecord.passwordHash,
        passwordSalt: passwordRecord.salt,
        banned: false,
        role: "normal user",
        profileImage: "",
        createdAt: now,
        updatedAt: now
      });
      await recordAuthEvent(env.DB, {
        id: crypto.randomUUID(),
        eventType: "admin_user_created",
        username: owner.username,
        userId: owner.id,
        ...getRequestMetadata(request, { eventType: "admin_user_created", user: owner }),
        createdAt: now,
        message: `Created user ${user.username}.`
      });
      return jsonResponse({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          displayName: user.displayName,
          organization: user.organization,
          role: user.role,
          banned: user.banned,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      }, 201);
    }
    if (request.method === "PATCH") {
      if (!userId) {
        throw new HttpError(400, "User id is required.");
      }
      const existingUser = await getUserById(env.DB, userId);
      if (!existingUser) {
        throw new HttpError(404, "User not found.");
      }
      if (isPrivilegedRole(existingUser.role)) {
        throw new HttpError(403, "Privileged accounts cannot be moderated here.");
      }
      const updatedUser = await updateUserBanStatus(env.DB, userId, !existingUser.banned);
      await recordAuthEvent(env.DB, {
        id: crypto.randomUUID(),
        eventType: updatedUser.banned ? "admin_user_banned" : "admin_user_restored",
        username: owner.username,
        userId: owner.id,
        ...getRequestMetadata(request, { eventType: updatedUser.banned ? "admin_user_banned" : "admin_user_restored", user: owner }),
        createdAt: Date.now(),
        message: `${updatedUser.banned ? "Banned" : "Restored"} user ${updatedUser.username}.`
      });
      return jsonResponse({
        user: {
          id: updatedUser.id,
          username: updatedUser.username,
          email: updatedUser.email,
          displayName: updatedUser.displayName,
          organization: updatedUser.organization,
          role: updatedUser.role,
          banned: updatedUser.banned,
          createdAt: updatedUser.createdAt,
          updatedAt: updatedUser.updatedAt
        }
      });
    }
    if (request.method === "DELETE") {
      if (!userId) {
        throw new HttpError(400, "User id is required.");
      }
      const existingUser = await getUserById(env.DB, userId);
      if (!existingUser) {
        throw new HttpError(404, "User not found.");
      }
      if (isPrivilegedRole(existingUser.role)) {
        throw new HttpError(403, "Privileged accounts cannot be removed here.");
      }
      const deletedUser = await deleteUser(env.DB, userId);
      await recordAuthEvent(env.DB, {
        id: crypto.randomUUID(),
        eventType: "admin_user_removed",
        username: owner.username,
        userId: owner.id,
        ...getRequestMetadata(request, { eventType: "admin_user_removed", user: owner }),
        createdAt: Date.now(),
        message: `Removed user ${deletedUser.username}.`
      });
      return jsonResponse({ success: true, userId: deletedUser.id });
    }
    throw new HttpError(405, "Method not allowed.");
  } catch (error) {
    return respondWithError(error);
  }
}
var init_users2 = __esm({
  "api/admin/users.js"() {
    init_functionsRoutes_0_08291424374010936();
    init_users();
    init_auth();
    init_http();
    init_auth();
    init_request_metadata();
    init_validators();
    __name(onRequest3, "onRequest");
  }
});

// ../shared/otp.js
function generateOtpSecret(length = 20) {
  return encodeBase32(crypto.getRandomValues(new Uint8Array(length)));
}
function normalizeOtpCode2(value) {
  return String(value || "").replace(/\s+/g, "").trim();
}
async function verifyTotpCode(secret, code, options = {}) {
  const normalizedSecret = String(secret || "").trim();
  const normalizedCode = normalizeOtpCode2(code);
  if (!normalizedSecret || !/^\d{6}$/.test(normalizedCode)) {
    return false;
  }
  const timestamp = Number(options.timestamp || Date.now());
  const window = Number.isFinite(options.window) ? Number(options.window) : 1;
  for (let offset = -window; offset <= window; offset += 1) {
    const expectedCode = await generateTotpCode(normalizedSecret, timestamp + offset * OTP_PERIOD_SECONDS * 1e3);
    if (expectedCode === normalizedCode) {
      return true;
    }
  }
  return false;
}
function buildOtpAuthUrl({ secret, username, issuer = "Civic Intelligence" }) {
  const label = `${issuer}:${username}`;
  const params = new URLSearchParams({
    secret,
    issuer,
    algorithm: "SHA1",
    digits: String(OTP_DIGITS),
    period: String(OTP_PERIOD_SECONDS)
  });
  return `otpauth://totp/${encodeURIComponent(label)}?${params.toString()}`;
}
async function generateTotpCode(secret, timestamp) {
  const counter = Math.floor(timestamp / 1e3 / OTP_PERIOD_SECONDS);
  const keyBytes = decodeBase32(secret);
  const key = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"]
  );
  const counterBuffer = new ArrayBuffer(8);
  const counterView = new DataView(counterBuffer);
  const high = Math.floor(counter / 4294967296);
  const low = counter >>> 0;
  counterView.setUint32(0, high);
  counterView.setUint32(4, low);
  const signature = new Uint8Array(await crypto.subtle.sign("HMAC", key, counterBuffer));
  const offset = signature[signature.length - 1] & 15;
  const binaryCode = (signature[offset] & 127) << 24 | (signature[offset + 1] & 255) << 16 | (signature[offset + 2] & 255) << 8 | signature[offset + 3] & 255;
  return String(binaryCode % 10 ** OTP_DIGITS).padStart(OTP_DIGITS, "0");
}
function encodeBase32(bytes) {
  let bits = 0;
  let value = 0;
  let output = "";
  for (const byte of bytes) {
    value = value << 8 | byte;
    bits += 8;
    while (bits >= 5) {
      output += BASE32_ALPHABET[value >>> bits - 5 & 31];
      bits -= 5;
    }
  }
  if (bits > 0) {
    output += BASE32_ALPHABET[value << 5 - bits & 31];
  }
  return output;
}
function decodeBase32(value) {
  const normalized = String(value || "").toUpperCase().replace(/=+$/g, "").replace(/[^A-Z2-7]/g, "");
  let bits = 0;
  let buffer = 0;
  const bytes = [];
  for (const character of normalized) {
    const index = BASE32_ALPHABET.indexOf(character);
    if (index < 0) {
      continue;
    }
    buffer = buffer << 5 | index;
    bits += 5;
    if (bits >= 8) {
      bytes.push(buffer >>> bits - 8 & 255);
      bits -= 8;
    }
  }
  return new Uint8Array(bytes);
}
var OTP_DIGITS, OTP_PERIOD_SECONDS, BASE32_ALPHABET;
var init_otp = __esm({
  "../shared/otp.js"() {
    init_functionsRoutes_0_08291424374010936();
    OTP_DIGITS = 6;
    OTP_PERIOD_SECONDS = 30;
    BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    __name(generateOtpSecret, "generateOtpSecret");
    __name(normalizeOtpCode2, "normalizeOtpCode");
    __name(verifyTotpCode, "verifyTotpCode");
    __name(buildOtpAuthUrl, "buildOtpAuthUrl");
    __name(generateTotpCode, "generateTotpCode");
    __name(encodeBase32, "encodeBase32");
    __name(decodeBase32, "decodeBase32");
  }
});

// api/account.js
async function onRequest4(context) {
  const { request, env } = context;
  if (request.method === "OPTIONS") {
    return handleOptions();
  }
  try {
    const sessionUser = await requireAuthenticatedUser(request, env.DB);
    const currentSessionTokenHash = await getCurrentSessionTokenHash(request);
    if (request.method !== "PATCH") {
      throw new HttpError(405, "Method not allowed.");
    }
    const payload = await readJsonBody(request);
    const action = String(payload?.action || "").trim().toLowerCase();
    const storedUser = await getUserById(env.DB, sessionUser.id);
    if (!storedUser) {
      throw new HttpError(404, "User not found.");
    }
    if (action === "profile_image") {
      const profileImage = normalizeProfileImage(payload?.profileImage);
      const updatedUser = await updateUserAccount(env.DB, {
        ...storedUser,
        profileImage,
        updatedAt: Date.now()
      });
      await recordAuthEvent(env.DB, {
        id: crypto.randomUUID(),
        eventType: "account_profile_updated",
        username: updatedUser.username,
        userId: updatedUser.id,
        ...getRequestMetadata(request, { eventType: "account_profile_updated", user: updatedUser }),
        createdAt: Date.now(),
        message: profileImage ? "Updated account profile image." : "Removed account profile image."
      });
      return jsonResponse({
        success: true,
        user: {
          profileImage: updatedUser.profileImage,
          otpEnabled: updatedUser.otpEnabled
        }
      });
    }
    if (action === "password") {
      const currentPassword = String(payload?.currentPassword || "");
      const newPassword = String(payload?.newPassword || "");
      const confirmPassword = String(payload?.confirmPassword || "");
      const otpCode = String(payload?.otpCode || "");
      if (!await verifyPassword(currentPassword, storedUser.passwordSalt, storedUser.passwordHash)) {
        throw new HttpError(401, "Current password is incorrect.");
      }
      if (newPassword.length < 8) {
        throw new HttpError(400, "New password must be at least 8 characters.");
      }
      if (newPassword !== confirmPassword) {
        throw new HttpError(400, "New password confirmation does not match.");
      }
      if (storedUser.otpEnabled) {
        const isValidOtp = await verifyTotpCode(storedUser.otpSecret, otpCode);
        if (!isValidOtp) {
          throw new HttpError(400, "Enter a valid one-time passcode.");
        }
      }
      const passwordRecord = await createPasswordRecord(newPassword);
      const updatedUser = await updateUserAccount(env.DB, {
        ...storedUser,
        passwordHash: passwordRecord.passwordHash,
        passwordSalt: passwordRecord.salt,
        updatedAt: Date.now()
      });
      await deleteUserSessionsByUserId(env.DB, updatedUser.id, {
        exceptTokenHash: currentSessionTokenHash
      });
      await recordAuthEvent(env.DB, {
        id: crypto.randomUUID(),
        eventType: "account_password_updated",
        username: updatedUser.username,
        userId: updatedUser.id,
        ...getRequestMetadata(request, { eventType: "account_password_updated", user: updatedUser }),
        createdAt: Date.now(),
        message: "Updated account password."
      });
      return jsonResponse({
        success: true,
        user: {
          profileImage: updatedUser.profileImage,
          otpEnabled: updatedUser.otpEnabled
        }
      });
    }
    if (action === "otp_setup") {
      const currentPassword = String(payload?.currentPassword || "");
      if (!await verifyPassword(currentPassword, storedUser.passwordSalt, storedUser.passwordHash)) {
        throw new HttpError(401, "Current password is incorrect.");
      }
      const otpSecret = storedUser.otpSecret || generateOtpSecret();
      const updatedUser = await updateUserAccount(env.DB, {
        ...storedUser,
        otpSecret,
        otpEnabled: false,
        updatedAt: Date.now()
      });
      return jsonResponse({
        success: true,
        secret: updatedUser.otpSecret,
        otpAuthUrl: buildOtpAuthUrl({
          secret: updatedUser.otpSecret,
          username: updatedUser.username
        }),
        otpEnabled: updatedUser.otpEnabled
      });
    }
    if (action === "otp_enable") {
      const currentPassword = String(payload?.currentPassword || "");
      const otpCode = String(payload?.otpCode || "");
      if (!await verifyPassword(currentPassword, storedUser.passwordSalt, storedUser.passwordHash)) {
        throw new HttpError(401, "Current password is incorrect.");
      }
      const otpSecret = storedUser.otpSecret || generateOtpSecret();
      const isValidOtp = await verifyTotpCode(otpSecret, otpCode);
      if (!isValidOtp) {
        throw new HttpError(400, "Enter the current one-time passcode from your authenticator app.");
      }
      const updatedUser = await updateUserAccount(env.DB, {
        ...storedUser,
        otpSecret,
        otpEnabled: true,
        updatedAt: Date.now()
      });
      await deleteUserSessionsByUserId(env.DB, updatedUser.id, {
        exceptTokenHash: currentSessionTokenHash
      });
      await recordAuthEvent(env.DB, {
        id: crypto.randomUUID(),
        eventType: "account_otp_enabled",
        username: updatedUser.username,
        userId: updatedUser.id,
        ...getRequestMetadata(request, { eventType: "account_otp_enabled", user: updatedUser }),
        createdAt: Date.now(),
        message: "Enabled one-time passcodes."
      });
      return jsonResponse({
        success: true,
        otpEnabled: true,
        secret: updatedUser.otpSecret
      });
    }
    if (action === "otp_disable") {
      const currentPassword = String(payload?.currentPassword || "");
      const otpCode = String(payload?.otpCode || "");
      if (!await verifyPassword(currentPassword, storedUser.passwordSalt, storedUser.passwordHash)) {
        throw new HttpError(401, "Current password is incorrect.");
      }
      if (storedUser.otpEnabled) {
        const isValidOtp = await verifyTotpCode(storedUser.otpSecret, otpCode);
        if (!isValidOtp) {
          throw new HttpError(400, "Enter a valid one-time passcode to disable it.");
        }
      }
      const updatedUser = await updateUserAccount(env.DB, {
        ...storedUser,
        otpSecret: "",
        otpEnabled: false,
        updatedAt: Date.now()
      });
      await deleteUserSessionsByUserId(env.DB, updatedUser.id, {
        exceptTokenHash: currentSessionTokenHash
      });
      await recordAuthEvent(env.DB, {
        id: crypto.randomUUID(),
        eventType: "account_otp_disabled",
        username: updatedUser.username,
        userId: updatedUser.id,
        ...getRequestMetadata(request, { eventType: "account_otp_disabled", user: updatedUser }),
        createdAt: Date.now(),
        message: "Disabled one-time passcodes."
      });
      return jsonResponse({
        success: true,
        otpEnabled: false,
        secret: ""
      });
    }
    throw new HttpError(400, "Account action is invalid.");
  } catch (error) {
    return respondWithError(error);
  }
}
function normalizeProfileImage(value) {
  const normalized = String(value || "").trim();
  if (!normalized) {
    return "";
  }
  if (!normalized.startsWith("data:image/")) {
    throw new HttpError(400, "Profile image must be a valid image.");
  }
  return normalized.slice(0, 25e4);
}
var init_account = __esm({
  "api/account.js"() {
    init_functionsRoutes_0_08291424374010936();
    init_auth();
    init_otp();
    init_http();
    init_users();
    init_request_metadata();
    __name(onRequest4, "onRequest");
    __name(normalizeProfileImage, "normalizeProfileImage");
  }
});

// ../shared/recaptcha.js
function getRecaptchaConfig(env) {
  const siteKey = String(env.RECAPTCHA_SITE_KEY || "").trim();
  const secretKey = String(env.RECAPTCHA_SECRET_KEY || "").trim();
  if (siteKey && secretKey) {
    return {
      siteKey,
      secretKey,
      mode: "live"
    };
  }
  return {
    siteKey: TEST_RECAPTCHA_SITE_KEY,
    secretKey: TEST_RECAPTCHA_SECRET_KEY,
    mode: "testing"
  };
}
async function verifyRecaptchaToken(env, token, remoteip) {
  const normalizedToken = String(token || "").trim();
  if (!normalizedToken) {
    throw new HttpError(400, "Complete the captcha check and try again.");
  }
  const config = getRecaptchaConfig(env);
  const body = new URLSearchParams({
    secret: config.secretKey,
    response: normalizedToken
  });
  if (remoteip) {
    body.set("remoteip", String(remoteip));
  }
  const response = await fetch(SITEVERIFY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: body.toString()
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload?.success) {
    throw new HttpError(400, "Captcha validation failed. Please try again.");
  }
  return {
    mode: config.mode,
    payload
  };
}
var TEST_RECAPTCHA_SITE_KEY, TEST_RECAPTCHA_SECRET_KEY, SITEVERIFY_URL;
var init_recaptcha = __esm({
  "../shared/recaptcha.js"() {
    init_functionsRoutes_0_08291424374010936();
    init_http();
    TEST_RECAPTCHA_SITE_KEY = "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI";
    TEST_RECAPTCHA_SECRET_KEY = "6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe";
    SITEVERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";
    __name(getRecaptchaConfig, "getRecaptchaConfig");
    __name(verifyRecaptchaToken, "verifyRecaptchaToken");
  }
});

// api/auth-config.js
async function onRequest5(context) {
  const { request, env } = context;
  if (request.method === "OPTIONS") {
    return handleOptions();
  }
  try {
    if (request.method !== "GET") {
      throw new HttpError(405, "Method not allowed.");
    }
    const config = getRecaptchaConfig(env);
    return jsonResponse({
      recaptchaSiteKey: config.siteKey,
      recaptchaMode: config.mode
    });
  } catch (error) {
    return respondWithError(error);
  }
}
var init_auth_config = __esm({
  "api/auth-config.js"() {
    init_functionsRoutes_0_08291424374010936();
    init_http();
    init_recaptcha();
    __name(onRequest5, "onRequest");
  }
});

// ../boards.js
function mapBoard(row) {
  if (!row) {
    return null;
  }
  return {
    id: row.id,
    name: row.name,
    description: row.description || "",
    iconEmoji: row.icon_emoji || "\u{1F4C1}",
    accentColor: row.accent_color || "#63b6ff",
    status: row.status || "active",
    nodeCount: Number(row.node_count || 0),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}
async function listBoardsForUser(db, user) {
  await ensureBoardOwnershipSchema(db);
  const { results } = await db.prepare(
    `
        SELECT
          boards.id,
          boards.name,
          boards.description,
          boards.icon_emoji,
          boards.accent_color,
          boards.status,
          boards.created_at,
          boards.updated_at,
          COUNT(nodes.id) AS node_count
        FROM boards
        LEFT JOIN nodes ON nodes.board_id = boards.id
        WHERE boards.owner_user_id = ?
          OR (boards.owner_user_id IS NULL AND ? = 1)
        GROUP BY boards.id
        ORDER BY boards.updated_at DESC
      `
  ).bind(user.id, canAccessLegacyBoards(user) ? 1 : 0).all();
  return results.map(mapBoard);
}
async function getBoardByIdForUser(db, boardId, user) {
  await ensureBoardOwnershipSchema(db);
  const row = await db.prepare(
    `
        SELECT
          id,
          name,
          description,
          icon_emoji,
          accent_color,
          status,
          created_at,
          updated_at
        FROM boards
        WHERE id = ?
          AND (owner_user_id = ? OR (owner_user_id IS NULL AND ? = 1))
        LIMIT 1
      `
  ).bind(boardId, user.id, canAccessLegacyBoards(user) ? 1 : 0).first();
  return mapBoard(row);
}
async function createBoard(db, board) {
  await ensureBoardOwnershipSchema(db);
  await db.prepare(
    `
        INSERT INTO boards (
          id,
          name,
          description,
          icon_emoji,
          accent_color,
          owner_user_id,
          status,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `
  ).bind(
    board.id,
    board.name,
    board.description,
    board.iconEmoji,
    board.accentColor,
    board.ownerUserId,
    board.status,
    board.createdAt,
    board.updatedAt
  ).run();
  return getBoardByIdForUser(db, board.id, {
    id: board.ownerUserId,
    role: board.ownerRole || ""
  });
}
async function updateBoardForUser(db, board, user) {
  await ensureBoardOwnershipSchema(db);
  await db.prepare(
    `
        UPDATE boards
        SET
          name = ?,
          description = ?,
          icon_emoji = ?,
          accent_color = ?,
          status = ?,
          updated_at = ?
        WHERE id = ?
      `
  ).bind(
    board.name,
    board.description,
    board.iconEmoji,
    board.accentColor,
    board.status,
    board.updatedAt,
    board.id
  ).run();
  return getBoardByIdForUser(db, board.id, user);
}
async function deleteBoardForUser(db, boardId, user) {
  const existing = await getBoardByIdForUser(db, boardId, user);
  if (!existing) {
    return null;
  }
  await db.prepare(
    `
        DELETE FROM boards
        WHERE id = ?
      `
  ).bind(boardId).run();
  return existing;
}
async function touchBoard(db, boardId, updatedAt) {
  await ensureBoardOwnershipSchema(db);
  await db.prepare(
    `
        UPDATE boards
        SET updated_at = ?
        WHERE id = ?
      `
  ).bind(updatedAt, boardId).run();
}
function canAccessLegacyBoards(user) {
  return isPrivilegedRole(user?.role);
}
async function ensureBoardOwnershipSchema(db) {
  if (boardOwnershipSchemaReady) {
    return;
  }
  try {
    await db.prepare(`ALTER TABLE boards ADD COLUMN owner_user_id TEXT`).run();
  } catch (error) {
    const message = String(error?.message || "");
    if (!/duplicate column name/i.test(message)) {
      throw error;
    }
  }
  await db.prepare(
    `
        CREATE INDEX IF NOT EXISTS idx_boards_owner_user_id
        ON boards(owner_user_id)
      `
  ).run();
  boardOwnershipSchemaReady = true;
}
var boardOwnershipSchemaReady;
var init_boards = __esm({
  "../boards.js"() {
    init_functionsRoutes_0_08291424374010936();
    init_auth();
    boardOwnershipSchemaReady = false;
    __name(mapBoard, "mapBoard");
    __name(listBoardsForUser, "listBoardsForUser");
    __name(getBoardByIdForUser, "getBoardByIdForUser");
    __name(createBoard, "createBoard");
    __name(updateBoardForUser, "updateBoardForUser");
    __name(deleteBoardForUser, "deleteBoardForUser");
    __name(touchBoard, "touchBoard");
    __name(canAccessLegacyBoards, "canAccessLegacyBoards");
    __name(ensureBoardOwnershipSchema, "ensureBoardOwnershipSchema");
  }
});

// ../edges.js
function mapEdge(row) {
  if (!row) {
    return null;
  }
  return {
    id: row.id,
    boardId: row.board_id,
    sourceNodeId: row.source_node_id,
    targetNodeId: row.target_node_id,
    label: row.label || "",
    metadata: parseMetadata(row.metadata),
    createdAt: row.created_at
  };
}
function parseMetadata(value) {
  if (!value) {
    return {};
  }
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
}
async function listEdgesByBoardForUser(db, boardId, user) {
  await ensureBoardOwnershipSchema(db);
  const { results } = await db.prepare(
    `
        SELECT
          edges.id,
          edges.board_id,
          edges.source_node_id,
          edges.target_node_id,
          edges.label,
          edges.metadata,
          edges.created_at
        FROM edges
        INNER JOIN boards ON boards.id = edges.board_id
        WHERE edges.board_id = ?
          AND (boards.owner_user_id = ? OR (boards.owner_user_id IS NULL AND ? = 1))
        ORDER BY edges.created_at ASC
      `
  ).bind(boardId, user.id, canAccessLegacyBoards2(user) ? 1 : 0).all();
  return results.map(mapEdge);
}
async function findEdge(db, boardId, sourceNodeId, targetNodeId) {
  const row = await db.prepare(
    `
        SELECT
          id,
          board_id,
          source_node_id,
          target_node_id,
          label,
          metadata,
          created_at
        FROM edges
        WHERE board_id = ?
          AND source_node_id = ?
          AND target_node_id = ?
        LIMIT 1
      `
  ).bind(boardId, sourceNodeId, targetNodeId).first();
  return mapEdge(row);
}
async function getEdgeByIdForUser(db, edgeId, user) {
  await ensureBoardOwnershipSchema(db);
  const row = await db.prepare(
    `
        SELECT
          edges.id,
          edges.board_id,
          edges.source_node_id,
          edges.target_node_id,
          edges.label,
          edges.metadata,
          edges.created_at
        FROM edges
        INNER JOIN boards ON boards.id = edges.board_id
        WHERE edges.id = ?
          AND (boards.owner_user_id = ? OR (boards.owner_user_id IS NULL AND ? = 1))
        LIMIT 1
      `
  ).bind(edgeId, user.id, canAccessLegacyBoards2(user) ? 1 : 0).first();
  return mapEdge(row);
}
async function createEdge(db, edge) {
  await db.prepare(
    `
        INSERT INTO edges (
          id,
          board_id,
          source_node_id,
          target_node_id,
          label,
          metadata,
          created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `
  ).bind(
    edge.id,
    edge.boardId,
    edge.sourceNodeId,
    edge.targetNodeId,
    edge.label,
    JSON.stringify(edge.metadata || {}),
    edge.createdAt
  ).run();
  return findEdge(db, edge.boardId, edge.sourceNodeId, edge.targetNodeId);
}
async function deleteEdge(db, edgeId) {
  const row = await db.prepare(
    `
        SELECT board_id
        FROM edges
        WHERE id = ?
        LIMIT 1
      `
  ).bind(edgeId).first();
  await db.prepare(
    `
        DELETE FROM edges
        WHERE id = ?
      `
  ).bind(edgeId).run();
  return row?.board_id || null;
}
function canAccessLegacyBoards2(user) {
  return isPrivilegedRole(user?.role);
}
var init_edges = __esm({
  "../edges.js"() {
    init_functionsRoutes_0_08291424374010936();
    init_auth();
    init_boards();
    __name(mapEdge, "mapEdge");
    __name(parseMetadata, "parseMetadata");
    __name(listEdgesByBoardForUser, "listEdgesByBoardForUser");
    __name(findEdge, "findEdge");
    __name(getEdgeByIdForUser, "getEdgeByIdForUser");
    __name(createEdge, "createEdge");
    __name(deleteEdge, "deleteEdge");
    __name(canAccessLegacyBoards2, "canAccessLegacyBoards");
  }
});

// ../nodes.js
function mapNode(row) {
  if (!row) {
    return null;
  }
  return {
    id: row.id,
    boardId: row.board_id,
    type: row.type,
    label: row.label,
    x: Number(row.x),
    y: Number(row.y),
    metadata: parseMetadata2(row.metadata),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}
function parseMetadata2(value) {
  if (!value) {
    return {};
  }
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
}
async function listNodesByBoardForUser(db, boardId, user) {
  await ensureBoardOwnershipSchema(db);
  const { results } = await db.prepare(
    `
        SELECT
          nodes.id,
          nodes.board_id,
          nodes.type,
          nodes.label,
          nodes.x,
          nodes.y,
          nodes.metadata,
          nodes.created_at,
          nodes.updated_at
        FROM nodes
        INNER JOIN boards ON boards.id = nodes.board_id
        WHERE nodes.board_id = ?
          AND (boards.owner_user_id = ? OR (boards.owner_user_id IS NULL AND ? = 1))
        ORDER BY nodes.created_at ASC
      `
  ).bind(boardId, user.id, canAccessLegacyBoards3(user) ? 1 : 0).all();
  return results.map(mapNode);
}
async function getNodeByIdForUser(db, nodeId, user) {
  await ensureBoardOwnershipSchema(db);
  const row = await db.prepare(
    `
        SELECT
          nodes.id,
          nodes.board_id,
          nodes.type,
          nodes.label,
          nodes.x,
          nodes.y,
          nodes.metadata,
          nodes.created_at,
          nodes.updated_at
        FROM nodes
        INNER JOIN boards ON boards.id = nodes.board_id
        WHERE nodes.id = ?
          AND (boards.owner_user_id = ? OR (boards.owner_user_id IS NULL AND ? = 1))
        LIMIT 1
      `
  ).bind(nodeId, user.id, canAccessLegacyBoards3(user) ? 1 : 0).first();
  return mapNode(row);
}
async function getNodeByIdForBoard(db, nodeId, boardId) {
  const row = await db.prepare(
    `
        SELECT
          id,
          board_id,
          type,
          label,
          x,
          y,
          metadata,
          created_at,
          updated_at
        FROM nodes
        WHERE id = ?
          AND board_id = ?
        LIMIT 1
      `
  ).bind(nodeId, boardId).first();
  return mapNode(row);
}
async function createNode(db, node) {
  await db.prepare(
    `
        INSERT INTO nodes (
          id,
          board_id,
          type,
          label,
          x,
          y,
          metadata,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `
  ).bind(
    node.id,
    node.boardId,
    node.type,
    node.label,
    node.x,
    node.y,
    JSON.stringify(node.metadata || {}),
    node.createdAt,
    node.updatedAt
  ).run();
  return getNodeByIdForBoard(db, node.id, node.boardId);
}
async function updateNode(db, node) {
  await db.prepare(
    `
        UPDATE nodes
        SET
          type = ?,
          label = ?,
          x = ?,
          y = ?,
          metadata = ?,
          updated_at = ?
        WHERE id = ?
      `
  ).bind(
    node.type,
    node.label,
    node.x,
    node.y,
    JSON.stringify(node.metadata || {}),
    node.updatedAt,
    node.id
  ).run();
  return getNodeByIdForBoard(db, node.id, node.boardId);
}
async function deleteNode(db, nodeId) {
  await db.prepare(
    `
        DELETE FROM edges
        WHERE source_node_id = ? OR target_node_id = ?
      `
  ).bind(nodeId, nodeId).run();
  await db.prepare(
    `
        DELETE FROM nodes
        WHERE id = ?
      `
  ).bind(nodeId).run();
}
function canAccessLegacyBoards3(user) {
  return isPrivilegedRole(user?.role);
}
var init_nodes = __esm({
  "../nodes.js"() {
    init_functionsRoutes_0_08291424374010936();
    init_auth();
    init_boards();
    __name(mapNode, "mapNode");
    __name(parseMetadata2, "parseMetadata");
    __name(listNodesByBoardForUser, "listNodesByBoardForUser");
    __name(getNodeByIdForUser, "getNodeByIdForUser");
    __name(getNodeByIdForBoard, "getNodeByIdForBoard");
    __name(createNode, "createNode");
    __name(updateNode, "updateNode");
    __name(deleteNode, "deleteNode");
    __name(canAccessLegacyBoards3, "canAccessLegacyBoards");
  }
});

// api/boards.js
async function onRequest6(context) {
  const { request, env } = context;
  if (request.method === "OPTIONS") {
    return handleOptions();
  }
  try {
    const user = await requireAuthenticatedUser(request, env.DB);
    const url = new URL(request.url);
    const boardId = String(url.searchParams.get("id") || "").trim();
    if (request.method === "GET") {
      if (!boardId) {
        const boards = await listBoardsForUser(env.DB, user);
        return jsonResponse({ boards });
      }
      const board = await getBoardByIdForUser(env.DB, boardId, user);
      if (!board) {
        throw new HttpError(404, "Board not found.");
      }
      const [nodes, edges] = await Promise.all([
        listNodesByBoardForUser(env.DB, boardId, user),
        listEdgesByBoardForUser(env.DB, boardId, user)
      ]);
      return jsonResponse({ board, nodes, edges });
    }
    if (request.method === "POST") {
      const payload = validateBoardPayload(await readJsonBody(request));
      const now = (/* @__PURE__ */ new Date()).toISOString();
      const board = await createBoard(env.DB, {
        id: crypto.randomUUID(),
        ...payload,
        ownerUserId: user.id,
        ownerRole: user.role,
        createdAt: now,
        updatedAt: now
      });
      return jsonResponse({ board }, 201);
    }
    if (request.method === "PATCH") {
      const id = requireId(boardId, "Board id");
      const existing = await getBoardByIdForUser(env.DB, id, user);
      if (!existing) {
        throw new HttpError(404, "Board not found.");
      }
      const payload = validateBoardPayload(await readJsonBody(request));
      const board = await updateBoardForUser(env.DB, {
        id,
        name: payload.name,
        description: payload.description,
        iconEmoji: payload.iconEmoji,
        accentColor: payload.accentColor,
        status: payload.status,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      }, user);
      return jsonResponse({ board });
    }
    if (request.method === "DELETE") {
      const id = requireId(boardId, "Board id");
      const board = await deleteBoardForUser(env.DB, id, user);
      if (!board) {
        throw new HttpError(404, "Board not found.");
      }
      return jsonResponse({ success: true, board });
    }
    throw new HttpError(405, "Method not allowed.");
  } catch (error) {
    return respondWithError(error);
  }
}
var init_boards2 = __esm({
  "api/boards.js"() {
    init_functionsRoutes_0_08291424374010936();
    init_boards();
    init_edges();
    init_nodes();
    init_auth();
    init_http();
    init_validators();
    __name(onRequest6, "onRequest");
  }
});

// ../shared/quota.js
function getSearchQuotaWindowStart(now = Date.now()) {
  return Number(now) - DAILY_SEARCH_WINDOW_MS;
}
function getRemainingSearchQuota(usedCount, limit = DAILY_SEARCH_QUOTA) {
  const used = Math.max(0, Number(usedCount) || 0);
  return Math.max(0, limit - used);
}
var DAILY_SEARCH_QUOTA, DAILY_SEARCH_WINDOW_MS;
var init_quota = __esm({
  "../shared/quota.js"() {
    init_functionsRoutes_0_08291424374010936();
    DAILY_SEARCH_QUOTA = 400;
    DAILY_SEARCH_WINDOW_MS = 24 * 60 * 60 * 1e3;
    __name(getSearchQuotaWindowStart, "getSearchQuotaWindowStart");
    __name(getRemainingSearchQuota, "getRemainingSearchQuota");
  }
});

// api/dashboard-metrics.js
async function onRequest7(context) {
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
      countAuthEventsSince(env.DB, getSearchQuotaWindowStart(), ["search"])
    ]);
    return jsonResponse({
      usersRegistered,
      totalQueries,
      quota: getRemainingSearchQuota(recentSearchCount),
      syncedAt: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (error) {
    return respondWithError(error);
  }
}
var init_dashboard_metrics = __esm({
  "api/dashboard-metrics.js"() {
    init_functionsRoutes_0_08291424374010936();
    init_auth();
    init_users();
    init_http();
    init_quota();
    __name(onRequest7, "onRequest");
  }
});

// api/edges.js
async function onRequest8(context) {
  const { request, env } = context;
  if (request.method === "OPTIONS") {
    return handleOptions();
  }
  try {
    const user = await requireAuthenticatedUser(request, env.DB);
    const url = new URL(request.url);
    const edgeId = String(url.searchParams.get("id") || "").trim();
    if (request.method === "POST") {
      const rawPayload = await readJsonBody(request);
      const boardId = requireId(rawPayload?.boardId, "boardId");
      const board = await getBoardByIdForUser(env.DB, boardId, user);
      if (!board) {
        throw new HttpError(404, "Board not found.");
      }
      const payload = validateEdgePayload(rawPayload);
      const [sourceNode, targetNode] = await Promise.all([
        getNodeByIdForBoard(env.DB, payload.sourceNodeId, boardId),
        getNodeByIdForBoard(env.DB, payload.targetNodeId, boardId)
      ]);
      if (!sourceNode || !targetNode) {
        throw new HttpError(404, "One or more nodes were not found.");
      }
      const existing = await findEdge(env.DB, boardId, payload.sourceNodeId, payload.targetNodeId);
      if (existing) {
        throw new HttpError(409, "That relationship already exists.");
      }
      const now = (/* @__PURE__ */ new Date()).toISOString();
      const edge = await createEdge(env.DB, {
        id: crypto.randomUUID(),
        boardId,
        sourceNodeId: payload.sourceNodeId,
        targetNodeId: payload.targetNodeId,
        label: payload.label,
        metadata: payload.metadata,
        createdAt: now
      });
      await touchBoard(env.DB, boardId, now);
      return jsonResponse({ edge }, 201);
    }
    if (request.method === "DELETE") {
      const id = requireId(edgeId, "Edge id");
      const existing = await getEdgeByIdForUser(env.DB, id, user);
      if (!existing) {
        throw new HttpError(404, "Relationship not found.");
      }
      const boardId = await deleteEdge(env.DB, id);
      if (!boardId) {
        throw new HttpError(404, "Relationship not found.");
      }
      await touchBoard(env.DB, boardId, (/* @__PURE__ */ new Date()).toISOString());
      return jsonResponse({ success: true });
    }
    throw new HttpError(405, "Method not allowed.");
  } catch (error) {
    return respondWithError(error);
  }
}
var init_edges2 = __esm({
  "api/edges.js"() {
    init_functionsRoutes_0_08291424374010936();
    init_edges();
    init_boards();
    init_nodes();
    init_auth();
    init_http();
    init_validators();
    __name(onRequest8, "onRequest");
  }
});

// ../shared/rate-limit.js
async function enforceRateLimit(db, { key, limit, windowMs, message = "Too many requests. Please try again later." }) {
  const normalizedKey = String(key || "").trim();
  const safeLimit = Math.max(1, Number(limit) || 1);
  const safeWindowMs = Math.max(1e3, Number(windowMs) || 1e3);
  if (!normalizedKey) {
    throw new HttpError(500, "Rate limit key is invalid.");
  }
  await ensureRateLimitTable(db);
  const now = Date.now();
  const resetAt = now + safeWindowMs;
  await db.prepare(
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
      `
  ).bind(normalizedKey, resetAt, now).run();
  const row = await db.prepare(
    `
        SELECT bucket_count, reset_at
        FROM app_rate_limits
        WHERE bucket_key = ?
      `
  ).bind(normalizedKey).first();
  if (Number(row?.bucket_count || 0) > safeLimit) {
    throw new HttpError(429, message, "RATE_LIMITED");
  }
}
async function ensureRateLimitTable(db) {
  if (rateLimitSchemaReady) {
    return;
  }
  await db.prepare(
    `
        CREATE TABLE IF NOT EXISTS app_rate_limits (
          bucket_key TEXT PRIMARY KEY,
          bucket_count INTEGER NOT NULL DEFAULT 0,
          reset_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL
        )
      `
  ).run();
  await db.prepare(
    `
        CREATE INDEX IF NOT EXISTS idx_app_rate_limits_reset_at
        ON app_rate_limits(reset_at)
      `
  ).run();
  rateLimitSchemaReady = true;
}
var rateLimitSchemaReady;
var init_rate_limit = __esm({
  "../shared/rate-limit.js"() {
    init_functionsRoutes_0_08291424374010936();
    init_http();
    rateLimitSchemaReady = false;
    __name(enforceRateLimit, "enforceRateLimit");
    __name(ensureRateLimitTable, "ensureRateLimitTable");
  }
});

// api/login.js
async function onRequest9(context) {
  const { request, env } = context;
  const requestMetadata = getRequestMetadata(request);
  if (request.method === "OPTIONS") {
    return handleOptions();
  }
  try {
    if (request.method !== "POST") {
      throw new HttpError(405, "Method not allowed.");
    }
    const payload = validateLoginPayload(await readJsonBody(request));
    const identifier = String(payload.username || "").trim().toLowerCase();
    await Promise.all([
      enforceRateLimit(env.DB, {
        key: `login:ip:${requestMetadata.ipAddress || "unknown"}`,
        limit: 15,
        windowMs: 10 * 60 * 1e3,
        message: "Too many login attempts. Please wait and try again."
      }),
      enforceRateLimit(env.DB, {
        key: `login:user:${identifier}`,
        limit: 10,
        windowMs: 10 * 60 * 1e3,
        message: "Too many login attempts. Please wait and try again."
      })
    ]);
    await verifyRecaptchaToken(env, payload.recaptchaToken, requestMetadata.ipAddress);
    const user = await getUserByUsername(env.DB, identifier);
    if (!user) {
      await recordAuthEvent(env.DB, {
        id: crypto.randomUUID(),
        eventType: "login_failed",
        username: identifier,
        userId: "",
        ...requestMetadata,
        createdAt: Date.now(),
        message: "Invalid credentials."
      });
      throw new HttpError(401, "Invalid username or password.");
    }
    const isValidPassword = await verifyPassword(
      payload.password,
      user.passwordSalt,
      user.passwordHash
    );
    if (!isValidPassword) {
      await recordAuthEvent(env.DB, {
        id: crypto.randomUUID(),
        eventType: "login_failed",
        username: user.username,
        userId: user.id,
        ...getRequestMetadata(request, { eventType: "login_failed", user }),
        createdAt: Date.now(),
        message: "Invalid credentials."
      });
      throw new HttpError(401, "Invalid username or password.");
    }
    if (user.banned) {
      await recordAuthEvent(env.DB, {
        id: crypto.randomUUID(),
        eventType: "login_blocked",
        username: user.username,
        userId: user.id,
        ...getRequestMetadata(request, { eventType: "login_blocked", user }),
        createdAt: Date.now(),
        message: "Banned account attempted to log in."
      });
      throw new HttpError(403, "This account is banned.");
    }
    if (user.otpEnabled) {
      if (!String(payload.otpCode || "").trim()) {
        throw new HttpError(401, "Enter your one-time passcode to continue.", "OTP_REQUIRED");
      }
      const isValidOtp = await verifyTotpCode(user.otpSecret, payload.otpCode);
      if (!isValidOtp) {
        await recordAuthEvent(env.DB, {
          id: crypto.randomUUID(),
          eventType: "login_failed",
          username: user.username,
          userId: user.id,
          ...getRequestMetadata(request, { eventType: "login_failed", user }),
          createdAt: Date.now(),
          message: "Invalid one-time passcode."
        });
        throw new HttpError(401, "Invalid one-time passcode.");
      }
    }
    const now = Date.now();
    const sessionToken = createSessionToken();
    const expiresAt = getSessionExpiryDate();
    await createUserSession(env.DB, {
      userId: user.id,
      tokenHash: await hashSessionToken(sessionToken),
      createdAt: now,
      expiresAt: expiresAt.getTime(),
      lastSeenAt: now
    });
    await recordAuthEvent(env.DB, {
      id: crypto.randomUUID(),
      eventType: "login",
      username: user.username,
      userId: user.id,
      ...getRequestMetadata(request, { eventType: "login", user }),
      createdAt: now,
      message: "Logged in."
    });
    return jsonResponse(
      {
        success: true,
        user: sanitizeUser(user)
      },
      200,
      {
        "Set-Cookie": createSessionCookie(sessionToken, expiresAt)
      }
    );
  } catch (error) {
    return respondWithError(error);
  }
}
var init_login = __esm({
  "api/login.js"() {
    init_functionsRoutes_0_08291424374010936();
    init_users();
    init_auth();
    init_otp();
    init_http();
    init_validators();
    init_request_metadata();
    init_rate_limit();
    init_recaptcha();
    __name(onRequest9, "onRequest");
  }
});

// api/login-otp-status.js
async function onRequest10(context) {
  const { request } = context;
  if (request.method === "OPTIONS") {
    return handleOptions();
  }
  return respondWithError(new HttpError(404, "Not found."));
}
var init_login_otp_status = __esm({
  "api/login-otp-status.js"() {
    init_functionsRoutes_0_08291424374010936();
    init_http();
    __name(onRequest10, "onRequest");
  }
});

// api/logout.js
async function onRequest11(context) {
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
        success: true
      },
      200,
      {
        "Set-Cookie": clearSessionCookie()
      }
    );
  } catch (error) {
    return respondWithError(error);
  }
}
var init_logout = __esm({
  "api/logout.js"() {
    init_functionsRoutes_0_08291424374010936();
    init_auth();
    init_http();
    init_users();
    __name(onRequest11, "onRequest");
  }
});

// api/me.js
async function onRequest12(context) {
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
var init_me = __esm({
  "api/me.js"() {
    init_functionsRoutes_0_08291424374010936();
    init_auth();
    init_http();
    __name(onRequest12, "onRequest");
  }
});

// api/nodes.js
async function onRequest13(context) {
  const { request, env } = context;
  if (request.method === "OPTIONS") {
    return handleOptions();
  }
  try {
    const user = await requireAuthenticatedUser(request, env.DB);
    const url = new URL(request.url);
    const nodeId = String(url.searchParams.get("id") || "").trim();
    if (request.method === "POST") {
      const rawPayload = await readJsonBody(request);
      const boardId = requireId(rawPayload?.boardId, "boardId");
      const board = await getBoardByIdForUser(env.DB, boardId, user);
      if (!board) {
        throw new HttpError(404, "Board not found.");
      }
      const payload = validateNodePayload(rawPayload);
      const now = (/* @__PURE__ */ new Date()).toISOString();
      const node = await createNode(env.DB, {
        id: crypto.randomUUID(),
        boardId,
        type: payload.type,
        label: payload.label,
        x: payload.x,
        y: payload.y,
        metadata: payload.metadata,
        createdAt: now,
        updatedAt: now
      });
      await touchBoard(env.DB, boardId, now);
      return jsonResponse({ node }, 201);
    }
    if (request.method === "PATCH") {
      const id = requireId(nodeId, "Node id");
      const existing = await getNodeByIdForUser(env.DB, id, user);
      if (!existing) {
        throw new HttpError(404, "Node not found.");
      }
      const payload = validateNodePayload(await readJsonBody(request), { partial: true });
      const now = (/* @__PURE__ */ new Date()).toISOString();
      const node = await updateNode(env.DB, {
        id,
        boardId: existing.boardId,
        type: payload.type ?? existing.type,
        label: payload.label ?? existing.label,
        x: payload.x ?? existing.x,
        y: payload.y ?? existing.y,
        metadata: payload.metadata ?? existing.metadata,
        updatedAt: now
      });
      const refreshedNode = await getNodeByIdForBoard(env.DB, node.id, existing.boardId);
      await touchBoard(env.DB, existing.boardId, now);
      return jsonResponse({ node: refreshedNode });
    }
    if (request.method === "DELETE") {
      const id = requireId(nodeId, "Node id");
      const existing = await getNodeByIdForUser(env.DB, id, user);
      if (!existing) {
        throw new HttpError(404, "Node not found.");
      }
      await deleteNode(env.DB, id);
      await touchBoard(env.DB, existing.boardId, (/* @__PURE__ */ new Date()).toISOString());
      return jsonResponse({ success: true });
    }
    throw new HttpError(405, "Method not allowed.");
  } catch (error) {
    return respondWithError(error);
  }
}
var init_nodes2 = __esm({
  "api/nodes.js"() {
    init_functionsRoutes_0_08291424374010936();
    init_boards();
    init_nodes();
    init_auth();
    init_http();
    init_validators();
    __name(onRequest13, "onRequest");
  }
});

// api/register.js
async function onRequest14(context) {
  const { request, env } = context;
  const requestMetadata = getRequestMetadata(request);
  if (request.method === "OPTIONS") {
    return handleOptions();
  }
  try {
    if (request.method !== "POST") {
      throw new HttpError(405, "Method not allowed.");
    }
    const rawPayload = await readJsonBody(request);
    const payload = validateRegisterPayload(rawPayload);
    await Promise.all([
      enforceRateLimit(env.DB, {
        key: `register:ip:${requestMetadata.ipAddress || "unknown"}`,
        limit: 8,
        windowMs: 60 * 60 * 1e3,
        message: "Too many registration attempts. Please wait and try again."
      }),
      enforceRateLimit(env.DB, {
        key: `register:user:${payload.username}`,
        limit: 4,
        windowMs: 60 * 60 * 1e3,
        message: "Too many registration attempts. Please wait and try again."
      })
    ]);
    await verifyRecaptchaToken(env, normalizeCaptchaToken(rawPayload), requestMetadata.ipAddress);
    const existingUsername = await getUserByUsername(env.DB, payload.username);
    if (existingUsername) {
      await recordAuthEvent(env.DB, {
        id: crypto.randomUUID(),
        eventType: "register_failed",
        username: payload.username,
        userId: "",
        ...requestMetadata,
        createdAt: Date.now(),
        message: "That username is already in use."
      });
      throw new HttpError(409, "That username is already in use.");
    }
    const now = Date.now();
    const userCount = await getUserCount(env.DB);
    const passwordRecord = await createPasswordRecord(payload.password);
    const user = await createUser(env.DB, {
      id: crypto.randomUUID(),
      username: payload.username,
      email: payload.email,
      displayName: payload.displayName,
      organization: payload.organization,
      passwordHash: passwordRecord.passwordHash,
      passwordSalt: passwordRecord.salt,
      banned: false,
      role: userCount === 0 ? "owner" : "normal user",
      profileImage: "",
      createdAt: now,
      updatedAt: now
    });
    const sessionToken = createSessionToken();
    const expiresAt = getSessionExpiryDate();
    await createUserSession(env.DB, {
      userId: user.id,
      tokenHash: await hashSessionToken(sessionToken),
      createdAt: now,
      expiresAt: expiresAt.getTime(),
      lastSeenAt: now
    });
    await recordAuthEvent(env.DB, {
      id: crypto.randomUUID(),
      eventType: "register",
      username: user.username,
      userId: user.id,
      ...getRequestMetadata(request, { eventType: "register", user }),
      createdAt: now,
      message: "Account created."
    });
    return jsonResponse(
      {
        success: true,
        user: sanitizeUser(user)
      },
      201,
      {
        "Set-Cookie": createSessionCookie(sessionToken, expiresAt)
      }
    );
  } catch (error) {
    return respondWithError(error);
  }
}
var init_register = __esm({
  "api/register.js"() {
    init_functionsRoutes_0_08291424374010936();
    init_users();
    init_auth();
    init_http();
    init_request_metadata();
    init_rate_limit();
    init_validators();
    init_recaptcha();
    __name(onRequest14, "onRequest");
  }
});

// api/search.js
async function onRequest15(context) {
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
      if (type === "keyword" && /\s/.test(query) && error instanceof HttpError && error.status === 400 && /invalid characters in query/i.test(error.message)) {
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
        message: buildSearchEventMessage(query, type, Number(payload?.found || 0))
      }),
      incrementTotalSearchQueries(env.DB, 1)
    ]);
    const [usersRegistered, totalQueries, recentSearchCount] = await Promise.all([
      getUserCount(env.DB),
      getTotalSearchQueries(env.DB),
      countAuthEventsSince(env.DB, getSearchQuotaWindowStart(), ["search"])
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
      result
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
          message: buildSearchFailureMessage(failedQuery, failedType, error)
        });
      } catch {
      }
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
      "X-API-Key": apiKey
    }
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
      query.split(/[^a-zA-Z0-9._@-]+/).map((part) => part.trim()).filter((part) => part.length >= 3)
    )
  ).slice(0, 3);
  if (tokens.length === 0) {
    throw new HttpError(400, "Search query is invalid.");
  }
  const responses = await Promise.all(tokens.map((token) => queryLeakCheck(apiKey, token, "keyword")));
  const merged = [];
  const seen = /* @__PURE__ */ new Set();
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
        item?.source?.breach_date || ""
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
    result: merged
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
var ALLOWED_TYPES, DEFAULT_LIMIT;
var init_search = __esm({
  "api/search.js"() {
    init_functionsRoutes_0_08291424374010936();
    init_auth();
    init_users();
    init_http();
    init_request_metadata();
    init_quota();
    ALLOWED_TYPES = /* @__PURE__ */ new Set(["email", "username", "phone", "domain", "keyword", "hash"]);
    DEFAULT_LIMIT = 25;
    __name(onRequest15, "onRequest");
    __name(queryLeakCheck, "queryLeakCheck");
    __name(queryKeywordTokens, "queryKeywordTokens");
    __name(buildSearchEventMessage, "buildSearchEventMessage");
    __name(buildSearchFailureMessage, "buildSearchFailureMessage");
    __name(truncateQuery, "truncateQuery");
  }
});

// api/search-quota.js
async function onRequest16(context) {
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
      ["search"]
    );
    return jsonResponse({
      provider: "LeakCheck",
      quota: getRemainingSearchQuota(recentSearchCount),
      syncedAt: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (error) {
    return respondWithError(error);
  }
}
var init_search_quota = __esm({
  "api/search-quota.js"() {
    init_functionsRoutes_0_08291424374010936();
    init_auth();
    init_users();
    init_http();
    init_quota();
    __name(onRequest16, "onRequest");
  }
});

// _middleware.js
async function onRequest17(context) {
  const { request, env, next } = context;
  const url = new URL(request.url);
  const pathname = url.pathname;
  if (pathname === "/admin" || pathname === "/admin/" || pathname === "/admin.html") {
    const privilegedUser = await requirePrivilegedUserOr404(request, env.DB);
    if (!privilegedUser) {
      return withSecurityHeaders(createStyledNotFoundResponse());
    }
    if (pathname === "/admin/" || pathname === "/admin.html") {
      return withSecurityHeaders(Response.redirect(new URL("/admin", url.origin).toString(), 302));
    }
    return withSecurityHeaders(await next());
  }
  if (pathname !== "/" && pathname !== "/index.html") {
    return withSecurityHeaders(await next());
  }
  const user = await getAuthenticatedActiveUser(request, env.DB);
  if (user) {
    return withSecurityHeaders(await next());
  }
  const landingUrl = new URL("/landing.html", url.origin);
  return withSecurityHeaders(Response.redirect(landingUrl.toString(), 302));
}
function createStyledNotFoundResponse() {
  const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>404 | Civic Intelligence</title>
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap"
    />
    <style>
      :root {
        color-scheme: dark;
        --bg: #05070b;
        --text: #edf4ff;
        --muted: #9daac0;
        --accent: #63b6ff;
        --accent-soft: #8ac8ff;
      }

      * { box-sizing: border-box; }
      html, body { min-height: 100%; margin: 0; }
      body {
        background:
          radial-gradient(circle at top left, rgba(47, 135, 255, 0.13), transparent 24%),
          radial-gradient(circle at 78% 16%, rgba(99, 182, 255, 0.1), transparent 18%),
          radial-gradient(circle at bottom center, rgba(18, 32, 58, 0.42), transparent 42%),
          linear-gradient(180deg, #07090e 0%, #030408 100%);
        color: var(--text);
        font-family: "Space Grotesk", sans-serif;
        overflow: hidden;
      }

      .shell {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 2rem 1.5rem;
        position: relative;
      }

      .brand {
        position: absolute;
        top: 1.5rem;
        left: 1.5rem;
        display: inline-grid;
        gap: 0.2rem;
        text-decoration: none;
        color: inherit;
        z-index: 1;
      }

      .eyebrow {
        margin: 0;
        color: var(--accent);
        font-family: "IBM Plex Mono", monospace;
        font-size: 0.74rem;
        letter-spacing: 0.18em;
        text-transform: uppercase;
      }

      .brand strong {
        font-size: 1rem;
      }

      .scene {
        width: min(100%, 980px);
        text-align: center;
        display: grid;
        justify-items: center;
        gap: 0.85rem;
      }

      .code {
        margin: 0;
        font-size: clamp(7rem, 19vw, 12rem);
        line-height: 0.82;
        letter-spacing: -0.08em;
        font-weight: 700;
        color: var(--accent-soft);
        text-shadow: 0 0 50px rgba(99, 182, 255, 0.12);
      }

      h1 {
        margin: 0;
        font-size: clamp(3.2rem, 8.4vw, 6.2rem);
        line-height: 0.9;
        letter-spacing: -0.07em;
        font-weight: 700;
      }

      p {
        margin: 0;
        color: var(--muted);
        line-height: 1.55;
        font-size: clamp(1rem, 2vw, 1.2rem);
        max-width: 38rem;
      }

      .actions {
        display: flex;
        justify-content: center;
        margin-top: 1rem;
      }

      .button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 54px;
        min-width: 240px;
        padding: 0 1.4rem;
        border: 1px solid transparent;
        border-radius: 16px;
        text-decoration: none;
        color: #04111e;
        font-size: 1rem;
        font-weight: 700;
        background: linear-gradient(135deg, rgba(47, 135, 255, 0.94), rgba(99, 182, 255, 0.94));
        box-shadow: 0 16px 48px rgba(47, 135, 255, 0.22);
      }

      @media (max-width: 640px) {
        .shell {
          padding: 5.5rem 1.25rem 2rem;
        }

        .brand {
          top: 1rem;
          left: 1rem;
        }

        .scene {
          gap: 0.7rem;
        }

        .actions,
        .button {
          width: 100%;
        }
      }
    </style>
  </head>
  <body>
    <div class="shell">
      <a class="brand" href="/landing.html">
        <span class="eyebrow">Civic Intelligence</span>
        <strong>Investigation Platform</strong>
      </a>
      <main class="scene">
        <p class="code">404</p>
        <h1>Page not found</h1>
        <p>This page does not exist, or you do not have access to it.</p>
        <div class="actions">
          <a class="button" href="/landing.html">Back to home</a>
        </div>
      </main>
    </div>
  </body>
</html>`;
  return new Response(html, {
    status: 404,
    headers: {
      "content-type": "text/html; charset=utf-8"
    }
  });
}
function withSecurityHeaders(response) {
  const nextResponse = new Response(response.body, response);
  nextResponse.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "form-action 'self'",
      "script-src 'self' https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/",
      "style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://fonts.googleapis.com",
      "font-src 'self' data: https://cdnjs.cloudflare.com https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://www.google.com https://www.gstatic.com https:",
      "connect-src 'self' https://www.google.com https://www.recaptcha.net",
      "frame-src https://www.google.com https://www.recaptcha.net",
      "manifest-src 'self'",
      "worker-src 'self' blob:",
      "upgrade-insecure-requests",
      "block-all-mixed-content"
    ].join("; ")
  );
  nextResponse.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains; preload"
  );
  nextResponse.headers.set("X-Frame-Options", "DENY");
  nextResponse.headers.set("X-Content-Type-Options", "nosniff");
  nextResponse.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  nextResponse.headers.set(
    "Permissions-Policy",
    [
      "accelerometer=()",
      "camera=()",
      "geolocation=()",
      "gyroscope=()",
      "magnetometer=()",
      "microphone=()",
      "payment=()",
      "usb=()",
      "interest-cohort=()",
      "browsing-topics=()"
    ].join(", ")
  );
  nextResponse.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  nextResponse.headers.set("Cross-Origin-Embedder-Policy", "unsafe-none");
  nextResponse.headers.delete("Cross-Origin-Resource-Policy");
  nextResponse.headers.delete("access-control-allow-origin");
  return nextResponse;
}
var init_middleware = __esm({
  "_middleware.js"() {
    init_functionsRoutes_0_08291424374010936();
    init_auth();
    __name(onRequest17, "onRequest");
    __name(createStyledNotFoundResponse, "createStyledNotFoundResponse");
    __name(withSecurityHeaders, "withSecurityHeaders");
  }
});

// ../.wrangler/tmp/pages-guLdmx/functionsRoutes-0.08291424374010936.mjs
var routes;
var init_functionsRoutes_0_08291424374010936 = __esm({
  "../.wrangler/tmp/pages-guLdmx/functionsRoutes-0.08291424374010936.mjs"() {
    init_logs();
    init_overview();
    init_users2();
    init_account();
    init_auth_config();
    init_boards2();
    init_dashboard_metrics();
    init_edges2();
    init_login();
    init_login_otp_status();
    init_logout();
    init_me();
    init_nodes2();
    init_register();
    init_search();
    init_search_quota();
    init_middleware();
    routes = [
      {
        routePath: "/api/admin/logs",
        mountPath: "/api/admin",
        method: "",
        middlewares: [],
        modules: [onRequest]
      },
      {
        routePath: "/api/admin/overview",
        mountPath: "/api/admin",
        method: "",
        middlewares: [],
        modules: [onRequest2]
      },
      {
        routePath: "/api/admin/users",
        mountPath: "/api/admin",
        method: "",
        middlewares: [],
        modules: [onRequest3]
      },
      {
        routePath: "/api/account",
        mountPath: "/api",
        method: "",
        middlewares: [],
        modules: [onRequest4]
      },
      {
        routePath: "/api/auth-config",
        mountPath: "/api",
        method: "",
        middlewares: [],
        modules: [onRequest5]
      },
      {
        routePath: "/api/boards",
        mountPath: "/api",
        method: "",
        middlewares: [],
        modules: [onRequest6]
      },
      {
        routePath: "/api/dashboard-metrics",
        mountPath: "/api",
        method: "",
        middlewares: [],
        modules: [onRequest7]
      },
      {
        routePath: "/api/edges",
        mountPath: "/api",
        method: "",
        middlewares: [],
        modules: [onRequest8]
      },
      {
        routePath: "/api/login",
        mountPath: "/api",
        method: "",
        middlewares: [],
        modules: [onRequest9]
      },
      {
        routePath: "/api/login-otp-status",
        mountPath: "/api",
        method: "",
        middlewares: [],
        modules: [onRequest10]
      },
      {
        routePath: "/api/logout",
        mountPath: "/api",
        method: "",
        middlewares: [],
        modules: [onRequest11]
      },
      {
        routePath: "/api/me",
        mountPath: "/api",
        method: "",
        middlewares: [],
        modules: [onRequest12]
      },
      {
        routePath: "/api/nodes",
        mountPath: "/api",
        method: "",
        middlewares: [],
        modules: [onRequest13]
      },
      {
        routePath: "/api/register",
        mountPath: "/api",
        method: "",
        middlewares: [],
        modules: [onRequest14]
      },
      {
        routePath: "/api/search",
        mountPath: "/api",
        method: "",
        middlewares: [],
        modules: [onRequest15]
      },
      {
        routePath: "/api/search-quota",
        mountPath: "/api",
        method: "",
        middlewares: [],
        modules: [onRequest16]
      },
      {
        routePath: "/",
        mountPath: "/",
        method: "",
        middlewares: [onRequest17],
        modules: []
      }
    ];
  }
});

// ../../../AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/pages-template-worker.ts
init_functionsRoutes_0_08291424374010936();

// ../../../AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/path-to-regexp/dist.es2015/index.js
init_functionsRoutes_0_08291424374010936();
function lexer(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j = i + 1;
      while (j < str.length) {
        var code = str.charCodeAt(j);
        if (
          // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95
        ) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name)
        throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name });
      i = j;
      continue;
    }
    if (char === "(") {
      var count = 1;
      var pattern = "";
      var j = i + 1;
      if (str[j] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j));
      }
      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }
        if (str[j] === ")") {
          count--;
          if (count === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count++;
          if (str[j + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(j));
          }
        }
        pattern += str[j++];
      }
      if (count)
        throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern)
        throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
__name(lexer, "lexer");
function parse(str, options) {
  if (options === void 0) {
    options = {};
  }
  var tokens = lexer(str);
  var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a, _b = options.delimiter, delimiter = _b === void 0 ? "/#?" : _b;
  var result = [];
  var key = 0;
  var i = 0;
  var path = "";
  var tryConsume = /* @__PURE__ */ __name(function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  }, "tryConsume");
  var mustConsume = /* @__PURE__ */ __name(function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a2 = tokens[i], nextType = _a2.type, index = _a2.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  }, "mustConsume");
  var consumeText = /* @__PURE__ */ __name(function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  }, "consumeText");
  var isSafe = /* @__PURE__ */ __name(function(value2) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char2 = delimiter_1[_i];
      if (value2.indexOf(char2) > -1)
        return true;
    }
    return false;
  }, "isSafe");
  var safePattern = /* @__PURE__ */ __name(function(prefix2) {
    var prev = result[result.length - 1];
    var prevText = prefix2 || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError('Must have text between two parameters, missing text after "'.concat(prev.name, '"'));
    }
    if (!prevText || isSafe(prevText))
      return "[^".concat(escapeString(delimiter), "]+?");
    return "(?:(?!".concat(escapeString(prevText), ")[^").concat(escapeString(delimiter), "])+?");
  }, "safePattern");
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path += prefix;
        prefix = "";
      }
      if (path) {
        result.push(path);
        path = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || safePattern(prefix),
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path += value;
      continue;
    }
    if (path) {
      result.push(path);
      path = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
__name(parse, "parse");
function match(str, options) {
  var keys = [];
  var re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}
__name(match, "match");
function regexpToFunction(re, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.decode, decode = _a === void 0 ? function(x) {
    return x;
  } : _a;
  return function(pathname) {
    var m = re.exec(pathname);
    if (!m)
      return false;
    var path = m[0], index = m.index;
    var params = /* @__PURE__ */ Object.create(null);
    var _loop_1 = /* @__PURE__ */ __name(function(i2) {
      if (m[i2] === void 0)
        return "continue";
      var key = keys[i2 - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i2].split(key.prefix + key.suffix).map(function(value) {
          return decode(value, key);
        });
      } else {
        params[key.name] = decode(m[i2], key);
      }
    }, "_loop_1");
    for (var i = 1; i < m.length; i++) {
      _loop_1(i);
    }
    return { path, index, params };
  };
}
__name(regexpToFunction, "regexpToFunction");
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
__name(escapeString, "escapeString");
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
__name(flags, "flags");
function regexpToRegexp(path, keys) {
  if (!keys)
    return path;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path.source);
  }
  return path;
}
__name(regexpToRegexp, "regexpToRegexp");
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path) {
    return pathToRegexp(path, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
__name(arrayToRegexp, "arrayToRegexp");
function stringToRegexp(path, keys, options) {
  return tokensToRegexp(parse(path, options), keys, options);
}
__name(stringToRegexp, "stringToRegexp");
function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function(x) {
    return x;
  } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString(encode(token));
    } else {
      var prefix = escapeString(encode(token.prefix));
      var suffix = escapeString(encode(token.suffix));
      if (token.pattern) {
        if (keys)
          keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
          } else {
            route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            throw new TypeError('Can not repeat "'.concat(token.name, '" without a prefix and suffix'));
          }
          route += "(".concat(token.pattern, ")").concat(token.modifier);
        }
      } else {
        route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict)
      route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}
__name(tokensToRegexp, "tokensToRegexp");
function pathToRegexp(path, keys, options) {
  if (path instanceof RegExp)
    return regexpToRegexp(path, keys);
  if (Array.isArray(path))
    return arrayToRegexp(path, keys, options);
  return stringToRegexp(path, keys, options);
}
__name(pathToRegexp, "pathToRegexp");

// ../../../AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/pages-template-worker.ts
var escapeRegex = /[.+?^${}()|[\]\\]/g;
function* executeRequest(request) {
  const requestPath = new URL(request.url).pathname;
  for (const route of [...routes].reverse()) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult) {
      for (const handler of route.middlewares.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: mountMatchResult.path
        };
      }
    }
  }
  for (const route of routes) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: true
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult && route.modules.length) {
      for (const handler of route.modules.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: matchResult.path
        };
      }
      break;
    }
  }
}
__name(executeRequest, "executeRequest");
var pages_template_worker_default = {
  async fetch(originalRequest, env, workerContext) {
    let request = originalRequest;
    const handlerIterator = executeRequest(request);
    let data = {};
    let isFailOpen = false;
    const next = /* @__PURE__ */ __name(async (input, init) => {
      if (input !== void 0) {
        let url = input;
        if (typeof input === "string") {
          url = new URL(input, request.url).toString();
        }
        request = new Request(url, init);
      }
      const result = handlerIterator.next();
      if (result.done === false) {
        const { handler, params, path } = result.value;
        const context = {
          request: new Request(request.clone()),
          functionPath: path,
          next,
          params,
          get data() {
            return data;
          },
          set data(value) {
            if (typeof value !== "object" || value === null) {
              throw new Error("context.data must be an object");
            }
            data = value;
          },
          env,
          waitUntil: workerContext.waitUntil.bind(workerContext),
          passThroughOnException: /* @__PURE__ */ __name(() => {
            isFailOpen = true;
          }, "passThroughOnException")
        };
        const response = await handler(context);
        if (!(response instanceof Response)) {
          throw new Error("Your Pages function should return a Response");
        }
        return cloneResponse(response);
      } else if ("ASSETS") {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      } else {
        const response = await fetch(request);
        return cloneResponse(response);
      }
    }, "next");
    try {
      return await next();
    } catch (error) {
      if (isFailOpen) {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      }
      throw error;
    }
  }
};
var cloneResponse = /* @__PURE__ */ __name((response) => (
  // https://fetch.spec.whatwg.org/#null-body-status
  new Response(
    [101, 204, 205, 304].includes(response.status) ? null : response.body,
    response
  )
), "cloneResponse");
export {
  pages_template_worker_default as default
};
