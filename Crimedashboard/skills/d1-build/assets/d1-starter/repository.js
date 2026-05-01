export async function listItems(db, { limit = 50 } = {}) {
  const result = await db
    .prepare(
      `
        SELECT id, name, created_at AS createdAt, updated_at AS updatedAt
        FROM items
        ORDER BY created_at DESC
        LIMIT ?
      `,
    )
    .bind(limit)
    .all();

  return result.results || [];
}

export async function getItemById(db, itemId) {
  return await db
    .prepare(
      `
        SELECT id, name, created_at AS createdAt, updated_at AS updatedAt
        FROM items
        WHERE id = ?
      `,
    )
    .bind(itemId)
    .first();
}

export async function createItem(db, item) {
  await db
    .prepare(
      `
        INSERT INTO items (id, name, created_at, updated_at)
        VALUES (?, ?, ?, ?)
      `,
    )
    .bind(item.id, item.name, item.createdAt, item.updatedAt)
    .run();

  return await getItemById(db, item.id);
}
