import { HttpError } from "./http.js";

const TEST_TURNSTILE_SITE_KEY = "1x00000000000000000000AA";
const TEST_TURNSTILE_SECRET_KEY = "1x0000000000000000000000000000000AA";
const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export function getTurnstileConfig(env) {
  const siteKey = String(env.TURNSTILE_SITE_KEY || "").trim();
  const secretKey = String(env.TURNSTILE_SECRET_KEY || "").trim();
  if (siteKey && secretKey) {
    return {
      siteKey,
      secretKey,
      mode: "live",
    };
  }

  return {
    siteKey: TEST_TURNSTILE_SITE_KEY,
    secretKey: TEST_TURNSTILE_SECRET_KEY,
    mode: "testing",
  };
}

export async function verifyTurnstileToken(env, token, remoteip) {
  const normalizedToken = String(token || "").trim();
  if (!normalizedToken) {
    throw new HttpError(400, "Complete the captcha check and try again.");
  }

  const config = getTurnstileConfig(env);
  const response = await fetch(SITEVERIFY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      secret: config.secretKey,
      response: normalizedToken,
      remoteip,
    }),
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok || !payload?.success) {
    throw new HttpError(400, "Captcha validation failed. Please try again.");
  }

  return {
    mode: config.mode,
    payload,
  };
}
