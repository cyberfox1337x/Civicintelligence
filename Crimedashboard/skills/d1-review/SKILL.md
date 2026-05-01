---
name: d1-review
description: Use when the task involves Cloudflare D1 queries, Workers data access, SQL safety, query efficiency, or backend review of D1-backed routes and helpers.
---

# D1 Review Skill

## Goal

Identify concrete D1 query risks and recommend small, safe fixes for Cloudflare Workers backends.

## Steps

1. Find all relevant `env.DB` and D1 helper call sites.
2. Inspect SQL construction, bind usage, filters, and result bounds.
3. Check validation, authorization, and error handling around each query.
4. Flag meaningful D1-specific performance or security issues only.
5. Recommend a small fix and a practical way to validate it.

## Output

For each finding include:
- severity
- query or D1 pattern
- why it is risky or inefficient
- affected path
- recommended fix
- validation idea

## Avoid

- generic SQL advice with no code basis
- broad ORM-style redesign suggestions
- speculative issues that are not supported by the query path
