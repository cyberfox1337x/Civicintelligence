---
name: deploy-build
description: Use when building or modifying deployment flow, environment configuration, Wrangler setup, Cloudflare Pages bindings, D1 migration sequencing, secrets handling, or release verification. Use for implementation tasks involving `wrangler.toml`, env vars, deploy docs, or rollout readiness.
---

# Deploy Build Skill

## Goal

Make deployment and release work repeatable, environment-aware, and safe to run without hidden setup.

## Steps

1. Identify which environments exist and which files or settings own their configuration.
2. Keep secrets out of source and use example files only for non-secret placeholders.
3. Define runtime bindings, D1 configuration, and environment variables explicitly.
4. Sequence schema or migration changes so deploy order is predictable.
5. Update deploy or release instructions when the setup changes.
6. Define a short smoke-check list for the most important post-deploy behavior.

## Starter Assets

If the project needs deployment scaffolding, use `assets/cloudflare-pages-starter/` for a small `wrangler.toml.example`, `.dev.vars.example`, and release checklist template.

## Deliverable

Ship the config, examples, and release notes needed to get the change deployed with less guesswork.

## Avoid

- hardcoding secrets or production identifiers in tracked files
- changing runtime bindings without updating example config
- shipping schema-dependent code with no migration or rollout order
- calling a setup complete when nobody knows how to verify the deploy
