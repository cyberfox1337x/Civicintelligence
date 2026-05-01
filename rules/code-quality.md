# Code Quality Rules

## Scope

Applies broadly to general application code.

## Best Practices

- Use clear descriptive names.
- Keep functions focused on one responsibility.
- Prefer early returns over deep nesting.
- Centralize shared logic that truly repeats.
- Keep public interfaces stable and predictable.
- Write errors that help debug the actual failure.

## Common Mistakes

- long functions with mixed responsibilities
- duplicate business logic
- inconsistent naming
- hidden mutations
- broad exception handling
- branching that is hard to follow
- weak or misleading comments
