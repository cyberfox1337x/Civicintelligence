import { requirePrivilegedUser } from "../../../auth.js";
import {
  countAuthEvents,
  getActiveSessionCount,
  listAuthEvents,
  listUsers,
} from "../../../users.js";
import { handleOptions, HttpError, jsonResponse, respondWithError } from "../../../shared/http.js";

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method === "OPTIONS") {
    return handleOptions();
  }

  try {
    await requirePrivilegedUser(request, env.DB);

    if (request.method !== "GET") {
      throw new HttpError(405, "Method not allowed.");
    }

    const [users, events, activeSessions, recentEvents] = await Promise.all([
      listUsers(env.DB),
      listAuthEvents(env.DB, 200),
      getActiveSessionCount(env.DB),
      countAuthEvents(env.DB),
    ]);

    return jsonResponse({
      users: users.map((user) => ({
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        organization: user.organization,
        role: user.role,
        banned: user.banned,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })),
      events,
      stats: {
        activeSessions,
        registeredUsers: users.length,
        recentEvents,
      },
    });
  } catch (error) {
    return respondWithError(error);
  }
}
