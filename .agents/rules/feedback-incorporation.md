# Feedback Incorporation Guidelines

## When to Update Rules

Suggest a rule update when user feedback reveals a repeated erxes-specific
pattern that is not already documented, such as:

- a plugin-specific architecture boundary
- a preferred GraphQL or Apollo pattern
- a recurring validation command
- a frontend table, drawer, routing, or state convention
- a backend permission, model, migration, or event-log requirement

Do not suggest rule updates for one-off preferences or corrections that are
already covered by existing rules.

## How to Propose Updates

When a rule update would help future work:

1. Summarize the pattern observed.
2. Name the rule file that should change.
3. Propose concise rule language.
4. Ask for confirmation before editing rules unless the user explicitly asked
   you to update rules.

## Rule Quality

Good rules are:

- specific to erxes
- actionable during coding
- short enough to scan
- backed by existing code
- scoped to the correct layer or plugin

Avoid rules that:

- copy conventions from another product
- contradict existing erxes code
- require large refactors
- ban patterns that are common in the repo
- duplicate a more specific nested `AGENTS.md`

## Maintenance Checklist

When editing rules:

- Keep paths and commands accurate.
- Remove stale references to other projects.
- Prefer examples from erxes paths and commands.
- Verify paths and commands after editing.
