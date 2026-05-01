# Backend (Cloudflare Pages Functions + D1)

## Overview

This folder holds shared backend behavior for a Cloudflare Pages + D1 application.

`functions/api/` is the deployed HTTP boundary.
`backend/` is where reusable backend logic and D1 guidance live.

All database access must follow D1 constraints and best practices.

Use this file together with:
- `../skills/auth-build/SKILL.md`
- `../skills/deploy-build/SKILL.md`
- `../skills/d1-build/SKILL.md`
- `../skills/test-build/SKILL.md`
- `../agents/d1.md`
- `../rules/d1.md`
- `../skills/d1-review/SKILL.md`

## Environment

- Platform: Cloudflare Pages Functions running on Workers
- Database: Cloudflare D1 (SQLite)
- No traditional server
- Stateless request handling

## Backend Layout

- `db/` owns schema, migrations, and D1 query helpers.
- `api/` is reserved for extracted backend orchestration when route files need a middle layer.
- `functions/api/` should stay focused on HTTP concerns and call into shared backend code when useful.

## D1 Query Rules

- Always use parameterized queries.
- Never build SQL using string concatenation.
- Prefer `prepare().bind().all()` or `.first()`.
- Keep queries explicit and easy to read.
- Select only the columns you need.
- Add `LIMIT` when a query should return a bounded result.

Example:

```js
const stmt = env.DB.prepare(
  "SELECT * FROM users WHERE id = ?"
).bind(userId)

const result = await stmt.first()
```

## Data Access Guidance

- Keep SQL close to the code that owns the behavior.
- Reuse query helpers only when the abstraction stays simple.
- Prefer small focused queries over generic query builders.
- Validate inputs before they reach database calls.
- Handle missing rows and empty results explicitly.
- Keep HTTP-specific parsing and response shaping out of database modules.

## Write Safety

- Treat writes as user-impacting operations.
- Validate identifiers, ownership, and permissions before writes.
- Avoid multi-step write flows unless each step is necessary.
- Keep mutations scoped and predictable.
- Do not rely on implicit ordering without `ORDER BY`.

## Performance Notes

- Avoid repeated queries inside loops.
- Prefer indexed lookup patterns where possible.
- Fetch only required rows and columns.
- Be careful with unbounded scans on request paths.
- Keep Pages Function handlers fast and deterministic.

## Security Notes

- Never trust request input.
- Enforce authorization on the server side.
- Do not expose raw database errors to clients.
- Keep secrets and tokens out of logs and responses.
- Use safe defaults for any admin or destructive route.

## Review Checklist

When reviewing backend changes:
1. Check request validation.
2. Check authorization and ownership rules.
3. Check SQL parameterization.
4. Check query shape, bounds, and likely performance.
5. Check error handling and response safety.
6. Suggest the smallest safe fix.

## Build Checklist

When implementing backend changes:
1. Decide whether the logic belongs in `functions/api`, `backend/api`, or `db`.
2. Keep D1 access parameterized and easy to trace.
3. Add explicit bounds, ordering, and result handling where needed.
4. Enforce authorization in server-side code when the backend owns the rule.
5. Validate write preconditions before mutations.
6. Call out migration or rollout ordering when backend changes affect deployment.
7. Keep the backend layer small, predictable, and audit-friendly.
