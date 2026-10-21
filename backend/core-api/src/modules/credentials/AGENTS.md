# Connections encrypted storage module

## Scope

Core owns the encrypted storage behind Connections, provider-specific templates,
grant capabilities, and metadata management API. Existing integration credentials remain independent.
The API and UI contract lives in `CONTRACT.md`; deployment and recovery
instructions live in `README.md`.

The user-facing module is Connections at `/settings/connections`. OpenAI, Grok,
Kimi, Kimi Coding, Cloudflare AI Gateway, Cloudflare R2, Amazon SES, SendGrid,
SMTP, and S3-compatible providers use authoritative typed fields in `templates.ts`.
Legacy `generic` and `ai-api-key` template ids remain valid for existing records
and consumers. The GraphQL names, collections, permissions, crypto AAD, reference
format, and environment names retain `credentials` for compatibility. Do not
rename those security contracts as a cosmetic UI change. Stored configuration
is not evidence of successful provider access; there are no network probes here.

Plugins consume values with `getCredentialValue` / `getCredentialValues` from
`erxes-api-shared/utils` (`backend/erxes-api-shared/src/utils/credentials.ts`).
These server-only helpers wrap the existing grant-scoped HTTP consume route;
they do not change the authorization contract or add GraphQL/tRPC retrieval.

## Security invariants

- All values use authenticated encryption with tenant/record/key binding.
  Never add an absent-key fallback, persist plaintext, or cache decrypted data.
- Management authenticates the actual workspace session and tenant user, then
  checks current core permissions. Forwarded identity/ownership flags are not
  authority. App, OAuth, client-portal, and agent identities cannot read values.
- GraphQL returns allowlisted metadata and field-presence flags only. Keep,
  replace, and clear are explicit; never turn a placeholder into a value.
- The backend-only consume route requires an active hash-matched capability for
  one tenant, named plugin, and exact credential. The unsigned tenant locator is
  only a lookup hint through the platform's existing organization registry.
- Vault/grant models must not enter full-document journaling or generic event
  capture. Audit only allowlisted identifiers and actions; never input, values,
  tokens, hashes, encryption envelopes, or arbitrary metadata text.
- Preserve core Apollo, gateway, shared resolver/logging, and browser privacy
  boundaries. They also cover failures before resolver execution. No secret
  inputs in URLs, raw-body capture, document caches, or telemetry.
- Do not annotate retrieval as an agent tool or rewire optional plugins.

## Validation

- `pnpm exec jest --config backend/core-api/src/modules/credentials/jest.credentials.cjs --runInBand`
- `pnpm exec jest --config backend/core-api/src/apollo/jest.credentials.cjs --runInBand`
- `pnpm exec jest --config backend/gateway/jest.credentials.config.ts --runInBand`
- `pnpm exec eslint backend/core-api/src/modules/credentials --max-warnings=0`
- `pnpm nx test erxes-api-shared --runInBand --testPathPattern=utils/credentials.test.ts` (when changing consumer helpers)
- `pnpm nx build erxes-api-shared` (when changing consumer helpers)
- `pnpm nx lint core-api`
- `pnpm nx build core-api`

Core-api has no Nx test target. Focused tests use synthetic inputs and mocked
infrastructure, with real crypto, schema casting, JWT, GraphQL, and HTTP code.
