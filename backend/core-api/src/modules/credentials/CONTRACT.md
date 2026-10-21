# Platform credentials contract

This is an additive core module. Existing configuration and integrations are unchanged.

## Management API (GraphQL)

Permissions belong to core module `credentials`: `credentialsRead`,
`credentialsManage`, `credentialGrantsManage`. None is an always-on permission.
Authenticated workspace users only; no app/client-portal or agent secret access.
`credentialsRead` gates templates, credential metadata, and grant metadata reads;
`credentialsManage` gates credential writes; `credentialGrantsManage` gates
grant issuance and revocation.

- `credentialsTemplates: [CredentialTemplate!]!`
- `credentialsList(search: String, category: String): [CredentialMetadata!]!` (bounded)
- `credentialsDetail(_id: String!): CredentialMetadata`
- `credentialsCreate(input: CredentialInput!): CredentialMetadata!`
- `credentialsUpdate(_id: String!, input: CredentialInput!): CredentialMetadata!`
- `credentialsDelete(_id: String!): Boolean!`
- `credentialsGrants(credentialId: String!): [CredentialGrantMetadata!]!`
- `credentialsGrantCreate(credentialId: String!, pluginName: String!, name: String!): CredentialGrantIssued!`
- `credentialsGrantRevoke(_id: String!): Boolean!`

`CredentialMetadata`: `_id`, immutable `reference`, `name`, `description`,
`templateId`, `category`, `fields`, `createdAt`, `updatedAt`.
Each field exposes `key`, `label`, `type`, `secret`, `required`, `help`, `hasValue`
ONLY: no stored values, even for non-secret-labelled fields.
Templates expose `id`, `name`, `category`, `description`, `fields` using those field
descriptors (without hasValue). Field types: `text`, `password`, `number`, `url`,
`boolean`. Initial ids: `generic`, `ai-api-key`, `smtp`, `s3`.

`CredentialInput`: `name: String!`, `description: String`, `templateId: String!`,
`category: String!`, `fields: [CredentialFieldInput!]!`.
Each field input: `key: String!`, `label: String`, `type: String`, `secret: Boolean`,
`action: String!` (`keep`, `replace`, `clear`), `value: String`.
Templates are immutable on edit; generic supports custom keys. Required fields
cannot be cleared. Keep is valid only for existing keys; never submit a placeholder.
Template fields and validation are authoritative server-side. Category is a
bounded free-form label for generic credentials, permitting future categories.
References are generated stable ids, not provider singletons. Multiple named
instances of every template are supported.

Grant metadata: `_id`, `credentialId`, `pluginName`, `name`, `createdAt`,
`revokedAt`. Issuance returns `{ grant: CredentialGrantMetadata!, token: String! }`.
Token is displayed once, held only in component memory, mutation fetchPolicy
`no-cache`, cleared on dismissal. No stored token can be read again.

## Backend-only consumption

`POST <core-api>/credentials/consume`, `Authorization: Bearer <issued token>`,
JSON `{ "reference": "<stable credential reference>" }`.
Success: `{ reference, templateId, values: { [key]: string } }`.
All responses `Cache-Control: no-store`; no secrets in URLs. Tokens are random
256-bit capability secrets stored only as hashes. A tenant locator inside the
token selects a database, but is NOT trusted identity: the complete token hash
must match an active grant bound to that tenant, plugin identity, and one exact
credential. Caller tenant/plugin headers cannot broaden access. Revocation and
deletion fail closed. No tRPC/agent retrieval procedure exists.

The unsigned locator uses the platform `generateModels` boundary: SaaS rejects
unregistered organization subdomains before selecting a tenant database, whose
name derives from the registered organization ID; OS reuses its existing
connection. The locator cannot register a tenant or select an arbitrary database.
The complete hash and tenant-scoped grant are still mandatory authorization.

Plugin `.env` holds its issued consumer token and core endpoint, never the vault
master key. Existing shared agent HMAC authenticates users/tenants, not distinct
plugin identities, so it is deliberately not sufficient for vault retrieval.

The public server helpers `getCredentialValue(key, options?)` and
`getCredentialValues(options?)` from `erxes-api-shared/utils` wrap that same HTTP
contract. Defaults come from `PLATFORM_CREDENTIALS_URL`,
`PLATFORM_CREDENTIALS_TOKEN`, and `PLATFORM_CREDENTIALS_REFERENCE`; options may
override the endpoint, token, reference, and expected template ID per named
instance. Helpers do not cache plaintext, bypass grants, or add retrieval APIs.

## Storage and observability

Encrypt all values with Node AES-256-GCM, fresh nonce, versioned key id/envelope,
AAD binding tenant + record. `CREDENTIALS_VAULT_KEY` (base64 32 bytes) and
`CREDENTIALS_VAULT_KEY_ID` are core-only environment configuration. Fail closed.
No schema auto-journaling or full-document activity hooks for vault/grant models.
Only allowlisted redacted audit metadata is emitted. Credential GraphQL fields
bypass general argument/result logging and before-resolver extensions. Errors,
Sentry events, traces and gateway request capture must not include inputs/tokens.
Management HTTP responses must be no-store too, especially one-time issuance.
