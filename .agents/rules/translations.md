# Translation Guidelines

## Current i18n Setup

erxes uses `react-i18next` in the frontend. The default i18n instance lives in
`frontend/core-ui/src/i18n/config.ts` and loads JSON files from the gateway:

```text
${REACT_APP_API_URL}/locales/{{lng}}/{{ns}}.json
```

Supported languages in the core config:

- `en`
- `mn`

Core locale files live in:

```text
backend/gateway/src/locales/en/
backend/gateway/src/locales/mn/
```

Some backend plugins also keep local locale files, for example:

```text
backend/plugins/frontline_api/src/locales/en.json
backend/plugins/frontline_api/src/locales/mn.json
```

## Namespaces

Core frontend namespaces are configured in `frontend/core-ui/src/i18n/config.ts`.
Current examples include:

- `common`
- `contact`
- `product`
- `documents`
- `organization`
- `segment`
- `automations`
- `settings`
- `broadcasts`

Before adding a namespace, check whether an existing namespace fits the feature.

## React Usage

Use `useTranslation` with the namespace and, when useful, a `keyPrefix`.

```typescript
import { useTranslation } from 'react-i18next';

export function UomForm() {
  const { t } = useTranslation('product', {
    keyPrefix: 'add',
  });

  return <button>{t('create')}</button>;
}
```

Fallback strings are common in some parts of the codebase. When adding new UI,
prefer adding the key to both `en` and `mn` instead of relying only on a
fallback.

## Locale Keys

- Keep keys descriptive and grouped by feature.
- Existing locale files often use kebab-case keys such as `unit-price` and
  `add-bundle-rule`; follow the namespace's existing style.
- Avoid concatenating translated strings. Use interpolation for dynamic values.
- Add keys to both English and Mongolian locale files when the namespace exists
  in both languages.

## Review Checklist

- New strings are translated or have an intentional fallback.
- The namespace exists and is loaded.
- Keys match the existing naming style.
- UI still works with longer Mongolian text.
- No hardcoded user-facing strings were introduced where the surrounding UI uses
  i18n.
