# Release Checklist

## Before Deploy

- Confirm required environment variables and bindings exist.
- Confirm schema or migration changes are ready in the correct order.
- Confirm the main success path still works locally.

## Deploy

- Deploy the frontend and function changes.
- Apply required D1 schema or migration changes.

## After Deploy

- Load the main page and check for client-side errors.
- Exercise one read path and one write path.
- Check auth-sensitive paths if the release touched identity or permissions.
