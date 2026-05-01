# Backend DB

This directory owns D1 schema, migrations, and query helpers.

Put here:
- schema files and migrations
- small query modules close to the tables they own
- helpers that wrap `env.DB.prepare(...).bind(...)`

Keep out of this folder:
- request parsing and HTTP response handling
- browser-facing shaping logic
- generic abstractions that make SQL harder to audit

Review guidance:
- follow `../AGENTS.md`
- use `../../skills/deploy-build/SKILL.md` when schema changes affect rollout order or environment setup
- use `../../skills/d1-build/SKILL.md` when the task is primarily about implementing D1 access
- use `../../skills/test-build/SKILL.md` when the task is primarily about validating D1 behavior
- apply `../../agents/d1.md`
- apply `../../rules/d1.md`
- use `../../skills/d1-review/SKILL.md` when the task is primarily about D1
