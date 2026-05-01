import { handleOptions, HttpError, jsonResponse, respondWithError } from "../../shared/http.js";
import { getRecaptchaConfig } from "../../shared/recaptcha.js";

export async function onRequest(context) {
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
      recaptchaMode: config.mode,
    });
  } catch (error) {
    return respondWithError(error);
  }
}
