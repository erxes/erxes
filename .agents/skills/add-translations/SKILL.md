---
name: add-translations
description: Add or update erxes frontend translation keys and locale JSON entries. Use when a task introduces user-facing text, i18n namespaces, locale files, or translation hook usage.
---

# Skill: Add Translations

## Workflow

1. Check whether nearby UI already uses `useTranslation` and which namespace it
   uses.
2. Check `frontend/core-ui/src/i18n/config.ts` before adding a new namespace.
3. Add core UI strings under `backend/gateway/src/locales/en/<namespace>.json`
   and `backend/gateway/src/locales/mn/<namespace>.json` when the namespace
   exists in both languages.
4. Follow the namespace's existing key style, often kebab-case grouped by
   feature.
5. Use `useTranslation(namespace, { keyPrefix })` when nearby code uses that
   pattern.
6. Use interpolation for dynamic values. Do not concatenate translated strings.
7. Verify JSON syntax and referenced namespace/key paths.

## Important

- Supported core languages are `en` and `mn`.
- Prefer adding both English and Mongolian keys over relying only on fallback
  text for new user-facing UI.
- Check long Mongolian strings in compact buttons, tabs, table headers, and
  drawer footers.
- Do not add comments to JSON locale files.
- For documentation-only translation edits, verify paths and keys instead of
  running full builds by default.
