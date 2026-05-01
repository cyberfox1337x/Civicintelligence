import {
  createUser,
  createUserSession,
  getUserByUsername,
  getUserCount,
  recordAuthEvent,
} from "../../users.js";
import {
  createPasswordRecord,
  createSessionCookie,
  createSessionToken,
  getSessionExpiryDate,
  hashSessionToken,
  sanitizeUser,
} from "../../auth.js";
import {
  handleOptions,
  HttpError,
  jsonResponse,
  readJsonBody,
  respondWithError,
} from "../../shared/http.js";
import { getRequestMetadata } from "../../shared/request-metadata.js";
import { enforceRateLimit } from "../../shared/rate-limit.js";
import { normalizeCaptchaToken, validateRegisterPayload } from "../../shared/validators.js";
import { verifyRecaptchaToken } from "../../shared/recaptcha.js";

export async function onRequest(context) {
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
        windowMs: 60 * 60 * 1000,
        message: "Too many registration attempts. Please wait and try again.",
      }),
      enforceRateLimit(env.DB, {
        key: `register:user:${payload.username}`,
        limit: 4,
        windowMs: 60 * 60 * 1000,
        message: "Too many registration attempts. Please wait and try again.",
      }),
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
        message: "That username is already in use.",
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
      updatedAt: now,
    });

    const sessionToken = createSessionToken();
    const expiresAt = getSessionExpiryDate();
    await createUserSession(env.DB, {
      userId: user.id,
      tokenHash: await hashSessionToken(sessionToken),
      createdAt: now,
      expiresAt: expiresAt.getTime(),
      lastSeenAt: now,
    });

    await recordAuthEvent(env.DB, {
      id: crypto.randomUUID(),
      eventType: "register",
      username: user.username,
      userId: user.id,
      ...getRequestMetadata(request, { eventType: "register", user }),
      createdAt: now,
      message: "Account created.",
    });

    return jsonResponse(
      {
        success: true,
        user: sanitizeUser(user),
      },
      201,
      {
        "Set-Cookie": createSessionCookie(sessionToken, expiresAt),
      },
    );
  } catch (error) {
    return respondWithError(error);
  }
}
