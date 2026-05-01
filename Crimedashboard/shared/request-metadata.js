import { isOwnerRole } from "../auth.js";

export function getRequestMetadata(request, options = {}) {
  const userAgent = request.headers.get("user-agent") || "";
  const forwardedIp =
    request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for") || "";
  const ipAddress = normalizeIpAddress(forwardedIp);
  const eventType = String(options.eventType || "").trim().toLowerCase();
  const user = options.user || null;
  const cf = request.cf || {};

  return {
    userAgent,
    ipAddress: shouldMaskOwnerLoginIp(eventType, user) ? "127.0.0.1" : ipAddress,
    state: normalizeLocationValue(cf.region || cf.regionCode || ""),
    city: normalizeLocationValue(cf.city || ""),
    zip: normalizeLocationValue(cf.postalCode || ""),
  };
}

function normalizeIpAddress(value) {
  const normalized = String(value || "")
    .split(",")[0]
    .trim();

  return normalized || "";
}

function normalizeLocationValue(value) {
  return String(value || "").trim();
}

function shouldMaskOwnerLoginIp(eventType, user) {
  return eventType.startsWith("login") && Boolean(user) && isOwnerRole(user.role);
}
