# Functions API

This folder maps deployed `/api/*` routes to Cloudflare Pages Function entrypoints.

Use `../../skills/auth-build/SKILL.md` when the route owns auth or permission checks.
Use `../../skills/api-build/SKILL.md` when the task is primarily about implementing a route.
Use `../../skills/test-build/SKILL.md` when the task is primarily about validating route behavior.


Keep each route file thin:

- dispatch on method
- parse params and request bodies
- validate input
- call backend modules
- return safe HTTP responses

If a route grows beyond request and response handling, move shared orchestration into `../../backend/api` and keep low-level SQL in `../../backend/db`.
