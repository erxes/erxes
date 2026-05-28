# erxes AI Operating Rules

## Agent Manifest Protocol (AMP) v1.0

This repository uses the **Agent Manifest Protocol** to ensure all AI agents
have complete, consistent context before making changes. The protocol is
declared in `.agents/manifest.yaml` and enforced through contract-based skills.

### Entry Point

**ALL agents MUST start by reading `.agents/manifest.yaml`**. This file
declares:
- Rule layers with precedence (constitution → global → category → plugin)
- Skill registry with contracts
- Plugin registry
- Context assembly protocol
- Validation requirements

### Quick Start

```bash
# Assemble context for your working directory
.agents/scripts/assemble-context.sh <path> [skill-name]

# Example: Working on content plugin table feature
.agents/scripts/assemble-context.sh frontend/plugins/content_ui/src/modules/cms create-table

# Validate manifest integrity
.agents/scripts/validate-manifest.sh
```

### Feature Mapping

When user describes a feature, search `.agents/maps/feature-map.yaml` to find:
- Which plugin owns this feature
- Which module to implement in
- Standard components and templates
- Scope (frontend, backend, or both)

Example: User says "Add tags to posts" → Map to `content/cms/tags`

### Protocol

1. **Read manifest.yaml** — Understand the system
2. **Assemble context** — Load all applicable rule layers
3. **Load skill contract** — If using a skill, load its contract.yaml
4. **Execute with rules** — Follow loaded rules and skill workflow
5. **Validate** — Run required validation before finishing

## Purpose

These rules are the root source of truth for AI agents working in this repo.
Agents should preserve existing architecture, local patterns, and product
behavior while keeping changes small.

## General Rules

- **ALWAYS read `.agents/manifest.yaml` first** before any other file.
- Use the `assemble-context` skill to load all applicable rule layers
  automatically.
- Read relevant `.agents/rules/*.md` and
  `.agents/skills/<skill-name>/contract.yaml` files for task-specific guidance.
- Search for a similar implementation before creating new code.
- Reuse existing components, hooks, GraphQL documents, utilities, and state
  patterns before adding new ones.
- Keep changes minimal and scoped to the requested task.
- Do not refactor unrelated files.
- Do not introduce new dependencies unless the task explicitly requires it.
- Prefer repository consistency over personal preference.

## Architecture Rules

- Plugins must remain isolated; avoid cross-plugin imports.
- Shared frontend UI primitives belong in `frontend/libs/erxes-ui`.
- Shared frontend business/UI modules belong in `frontend/libs/ui-modules`.
- `frontend/core-ui` is the Module Federation host app, not the default place
  for reusable plugin UI.
- Follow existing GraphQL, Apollo, routing, and state management patterns in
  the touched project.
- Name GraphQL queries and mutations with the plugin or module prefix plus the
  operation purpose, such as `cmsPageList`; operation names must be unique.
- Do not introduce new `schemaWrapper` usage in backend schema definitions.
  Define schemas directly with `new Schema(...)` and explicit fields following
  nearby backend patterns; leave existing `schemaWrapper` usage untouched unless
  the task explicitly asks to migrate it.
- Do not modify backend contracts from a frontend task unless explicitly
  requested.

## Workflow

Before coding:

1. **Read `.agents/manifest.yaml`** — This is the entry point.
2. **Consult Semantic Index** — Read `.agents/skills/SEMANTIC_INDEX.md` to find the correct skills for your intent or to troubleshoot symptoms (404s, loading errors).
3. **Assemble context** — Run `.agents/scripts/assemble-context.sh <path> [skill]`
   or follow the `assemble-context` skill to load all applicable rule layers.
3. **Run intake** — Use `.agents/skills/intake` to gather requirements and
   confirm scope. **NEVER start coding without confirmed scope.**
4. **Read ALL relevant rules** — Load `.agents/rules/*.md` files declared in the
   manifest for your working path. **MUST read `non-negotiable.md` IN FULL.**
   **MUST read `architecture.md` IN FULL.**
   **MUST read `code-style.md` IN FULL.**
   You are responsible for EVERY rule in these files.
5. **Load skill contract** (if applicable) — Read
   `.agents/skills/<skill-name>/contract.yaml` before executing any skill.
6. **Confirm scaffold awareness** — If using `create-plugin` skill, acknowledge
   that scaffolded code REQUIRES fixing. The scaffold generates violations.
7. Search for similar implementations with `rg`.
8. Confirm local routing, GraphQL, state, and UI patterns.
9. Reuse nearby code structure before inventing a new one.

During coding:

1. Keep changes small and readable.
2. Preserve naming conventions and UX behavior unless the task changes them.
3. Keep hooks, GraphQL documents, constants, types, and state near the feature
   they support unless the repo already has a shared location.
4. Remove debug code and avoid commented-out dead code.

After coding:

1. Run the focused project validation that exists in Nx.
2. For frontend plugins, prefer `pnpm nx lint <plugin>`,
   `pnpm nx build <plugin>`, and `pnpm nx test <plugin>` when tests or test
   setup are touched.
3. Fix TypeScript, lint, build, and Sonar issues introduced by the change.
4. Review the diff for unrelated edits before finishing.
5. **Run `.agents/scripts/validate-manifest.sh`** when modifying any `.agents/`
   files to ensure system integrity.
6. **If you created a plugin, run `.agents/scripts/validate-scaffold.sh <plugin> [scope]`**
   to ensure the scaffolded code was properly fixed.

## Red Lines (IMMEDIATE REJECTION)

Performance matching any of these patterns will result in immediate task rejection and system reset:

1. **Scaffold Abandonment**: Running a scaffolding script and leaving the generated placeholders as "complete".
2. **Rule Bypassing**: Knowingly violating `non-negotiable.md` (e.g., using `default` exports) because it's "easier" or because a tool generated it.
3. **Type Erasure**: Using `any` or skipping types to avoid compiler errors.
4. **Half-Implemented CRUD**: Providing a list page without a create form, or a button without a handler.
5. **Architectural Isolation**: Using relative imports (`./`) for module boundaries or importing across plugin lines.
6. **Path Mismatch**: Registering a config path (in `config.tsx`) that doesn't match the actual file path or route, causing 404s.

## Scaffolded Code Warning

**Scaffolding scripts (`pnpm create-plugin`, `pnpm create-backend-plugin`) generate code that VIOLATES non-negotiable rules.**

When using the `create-plugin` skill:
1. The scaffold creates directory structure and boilerplate
2. The scaffold does NOT produce production-ready code
3. You MUST fix all generated code before declaring completion
4. You MUST run `.agents/scripts/validate-scaffold.sh <plugin> [scope]` before finishing

**Common scaffold violations:**
- Default exports in application code (Rule #4)
- `any` types (Rule #9)
- Placeholder/empty content (Rule #3)
- `schemaWrapper` usage in backend (Rule #6)
- Relative imports instead of aliases (Code Style)

**You are responsible for every line of code in the final plugin.**

## Forbidden

- Do not introduce a new UI system.
- Do not replace existing patterns with personal preferences.
- Do not rename public APIs casually.
- Do not perform large refactors without an explicit request.
- Do not move Module Federation exposes without updating host references.
- Do not treat scaffolded code as finished implementation.

## Priority Order

When making decisions:

1. Existing repository patterns
2. Local plugin consistency
3. Minimal changes
4. Clear behavior and maintainability
5. Reusability
6. Performance
7. Personal preference
