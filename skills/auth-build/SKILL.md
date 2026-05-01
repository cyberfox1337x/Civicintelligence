---
name: auth-build
description: Use when building or modifying sign-in, sign-out, sessions, tokens, user identity, middleware guards, role checks, or permission enforcement. Use for implementation tasks where authentication or authorization crosses frontend, functions, or backend code.
---

# Auth Build Skill

## Goal

Build authentication and authorization flows that keep trust on the server side and make permission boundaries easy to audit.

## Steps

1. Identify the actor, the protected resource, and the action being allowed or denied.
2. Separate authentication from authorization so identity checks and permission checks do not get blurred together.
3. Keep token verification, session lookup, and sensitive auth logic on the server side.
4. Enforce authorization at the route or backend boundary, not only in the UI.
5. Minimize the data trusted from the client and avoid client-supplied role or owner identifiers.
6. Make signed-out, expired-session, and forbidden states explicit in both API and UI behavior.
7. Add focused validation for the happy path and at least one denied path.

## Deliverable

Ship an auth flow or permission change that is server-enforced, narrow in scope, and clear about who can do what.

## Avoid

- trusting client-provided `userId`, `role`, or ownership claims
- storing sensitive tokens where less-trusted code can read them without reason
- putting the only permission check in frontend code
- broad admin bypasses with unclear boundaries
