# Gateway — federation and workspace GraphQL

## Ownership

- Public HTTP/GraphQL gateway, identity establishment, service discovery,
  federation routing, locale delivery and existing subscriptions.
- The Apollo Router remains the executor for existing core/plugin GraphQL
  operations. `src/middlewares/workspace-graphql.ts` adds workspace-specific model
  types at the same `/graphql` endpoint, before the static schema limiter/proxy.

## Workspace schema invariants

- Run workspace handling only after the existing identity middleware sanitizes
  and establishes trusted identity headers. Forward that established context to
  core; never trust client-supplied user/model schema metadata.
- Fetch authenticated `dataModelWorkspaceSchema` from the discovered core API on
  each relevant authenticated request. Core owns metadata and permissions; the
  gateway must not read its database or import its private implementation.
- Use the federation public API schema, not raw supergraph internals. The direct
  `@apollo/composition` dependency is needed in the gateway production install.
- Cache compiled schemas by workspace/platform revision/metadata hash with a
  bounded 128-entry cache. Never capture a user/tenant inside a compiled resolver.
  Validate against that request's schema, including introspection configuration.
- Ordinary operations, anonymous/authentication/client-portal traffic and current
  subscriptions retain the existing router path. Generated model subscriptions
  are not added by this HTTP implementation.
- Parse authenticated JSON with the core API's 15 MiB transport ceiling; do not
  consume anonymous request bodies. Known platform-only documents bypass metadata
  fetching. Apply workspace query limits only after workspace-field detection.
- Mixed operations delegate platform roots to the Router and generated roots to
  core's `/data-models/graphql` executor. Preserve aliases, reachable fragments,
  directives, variable scoping, explicit nulls and mutation ordering. Merge root
  field selections and inject collision-free transport aliases for identities and
  typenames. Store transport metadata on symbols so client aliases, directives
  and JSON scalar output remain intact.
- Extra fields on existing built-in types are hydrated through the published
  core generated field API, with per-request load deduplication and core's record
  and original business permission checks. Never expose another tenant's fields.
- `_dataModelVersion` is a selectable field on extended business types. Its
  transport selection aliases the generated field API's `version`; keep it in
  the same per-request load as the model values.
- Relation selections hydrate through the same generated field API with the
  client's nested selections, aliases, reachable fragments, arguments and used
  variables. Distinct paginated selections have separate request-local loads;
  hydration identity variables cannot shadow client variables. Exclude object
  fields from scalar hydration. Nested built-in fields already returned by a
  generated root resolve from that result without another hydration call.
- Limit query size, aliases and depth; forward cookies without logging secrets.

## Validation

- `pnpm nx build gateway`
- `pnpm nx lint gateway`
- `pnpm nx test gateway`
- `pnpm exec tsc -p backend/gateway/tsconfig.build.json --noEmit --incremental false`
- Tests in `src/middlewares/__tests__/workspace-graphql.spec.ts` cover delegation,
  mixed operations, built-in hydration, tenant context and live HTTP schema
  invalidation at `/graphql` with mocked upstreams.
