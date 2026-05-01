# Rules

This folder defines the concrete standards for each review type.

If `agents/` answers "what lens should I use?", `rules/` answers "what should I check?"

- `code-quality.md`: maintainability and readability expectations
- `frontend.md`: accessibility, UI state, semantics, and responsive behavior
- `performance.md`: latency, query count, payload size, and repeated work
- `security.md`: input handling, auth, secrets, and output safety
- `d1.md`: D1-specific SQL safety and query-shape rules

Use the matching rules file together with the nearest agent and skill.
