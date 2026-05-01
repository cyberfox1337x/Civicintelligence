# Agents

This folder defines review personas.

Each file answers: "What kind of reviewer should Codex be right now?"

- `code.md`: general correctness, clarity, maintainability, and project fit
- `frontend.md`: accessibility, usability, rendering behavior, and UI state
- `performance.md`: latency, query efficiency, repeated work, and hot paths
- `security.md`: trust boundaries, auth, secrets, and unsafe defaults
- `d1.md`: Cloudflare D1 query safety, correctness, and efficiency

Start with the closest agent, then pair it with the matching file in `../rules/` and `../skills/`.
