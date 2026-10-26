# Notification templates module (core-api)

Workspace-edited replacements for the built-in system emails in
`src/private/emailTemplates`, written in the maily email editor. Frontend
lives in `frontend/core-ui/src/modules/notification/templates` (Settings →
Notification → Workspace).

## Layout

| Path                     | Responsibility                                                                  |
| ------------------------ | ------------------------------------------------------------------------------- |
| `registry.ts`            | Editable templates: built-in file, default subject, field contract, starter doc |
| `render.ts`              | Save-time validation, contract-only placeholder filling, `loadSystemEmail`      |
| `brand.ts`               | Brand configs (`EMAIL_BRAND_*`) and the header/footer html filled on every send |
| `db/models/*`            | Draft/publish with `draftRevision` conflicts, revert, fallback counter          |
| `graphql/`               | `notificationTemplate*` and `notificationEmailBrand*`; resolvers only call models |

## Invariants

- `sendEmail` (`src/utils/email/index.ts`) asks `loadSystemEmail` for every
  named template. Nothing published, or a send it cannot fill, returns null
  and the built-in file goes instead: a template never loses an email. Each
  fallback is counted on the template and shown in the UI.
- Placeholders are filled only from the template's own field contract. A path
  outside it stays as `{{ … }}`, which is what makes the send fall back; never
  swap in `recordPlaceholderResolver`, which owns every path and would empty it.
- Saved html always contains `{{ brand.header }}` and `{{ brand.footer }}`
  (the editor wraps the body on save). The footer carries the postal address
  and, for notifications, the settings link, so validation refuses html
  without them.
- The built-in `notification`, `resetPassword` and `userInvitation` files read
  `brand` (`buildBuiltInBrand`) and swap the erxes banner, accent color and
  footer for it. It is null until a brand name, logo or footer is saved, so a
  workspace without a brand keeps the erxes design byte for byte.
- Logo addresses go through `normalizeImageUrl` on save and on read: an
  uploaded file name leaves spaces that mail image proxies do not load.
- `senderConfirmation` and `magicLogin` are deliberately absent from the
  registry: they prove who owns an address or an account.
- Every query and mutation requires `notificationTemplatesManage`. The brand
  is written through `notificationEmailBrandUpdate`, never `configsUpdate`.

## Validation

- `NODE_OPTIONS=--experimental-vm-modules pnpm exec jest src/modules/notificationTemplates` (from `backend/core-api`)
- `npx tsc --project tsconfig.build.json --noEmit`
