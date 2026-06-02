---
name: create-provider-context
description: Add scoped React providers or contexts in erxes using existing feature, shared-library, and provider-effect patterns. Use when child trees need shared scoped access.
---

# Skill: Create Provider or Context

## Workflow

1. Search for nearby providers and contexts before adding a new one.
2. Use provider/context only for scoped component trees, shared child access, or
   integration boundaries that cannot be expressed cleanly with props.
3. Keep provider state and hooks near the feature unless the provider is part of
   `erxes-ui` or `ui-modules`.
4. Export a small hook such as `useFeatureContext` when surrounding code uses
   that pattern.
5. Throw a clear error from the hook when the context must be used inside its
   provider.
6. Keep side-effect-only provider components named consistently with nearby
   `*ProviderEffect` patterns when they load/sync global app data.
7. Run focused validation for the touched project.

## Important

- Do not create context for state used by a single component.
- Do not duplicate Apollo server data into context without a clear reason.
- Prefer props, local state, URL state, Apollo, or Jotai when those better match
  the behavior.
- Keep provider composition stable in `frontend/core-ui/src/providers` when
  changing host-level providers.
