# Connections module (core-api)

One reusable store for integration credentials. Every connection has the same
shape: a tenant-unique **name** (case-insensitive), an **icon** from the
erxes-ui set or an uploaded **logo** (one is required), a registered **type**,
and key/value **fields** that the type's schema marks plain or **secret**.
Created/updated by and timestamps are kept. UI: Settings → Connections
(`frontend/core-ui/src/modules/settings/connections`).

New integration credentials go here, not in plugin-local configs. Existing
storage (core org configs for R2/S3, the Assistant's `AgentsConnection`,
frontline mail/domain settings, …) keeps working and moves over only by a
deliberate migration.

## Layout

| Path | Responsibility |
| --- | --- |
| `db/definitions/connection.ts` | Schema (`schemaWrapper`), unique case-insensitive `name` index |
| `db/models/Connections.ts` | Create/edit/remove/test-result statics; id chosen before sealing |
| `validation.ts` | Name/appearance rules, field building against the type schema, keep-on-omit |
| `sealing.ts` | Secret values at rest: core secret box, own HKDF key, bound to `connection:<id>:<key>` |
| `registry.ts` | Built-in types + types published by services the tenant can use; the allow-list |
| `service.ts` | Browser-safe view, audited decrypted reads (core and plugins), running a type's test |
| `trpc/connections.ts` | Internal `connections.read` for plugin server code (signed token only) |
| `graphql/` | `connectionsTypes`, `connections`, `connectionsDetail`, `connectionsAdd`, `connectionsEdit`, `connectionsRemove`, `connectionsTest` |

The shared contract lives in `backend/erxes-api-shared/src/core-modules/connections`
(types, built-in types, signed tokens, `getConnection`/`resolveConnection`,
`initConnections`/`publishConnectionsMeta` used by `startPlugin`).

## Security invariants

- **Secrets never leave the server.** GraphQL returns plain values and, for
  secrets, only `hasValue`. Edits are write-only: an omitted `value` keeps the
  stored one, a string replaces it, `""` clears it. A secret turned plain must
  be entered again; it is never revealed.
- **Sealed at rest.** `sealing.ts` uses `createSecretBox` (`~/utils/secretBox`,
  AES-256-GCM, key = HKDF(JWT_TOKEN_SECRET, 'erxes-connections',
  'connection-field-v1')), with the connection id + key as authenticated data.
  No plaintext fallback; sealing fails closed without the secret.
- **No secret in logs or hooks.** Mutations are marked
  `wrapperConfig.sensitiveArgs`: mutation logs record `argsRedacted` instead of
  arguments, and plugin before-resolver hooks never receive them. Other core
  mutations that accept passwords, keys or credentials are listed in
  `SECRET_ARGUMENT_MUTATIONS` (`src/apollo/resolvers/mutations.ts`); add any
  new one there. Never add `console.*` of values; test errors become fixed
  messages.
- **Permissions on every operation.** Queries require `showConnections`;
  mutations and tests `manageConnections` (`src/meta/permissions.ts`, granted
  to `core:admin`). No OAuth scope is declared, so OAuth tokens are refused.
- **Agent deny policy.** All `connections…` operations are denied in
  `src/modules/agents/graphqlPolicy.ts`; keep new operation names covered.
- **Tenant isolation.** Resolvers use only `ctx.models`; the internal read
  uses models for the signed tenant and rejects a token for another tenant.
- **Plugin access is declared and audited.** `connections.read` admits only a
  short-lived (60 s) token signed with the shared service secret, purpose
  `erxes-connections-read-v1`, binding tenant, calling service and lookup. A
  service reads types it registered itself or listed in
  `meta.connections.uses`, only while it is available to the tenant, and only
  connections of the type it asked for. Every read, allowed or denied, is
  audited (`source: 'auth'`, `action: 'connectionRead'`: service, type,
  lookup, status) and never stores the result.
- **What the allow-list is.** All services share `JWT_TOKEN_SECRET` and the
  database, so the allow-list stops undeclared and accidental reads and makes
  every read auditable; it is not a sandbox against a compromised service.
