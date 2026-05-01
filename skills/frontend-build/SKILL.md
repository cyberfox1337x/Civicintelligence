---
name: frontend-build
description: Use when building or modifying browser-facing UI, pages, components, forms, styling, client-side state, or same-origin API interactions. Use for implementation tasks in `frontend/`, not just frontend reviews.
---

# Frontend Build Skill

## Goal

Build or extend frontend features that are accessible, predictable, and aligned with existing UI patterns.

## Steps

1. Identify the user flow, visible states, and files that own the change.
2. Keep the change in the browser layer unless the feature truly needs backend work.
3. Use relative `/api/...` requests for server interaction.
4. Implement loading, empty, validation, success, and error states when they matter.
5. Preserve semantic HTML, keyboard access, and responsive behavior.
6. Keep state transitions easy to trace and avoid mixing unrelated concerns.

## Starter Assets

If the feature starts from an empty UI, use `assets/vanilla-pages-starter/` as a small scaffold for HTML, CSS, and same-origin API wiring.

## Deliverable

Ship the smallest working UI change with the supporting state and API wiring it needs.

## Avoid

- putting secrets or server-only logic in the browser
- skipping empty, loading, or failure states on user-facing flows
- introducing a new UI pattern when an existing one already fits
- growing one component until it owns unrelated behavior
