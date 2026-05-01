---
name: api-build
description: Use when building or modifying Cloudflare Pages Function routes, request validation, method handling, response shaping, or route-to-backend wiring. Use for implementation tasks in `functions/` and `functions/api/`, not just API reviews.
---

# API Build Skill

## Goal

Build thin, safe HTTP route handlers that validate input early and delegate reusable behavior to backend code.

## Steps

1. Define the route contract: methods, params, body shape, and response shape.
2. Keep method dispatch, request parsing, and response shaping in the route file.
3. Validate and normalize input before calling backend or database code.
4. Move reusable orchestration into `backend/api` when route logic starts repeating.
5. Keep SQL and table-specific data access out of route files.
6. Return explicit status codes and safe error messages.

## Starter Assets

If the route starts from scratch, use `assets/pages-function-starter/route.js` as a thin Pages Function template and replace the placeholder contract with the real one.

## Deliverable

Ship a route handler that is easy to audit, thin at the HTTP boundary, and wired to the correct backend layer.

## Avoid

- duplicating validation or SQL across route files
- leaking raw exceptions, stack traces, or database errors
- mixing HTTP concerns with table-specific query logic
- adding broad abstractions before repeated route patterns actually exist
