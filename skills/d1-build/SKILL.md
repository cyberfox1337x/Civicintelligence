---
name: d1-build
description: Use when building or modifying Cloudflare D1 schema, migrations, query helpers, repository modules, or D1-backed backend behavior. Use for implementation tasks involving `env.DB`, SQL reads or writes, pagination, filtering, or D1-backed data access.
---

# D1 Build Skill

## Goal

Build D1 access patterns that are safe, bounded, easy to audit, and practical for Cloudflare Workers.

## Steps

1. Define the query shape, inputs, and expected result before writing SQL.
2. Use `prepare(...).bind(...)` for every dynamic value.
3. Select only required columns and add `ORDER BY` and `LIMIT` when result shape depends on them.
4. Keep SQL close to the behavior that owns it instead of hiding it behind generic builders.
5. Validate identifiers, ownership, and write preconditions before mutations.
6. Handle empty results, failed statements, and repeated-query risks explicitly.

## Starter Assets

If the data layer is still empty, use `assets/d1-starter/` for a small schema and repository pattern that matches this repo's guidance.

## Deliverable

Ship query code or schema changes that are parameterized, bounded, and easy to trace from request to database behavior.

## Avoid

- SQL built with concatenation or interpolation
- `SELECT *` when a narrow projection is enough
- repeated D1 calls inside loops
- write flows that skip validation, ownership checks, or predictable ordering
