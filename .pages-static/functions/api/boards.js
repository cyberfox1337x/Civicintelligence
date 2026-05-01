import {
  createBoard,
  deleteBoardForUser,
  getBoardByIdForUser,
  listBoardsForUser,
  updateBoardForUser,
} from "../../boards.js";
import { listEdgesByBoardForUser } from "../../edges.js";
import { listNodesByBoardForUser } from "../../nodes.js";
import { requireAuthenticatedUser } from "../../auth.js";
import { handleOptions, HttpError, jsonResponse, readJsonBody, respondWithError } from "../../shared/http.js";
import { requireId, validateBoardPayload } from "../../shared/validators.js";

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method === "OPTIONS") {
    return handleOptions();
  }

  try {
    const user = await requireAuthenticatedUser(request, env.DB);

    const url = new URL(request.url);
    const boardId = String(url.searchParams.get("id") || "").trim();

    if (request.method === "GET") {
      if (!boardId) {
        const boards = await listBoardsForUser(env.DB, user);
        return jsonResponse({ boards });
      }

      const board = await getBoardByIdForUser(env.DB, boardId, user);
      if (!board) {
        throw new HttpError(404, "Board not found.");
      }

      const [nodes, edges] = await Promise.all([
        listNodesByBoardForUser(env.DB, boardId, user),
        listEdgesByBoardForUser(env.DB, boardId, user),
      ]);

      return jsonResponse({ board, nodes, edges });
    }

    if (request.method === "POST") {
      const payload = validateBoardPayload(await readJsonBody(request));
      const now = new Date().toISOString();
      const board = await createBoard(env.DB, {
        id: crypto.randomUUID(),
        ...payload,
        ownerUserId: user.id,
        ownerRole: user.role,
        createdAt: now,
        updatedAt: now,
      });

      return jsonResponse({ board }, 201);
    }

    if (request.method === "PATCH") {
      const id = requireId(boardId, "Board id");
      const existing = await getBoardByIdForUser(env.DB, id, user);
      if (!existing) {
        throw new HttpError(404, "Board not found.");
      }

      const payload = validateBoardPayload(await readJsonBody(request));
      const board = await updateBoardForUser(env.DB, {
        id,
        name: payload.name,
        description: payload.description,
        iconEmoji: payload.iconEmoji,
        accentColor: payload.accentColor,
        status: payload.status,
        updatedAt: new Date().toISOString(),
      }, user);

      return jsonResponse({ board });
    }

    if (request.method === "DELETE") {
      const id = requireId(boardId, "Board id");
      const board = await deleteBoardForUser(env.DB, id, user);
      if (!board) {
        throw new HttpError(404, "Board not found.");
      }

      return jsonResponse({ success: true, board });
    }

    throw new HttpError(405, "Method not allowed.");
  } catch (error) {
    return respondWithError(error);
  }
}
