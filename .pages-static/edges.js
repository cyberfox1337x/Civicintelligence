import { isPrivilegedRole } from "./auth.js";
import { ensureBoardOwnershipSchema } from "./boards.js";

function mapEdge(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    boardId: row.board_id,
    sourceNodeId: row.source_node_id,
    targetNodeId: row.target_node_id,
    label: row.label || "",
    metadata: parseMetadata(row.metadata),
    createdAt: row.created_at,
  };
}

function parseMetadata(value) {
  if (!value) {
    return {};
  }

  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
}

export async function listEdgesByBoardForUser(db, boardId, user) {
  await ensureBoardOwnershipSchema(db);

  const { results } = await db
    .prepare(
      `
        SELECT
          edges.id,
          edges.board_id,
          edges.source_node_id,
          edges.target_node_id,
          edges.label,
          edges.metadata,
          edges.created_at
        FROM edges
        INNER JOIN boards ON boards.id = edges.board_id
        WHERE edges.board_id = ?
          AND (boards.owner_user_id = ? OR (boards.owner_user_id IS NULL AND ? = 1))
        ORDER BY edges.created_at ASC
      `,
    )
    .bind(boardId, user.id, canAccessLegacyBoards(user) ? 1 : 0)
    .all();

  return results.map(mapEdge);
}

export async function findEdge(db, boardId, sourceNodeId, targetNodeId) {
  const row = await db
    .prepare(
      `
        SELECT
          id,
          board_id,
          source_node_id,
          target_node_id,
          label,
          metadata,
          created_at
        FROM edges
        WHERE board_id = ?
          AND source_node_id = ?
          AND target_node_id = ?
        LIMIT 1
      `,
    )
    .bind(boardId, sourceNodeId, targetNodeId)
    .first();

  return mapEdge(row);
}

export async function getEdgeByIdForUser(db, edgeId, user) {
  await ensureBoardOwnershipSchema(db);

  const row = await db
    .prepare(
      `
        SELECT
          edges.id,
          edges.board_id,
          edges.source_node_id,
          edges.target_node_id,
          edges.label,
          edges.metadata,
          edges.created_at
        FROM edges
        INNER JOIN boards ON boards.id = edges.board_id
        WHERE edges.id = ?
          AND (boards.owner_user_id = ? OR (boards.owner_user_id IS NULL AND ? = 1))
        LIMIT 1
      `,
    )
    .bind(edgeId, user.id, canAccessLegacyBoards(user) ? 1 : 0)
    .first();

  return mapEdge(row);
}

export async function createEdge(db, edge) {
  await db
    .prepare(
      `
        INSERT INTO edges (
          id,
          board_id,
          source_node_id,
          target_node_id,
          label,
          metadata,
          created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
    )
    .bind(
      edge.id,
      edge.boardId,
      edge.sourceNodeId,
      edge.targetNodeId,
      edge.label,
      JSON.stringify(edge.metadata || {}),
      edge.createdAt,
    )
    .run();

  return findEdge(db, edge.boardId, edge.sourceNodeId, edge.targetNodeId);
}

export async function deleteEdge(db, edgeId) {
  const row = await db
    .prepare(
      `
        SELECT board_id
        FROM edges
        WHERE id = ?
        LIMIT 1
      `,
    )
    .bind(edgeId)
    .first();

  await db
    .prepare(
      `
        DELETE FROM edges
        WHERE id = ?
      `,
    )
    .bind(edgeId)
    .run();

  return row?.board_id || null;
}

function canAccessLegacyBoards(user) {
  return isPrivilegedRole(user?.role);
}
