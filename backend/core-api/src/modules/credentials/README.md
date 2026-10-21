# Connections backend

This additive core module owns tenant-scoped `credentials` and
`credential_grants` collections. It does not migrate, read, or replace existing
integration/configuration credentials. The management and consumer contracts
are defined in [CONTRACT.md](./CONTRACT.md).

## End-user setup

Open **Settings → Connections** (`/settings/connections`). Choose a recognizable
provider, follow its setup guide, enter the labelled account details, review the
field-presence summary, and save. Optional endpoint/model/TLS settings are
progressively disclosed. Provider choice is immutable after saving; create a
second connection for a different provider or account. Existing generic records
remain editable, and old settings links redirect to Connections.

The catalog includes OpenAI, Grok, Kimi, Kimi Coding, Cloudflare AI Gateway,
Cloudflare R2, Amazon SES, SendGrid, SMTP, and S3-compatible storage. Their field
definitions are validated and encrypted by the same tenant-bound vault. Local
logos and creation-only public defaults add no external browser requests.

**Configured is not verified.** This module stores configuration for authorized
runtime consumers. It does not test a provider, send an email, create a bucket,
perform OAuth, replace existing integration settings, or automatically bind a
plugin to the new configuration. Grant app access under a connection's advanced
settings and provision the consumer once as described below; subsequent account
detail changes are read at runtime without redeploying that consumer.

## Provisioning

Provision these environment variables on **core-api only**, through the
deployment secret manager:

- `CREDENTIALS_VAULT_KEY`: canonical base64 encoding of exactly 32
  cryptographically random bytes. Generate it using a CSPRNG in the secret
  provisioning system, without writing it to terminal output or shell history.
- `CREDENTIALS_VAULT_KEY_ID`: a stable identifier of 1–64 ASCII letters,
  digits, underscores, or hyphens. Every core replica must use the same key and
  ID for the same database.
- `JWT_TOKEN_SECRET`: the platform's configured session-signing secret.
  Credential management rejects the platform's development `SECRET` fallback.

Keep vault keys out of source control, browser configuration, plugin
environments, logs, traces, and screenshots. Back up the key and ID in the
secret manager independently of encrypted database backups. MongoDB and Redis
must be available for tenant data and active-session verification respectively.
There is no automatic key generation or fallback encryption key at startup.

Encryption uses Node's AES-256-GCM with a fresh 12-byte nonce and 16-byte tag for
each write. Versioned authenticated data binds each envelope to its key ID,
tenant, and immutable record ID. All field values are encrypted, including
fields labelled non-secret. Payloads are bounded to 128 KiB of serialized UTF-8.

## Recovery and key changes

Missing, malformed, mismatched, or lost keys cannot decrypt stored records.
Tampering and moving an envelope to another record or tenant also fail closed.
Errors never reveal encryption-library or database details. Metadata reads,
deletion, and grant revocation do not require decryption; create, update, and
consumption require valid encryption configuration. Grant issuance requires a
configured key, but does not itself prove that existing ciphertext decrypts.

After an accidental environment change, restore the **original key and key ID**
on every core replica. Recover database backups with their matching key/ID,
and verify with a synthetic credential before enabling consumers. Do not change
only the key ID or overwrite the key to try to unlock records. There is no
keyring or online re-encryption/rotation facility in this module.

If the original key is permanently lost, its encrypted values are unrecoverable.
Revoke consumer grants, delete affected records, create new credentials from
independently recovered/provider-reissued values, and provision new grants and
references. Restoring a database snapshot may restore previously revoked grants;
reapply revocations before allowing consumer traffic. Revoke grants for any lost
consumer token and issue replacements; raw tokens cannot be retrieved again.

## Management and server consumption

Management requires a verified, unexpired HS256 workspace session, a live Redis
session entry, and a current active user from the selected tenant. Forwarded
ownership and permission headers are never authoritative. App, OAuth, and
client-portal identities are denied. Active workspace owners are authorized;
other users need the matching core `credentials` permission with `all` scope.
Permission groups are read from the tenant for each request without the generic
action cache. `credentialsRead` includes grant metadata; writes use
`credentialsManage`, and issuing/revoking grants uses `credentialGrantsManage`.

GraphQL returns only allowlisted metadata and field `hasValue` flags. There is
no value/reveal query. An edit uses `keep`, `replace`, or `clear` per field;
never send a masked placeholder. Template definitions are authoritative, required
fields cannot be cleared, and templates cannot change on an existing record.
Updates check the persisted revision to prevent a concurrent overwrite.

Issue a consumer grant for one named plugin and one exact credential. Its
random 256-bit bearer token is returned only once; persistence stores only its
SHA-256 hash. The plugin identity belongs to that issued capability, rather than
to a caller-supplied plugin header. Provision the token and core endpoint into
that plugin's server environment through its secret manager. Never provision the
vault master key outside core-api. No optional plugin is modified by this module.

From trusted server code, send an HTTPS request to
`POST <core-api>/credentials/consume` with:

- `Authorization: Bearer <issued consumer token>`
- `Content-Type: application/json`
- Body: `{ "reference": "<the credential's immutable reference>" }`

