import {
  createPasswordRecord,
  getCurrentSessionTokenHash,
  requireAuthenticatedUser,
  verifyPassword,
} from "../../auth.js";
import { buildOtpAuthUrl, generateOtpSecret, verifyTotpCode } from "../../shared/otp.js";
import {
  handleOptions,
  HttpError,
  jsonResponse,
  readJsonBody,
  respondWithError,
} from "../../shared/http.js";
import {
  deleteUserSessionsByUserId,
  getUserById,
  recordAuthEvent,
  updateUserAccount,
} from "../../users.js";
import { getRequestMetadata } from "../../shared/request-metadata.js";

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method === "OPTIONS") {
    return handleOptions();
  }

  try {
    const sessionUser = await requireAuthenticatedUser(request, env.DB);
    const currentSessionTokenHash = await getCurrentSessionTokenHash(request);

    if (request.method !== "PATCH") {
      throw new HttpError(405, "Method not allowed.");
    }

    const payload = await readJsonBody(request);
    const action = String(payload?.action || "").trim().toLowerCase();
    const storedUser = await getUserById(env.DB, sessionUser.id);
    if (!storedUser) {
      throw new HttpError(404, "User not found.");
    }

    if (action === "profile_image") {
      const profileImage = normalizeProfileImage(payload?.profileImage);
      const updatedUser = await updateUserAccount(env.DB, {
        ...storedUser,
        profileImage,
        updatedAt: Date.now(),
      });

      await recordAuthEvent(env.DB, {
        id: crypto.randomUUID(),
        eventType: "account_profile_updated",
        username: updatedUser.username,
        userId: updatedUser.id,
        ...getRequestMetadata(request, { eventType: "account_profile_updated", user: updatedUser }),
        createdAt: Date.now(),
        message: profileImage ? "Updated account profile image." : "Removed account profile image.",
      });

      return jsonResponse({
        success: true,
        user: {
          profileImage: updatedUser.profileImage,
          otpEnabled: updatedUser.otpEnabled,
        },
      });
    }

    if (action === "password") {
      const currentPassword = String(payload?.currentPassword || "");
      const newPassword = String(payload?.newPassword || "");
      const confirmPassword = String(payload?.confirmPassword || "");
      const otpCode = String(payload?.otpCode || "");

      if (!(await verifyPassword(currentPassword, storedUser.passwordSalt, storedUser.passwordHash))) {
        throw new HttpError(401, "Current password is incorrect.");
      }

      if (newPassword.length < 8) {
        throw new HttpError(400, "New password must be at least 8 characters.");
      }

      if (newPassword !== confirmPassword) {
        throw new HttpError(400, "New password confirmation does not match.");
      }

      if (storedUser.otpEnabled) {
        const isValidOtp = await verifyTotpCode(storedUser.otpSecret, otpCode);
        if (!isValidOtp) {
          throw new HttpError(400, "Enter a valid one-time passcode.");
        }
      }

      const passwordRecord = await createPasswordRecord(newPassword);
      const updatedUser = await updateUserAccount(env.DB, {
        ...storedUser,
        passwordHash: passwordRecord.passwordHash,
        passwordSalt: passwordRecord.salt,
        updatedAt: Date.now(),
      });
      await deleteUserSessionsByUserId(env.DB, updatedUser.id, {
        exceptTokenHash: currentSessionTokenHash,
      });

      await recordAuthEvent(env.DB, {
        id: crypto.randomUUID(),
        eventType: "account_password_updated",
        username: updatedUser.username,
        userId: updatedUser.id,
        ...getRequestMetadata(request, { eventType: "account_password_updated", user: updatedUser }),
        createdAt: Date.now(),
        message: "Updated account password.",
      });

      return jsonResponse({
        success: true,
        user: {
          profileImage: updatedUser.profileImage,
          otpEnabled: updatedUser.otpEnabled,
        },
      });
    }

    if (action === "otp_setup") {
      const currentPassword = String(payload?.currentPassword || "");
      if (!(await verifyPassword(currentPassword, storedUser.passwordSalt, storedUser.passwordHash))) {
        throw new HttpError(401, "Current password is incorrect.");
      }

      const otpSecret = storedUser.otpSecret || generateOtpSecret();
      const updatedUser = await updateUserAccount(env.DB, {
        ...storedUser,
        otpSecret,
        otpEnabled: false,
        updatedAt: Date.now(),
      });

      return jsonResponse({
        success: true,
        secret: updatedUser.otpSecret,
        otpAuthUrl: buildOtpAuthUrl({
          secret: updatedUser.otpSecret,
          username: updatedUser.username,
        }),
        otpEnabled: updatedUser.otpEnabled,
      });
    }

    if (action === "otp_enable") {
      const currentPassword = String(payload?.currentPassword || "");
      const otpCode = String(payload?.otpCode || "");
      if (!(await verifyPassword(currentPassword, storedUser.passwordSalt, storedUser.passwordHash))) {
        throw new HttpError(401, "Current password is incorrect.");
      }

      const otpSecret = storedUser.otpSecret || generateOtpSecret();
      const isValidOtp = await verifyTotpCode(otpSecret, otpCode);
      if (!isValidOtp) {
        throw new HttpError(400, "Enter the current one-time passcode from your authenticator app.");
      }

      const updatedUser = await updateUserAccount(env.DB, {
        ...storedUser,
        otpSecret,
        otpEnabled: true,
        updatedAt: Date.now(),
      });
      await deleteUserSessionsByUserId(env.DB, updatedUser.id, {
        exceptTokenHash: currentSessionTokenHash,
      });

      await recordAuthEvent(env.DB, {
        id: crypto.randomUUID(),
        eventType: "account_otp_enabled",
        username: updatedUser.username,
        userId: updatedUser.id,
        ...getRequestMetadata(request, { eventType: "account_otp_enabled", user: updatedUser }),
        createdAt: Date.now(),
        message: "Enabled one-time passcodes.",
      });

      return jsonResponse({
        success: true,
        otpEnabled: true,
        secret: updatedUser.otpSecret,
      });
    }

    if (action === "otp_disable") {
      const currentPassword = String(payload?.currentPassword || "");
      const otpCode = String(payload?.otpCode || "");
      if (!(await verifyPassword(currentPassword, storedUser.passwordSalt, storedUser.passwordHash))) {
        throw new HttpError(401, "Current password is incorrect.");
      }

      if (storedUser.otpEnabled) {
        const isValidOtp = await verifyTotpCode(storedUser.otpSecret, otpCode);
        if (!isValidOtp) {
          throw new HttpError(400, "Enter a valid one-time passcode to disable it.");
        }
      }

      const updatedUser = await updateUserAccount(env.DB, {
        ...storedUser,
        otpSecret: "",
        otpEnabled: false,
        updatedAt: Date.now(),
      });
      await deleteUserSessionsByUserId(env.DB, updatedUser.id, {
        exceptTokenHash: currentSessionTokenHash,
      });

      await recordAuthEvent(env.DB, {
        id: crypto.randomUUID(),
        eventType: "account_otp_disabled",
        username: updatedUser.username,
        userId: updatedUser.id,
        ...getRequestMetadata(request, { eventType: "account_otp_disabled", user: updatedUser }),
        createdAt: Date.now(),
        message: "Disabled one-time passcodes.",
      });

      return jsonResponse({
        success: true,
        otpEnabled: false,
        secret: "",
      });
    }

    throw new HttpError(400, "Account action is invalid.");
  } catch (error) {
    return respondWithError(error);
  }
}

function normalizeProfileImage(value) {
  const normalized = String(value || "").trim();
  if (!normalized) {
    return "";
  }

  if (!normalized.startsWith("data:image/")) {
    throw new HttpError(400, "Profile image must be a valid image.");
  }

  return normalized.slice(0, 250000);
}
