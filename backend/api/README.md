# Backend API

This folder is reserved for backend-side orchestration that sits between the HTTP boundary in `../../functions/api` and the low-level D1 helpers in `../db`.

Use this folder when:

- a Pages Function route grows beyond simple method dispatch
- multiple routes need the same backend use-case logic
- you want to keep request and response handling out of database modules

Keep out of this folder:

- raw SQL and table-specific queries
- browser-facing code
- deployment-specific Pages routing boilerplate

This folder can stay empty until the codebase needs that extra layer.
