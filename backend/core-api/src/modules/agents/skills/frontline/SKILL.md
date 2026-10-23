---
name: frontline
description: Frontline team inbox data. Use for conversation volume or reports by channel, source, agent or tag; channels, integrations, brands and phone numbers; call history and call stats; repeat contacts and conversation customers; tickets.
---

Every operation below ran against the live schema. Copy selections and variables as written; reach for `searchGraphql` only for a field this page leaves out.

## Domain map

- **Brand** (`brands`) and **channel** (`getChannels`, a team inbox) are independent. An **integration** (one connected source) carries `brandId` and `channelId`; a conversation reaches its brand and channel through its integration.
- `Integration.kind`: `messenger`, `lead` (forms), `mail`, `nylas-imap`, `facebook-messenger`, `facebook-post`, `instagram-messenger`, `instagram-post`, `calls`, `callpro`, `telnyx`, `smooch-twilio`, `discord-messenger`, `webhook`.
- **Conversation**: `integrationId`, `customerId` (core Customer), `assignedUserIds`, `tagIds` (tag types `inbox:conversation` and `frontline:conversation`), `status` (`new`, `open`, `closed`), `createdAt`, `updatedAt`. `content` is a 100-character preview of the opening message.
- **Messages**: `conversationMessages(conversationId)`; `internal: true` is a team note, `userId` an agent, `customerId` the customer. Call conversations have no messages; their record is the call history.
- **Calls**: a `calls` integration's phone number and queues live in `callReportIntegrations`, joined by `inboxId` = `Integration._id`. Each call links back through `conversationId` and `customerId`. `Integration.callData` is the web-call widget config and holds no phone number.

## Pick the operation

| Question | Operation |
| --- | --- |
| Totals, open/closed/resolved, by source, daily trend, tags | report queries, `filters: ConversationReportFilter` |
| Anything by channel or by agent | alias batch: one document, one aliased report field per channel or agent |
| All-time count per channel, kinds per channel | `getChannels { conversationCount integrationKinds }` |
| Current unassigned / awaiting-response queue | `conversationCounts` |
| Phone numbers per brand or channel | phone join document |
| Calls: volume, agents, queues, repeat callers | call report queries |
| Repeat contacts, chatted-without-deal, complaint themes | code-mode recipes |

**Alias batch** is the default for every per-channel or per-agent breakdown. A loop of single-filter calls costs one tool call per item; the batch costs one.

## Conversation reports

`ConversationReportFilter`: `fromDate`, `toDate` (ISO strings, filter `createdAt`), `channelIds`, `memberIds` (assignees), `source`, `status`, `limit`, `page`. Reports see every channel regardless of membership.

```graphql
query Kpis($f: ConversationReportFilter) {
  total: reportConversationList(filters: $f) { totalCount }
  open: reportConversationOpen(filters: $f) { count percentage }
  closed: reportConversationClosed(filters: $f) { count percentage }
  resolved: reportConversationResolved(filters: $f) { count }
  sources: reportConversationSources(filters: $f) { _id count percentage }
  tags: reportConversationTags(filters: $f) { _id name count percentage }
  trend: reportConversationOpenDate(filters: $f) { date count }
}
```
Variables: `{"f": {"fromDate": "2026-07-22T00:00:00.000Z", "toDate": "2026-10-22T23:59:59.999Z", "limit": 10}}`. Add `"channelIds": ["<channelId>"]` or `"source": "calls"` to narrow it.

What each number means:
- `total`: conversations created in the window, any status.
- `open`: status `open` only, so `new` is excluded. Pass `"status": "new"` to count those.
- `closed`: created in the window and closed now.
- `resolved`: closed within the window, whenever created.
- `sources[]._id`: the integration kind. The `name` field there is one integration's name, so label rows by `_id`.
- `tags`: the most used tags with names resolved. `limit` caps the rows (default 100).
- `trend`: one row per day, `date` is `YYYY-MM-DD`.

### Alias batch by channel (frontline report by channel)

```js
const from = '2026-10-19T00:00:00.000Z', to = '2026-10-22T23:59:59.999Z';
const ch = await external_callGraphql({ query: 'query { getChannels { _id name } }' });
const channels = ch.data.getChannels;
const fields = channels.map((c, i) => `
  t${i}: reportConversationList(filters: { channelIds: ["${c._id}"], fromDate: $from, toDate: $to, limit: 1 }) { totalCount }
  o${i}: reportConversationOpen(filters: { channelIds: ["${c._id}"], fromDate: $from, toDate: $to }) { count }
  r${i}: reportConversationResolved(filters: { channelIds: ["${c._id}"], fromDate: $from, toDate: $to }) { count }`).join('');
const r = await external_callGraphql({ query: `query ByChannel($from: String, $to: String) {${fields}\n}`, variables: { from, to } });
return channels
  .map((c, i) => ({ channel: c.name, created: r.data[`t${i}`].totalCount, open: r.data[`o${i}`].count, resolvedInWindow: r.data[`r${i}`].count }))
  .sort((a, b) => b.created - a.created);
```
Without code mode, send the same aliased document through `callGraphql` after one `getChannels` call. `getChannels` lists team channels only; personal inboxes stay out.

