import { HttpError } from "./shared/http.js";

const textEncoder = new TextEncoder();
const PASSWORD_ITERATIONS = 100000;
const PASSWORD_HASH_ALGORITHM = "SHA-256";
const SESSION_COOKIE_NAME = "civic_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30;

export function getSessionCookieName() {
  return SESSION_COOKIE_NAME;
}

export async function createPasswordRecord(password) {
  const salt = generateRandomHex(16);
  const passwordHash = await hashPassword(password, salt);
  return { salt, passwordHash };
}

export async function verifyPassword(password, salt, expectedHash) {
  const actualHash = await hashPassword(password, salt);
  return constantTimeEqual(actualHash, expectedHash);
}

export function createSessionToken() {
  return toBase64Url(crypto.getRandomValues(new Uint8Array(32)));
}

export async function hashSessionToken(token) {
  const digest = await crypto.subtle.digest(PASSWORD_HASH_ALGORITHM, textEncoder.encode(token));
  return toHex(new Uint8Array(digest));
}

export function getSessionExpiryDate() {
  return new Date(Date.now() + SESSION_TTL_MS);
}

export function createSessionCookie(token, expiresAt) {
  const expiresValue =
    expiresAt instanceof Date ? expiresAt.toUTCString() : new Date(expiresAt).toUTCString();

  return [
    `${SESSION_COOKIE_NAME}=${token}`,
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
    `Expires=${expiresValue}`,
  ].join("; ");
}

export function clearSessionCookie() {
  return [
    `${SESSION_COOKIE_NAME}=`,
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
    "Expires=Thu, 01 Jan 1970 00:00:00 GMT",
  ].join("; ");
}

export function readCookie(request, name) {
  const rawCookie = request.headers.get("cookie") || "";
  const match = rawCookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));

  return match ? match.slice(name.length + 1) : "";
}

export async function getCurrentSessionTokenHash(request) {
  const token = readCookie(request, SESSION_COOKIE_NAME);
  if (!token) {
    return "";
  }

  return hashSessionToken(token);
}

export function sanitizeUser(user) {
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
    updatedAt: user.updatedAt,
  };
}

export async function getAuthenticatedUser(request, db) {
  const token = readCookie(request, SESSION_COOKIE_NAME);
  if (!token) {
    return null;
  }

  const { getUserById, getUserSessionByTokenHash, touchUserSession } = await import("./users.js");
  const tokenHash = await hashSessionToken(token);
  const session = await getUserSessionByTokenHash(db, tokenHash);

  if (!session) {
    return null;
  }

  if (new Date(session.expires_at).getTime() <= Date.now()) {
    return null;
  }

  const user = await getUserById(db, session.user_id);
  if (!user) {
    return null;
  }

  await touchUserSession(db, session.token_hash, Date.now());
  return sanitizeUser(user);
}

export async function getAuthenticatedActiveUser(request, db) {
  const user = await getAuthenticatedUser(request, db);
  if (!user || user.banned) {
    return null;
  }

  return user;
}

export async function requireAuthenticatedUser(request, db) {
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

export function isOwnerRole(role) {
  return String(role || "").trim().toLowerCase() === "owner";
}

export function isPrivilegedRole(role) {
  const normalizedRole = String(role || "").trim().toLowerCase();
  return normalizedRole === "owner" || normalizedRole === "admin";
}

export async function requirePrivilegedUserOr404(request, db) {
  const user = await getAuthenticatedUser(request, db);
  if (!user || user.banned || !isPrivilegedRole(user.role)) {
    return null;
  }

  return user;
}

export async function requirePrivilegedUser(request, db) {
  const user = await requirePrivilegedUserOr404(request, db);
  if (!user) {
    throw new HttpError(404, "Not found.");
  }

  return user;
}

export async function requireOwnerUserOr404(request, db) {
  const user = await getAuthenticatedUser(request, db);
  if (!user || user.banned || !isOwnerRole(user.role)) {
    return null;
  }

  return user;
}

export async function requireOwnerUser(request, db) {
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
    ["deriveBits"],
  );
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: textEncoder.encode(salt),
      iterations: PASSWORD_ITERATIONS,
      hash: PASSWORD_HASH_ALGORITHM,
    },
    keyMaterial,
    256,
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
