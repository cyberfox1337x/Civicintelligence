# Codex Workspace Instructions

## Overview

This repository contains reusable build and review guidance for Codex.
The goal is to make implementation work, auth changes, testing, deployment prep, code reviews, performance analysis, frontend checks, and security reviews consistent and predictable.

Use the closest applicable guidance.
Prefer the root instructions first, then more specific directory instructions if present.

## Repository Shape

This repo uses a simple layered model:

- `agents/` defines the review role or perspective.
- `rules/` defines the concrete standards and common mistakes.
- `skills/` defines the workflow and output shape for build or review tasks.
- `frontend/` is the browser-facing UI layer.
- `functions/` is the deployed HTTP route layer for Cloudflare Pages Functions.
- `backend/` is shared backend logic and D1-oriented guidance.

Think of it as:

- agent = what to focus on
- rules = what good looks like
- skill = how to execute the task

If a folder has special constraints, give it a local `AGENTS.md` so the structure explains the idea without extra prompt text.

## Working Style

- Make the smallest correct change.
- Preserve existing architecture unless the task requires change.
- Do not refactor unrelated code.
- Do not rename files, symbols, or modules without a concrete reason.
- Prefer readability over cleverness.
- Follow existing project patterns before introducing new ones.
- When uncertain, inspect nearby files and mirror the established style.

## Build Defaults

For implementation tasks:
1. Identify the owning layer first: `frontend/`, `functions/`, `backend/api/`, or `backend/db/`.
2. Keep browser concerns in `frontend/`.
3. Keep HTTP parsing and response shaping in `functions/`.
4. Keep shared backend orchestration in `backend/api/` only when a middle layer is justified.
5. Keep SQL, schema, and table-specific data access in `backend/db/`.
6. Treat auth, tests, and deployment impact as first-class parts of the feature when they apply.
7. Implement the smallest end-to-end path that fully supports the feature.

## Review Defaults

For any review task:
1. Inspect the requested files and relevant neighbors.
2. Identify the intent of the code before criticizing it.
3. Flag only meaningful issues.
4. Prioritize correctness, security, performance, maintainability, and user impact.
5. Report findings clearly with severity and reasoning.
6. Suggest the smallest practical fix.

## Severity Model

- Critical: exploitable security issue, data loss, outage risk, or severe correctness bug
- High: likely production failure, major performance regression, broken auth, broken data handling
- Medium: maintainability problem, edge-case failure, avoidable inefficiency, accessibility problem
- Low: style issue, minor duplication, weak naming, missing cleanup

## Tool Usage

Use these tools when available:
- Read: inspect files carefully before making claims
- Grep: find usages, patterns, and references
- Glob: discover related files
- Bash: run focused validation commands only when necessary

## Constraints

- Do not claim something is broken unless you can point to code that supports it.
- Do not recommend broad rewrites when a local fix is enough.
- Do not add dependencies unless clearly justified.
- Do not change tests just to make failures disappear.
- Do not remove safeguards, validation, or logging without reason.
- Do not introduce premature abstraction.

## What Good Looks Like

A good output:
- states the problem
- explains why it matters
- points to the relevant code
- proposes a concrete fix
- stays scoped to the task

## Guidance Registry

Agent definitions live here for organization:
- `agents/code.md`
- `agents/d1.md`
- `agents/frontend.md`
- `agents/performance.md`
- `agents/security.md`

Rule references:
- `rules/code-quality.md`
- `rules/d1.md`
- `rules/frontend.md`
- `rules/performance.md`
- `rules/security.md`

Skills:
- `skills/auth-build/SKILL.md`
- `skills/api-build/SKILL.md`
- `skills/code-review/SKILL.md`
- `skills/deploy-build/SKILL.md`
- `skills/d1-build/SKILL.md`
- `skills/d1-review/SKILL.md`
- `skills/frontend-build/SKILL.md`
- `skills/frontend-review/SKILL.md`
- `skills/performance-review/SKILL.md`
- `skills/security-review/SKILL.md`
- `skills/test-build/SKILL.md`