### Alias batch by agent (workload balance)

```js
const from = '2026-09-22T00:00:00.000Z', to = '2026-10-22T23:59:59.999Z';
const resp = await external_callGraphql({
  query: 'query Responses($f: ConversationReportFilter) { reportConversationResponses(filters: $f) { messageCount user { _id email details { fullName } } } }',
  variables: { f: { fromDate: from, toDate: to } },
});
const agents = resp.data.reportConversationResponses;
if (!agents.length) return [];
const fields = agents.map((a, i) => `a${i}: reportConversationList(filters: { memberIds: ["${a.user._id}"], fromDate: $from, toDate: $to, limit: 1 }) { totalCount }`).join('\n');
const counts = await external_callGraphql({ query: `query ByAgent($from: String, $to: String) {\n${fields}\n}`, variables: { from, to } });
return agents.map((a, i) => ({ agent: a.user.details?.fullName || a.user.email, replies: a.messageCount, assigned: counts.data[`a${i}`].totalCount }));
```
`reportConversationResponses` gives agent replies in the window, sorted, so the roster is agents who replied. For a fixed roster, take user ids from `users(ids: [...], limit: 100) { list { _id email details { fullName } } }`.

## Inbox queue and conversation lists

```graphql
query Counts($channelId: String) { conversationCounts(channelId: $channelId) }
```
`conversationCounts` is a JSON scalar, so it takes no selection. Keys: `unassigned`, `awaitingResponse` and the automation keys count current `new`+`open` conversations; `resolved` counts closed ones; `participating`, `mentioned` and `starred` are about the calling user.

```graphql
query Conversations($channelId: String, $status: String, $cursor: String) {
  conversations(channelId: $channelId, status: $status, limit: 50, cursor: $cursor) {
    totalCount
    pageInfo { hasNextPage endCursor }
    list { _id content status createdAt updatedAt integrationId customerId assignedUserIds tagIds
      customer { _id firstName lastName primaryEmail primaryPhone } }
  }
}
```
`conversations` returns `new`+`open` unless `status` is set, and a non-member asking for a channel gets 0 rows. Other filters: `integrationType` (kind), `tag` (tag ids, comma separated), `brandId`, `customerId`, `unassigned: "true"`, `awaitingResponse: "true"`, `searchValue`. Use it for current-state lists; dated questions go through the reports above.

One conversation, its messages, its call record and what it became:
```graphql
query Detail($id: String!) {
  conversationDetail(_id: $id) { _id status createdAt integration { _id kind name channelId brandId } customer { _id firstName lastName primaryPhone } tags { _id name } assignedUsers { _id details { fullName } } }
  conversationMessages(conversationId: $id, limit: 50) { _id content internal fromBot userId customerId createdAt }
  conversationMessagesTotalCount(conversationId: $id)
  callHistoryDetail(conversationId: $id) { callStatus callType callDuration callStartTime customerPhone operatorPhone extensionNumber }
  conversationConvertedItems(_id: $id) { type _id }
}
```

## Channels, integrations, brands, phone numbers

```graphql
query Setup($kind: String, $cursor: String) {
  getChannels { _id name integrationKinds integrationCount memberCount conversationCount }
  brands(limit: 100) { totalCount list { _id name code } }
  integrations(channelId: "", kind: $kind, limit: 100, cursor: $cursor) {
    totalCount
    pageInfo { hasNextPage endCursor }
    list { _id name kind brandId channelId isActive }
  }
  integrationsGetUsedTypesByChannel { _id name conversationCount unreadConversationCount }
}
```
`channelId: ""` lists integrations from every channel. `Channel.conversationCount` is all-time, every status. `integrationsGetUsedTypesByChannel` (optional `channelId`) gives all-time conversations per kind across active integrations.

Phone join, for "which brands or channels have phone numbers":
```graphql
query Phones {
  callReportIntegrations { inboxId phone queues }
  integrations(channelId: "", kind: "calls", limit: 100) { list { _id name brandId channelId isActive } }
  brands(limit: 100) { list { _id name } }
  getChannels { _id name }
}
```
Join `callReportIntegrations.inboxId` to `integrations.list._id`, then `brandId` and `channelId` to the names. CallPro numbers come per integration: list `integrations(channelId: "", kind: "callpro", limit: 100)`, then alias-batch `callProIntegrationDetail(integrationId: "<id>") { phoneNumber }`.

