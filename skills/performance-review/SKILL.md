---
name: performance-review
description: Use when the task is about speed, latency, scaling, database efficiency, hot paths, repeated work, or performance regressions.
---

# Performance Review Skill

## Goal

Identify concrete performance risks and propose realistic fixes.

## Steps

1. Find the hot path or likely frequent path.
2. Inspect loops, queries, network calls, and serialization.
3. Estimate likely cost under real usage.
4. Flag only meaningful bottlenecks.
5. Recommend validation steps such as profiling, metrics, or targeted tests.

## Output

For each finding include:
- severity
- bottleneck
- why it is costly
- likely trigger condition
- recommended fix
- validation idea

## Avoid

- speculative micro-optimizations
- generic advice with no code basis
- tuning suggestions without identifying the expensive path
