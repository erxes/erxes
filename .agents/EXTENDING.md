# EXTENDING — Adding New Plugins to the Agent System

> This document describes how to extend the `.agents` system to support new plugins.

## Promotion Gate (Heuristic)

Before extending to a new plugin, **most** of these should be true for an already-supported plugin:

- [ ] At least **2** customer-facing features shipped end-to-end via the plugin
- [ ] At least 1 lesson captured from a real failure in that plugin
- [ ] The rule checklist has been updated based on real PR review feedback
- [ ] Plugin builds and lints successfully via `pnpm nx build <plugin>`

The gate is a heuristic — **you can override consciously when a new plugin's requirements are concrete enough to justify the scaffold**. Document the override reasoning.

## How to Add a New Plugin

### 1. Create Plugin-Specific Rules

Create an `AGENTS.md` file in the plugin root:

```bash
# Frontend plugin
frontend/plugins/<name>_ui/AGENTS.md

# Backend plugin
backend/plugins/<name>_api/AGENTS.md
```

Use existing plugin `AGENTS.md` files as reference (e.g., `frontend/plugins/content_ui/AGENTS.md`). Category-wide rules already live in `frontend/plugins/AGENTS.md` and `backend/plugins/AGENTS.md` — the plugin file should only add what is specific to that plugin.

### 2. Register Plugin in Manifest

Add the plugin to `.agents/manifest.yaml` in the `plugins` section:

```yaml
plugins:
  frontend:
    - name: "<plugin_name>"
      nx_name: "<plugin_name>_ui"
      path: "frontend/plugins/<plugin_name>_ui"
      status: "active"
  backend:
    - name: "<plugin_name>"
      nx_name: "<plugin_name>_api"
      path: "backend/plugins/<plugin_name>_api"
      status: "active"
```

### 3. Add Features to Feature Map

Add plugin features to `.agents/maps/feature-map.yaml`:

```yaml
features:
  - name: "<Feature Name>"
    plugin: "<plugin_name>"
    module: "<module_path>"
    scope: "both"
    keywords: ["keyword1", "keyword2"]
```

### 4. Create Plugin Skills (Optional)

For plugin-specific patterns, create skill documentation:

```bash
.agents/skills/<plugin_name>/
  <pattern-name>.md
```

Use existing skills as templates (e.g., `.agents/skills/create-table/SKILL.md`).

### 5. Update Skill Contracts

If plugin-specific deliverables are needed, update relevant skill contracts:

```bash
.agents/skills/<skill-name>/contract.yaml
```

### 6. Validate

Run the validation scripts:

```bash
# Validate manifest integrity
.agents/scripts/validate-manifest.sh

# Validate plugin builds
pnpm nx build <plugin_name>_ui
pnpm nx build <plugin_name>_api

# Check rules compliance
.agents/scripts/check-rules.sh frontend/plugins/<plugin_name>_ui
```

## What Does NOT Need to be Replicated

These are **repo-wide** — they stay in `.agents/` root and apply to every plugin:

- `AGENTS.md` (the constitution)
- `.agents/manifest.yaml` (the manifest)
- `.agents/rules/` (repo-wide conventions)
- `.agents/skills/` (shared skills)
- `.agents/scripts/` (validation scripts)
- `.agents/maps/feature-map.yaml` (feature registry)
- `.agents/references/canonical-examples.yaml` (reference implementations)

## Cross-Plugin Features

When a feature spans plugins:

1. Pick the **primary** plugin (where the user-visible behavior lives)
2. Use the primary plugin's skill/context
3. Explicitly call out the cross-plugin contract in the implementation
4. Verify on both sides

If a feature has no clear primary, split it into separate tasks.

## Path Integrity (Hard Rule)

Every repo path, file name, hook name, or command cited anywhere in `.agents/`
must exist in the repo at the time it is written. Stale references poison
every future agent session.

- Before citing a path, verify it: `ls <path>` or `test -e <path>`.
- After editing `manifest.yaml`, `maps/feature-map.yaml`, or
  `references/canonical-examples.yaml`, run
  `.agents/scripts/validate-manifest.sh` — Check 7 verifies all cited paths
  and feature-map plugin/module pairs resolve.
- When renaming or moving modules in the repo, grep `.agents/` for the old
  path and update it in the same PR.

## Anti-Pattern: Bulk Replication

Don't scaffold skills/docs for all plugins at once. Each plugin has its own quirks. **One plugin at a time, each validated with at least one real feature before starting the next.**