Success returns `{ reference, templateId, values }`, with string field values.
The unsigned tenant locator only selects a tenant context through the existing
platform `generateModels` resolver. In SaaS mode, its organization registry must
contain that subdomain before `useDb` or tenant model creation; database names
come from the registered organization ID. In OS mode, resolution uses the
existing platform connection instead of a database named by the caller. The
locator never creates a tenant or establishes identity. The complete token hash,
active grant, stored tenant, plugin binding, and exact credential must match.
Caller tenant/plugin headers cannot grant broader access. Authorization and
record revision are checked again after decryption. Revocation/deletion take
effect on subsequent requests; a response already delivered cannot be recalled.

All consumer responses, including parser/rate-limit/errors, are `no-store`.
Malformed requests return 400, denied/unavailable consumption returns 403,
rate limits return 429, and unknown paths/methods return 404, with a generic
error body. Requests are limited to 2 KiB and 60 per minute per Express-resolved
IP. Configure trusted proxies accurately. Keep this endpoint on trusted backend
network paths; do not expose tokens in URLs, browser requests, logs, Apollo state,
telemetry, exception messages, or caches. Consume values only in server memory
for the provider request. There is no agent/tRPC retrieval interface.

Vault/grant models have strict schemas, hidden encrypted/token-hash fields, and
no generic event handlers or full-document capture hooks. Audit events allow only action, tenant, actor ID,
credential ID, template ID, grant ID, and plugin name. Management traffic also
depends on the core/shared/gateway privacy boundaries to suppress argument,
result, raw-body, and telemetry capture; do not remove those boundaries.
Core Apollo disables its process-wide parsed-document cache and automatic
usage/inline tracing because documents may contain inline vault inputs. This
adds parsing/validation work for ordinary core queries; assess that operational
cost when deploying. Existing resolvers and integration behavior are unchanged.

## Plugin helper (recommended)

After granting a plugin access in workspace Connections settings, configure its
server environment once. These names are consumed by the public
`erxes-api-shared/utils` helper, not injected into other plugins or the browser:

```dotenv
PLATFORM_CREDENTIALS_URL=https://core-api.example.invalid
PLATFORM_CREDENTIALS_TOKEN=<one-time token issued for this plugin and credential>
PLATFORM_CREDENTIALS_REFERENCE=<stable reference from workspace settings>
```

For local development only, `PLATFORM_CREDENTIALS_URL=http://localhost:3300`
is supported. HTTPS is mandatory in production; non-loopback HTTP, URL-embedded
credentials, query strings, fragments, and non-root base paths are rejected.

```typescript
import { getCredentialValue } from 'erxes-api-shared/utils';

const testKey = await getCredentialValue('testKey');
// Use testKey only in a server-side provider request; never log or return it.
```

To read several fields in one request, or select a different named instance:

```typescript
import { getCredentialValues } from 'erxes-api-shared/utils';

const smtp = await getCredentialValues({
  reference: process.env.EMAIL_CREDENTIAL_REFERENCE,
  token: process.env.EMAIL_CREDENTIAL_TOKEN,
  templateId: 'smtp',
});
// smtp contains string field values. Use them only in server memory.
```

Both helpers accept optional `endpoint`, `token`, `reference`, and `templateId`
options. Omitted options use the three environment defaults above; `templateId`
is an optional expectation checked against the response. Use a separate grant
and environment binding for each credential instance. The field key is not a
platform-wide singleton lookup: the reference and exact grant still select the
credential and tenant. No caller-controlled plugin/tenant header is accepted.

The Node 22 helpers handle the HTTP request, five-second deadline, redirect
rejection, response size/type/reference validation, and redacted failures.
Missing configuration throws `Credential consumer is not configured`; denied,
revoked, deleted, missing-field, mismatched-template, unavailable-key, malformed,
or failed-network reads throw `Credential unavailable`, without sensitive causes.
An explicitly stored empty string is returned as an empty string, not replaced.
Every call performs a fresh authorized read; there is no retry, global plaintext
cache, automatic environment injection, or fallback to old configuration. To
avoid repeated calls and rate limiting, read several fields together with
`getCredentialValues` and keep them only for the operation that needs them.

Helpers are server-only and use the same backend-only consume route documented
above. They do not add a GraphQL secret query, tRPC procedure, or agent tool.
Existing flows remain independent until a plugin explicitly opts in. Rebuild
`erxes-api-shared` before restarting consumers after a helper change.

## Validation

From the repository root:

```sh
pnpm exec jest --config backend/core-api/src/modules/credentials/jest.credentials.cjs --runInBand
pnpm exec eslint backend/core-api/src/modules/credentials --max-warnings=0
pnpm exec jest --config backend/core-api/src/apollo/jest.credentials.cjs --runInBand
pnpm exec jest --config backend/gateway/jest.credentials.config.ts --runInBand
pnpm nx test erxes-api-shared --runInBand --testPathPattern=utils/credentials.test.ts
pnpm nx build erxes-api-shared
pnpm nx lint core-api
pnpm nx build core-api
```

The module suite also exercises the shared helper through the real temporary
HTTP consume route, including denial immediately after grant revocation.
The module suite uses synthetic values, mocked Redis/tenant reads, real JWT
verification, real Node crypto, real Mongoose schema casting/store queries with
mocked driver calls, GraphQL execution, and a temporary loopback HTTP listener
that is closed in teardown. It does not require a live MongoDB or Redis server.
The tenant-locator tests exercise the platform resolver with mocked registry
responses and verify SaaS registry lookup precedes database selection and OS
mode reuses the existing connection.
Core-api has no Nx test target; use the focused Jest command above. Run the
parent-owned privacy suites alongside it before delivery. Lint/build must also
be assessed for existing failures outside this module.
