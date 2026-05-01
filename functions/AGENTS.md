# Functions (Cloudflare Pages Functions)

## Purpose

This folder contains deployed HTTP entrypoints.
Each file is the route boundary for a Cloudflare Pages Function.

Use this file together with:
- `../skills/auth-build/SKILL.md`
- `../skills/api-build/SKILL.md`
- `../skills/test-build/SKILL.md`
- `../agents/security.md`
- `../agents/performance.md`
- `../rules/security.md`
- `../rules/performance.md`
- `../backend/AGENTS.md` when the route touches shared backend logic or D1

## Responsibilities

- parse request methods, params, and body
- validate and normalize input
- enforce auth and permission boundaries when the route owns them
- call backend or data modules
- map failures to safe HTTP responses
- keep route handlers thin and deterministic

## Boundaries

- Put reusable query logic in `../backend/db`.
- Put extracted backend orchestration in `../backend/api` if a route becomes too large.
- Do not duplicate validation or SQL across multiple routes.
- Do not leak raw exceptions, stack traces, or database errors.

## Review Checklist

1. Check allowed methods and route shape.
2. Check input validation and authorization.
3. Check response codes and error handling.
4. Check repeated work, query count, and D1 safety.
5. Suggest the smallest safe fix.

## Build Checklist

1. Define the route contract before writing the handler.
2. Keep parsing, validation, and response shaping at the route boundary.
3. Apply authentication and authorization at the server boundary when the route is sensitive.
4. Move reusable orchestration to `../backend/api` only when repetition appears.
5. Keep SQL and table-specific logic out of route files.
6. Return explicit status codes and safe error responses.
