import { HttpError } from "./http.js";

const NODE_TYPES = new Set([
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
  "location",
]);

const BOARD_STATUSES = new Set(["active", "closed"]);

export function requireId(value, fieldName) {
  const normalized = normalizeString(value);
  if (!normalized) {
    throw new HttpError(400, `${fieldName} is required.`);
  }

  return normalized;
}

export function validateBoardPayload(payload) {
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
    status,
  };
}

export function validateNodePayload(payload, { partial = false } = {}) {
  const result = {};

  if (!partial || payload?.type !== undefined) {
    const type = normalizeString(payload?.type).toLowerCase();
    if (!NODE_TYPES.has(type)) {
      throw new HttpError(400, "Node type is invalid.");
    }
    result.type = type;
  }

  if (!partial || payload?.label !== undefined) {
    const label = normalizeString(payload?.label);
    if (!label) {
      throw new HttpError(400, "Node label is required.");
    }
    result.label = label.slice(0, 160);
  }

  if (!partial || payload?.x !== undefined) {
    result.x = normalizeCoordinate(payload?.x, "Node x");
  }

  if (!partial || payload?.y !== undefined) {
    result.y = normalizeCoordinate(payload?.y, "Node y");
  }

  if (!partial || payload?.metadata !== undefined) {
    result.metadata = normalizeMetadata(payload?.metadata);
  }

  return result;
}

export function validateEdgePayload(payload) {
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
    metadata,
  };
}

export function validateRegisterPayload(payload) {
  const username = normalizeUsername(payload?.username);
  const password = normalizePassword(payload?.password);

  return {
    username,
    email: buildInternalEmail(username),
    displayName: username,
    password,
    organization: "",
  };
}

export function validateLoginPayload(payload) {
  const username = normalizeUsername(payload?.username);
  const password = normalizePassword(payload?.password);
  const otpCode = normalizeOtpCode(payload?.otpCode);
  const recaptchaToken = normalizeCaptchaToken(payload);

  return {
    username,
    password,
    otpCode,
    recaptchaToken,
  };
}

export function normalizeCaptchaToken(payload) {
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
      const maxLength = key === "profileImage" ? 250000 : 1000;
      result[key] = value.trim().slice(0, maxLength);
    }
  }

  return result;
}

function normalizeEmail(value) {
  const normalized = normalizeString(value).toLowerCase();
  if (!normalized) {
    throw new HttpError(400, "Email is required.");
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    throw new HttpError(400, "Email is invalid.");
  }

  return normalized.slice(0, 160);
}

export function normalizePassword(value) {
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
  return String(value || "")
    .replace(/\s+/g, "")
    .trim()
    .slice(0, 12);
}

function buildInternalEmail(username) {
  return `${username}@users.civic.local`;
}