## Calls

Call reports take `startDate`, `endDate` (ISO strings, `endDate` exclusive), optional `integrationId` (the `calls` Integration `_id`), `queueId`, `direction` (`Inbound`, `Outbound`). Non-admin users see only integrations they operate.

```graphql
query CallStats($startDate: String!, $endDate: String!, $integrationId: String) {
  callKpiScorecard(startDate: $startDate, endDate: $endDate, integrationId: $integrationId) { callstotal serviceLevel abandonment averageSpeed averageAnsweredTime firstCallResolution }
  callGetQueueStats(startDate: $startDate, endDate: $endDate, integrationId: $integrationId) { queue totalCalls answeredCalls answeredRate abandonedCalls averageWaitTime averageTalkTime }
  callGetAgentStats(startDate: $startDate, endDate: $endDate, integrationId: $integrationId) { agent agentName totalCalls answeredCalls missedCalls averageTalkTime }
  callTopNumbers(startDate: $startDate, endDate: $endDate, integrationId: $integrationId, limit: 20) { number attempts answered missed duration }
  callVolumeSeries(startDate: $startDate, endDate: $endDate, integrationId: $integrationId) { day incoming outgoing answered noAnswer abandoned }
}
```
`callTopNumbers` answers "who calls repeatedly". Call history, newest first:
```graphql
query Calls($startDate: String!, $endDate: String!, $outcome: String, $skip: Int) {
  callHistoryList(startDate: $startDate, endDate: $endDate, outcome: $outcome, skip: $skip, limit: 100) {
    totalCount callerCount
    agents { extension name }
    entries { uniqueid startedAt direction outcome isAnswered waitTime talkTime agentName queue customerPhone customerId conversationId repeatCount }
  }
}
```
`outcome`: `ANSWERED`, `MISSED`, `NO ANSWER`, `BUSY`, `FAILED`, `VOICEMAIL`, `IVR`, `FOLLOWME`. Tags on call conversations: the `Kpis` document with `"source": "calls"`.

## Tickets

```graphql
query Tickets($filter: ITicketFilter, $f: TicketReportFilter) {
  getTickets(filter: $filter) { totalCount pageInfo { hasNextPage endCursor } list { _id number name priority createdAt channelId status { name type } assignee { _id details { fullName } } } }
  reportTicketTotalCount(filters: $f)
  reportTicketStatusSummary(filters: $f) { name count percentage }
  reportTicketPriority(filters: $f) { priority name count }
  reportTicketTags(filters: $f) { name count }
}
```
Variables: `{"filter": {"channelId": "<channelId>", "limit": 50}, "f": {"channelIds": ["<channelId>"], "fromDate": "...", "toDate": "..."}}`.

## Code-mode recipes for aggregates the API lacks

Page `reportConversationList` with a narrow selection, run pages through `Promise.all`, aggregate inside the program and return only the answer.

Repeat contacts, plus the customer ids reused by the no-deal recipe:
```js
const from = '2026-09-22T00:00:00.000Z', to = '2026-10-22T23:59:59.999Z';
const Q = 'query Page($f: ConversationReportFilter) { reportConversationList(filters: $f) { totalPages list { customerId } } }';
const page = (n) => external_callGraphql({ query: Q, variables: { f: { fromDate: from, toDate: to, limit: 1000, page: n } } });
const first = await page(1);
const totalPages = first.data.reportConversationList.totalPages;
const scanned = Math.min(totalPages, 12);
const rest = await Promise.all(Array.from({ length: scanned - 1 }, (_, i) => page(i + 2)));
const counts = {};
for (const r of [first, ...rest]) for (const { customerId } of r.data.reportConversationList.list) if (customerId) counts[customerId] = (counts[customerId] || 0) + 1;
const top = Object.entries(counts).filter(([, n]) => n > 1).sort((a, b) => b[1] - a[1]).slice(0, 20);
const names = await external_callGraphql({
  query: 'query Customers($ids: [String]) { customers(ids: $ids, limit: 100) { list { _id firstName lastName primaryEmail primaryPhone } } }',
  variables: { ids: top.map(([id]) => id) },
});
const byId = Object.fromEntries(names.data.customers.list.map((c) => [c._id, c]));
return { scannedPages: scanned, totalPages, top: top.map(([id, n]) => ({ customer: byId[id] ?? { _id: id }, conversations: n })) };
```

