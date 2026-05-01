import { isPrivilegedRole } from "./auth.js";
import { ensureBoardOwnershipSchema } from "./boards.js";

function mapNode(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    boardId: row.board_id,
    type: row.type,
    label: row.label,
    x: Number(row.x),
    y: Number(row.y),
    metadata: parseMetadata(row.metadata),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
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

export async function listNodesByBoardForUser(db, boardId, user) {
  await ensureBoardOwnershipSchema(db);

  const { results } = await db
    .prepare(
      `
        SELECT
          nodes.id,
          nodes.board_id,
          nodes.type,
          nodes.label,
          nodes.x,
          nodes.y,
          nodes.metadata,
          nodes.created_at,
          nodes.updated_at
        FROM nodes
        INNER JOIN boards ON boards.id = nodes.board_id
        WHERE nodes.board_id = ?
          AND (boards.owner_user_id = ? OR (boards.owner_user_id IS NULL AND ? = 1))
        ORDER BY nodes.created_at ASC
      `,
    )
    .bind(boardId, user.id, canAccessLegacyBoards(user) ? 1 : 0)
    .all();

  return results.map(mapNode);
}

export async function getNodeByIdForUser(db, nodeId, user) {
  await ensureBoardOwnershipSchema(db);

  const row = await db
    .prepare(
      `
        SELECT
          nodes.id,
          nodes.board_id,
          nodes.type,
          nodes.label,
          nodes.x,
          nodes.y,
          nodes.metadata,
          nodes.created_at,
          nodes.updated_at
        FROM nodes
        INNER JOIN boards ON boards.id = nodes.board_id
        WHERE nodes.id = ?
          AND (boards.owner_user_id = ? OR (boards.owner_user_id IS NULL AND ? = 1))
        LIMIT 1
      `,
    )
    .bind(nodeId, user.id, canAccessLegacyBoards(user) ? 1 : 0)
    .first();

  return mapNode(row);
}

export async function getNodeByIdForBoard(db, nodeId, boardId) {
  const row = await db
    .prepare(
      `
        SELECT
          id,
          board_id,
          type,
          label,
          x,
          y,
          metadata,
          created_at,
          updated_at
        FROM nodes
        WHERE id = ?
          AND board_id = ?
        LIMIT 1
      `,
    )
    .bind(nodeId, boardId)
    .first();

  return mapNode(row);
}

export async function createNode(db, node) {
  await db
    .prepare(
      `
        INSERT INTO nodes (
          id,
          board_id,
          type,
          label,
          x,
          y,
          metadata,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
    )
    .bind(
      node.id,
      node.boardId,
      node.type,
      node.label,
      node.x,
      node.y,
      JSON.stringify(node.metadata || {}),
      node.createdAt,
      node.updatedAt,
    )
    .run();

  return getNodeByIdForBoard(db, node.id, node.boardId);
}

export async function updateNode(db, node) {
  await db
    .prepare(
      `
        UPDATE nodes
        SET
          type = ?,
          label = ?,
          x = ?,
          y = ?,
          metadata = ?,
          updated_at = ?
        WHERE id = ?
      `,
    )
    .bind(
      node.type,
      node.label,
      node.x,
      node.y,
      JSON.stringify(node.metadata || {}),
      node.updatedAt,
      node.id,
    )
    .run();

  return getNodeByIdForBoard(db, node.id, node.boardId);
}

export async function deleteNode(db, nodeId) {
  await db
    .prepare(
      `
        DELETE FROM edges
        WHERE source_node_id = ? OR target_node_id = ?
      `,
    )
    .bind(nodeId, nodeId)
    .run();

  await db
    .prepare(
      `
        DELETE FROM nodes
        WHERE id = ?
      `,
    )
    .bind(nodeId)
    .run();
}

function canAccessLegacyBoards(user) {
  return isPrivilegedRole(user?.role);
}
