import { isPrivilegedRole } from "./auth.js";

let boardOwnershipSchemaReady = false;

function mapBoard(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    name: row.name,
    description: row.description || "",
    iconEmoji: row.icon_emoji || "\u{1F4C1}",
    accentColor: row.accent_color || "#63b6ff",
    status: row.status || "active",
    nodeCount: Number(row.node_count || 0),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listBoardsForUser(db, user) {
  await ensureBoardOwnershipSchema(db);

  const { results } = await db
    .prepare(
      `
        SELECT
          boards.id,
          boards.name,
          boards.description,
          boards.icon_emoji,
          boards.accent_color,
          boards.status,
          boards.created_at,
          boards.updated_at,
          COUNT(nodes.id) AS node_count
        FROM boards
        LEFT JOIN nodes ON nodes.board_id = boards.id
        WHERE boards.owner_user_id = ?
          OR (boards.owner_user_id IS NULL AND ? = 1)
        GROUP BY boards.id
        ORDER BY boards.updated_at DESC
      `,
    )
    .bind(user.id, canAccessLegacyBoards(user) ? 1 : 0)
    .all();

  return results.map(mapBoard);
}

export async function getBoardByIdForUser(db, boardId, user) {
  await ensureBoardOwnershipSchema(db);

  const row = await db
    .prepare(
      `
        SELECT
          id,
          name,
          description,
          icon_emoji,
          accent_color,
          status,
          created_at,
          updated_at
        FROM boards
        WHERE id = ?
          AND (owner_user_id = ? OR (owner_user_id IS NULL AND ? = 1))
        LIMIT 1
      `,
    )
    .bind(boardId, user.id, canAccessLegacyBoards(user) ? 1 : 0)
    .first();

  return mapBoard(row);
}

export async function createBoard(db, board) {
  await ensureBoardOwnershipSchema(db);

  await db
    .prepare(
      `
        INSERT INTO boards (
          id,
          name,
          description,
          icon_emoji,
          accent_color,
          owner_user_id,
          status,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
    )
    .bind(
      board.id,
      board.name,
      board.description,
      board.iconEmoji,
      board.accentColor,
      board.ownerUserId,
      board.status,
      board.createdAt,
      board.updatedAt,
    )
    .run();

  return getBoardByIdForUser(db, board.id, {
    id: board.ownerUserId,
    role: board.ownerRole || "",
  });
}

export async function updateBoardForUser(db, board, user) {
  await ensureBoardOwnershipSchema(db);

  await db
    .prepare(
      `
        UPDATE boards
        SET
          name = ?,
          description = ?,
          icon_emoji = ?,
          accent_color = ?,
          status = ?,
          updated_at = ?
        WHERE id = ?
      `,
    )
    .bind(
      board.name,
      board.description,
      board.iconEmoji,
      board.accentColor,
      board.status,
      board.updatedAt,
      board.id,
    )
    .run();

  return getBoardByIdForUser(db, board.id, user);
}

export async function deleteBoardForUser(db, boardId, user) {
  const existing = await getBoardByIdForUser(db, boardId, user);
  if (!existing) {
    return null;
  }

  await db
    .prepare(
      `
        DELETE FROM boards
        WHERE id = ?
      `,
    )
    .bind(boardId)
    .run();

  return existing;
}

export async function touchBoard(db, boardId, updatedAt) {
  await ensureBoardOwnershipSchema(db);

  await db
    .prepare(
      `
        UPDATE boards
        SET updated_at = ?
        WHERE id = ?
      `,
    )
    .bind(updatedAt, boardId)
    .run();
}

function canAccessLegacyBoards(user) {
  return isPrivilegedRole(user?.role);
}

export async function ensureBoardOwnershipSchema(db) {
  if (boardOwnershipSchemaReady) {
    return;
  }

  try {
    await db.prepare(`ALTER TABLE boards ADD COLUMN owner_user_id TEXT`).run();
  } catch (error) {
    const message = String(error?.message || "");
    if (!/duplicate column name/i.test(message)) {
      throw error;
    }
  }

  await db
    .prepare(
      `
        CREATE INDEX IF NOT EXISTS idx_boards_owner_user_id
        ON boards(owner_user_id)
      `,
    )
    .run();

  boardOwnershipSchemaReady = true;
}
