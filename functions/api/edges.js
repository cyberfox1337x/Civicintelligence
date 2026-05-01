import { createEdge, deleteEdge, findEdge, getEdgeByIdForUser } from "../../edges.js";
import { getBoardByIdForUser, touchBoard } from "../../boards.js";
import { getNodeByIdForBoard } from "../../nodes.js";
import { requireAuthenticatedUser } from "../../auth.js";
import { handleOptions, HttpError, jsonResponse, readJsonBody, respondWithError } from "../../shared/http.js";
import { requireId, validateEdgePayload } from "../../shared/validators.js";

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method === "OPTIONS") {
    return handleOptions();
  }

  try {
    const user = await requireAuthenticatedUser(request, env.DB);

    const url = new URL(request.url);
    const edgeId = String(url.searchParams.get("id") || "").trim();

    if (request.method === "POST") {
      const rawPayload = await readJsonBody(request);
      const boardId = requireId(rawPayload?.boardId, "boardId");
      const board = await getBoardByIdForUser(env.DB, boardId, user);
      if (!board) {
        throw new HttpError(404, "Board not found.");
      }

      const payload = validateEdgePayload(rawPayload);
      const [sourceNode, targetNode] = await Promise.all([
        getNodeByIdForBoard(env.DB, payload.sourceNodeId, boardId),
        getNodeByIdForBoard(env.DB, payload.targetNodeId, boardId),
      ]);

      if (!sourceNode || !targetNode) {
        throw new HttpError(404, "One or more nodes were not found.");
      }

      const existing = await findEdge(env.DB, boardId, payload.sourceNodeId, payload.targetNodeId);
      if (existing) {
        throw new HttpError(409, "That relationship already exists.");
      }

      const now = new Date().toISOString();
      const edge = await createEdge(env.DB, {
        id: crypto.randomUUID(),
        boardId,
        sourceNodeId: payload.sourceNodeId,
        targetNodeId: payload.targetNodeId,
        label: payload.label,
        metadata: payload.metadata,
        createdAt: now,
      });

      await touchBoard(env.DB, boardId, now);
      return jsonResponse({ edge }, 201);
    }

    if (request.method === "DELETE") {
      const id = requireId(edgeId, "Edge id");
      const existing = await getEdgeByIdForUser(env.DB, id, user);
      if (!existing) {
        throw new HttpError(404, "Relationship not found.");
      }

      const boardId = await deleteEdge(env.DB, id);
      if (!boardId) {
        throw new HttpError(404, "Relationship not found.");
      }

      await touchBoard(env.DB, boardId, new Date().toISOString());
      return jsonResponse({ success: true });
    }

    throw new HttpError(405, "Method not allowed.");
  } catch (error) {
    return respondWithError(error);
  }
}
