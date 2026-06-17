---
name: create-backend-migration
description: Create safe erxes backend MongoDB migrations or command scripts. Use when existing persisted data needs idempotent migration, backfill, repair, or cleanup.
---

# Skill: Create Backend Migration

## Workflow

1. Confirm a migration or command is actually needed for existing data.
2. Search for service-local migration or command patterns before adding files.
3. Put the script in the owning service or plugin's existing location, such as
   `src/migrations` or `src/commands`.
4. Make the script idempotent so running it twice does not corrupt data.
5. Read `MONGO_URL` or service env values consistently with nearby scripts.
6. Process large collections in batches when practical.
7. Log useful progress without logging secrets, tokens, or sensitive payloads.
8. Close database connections or exit cleanly.
9. Run focused validation, usually `pnpm nx build <api-project>`.

## Important

- Do not add migrations for purely frontend changes.
- Prefer guarded `$set`, `$unset`, `$addToSet`, and filtered updates over full
  document replacement.
- Avoid hardcoded tenant, brand, user, or subdomain data.
- Preserve existing ID conventions.
- Do not add temporary public GraphQL mutations or routes for migrations unless
  explicitly requested.
