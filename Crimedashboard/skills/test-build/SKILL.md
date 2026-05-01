---
name: test-build
description: Use when building or modifying tests, smoke checks, fixtures, validation commands, or feature-level verification for frontend, API, backend, or D1 changes. Use for implementation tasks where regression protection or proof of behavior matters.
---

# Test Build Skill

## Goal

Add the smallest meaningful validation that protects the changed behavior without turning the test suite into noise.

## Steps

1. Identify the highest-risk behavior introduced or changed by the task.
2. Choose the narrowest useful test layer: frontend, route, backend, or D1 helper.
3. Cover the main success path and the most important denied, empty, or failure path.
4. Prefer deterministic fixtures and assertions over brittle snapshots or timing-heavy flows.
5. Test contracts and user-visible behavior more than private implementation details.
6. Run the most targeted validation command available when feasible.

## Deliverable

Ship focused tests or smoke checks that make the new behavior safer to change.

## Avoid

- rewriting tests only to fit broken behavior
- adding giant end-to-end coverage for a small local helper
- asserting every internal detail when one contract-level assertion is enough
- leaving a feature with no validation when the failure mode is easy to regress
