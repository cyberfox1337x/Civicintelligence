# Skills

This folder defines reusable implementation and review workflows.

Each skill answers: "How should Codex execute this task?"

- `auth-build/`: build workflow for auth, sessions, identity, and permission boundaries
- `frontend-build/`: build workflow for browser UI, client state, forms, and `/api` wiring
- `api-build/`: build workflow for Cloudflare Pages Function route handlers and HTTP boundaries
- `d1-build/`: build workflow for D1 schema, queries, and data-access code
- `test-build/`: build workflow for focused tests, smoke checks, and regression protection
- `deploy-build/`: build workflow for env config, Wrangler, release prep, and rollout checks
- `code-review/`: general code-quality review workflow
- `frontend-review/`: frontend review workflow for accessibility, state, and UI behavior
- `performance-review/`: performance review workflow for hot paths and repeated work
- `security-review/`: security review workflow for trust boundaries and vulnerabilities
- `d1-review/`: D1 review workflow for query safety and efficiency

Skills should stay practical:

- focus on meaningful findings
- keep build steps aligned with the owning layer
- reuse starter assets when bootstrapping a new layer from zero
- avoid unsupported speculation
- prefer the smallest safe fix
