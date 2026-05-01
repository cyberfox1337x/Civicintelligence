import { handleOptions, HttpError, respondWithError } from "../../shared/http.js";

export async function onRequest(context) {
  const { request } = context;

  if (request.method === "OPTIONS") {
    return handleOptions();
  }

  return respondWithError(new HttpError(404, "Not found."));
}
