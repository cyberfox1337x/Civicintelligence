import { getBoardByIdForUser, touchBoard } from "../../boards.js";
import { createNode, deleteNode, getNodeByIdForBoard, getNodeByIdForUser, updateNode } from "../../nodes.js";
import { requireAuthenticatedUser } from "../../auth.js";
import { handleOptions, HttpError, jsonResponse, readJsonBody, respondWithError } from "../../shared/http.js";
import { requireId, validateNodePayload } from "../../shared/validators.js";

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method === "OPTIONS") {
    return handleOptions();
  }

  try {
    const user = await requireAuthenticatedUser(request, env.DB);

    const url = new URL(request.url);
    const nodeId = String(url.searchParams.get("id") || "").trim();

    if (request.method === "POST") {
      const rawPayload = await readJsonBody(request);
      const boardId = requireId(rawPayload?.boardId, "boardId");
      const board = await getBoardByIdForUser(env.DB, boardId, user);
      if (!board) {
        throw new HttpError(404, "Board not found.");
      }

      const payload = validateNodePayload(rawPayload);
      const now = new Date().toISOString();
      const node = await createNode(env.DB, {
        id: crypto.randomUUID(),
        boardId,
        type: payload.type,
        label: payload.label,
        x: payload.x,
        y: payload.y,
        metadata: payload.metadata,
        createdAt: now,
        updatedAt: now,
      });

      await touchBoard(env.DB, boardId, now);
      return jsonResponse({ node }, 201);
    }

    if (request.method === "PATCH") {
      const id = requireId(nodeId, "Node id");
      const existing = await getNodeByIdForUser(env.DB, id, user);
      if (!existing) {
        throw new HttpError(404, "Node not found.");
      }

      const payload = validateNodePayload(await readJsonBody(request), { partial: true });
      const now = new Date().toISOString();
      const node = await updateNode(env.DB, {
        id,
        boardId: existing.boardId,
        type: payload.type ?? existing.type,
        label: payload.label ?? existing.label,
        x: payload.x ?? existing.x,
        y: payload.y ?? existing.y,
        metadata: payload.metadata ?? existing.metadata,
        updatedAt: now,
      });
      const refreshedNode = await getNodeByIdForBoard(env.DB, node.id, existing.boardId);

      await touchBoard(env.DB, existing.boardId, now);
      return jsonResponse({ node: refreshedNode });
    }

    if (request.method === "DELETE") {
      const id = requireId(nodeId, "Node id");
      const existing = await getNodeByIdForUser(env.DB, id, user);
      if (!existing) {
        throw new HttpError(404, "Node not found.");
      }

      await deleteNode(env.DB, id);
      await touchBoard(env.DB, existing.boardId, new Date().toISOString());
      return jsonResponse({ success: true });
    }

    throw new HttpError(405, "Method not allowed.");
  } catch (error) {
    return respondWithError(error);
  }
}