## System Routing

When working in this repository:

- Start with this file for repository-wide defaults.
- Use folder-level `AGENTS.md` files when present.
- Use `/skills/auth-build/SKILL.md` when the task changes identity, sessions, roles, or permission boundaries across layers
- Use `/skills/test-build/SKILL.md` when the task is primarily about adding or updating validation, tests, or smoke checks
- Use `/skills/deploy-build/SKILL.md` when the task is primarily about environment config, Wrangler, bindings, migrations order, or release prep
- Use `/agents/code.md` for general code reviews
- Use `/agents/frontend.md` for UI-related files
- Use `/agents/performance.md` for performance analysis
- Use `/agents/security.md` for security review

When working inside `/frontend`:
- Follow `/frontend/AGENTS.md`
- Apply `/agents/frontend.md`
- Apply `/rules/frontend.md`
- Use `/skills/auth-build/SKILL.md` for sign-in UI, signed-out states, or session-aware frontend behavior
- Use `/skills/frontend-build/SKILL.md` when the task is primarily a frontend implementation
- Use `/skills/frontend-review/SKILL.md` when the task is primarily a frontend review

When working inside `/functions`:
- Follow `/functions/AGENTS.md`
- Apply security and performance rules by default
- Use `/skills/auth-build/SKILL.md` when routes or middleware enforce identity or permissions
- Use `/skills/api-build/SKILL.md` when the task is primarily route or API implementation
- Apply backend and D1 guidance when the route touches `env.DB`

When working inside `/backend`:
- Follow `/backend/AGENTS.md`
- Apply database and API rules
- Use `/skills/auth-build/SKILL.md` when backend logic owns authorization or session behavior
- Use `/skills/d1-build/SKILL.md` for D1-focused implementation work
- Use `/agents/d1.md` for D1-specific query review
- Apply `/rules/d1.md` for D1 query safety and efficiency
- Use `/skills/d1-review/SKILL.md` when the task is primarily about D1 access patterns

## Standard Build Workflow

When asked to implement a feature:
1. Identify the user flow or backend behavior being added.
2. Determine the owning layer and the smallest set of touched files.
3. Add only the wiring each layer owns.
4. Use auth, test, and deploy skills when the feature changes those concerns.
5. Keep route files thin and D1 logic easy to audit.
6. Validate the main success path plus the most important failure path.
7. Leave the repo with clearer boundaries than you found.

## Standard Review Workflow

When asked to review code:
1. Determine the review type: code quality, frontend, performance, or security.
2. Read the relevant agent file and matching rules file.
3. Inspect changed files and their call sites.
4. Check for correctness first.
5. Check for task-specific issues.
6. Return findings ordered by severity, then suggested fixes.

## Review Output Format

Use this structure unless the user asks for something else:

### Summary
Short statement of overall quality and biggest risks.

### Findings
For each finding include:
- Severity
- File or area
- Issue
- Why it matters
- Recommended fix

### Optional Follow-up
- tests to run
- metrics to inspect
- edge cases to verify

## File-Type Routing Guidance

Use these heuristics:
- backend, services, queries, APIs, caching, loops, jobs: performance and security checks
- D1 queries, SQL access, repository helpers, migrations, and data access code: D1, performance, and security checks
- auth, middleware, controllers, tokens, headers, sessions, role checks: `auth-build` plus security checks
- tests, fixtures, validation helpers, smoke checks: `test-build`
- wrangler config, env examples, release docs, binding setup, rollout notes: `deploy-build`
- components, pages, styles, client rendering, forms: frontend and code-quality checks
- any general implementation task: code-quality checks first

## Maintenance

If recurring mistakes appear, update the nearest relevant guidance file instead of adding repetitive prompt text.
If folder intent is unclear, add or update the nearest `README.md` or `AGENTS.md` so the structure explains itself.
Keep instructions practical and short.
