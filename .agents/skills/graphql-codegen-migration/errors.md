# Reading codegen errors

Find the step that failed, then sort each message into one of these kinds.

## Print error: `<name>_api:schema:print` fails

The subgraph SDL doesn't build. Typical causes are an SDL syntax error, a reference to an undefined type, or a subscription field declared in both `subscription.ts` and the subgraph SDL. The fix goes in that backend's `src`.

## Compose error: `gateway:schema:compose` fails

The subgraphs disagree with each other. Examples are a shared enum with different values in two subgraphs, or a field with conflicting argument types. Every plugin's codegen is red until it's fixed, so fix it first, in the subgraph that diverged from the others. The router hits the same error at runtime for any deployment that enables both plugins.

## Codegen syntax error

`Syntax Error: Expected Name, found "}"` or `Expected "$", found ")"` means a document has a `${...}` interpolation codegen can't read. Rewrite it with [fragments.md](fragments.md).

## Codegen validation error

A document doesn't match the composed schema. For each one, decide which side is wrong:

- **Query mistake.** The field exists under another name, or the selection is malformed. Fix the document.
- **Drift.** The UI uses a field or mutation the backend no longer has, or never had. Either the backend adds it back with a resolver, or the UI stops using it. Ask the owner which one. When the backend side belongs to another team, open an issue for them.

| Message                                                                         | Usually                                                                     |
| ------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `Cannot query field "x" on type "Y"`                                            | drift, or a typo when it says "Did you mean"                                |
| `Field "x" of type "[T]" must have a selection of subfields`                    | the backend changed a scalar or `JSON` field into an object type            |
| `Unknown fragment "F"`                                                          | the fragment lives in an interpolated string, or isn't defined with `gql()` |
| `Unknown argument` / `Variable "$x" of type ... used in position expecting ...` | an argument was renamed or changed type                                     |
| `Not all operations have an unique name`                                        | two documents share an operation name                                       |

## Type error after codegen passes

`tsc` complains where the UI assumed a stricter type than the composed schema gives. Apply the nullability rules in SKILL.md. Either the SDL tightens, with data to back it, or the UI handles `null`.

## Contract fixes in the owning backend

- **Required arguments.** An argument the resolver can't run without is non-null in the SDL. Keep a runtime guard for empty strings, because GraphQL validation lets them through.
- **JSON outputs.** When the UI reads structure out of a `JSON` field, replace the field with SDL object types. The resolver then returns that shape every time, with zero values or empty arrays instead of `{}`.
- **Resolver parity.** Every SDL field has a resolver, and every resolver is declared in the SDL.
- **Regex input.** Request text that reaches `new RegExp()` or `$regex` goes through `escapeRegExp` from `erxes-api-shared/utils`. Operation's backend `eslint.config.js` has a rule that enforces it.

## Worked example: frontline_ui on main

Checked against frontline's own subgraph schema only, 318 parseable documents produced 606 validation errors. Most of them were fields owned by core, operation or content, which that schema couldn't see. Against the composed schema the count fell to 25, and every one of the 25 is drift or a query mistake:

- Dead call mutations: `callsUpdateIntegration`, `callTerminateSession`, `callDisconnect`, `callSelectCustomer`, and the `callCustomers` query.
- `InstagramPostMessage` fields the SDL doesn't have, such as `postId`, `senderId` and `permalink_url`.
- `channels`, `channelsTotalCount`, and `Channel.memberIds` and `integrationIds`, which the backend renamed or removed.
- `conversationMessagePin`, which has no mutation behind it.
- `Unknown fragment "AttachmentFragment"`, which is defined in an interpolated string.
- `getStatusesChoicesByTeam` queried without a selection set. Operation changed it from `JSON` to `[StatusChoice]`. That broke the convert-to-task status picker on officenext, and #9595 fixed it. Codegen against the composed schema would have failed frontline's build before the deploy.

Another 11 documents didn't parse because of `${fragment}` interpolation, so step 2 comes first.