- **Types are namespaced.** Core accepts a published type only when its id is
  `<publishing service>:<id>`; a service cannot shadow another's type.

## Adding a connection type (worked example: AI provider)

One type serves many vendors through configuration. An OpenAI-compatible
provider type covers OpenAI, Grok, Kimi, OpenRouter, a local gateway, … with a
`baseUrl` + `apiKey`. Register it from the owning service's `startPlugin`:

```ts
import { defineConnectionType } from 'erxes-api-shared/core-modules';

export const aiProviderType = defineConnectionType({
  id: 'provider', // registered as `ai:provider`
  label: 'AI provider',
  description: 'Any OpenAI-compatible API',
  icon: 'IconSparkles',
  fields: [
    { key: 'baseUrl', label: 'Base URL', required: true, inputType: 'url',
      placeholder: 'https://api.openai.com/v1' },
    { key: 'apiKey', label: 'API key', required: true, secret: true },
    { key: 'model', label: 'Default model' },
  ],
  // Runs in this service when a user clicks "Test connection".
  test: async ({ fields }) => {
    const res = await fetch(`${fields.baseUrl}/models`, {
      headers: { authorization: `Bearer ${fields.apiKey}` },
    });
    // Never echo a value in the message.
    return res.ok ? { ok: true, message: 'Models listed' }
      : { ok: false, message: `The provider answered ${res.status}` };
  },
  // Runs in the reading service (`resolveConnection`).
  resolve: ({ fields }) => ({ baseURL: fields.baseUrl, apiKey: fields.apiKey,
    model: fields.model }),
});

startPlugin({
  name: 'ai',
  // …
  meta: {
    connections: {
      types: [aiProviderType],
      // Other services' types this service's server code reads.
      uses: ['core:custom'],
    },
  },
});
```

`startPlugin` publishes the validated descriptors when the service joins
service discovery and serves the signed `test` producer; core lists the type in
Settings → Connections for tenants that have the service.

Read it from the same service's **server code**:

```ts
import { getConnection, resolveConnection } from 'erxes-api-shared/core-modules';

const client = await resolveConnection<{ baseURL: string; apiKey: string }>({
  subdomain, type: 'ai:provider', name: 'OpenAI production',
});
const raw = await getConnection({ subdomain, type: 'core:custom', connectionId });
```

`resolve` runs only for types the reading service registered itself or that
ship in `BUILT_IN_CONNECTION_TYPES`; other services' types are read with
`getConnection`. Core's own server code reads with `readConnection` from
`service.ts` (audited, no allow-list).

The only built-in type is `core:custom` (`CUSTOM_CONNECTION_TYPE`): the user
defines the keys and marks secret ones. Vendor types belong to the services
that use them, or to the shared built-ins when several services need them.

## Forbidden

- Returning, logging or caching a decrypted value, or putting one in an error,
  test message, URL or GraphQL field. Reads are for server code only.
- Reading another tenant's connections, or models not from the request's
  tenant.
- Reading a type a service did not declare; widening the allow-list in core.
- A GraphQL, gateway or agent path to decrypted values; exposing
  `connections.read` beyond signed service calls.
- Storing a secret unsealed or adding a plaintext fallback.
- New `connections…` operations that the agent deny policy does not cover.

## Validation

- `pnpm nx test core-api` — `__tests__/connections.test.ts` runs against a real
  MongoDB (`CONNECTIONS_TEST_MONGO_URL`, default `mongodb://127.0.0.1:27017`)
  in throwaway `erxes_conn_test_*` databases it drops: `generateModels` in SaaS
  mode (a database per tenant), real GraphQL, permissions and HTTP tRPC with
  simulated plugin services; only Redis and the log queue are in memory. Use
  Node 22 (CI): `jsonwebtoken`'s dependency fails to load on Node ≥ 25.
- `pnpm nx test erxes-api-shared` (contract) and `pnpm nx build erxes-api-shared`
- `pnpm nx build core-api`, `pnpm nx lint core-api` (keep this module clean)
