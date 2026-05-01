---
name: security-review
description: Use when the task involves auth, authorization, API security, untrusted input, secrets, output encoding, headers, tokens, or vulnerability review.
---

# Security Review Skill

## Goal

Identify concrete vulnerabilities and risky trust-boundary mistakes.

## Steps

1. Identify entry points and sensitive operations.
2. Trace untrusted input through the code.
3. Check authentication and authorization.
4. Check injection, XSS, secrets, logging, and error handling.
5. Flag concrete issues with the smallest safe fix.

## Output

For each finding include:
- severity
- vulnerability or risk
- exploit path or failure mode
- affected area
- recommended fix

## Avoid

- vague fear-based language
- claiming exploitable risk without supporting code
- rewriting systems when a local safe fix exists
