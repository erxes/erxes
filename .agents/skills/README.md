# erxes Agent Skills

Use these skills as short task workflows for common erxes changes. Rules in
`AGENTS.md`, nested `AGENTS.md`, and `.agents/rules/*.md` remain the source of
truth for architecture and project conventions.

## Format

Skills use one folder per skill:

```text
.agents/skills/<skill-name>/
  SKILL.md
```

`SKILL.md` should include YAML frontmatter with `name` and `description`, then
the shortest workflow that helps an agent complete the task.

## Available Skills

- `plugin-workflow/SKILL.md` - baseline workflow for plugin changes.
- `operation-plugin-reference/SKILL.md` - apply operation plugin patterns from
  `operation_ui` and `operation_api`.
- `create-page/SKILL.md` - add a route/page using nearby plugin structure.
- `create-table/SKILL.md` - build table/list screens with existing table
  patterns.
- `create-query/SKILL.md` - add or reuse frontend GraphQL operations and hooks.
- `create-modal/SKILL.md` - add dialog/modal UI without introducing new
  systems.
- `create-form-drawer/SKILL.md` - add drawer/sheet CRUD forms with local
  mutation and validation patterns.
- `create-backend-entity/SKILL.md` - add or extend Mongoose-backed backend
  features.
- `create-backend-migration/SKILL.md` - add MongoDB migration or command
  scripts.
- `add-translations/SKILL.md` - add frontend i18n strings and locale keys.
- `module-federation-expose/SKILL.md` - add or change frontend plugin
  exposes/widgets.
- `configure-plugin-navigation/SKILL.md` - wire plugin config, navigation,
  icons, and widget declarations.
- `create-provider-context/SKILL.md` - add scoped React providers/contexts using
  existing erxes patterns.
- `fix-sonar/SKILL.md` - fix Sonar/lint issues with minimal behavior-preserving
  edits.

## Usage

1. Pick the smallest skill that matches the task.
2. Read the root `AGENTS.md` and any nested `AGENTS.md` that applies.
3. Read the matching `.agents/skills/<skill-name>/SKILL.md`.
4. Search for a similar implementation with `rg`.
5. Reuse nearby code, commands, and validation patterns.
6. Keep changes scoped and review the final diff.
