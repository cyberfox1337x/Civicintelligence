---
name: frontend-review
description: Use when the task is a frontend review, UI review, accessibility review, client-state review, or component-level usability and rendering review.
---

# Frontend Review Skill

## Goal

Identify meaningful user-facing, accessibility, and rendering issues with small practical fixes.

## Steps

1. Identify the user flow or visible behavior being changed.
2. Check semantics, labels, keyboard access, and focus behavior.
3. Check loading, empty, validation, and error states.
4. Inspect state transitions, effects, and rerender risks.
5. Flag only meaningful issues and recommend the smallest fix.

## Output

For each finding include:
- severity
- user-facing issue
- affected path
- why it matters
- recommended fix
- validation idea

## Avoid

- purely stylistic opinions with no user impact
- generic accessibility advice with no code basis
- rewrite suggestions when a local change is enough
