# GROUND: Create agent-assistant plugin with agent entity

**Wish:** [`./WISH.md`](./WISH.md) | **Spec:** [`./SPEC.md`](./SPEC.md)

## Sister features

### Sister 1: `payment` plugin (payment methods CRUD)
**Why chosen:** Same shape — single entity with name/status/config fields, GraphQL CRUD, settings page wiring. payment_api is a canonical simple plugin with one primary entity.
**Implemented in:**
- `backend/plugins/payment_api/src/connectionResolvers.ts` — model registration pattern
- `backend/plugins/payment_api/src/modules/payment/db/definitions/payment.ts` — Mongoose schema with enum + timestamps
- `backend/plugins/payment_api/src/modules/payment/db/models/Payment.ts` — model class with static methods
- `backend/plugins/payment_api/src/modules/payment/@types/payment.ts` — TypeScript interface
- `backend/plugins/payment_api/src/modules/payment/graphql/schemas/payment.ts` — GraphQL types/queries/mutations
- `backend/plugins/payment_api/src/apollo/resolvers/index.ts` — resolver composition
- `backend/plugins/payment_api/src/apollo/resolvers/mutations.ts` — mutation aggregation
- `backend/plugins/payment_api/src/apollo/resolvers/queries.ts` — query aggregation
- `backend/plugins/payment_api/src/apollo/schema/schema.ts` — schema aggregation
- `backend/plugins/payment_api/src/apollo/typeDefs.ts` — typeDefs assembly with apolloCommonTypes
- `backend/plugins/payment_api/src/main.ts` — startPlugin with port 3310

## Files I read in full

- [x] `backend/plugins/payment_api/src/connectionResolvers.ts`
- [x] `backend/plugins/payment_api/src/modules/payment/db/definitions/payment.ts`
- [x] `backend/plugins/payment_api/src/modules/payment/db/models/Payment.ts`
- [x] `backend/plugins/payment_api/src/modules/payment/@types/payment.ts`
- [x] `backend/plugins/payment_api/src/modules/payment/graphql/schemas/payment.ts`
- [x] `backend/plugins/payment_api/src/apollo/resolvers/index.ts`
- [x] `backend/plugins/payment_api/src/apollo/resolvers/mutations.ts`
- [x] `backend/plugins/payment_api/src/apollo/resolvers/queries.ts`
- [x] `backend/plugins/payment_api/src/apollo/schema/schema.ts`
- [x] `backend/plugins/payment_api/src/apollo/typeDefs.ts`
- [x] `backend/plugins/payment_api/src/main.ts`

## Files to edit (mapped from sisters)

| File | Why | Sister equivalent |
|---|---|---|
| `backend/plugins/agent-assistant_api/src/connectionResolvers.ts` | Register AgentAssistant model | `payment_api/src/connectionResolvers.ts` |
| `backend/plugins/agent-assistant_api/src/main.ts` | Start plugin on port 33011 | `payment_api/src/main.ts` |
| `backend/plugins/agent-assistant_api/src/apollo/typeDefs.ts` | Assemble typeDefs | `payment_api/src/apollo/typeDefs.ts` |
| `backend/plugins/agent-assistant_api/src/apollo/resolvers/index.ts` | Compose resolvers | `payment_api/src/apollo/resolvers/index.ts` |
| `backend/plugins/agent-assistant_api/src/apollo/resolvers/mutations.ts` | Aggregate mutations | `payment_api/src/apollo/resolvers/mutations.ts` |
| `backend/plugins/agent-assistant_api/src/apollo/resolvers/queries.ts` | Aggregate queries | `payment_api/src/apollo/resolvers/queries.ts` |
| `backend/plugins/agent-assistant_api/src/apollo/schema/schema.ts` | Aggregate schema | `payment_api/src/apollo/schema/schema.ts` |

## Files to create

| File | Why | Closest existing analogue |
|---|---|---|
| `backend/plugins/agent-assistant_api/src/modules/agent-assistant/db/definitions/agent-assistant.ts` | Mongoose schema for AgentAssistant | `payment_api/src/modules/payment/db/definitions/payment.ts` |
| `backend/plugins/agent-assistant_api/src/modules/agent-assistant/db/models/AgentAssistant.ts` | Model class with CRUD statics | `payment_api/src/modules/payment/db/models/Payment.ts` |
| `backend/plugins/agent-assistant_api/src/modules/agent-assistant/@types/agent-assistant.ts` | TypeScript interface | `payment_api/src/modules/payment/@types/payment.ts` |
| `backend/plugins/agent-assistant_api/src/modules/agent-assistant/graphql/schemas/agent-assistant.ts` | GraphQL schema | `payment_api/src/modules/payment/graphql/schemas/payment.ts` |
| `backend/plugins/agent-assistant_api/src/modules/agent-assistant/graphql/resolvers/mutations/agent-assistant.ts` | Mutation resolvers | `payment_api/src/modules/payment/graphql/resolvers/mutations/payments.ts` |
| `backend/plugins/agent-assistant_api/src/modules/agent-assistant/graphql/resolvers/queries/agent-assistant.ts` | Query resolvers | `payment_api/src/modules/payment/graphql/resolvers/queries/payments.ts` |
| `backend/plugins/agent-assistant_api/src/meta/permissions.ts` | Permission definitions | `content_api/src/meta/permissions.ts` |
| `backend/plugins/agent-assistant_api/src/trpc/init-trpc.ts` | tRPC router | `payment_api/src/trpc/init-trpc.ts` |
| `backend/plugins/agent-assistant_api/src/trpc/trpc-clients.ts` | tRPC clients | `payment_api/src/trpc/trpc-clients.ts` |

## Deviations from sister

- **What's different:** AgentAssistant has a `modelProvider` enum field and `apiKey` sensitive field; payment has `kind` enum and `config` object.
- **Why we deviate:** The wish specifies an AI agent configuration entity, not a payment method.
- **Risk:** apiKey should be encrypted at rest; for MVP we store plaintext with a note that encryption is a follow-up.

## Cross-plugin impact

- [ ] No (single plugin only)

## Approval

- [x] All listed files read in full
- [x] Sister features confirmed appropriate
- [x] Deviations documented
- [x] Cross-plugin impact assessed
