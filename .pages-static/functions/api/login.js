import { createUserSession, getUserByUsername, recordAuthEvent } from "../../users.js";
import {
  createSessionCookie,
  createSessionToken,
  getSessionExpiryDate,
  hashSessionToken,
  sanitizeUser,
  verifyPassword,
} from "../../auth.js";
import { verifyTotpCode } from "../../shared/otp.js";
import {
  handleOptions,
  HttpError,
  jsonResponse,
  readJsonBody,
  respondWithError,
} from "../../shared/http.js";
import { validateLoginPayload } from "../../shared/validators.js";
import { getRequestMetadata } from "../../shared/request-metadata.js";
import { enforceRateLimit } from "../../shared/rate-limit.js";
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

    const payload = validateLoginPayload(await readJsonBody(request));
    const identifier = String(payload.username || "").trim().toLowerCase();
    await Promise.all([
      enforceRateLimit(env.DB, {
        key: `login:ip:${requestMetadata.ipAddress || "unknown"}`,
        limit: 15,
        windowMs: 10 * 60 * 1000,
        message: "Too many login attempts. Please wait and try again.",
      }),
      enforceRateLimit(env.DB, {
        key: `login:user:${identifier}`,
        limit: 10,
        windowMs: 10 * 60 * 1000,
        message: "Too many login attempts. Please wait and try again.",
      }),
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
        message: "Invalid credentials.",
      });
      throw new HttpError(401, "Invalid username or password.");
    }

    const isValidPassword = await verifyPassword(
      payload.password,
      user.passwordSalt,
      user.passwordHash,
    );

    if (!isValidPassword) {
      await recordAuthEvent(env.DB, {
        id: crypto.randomUUID(),
        eventType: "login_failed",
        username: user.username,
        userId: user.id,
        ...getRequestMetadata(request, { eventType: "login_failed", user }),
        createdAt: Date.now(),
        message: "Invalid credentials.",
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
        message: "Banned account attempted to log in.",
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
          message: "Invalid one-time passcode.",
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
      lastSeenAt: now,
    });

    await recordAuthEvent(env.DB, {
      id: crypto.randomUUID(),
      eventType: "login",
      username: user.username,
      userId: user.id,
      ...getRequestMetadata(request, { eventType: "login", user }),
      createdAt: now,
      message: "Logged in.",
    });

    return jsonResponse(
      {
        success: true,
        user: sanitizeUser(user),
      },
      200,
      {
        "Set-Cookie": createSessionCookie(sessionToken, expiresAt),
      },
    );
  } catch (error) {
    return respondWithError(error);
  }
}
