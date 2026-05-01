# Frontend

## Purpose

This folder is the browser-facing client layer.
It owns UI structure, styling, client state, and same-origin calls to `/api/...`.

Use this file together with:
- `../skills/auth-build/SKILL.md`
- `../agents/frontend.md`
- `../rules/frontend.md`
- `../skills/frontend-build/SKILL.md`
- `../skills/frontend-review/SKILL.md`
- `../skills/test-build/SKILL.md`
- `../agents/code.md`
- `../rules/code-quality.md`

## Boundaries

- No secrets, tokens, or server-only credentials belong here.
- No direct database access belongs here.
- Keep API calls relative and browser-safe.
- Preserve keyboard and screen-reader accessibility.
- Make loading, empty, and error states explicit.
- Keep client state predictable and easy to trace.

## Review Checklist

1. Identify the user flow the change affects.
2. Check semantics, labels, focus order, and responsiveness.
3. Check state derivation, effects, and rerender risks.
4. Check form validation, empty states, and failure states.
5. Suggest the smallest user-facing fix.

## Build Checklist

1. Keep the feature in the browser layer unless backend work is required.
2. Use relative `/api/...` requests for server interaction.
3. Implement the visible states the user will actually hit.
4. If the UI depends on auth or session state, mirror server truth instead of inventing client authority.
5. Preserve accessibility and responsive behavior while adding the feature.
6. Add focused validation when the behavior is easy to regress.
7. Keep component and state ownership easy to follow.
