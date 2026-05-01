# Performance Rules

## Scope

Applies to:
- database access
- request handlers
- background jobs
- caching code
- serialization or transformation pipelines

## Best Practices

- Minimize round trips.
- Paginate list endpoints.
- Query only required fields.
- Prefer indexed access paths.
- Cache stable repeated reads when appropriate.
- Move expensive work off hot request paths when possible.

## Common Mistakes

- N+1 queries
- unbounded scans
- missing limits
- repeated parsing or serialization
- repeated network fetches
- expensive work inside loops
- loading full objects where a subset is enough
- cache keys that are too broad or unstable
