# Frontend Rules

## Scope

Applies to:
- `*.tsx`
- `*.jsx`
- `*.css`
- `*.scss`
- component and page files
- client-side forms and UI state

## Best Practices

- Use semantic elements.
- Ensure keyboard navigation works.
- Provide accessible names for controls.
- Keep components small and composable.
- Make loading, empty, and error states explicit.
- Avoid unnecessary rerenders and unstable effect dependencies.

## Common Mistakes

- missing labels or roles
- click handlers on non-interactive elements
- focus traps or broken modal behavior
- state derived incorrectly from props
- large monolithic components
- fragile responsive layouts
- effects that refire unnecessarily
