# Security Rules

## Scope

Applies to:
- auth code
- middleware
- API handlers
- controllers
- routes
- file upload paths
- token and session handling
- logging of request or user data

## Best Practices

- Validate all external input.
- Enforce authorization at the server boundary.
- Use parameterized queries.
- Escape or encode untrusted output for its destination.
- Keep secrets out of source, logs, and client payloads.
- Use safe comparisons for sensitive token checks where relevant.
- Return minimal error detail to clients.

## Common Mistakes

- trusting client-provided identifiers
- missing permission checks
- direct string interpolation into queries or commands
- unsafe HTML rendering
- secret leakage in logs
- verbose stack traces in responses
- overly permissive CORS
- insecure file upload validation