Chatted but no deal: run the first half of the repeat-contacts recipe to fill `counts`, then:
```js
const ids = Object.keys(counts);
const chunks = [];
for (let i = 0; i < ids.length; i += 50) chunks.push(ids.slice(i, i + 50));
const DQ = 'query Deals($ids: [String], $cursor: String) { deals(customerIds: $ids, limit: 100, cursor: $cursor) { pageInfo { hasNextPage endCursor } list { customers { _id } } } }';
const withDeal = new Set();
await Promise.all(chunks.map(async (chunk) => {
  let cursor;
  do {
    const r = await external_callGraphql({ query: DQ, variables: { ids: chunk, cursor } });
    for (const d of r.data.deals.list) for (const c of d.customers ?? []) withDeal.add(c._id);
    cursor = r.data.deals.pageInfo.hasNextPage ? r.data.deals.pageInfo.endCursor : undefined;
  } while (cursor);
}));
const noDeal = ids.filter((id) => !withDeal.has(id));
return { chatted: ids.length, withDeal: ids.length - noDeal.length, noDeal: noDeal.length, sampleIds: noDeal.slice(0, 50) };
```
Resolve the returned `sampleIds` with the `Customers` document above.

Complaint themes: tags from the `Kpis` document (`limit: 15`), then a text sample you read and group, one alias per chat source:
```graphql
query Sample($from: String, $to: String) {
  messenger: reportConversationList(filters: { source: "messenger", fromDate: $from, toDate: $to, limit: 300 }) { totalCount list { content } }
  facebook: reportConversationList(filters: { source: "facebook-messenger", fromDate: $from, toDate: $to, limit: 300 }) { totalCount list { content } }
}
```
Call conversations' `content` is the caller's number, so call topics come from tags only.

**Partial results.** When a recipe scans fewer pages than `totalPages` or samples a slice, the answer states the scanned share ("from 12,000 of 15,300 conversations") and labels themes from samples as a sample.

## Gotchas

- **64KB per `callGraphql` result**, in chat and in code mode. Code mode also stops at 15 seconds and caps its return value at 64KB. Rows per page that fit: about 1000 with `customerId` only, 400 with five scalar fields, 300 with `content`, 150 `callHistoryList` entries.
- **Cursor lists** (`integrations`, `conversations`, `brands`, `tags`, `customers`, `users`, `deals`, `getTickets`) take `limit` 1 to 100. `totalCount` and `pageInfo { hasNextPage endCursor }` come back in the same response; pass `endCursor` as `cursor`. `reportConversationList` pages with `page` and `limit` and returns `totalPages`.
- **Required args**: `integrations(channelId: String!)` and `integrationsTotalCount(channelId: String!)`, so pass `""` for all channels. Call reports require `startDate` and `endDate`.
- **Object fields need a selection**: `callData { header isReceiveWebCall }`, `customer { ... }`, `integration { ... }`, `tags { _id name }`, `assignedUsers { _id details { fullName } }`, `user { details { fullName } }`, Ticket `status { name }`.
- **Real field names**: phone number is `callReportIntegrations.phone` (or `callProIntegrationDetail.phoneNumber`). An integration's brand is `brandId` resolved through `brands`. A deal's customers are `customers { _id }`; `Deal.customerIds` comes back null.
- **`conversationCounts(only: ...)`** returns 0 for every key under `byChannels`, `byTags` and `byIntegrationTypes`. Use an alias batch.
- **`conversations` with `startDate` + `endDate`** matches `createdAt` OR `updatedAt` and silently drops `integrationType` and `searchValue`. Report queries count created-in-window correctly.
- **Report `source`** accepts `messenger`, `facebook-messenger`, `facebook-post`, `instagram-messenger`, `instagram-post`, `calls`. Any other value is ignored and the report counts every source. For `mail` or `lead`, read the row from `reportConversationSources` or narrow by `channelIds`.
- **Tag names**: take them from `reportConversationTags`. To list every conversation tag, alias `tags(type: "inbox:conversation", limit: 100)` with `tags(type: "frontline:conversation", includeWorkspaceTags: true, limit: 100)`, both selecting `totalCount list { _id name }`.

## Out of reach through GraphQL

Say so plainly and offer the nearest answer:
- Telnyx and Smooch/Twilio phone numbers.
- Full message text in bulk. Only the 100-character `content` preview is listable; full text is one `conversationMessages` call per conversation.
- Chat first-response time and chat SLA. SLA exists for calls only (`callSlaReport`).
- Topic, complaint or sentiment classification beyond tags.
- Dated conversation counts per brand. Reports filter by channel, not brand; map brands through `integrations` and page `reportConversationList { list { integrationId } }`.
