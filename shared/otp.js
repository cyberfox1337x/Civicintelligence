const OTP_DIGITS = 6;
const OTP_PERIOD_SECONDS = 30;
const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export function generateOtpSecret(length = 20) {
  return encodeBase32(crypto.getRandomValues(new Uint8Array(length)));
}

export function normalizeOtpCode(value) {
  return String(value || "").replace(/\s+/g, "").trim();
}

export async function verifyTotpCode(secret, code, options = {}) {
  const normalizedSecret = String(secret || "").trim();
  const normalizedCode = normalizeOtpCode(code);
  if (!normalizedSecret || !/^\d{6}$/.test(normalizedCode)) {
    return false;
  }

  const timestamp = Number(options.timestamp || Date.now());
  const window = Number.isFinite(options.window) ? Number(options.window) : 1;
  for (let offset = -window; offset <= window; offset += 1) {
    const expectedCode = await generateTotpCode(normalizedSecret, timestamp + offset * OTP_PERIOD_SECONDS * 1000);
    if (expectedCode === normalizedCode) {
      return true;
    }
  }

  return false;
}

export function buildOtpAuthUrl({ secret, username, issuer = "Civic Intelligence" }) {
  const label = `${issuer}:${username}`;
  const params = new URLSearchParams({
    secret,
    issuer,
    algorithm: "SHA1",
    digits: String(OTP_DIGITS),
    period: String(OTP_PERIOD_SECONDS),
  });

  return `otpauth://totp/${encodeURIComponent(label)}?${params.toString()}`;
}

async function generateTotpCode(secret, timestamp) {
  const counter = Math.floor(timestamp / 1000 / OTP_PERIOD_SECONDS);
  const keyBytes = decodeBase32(secret);
  const key = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"],
  );

  const counterBuffer = new ArrayBuffer(8);
  const counterView = new DataView(counterBuffer);
  const high = Math.floor(counter / 0x100000000);
  const low = counter >>> 0;
  counterView.setUint32(0, high);
  counterView.setUint32(4, low);

  const signature = new Uint8Array(await crypto.subtle.sign("HMAC", key, counterBuffer));
  const offset = signature[signature.length - 1] & 0x0f;
  const binaryCode =
    ((signature[offset] & 0x7f) << 24) |
    ((signature[offset + 1] & 0xff) << 16) |
    ((signature[offset + 2] & 0xff) << 8) |
    (signature[offset + 3] & 0xff);

  return String(binaryCode % 10 ** OTP_DIGITS).padStart(OTP_DIGITS, "0");
}

function encodeBase32(bytes) {
  let bits = 0;
  let value = 0;
  let output = "";

  for (const byte of bytes) {
    value = (value << 8) | byte;
    bits += 8;

    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }

  return output;
}

function decodeBase32(value) {
  const normalized = String(value || "")
    .toUpperCase()
    .replace(/=+$/g, "")
    .replace(/[^A-Z2-7]/g, "");

  let bits = 0;
  let buffer = 0;
  const bytes = [];

  for (const character of normalized) {
    const index = BASE32_ALPHABET.indexOf(character);
    if (index < 0) {
      continue;
    }

    buffer = (buffer << 5) | index;
    bits += 5;

    if (bits >= 8) {
      bytes.push((buffer >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }

  return new Uint8Array(bytes);
}
