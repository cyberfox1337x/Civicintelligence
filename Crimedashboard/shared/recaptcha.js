import { HttpError } from "./http.js";

const TEST_RECAPTCHA_SITE_KEY = "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI";
const TEST_RECAPTCHA_SECRET_KEY = "6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe";
const SITEVERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";

export function getRecaptchaConfig(env) {
  const siteKey = String(env.RECAPTCHA_SITE_KEY || "").trim();
  const secretKey = String(env.RECAPTCHA_SECRET_KEY || "").trim();

  if (siteKey && secretKey) {
    return {
      siteKey,
      secretKey,
      mode: "live",
    };
  }

  return {
    siteKey: TEST_RECAPTCHA_SITE_KEY,
    secretKey: TEST_RECAPTCHA_SECRET_KEY,
    mode: "testing",
  };
}

export async function verifyRecaptchaToken(env, token, remoteip) {
  const normalizedToken = String(token || "").trim();
  if (!normalizedToken) {
    throw new HttpError(400, "Complete the captcha check and try again.");
  }

  const config = getRecaptchaConfig(env);
  const body = new URLSearchParams({
    secret: config.secretKey,
    response: normalizedToken,
  });

  if (remoteip) {
    body.set("remoteip", String(remoteip));
  }

  const response = await fetch(SITEVERIFY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
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
