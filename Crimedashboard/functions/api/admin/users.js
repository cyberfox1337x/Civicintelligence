import { createUser, deleteUser, getUserById, getUserByUsername, recordAuthEvent, updateUserBanStatus } from "../../../users.js";
import { createPasswordRecord } from "../../../auth.js";
import {
  handleOptions,
  HttpError,
  jsonResponse,
  readJsonBody,
  respondWithError,
} from "../../../shared/http.js";
import { isPrivilegedRole, requireOwnerUser } from "../../../auth.js";
import { getRequestMetadata } from "../../../shared/request-metadata.js";
import { normalizePassword } from "../../../shared/validators.js";

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method === "OPTIONS") {
    return handleOptions();
  }

  try {
    const owner = await requireOwnerUser(request, env.DB);
    const url = new URL(request.url);
    const userId = String(url.searchParams.get("id") || "").trim();

    if (request.method === "POST") {
      const payload = await readJsonBody(request);
      const username = String(payload?.username || "").trim().toLowerCase();
      const password = normalizePassword(payload?.password);

      if (username.length < 3) {
        throw new HttpError(400, "Username must be at least 3 characters.");
      }

      const existingUser = await getUserByUsername(env.DB, username);
      if (existingUser) {
        throw new HttpError(409, "That username is already in use.");
      }

      const now = Date.now();
      const passwordRecord = await createPasswordRecord(password);
      const user = await createUser(env.DB, {
        id: crypto.randomUUID(),
        username,
        email: `${username}@users.civic.local`,
        displayName: username,
        organization: "",
        passwordHash: passwordRecord.passwordHash,
        passwordSalt: passwordRecord.salt,
        banned: false,
        role: "normal user",
        profileImage: "",
        createdAt: now,
        updatedAt: now,
      });

      await recordAuthEvent(env.DB, {
        id: crypto.randomUUID(),
        eventType: "admin_user_created",
        username: owner.username,
        userId: owner.id,
        ...getRequestMetadata(request, { eventType: "admin_user_created", user: owner }),
        createdAt: now,
        message: `Created user ${user.username}.`,
      });

      return jsonResponse({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          displayName: user.displayName,
          organization: user.organization,
          role: user.role,
          banned: user.banned,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      }, 201);
    }

    if (request.method === "PATCH") {
      if (!userId) {
        throw new HttpError(400, "User id is required.");
      }

      const existingUser = await getUserById(env.DB, userId);
      if (!existingUser) {
        throw new HttpError(404, "User not found.");
      }

      if (isPrivilegedRole(existingUser.role)) {
        throw new HttpError(403, "Privileged accounts cannot be moderated here.");
      }

      const updatedUser = await updateUserBanStatus(env.DB, userId, !existingUser.banned);
      await recordAuthEvent(env.DB, {
        id: crypto.randomUUID(),
        eventType: updatedUser.banned ? "admin_user_banned" : "admin_user_restored",
        username: owner.username,
        userId: owner.id,
        ...getRequestMetadata(request, { eventType: updatedUser.banned ? "admin_user_banned" : "admin_user_restored", user: owner }),
        createdAt: Date.now(),
        message: `${updatedUser.banned ? "Banned" : "Restored"} user ${updatedUser.username}.`,
      });

      return jsonResponse({
        user: {
          id: updatedUser.id,
          username: updatedUser.username,
          email: updatedUser.email,
          displayName: updatedUser.displayName,
          organization: updatedUser.organization,
          role: updatedUser.role,
          banned: updatedUser.banned,
          createdAt: updatedUser.createdAt,
          updatedAt: updatedUser.updatedAt,
        },
      });
    }

    if (request.method === "DELETE") {
      if (!userId) {
        throw new HttpError(400, "User id is required.");
      }

      const existingUser = await getUserById(env.DB, userId);
      if (!existingUser) {
        throw new HttpError(404, "User not found.");
      }

      if (isPrivilegedRole(existingUser.role)) {
        throw new HttpError(403, "Privileged accounts cannot be removed here.");
      }

      const deletedUser = await deleteUser(env.DB, userId);
      await recordAuthEvent(env.DB, {
        id: crypto.randomUUID(),
        eventType: "admin_user_removed",
        username: owner.username,
        userId: owner.id,
        ...getRequestMetadata(request, { eventType: "admin_user_removed", user: owner }),
        createdAt: Date.now(),
        message: `Removed user ${deletedUser.username}.`,
      });

      return jsonResponse({ success: true, userId: deletedUser.id });
    }

    throw new HttpError(405, "Method not allowed.");
  } catch (error) {
    return respondWithError(error);
  }
}
