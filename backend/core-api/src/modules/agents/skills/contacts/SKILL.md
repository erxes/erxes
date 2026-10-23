---
name: contacts
description: Contacts and team members. Load for any question about customers, leads, visitors, companies, team members or the current user ("me"), including counts, per-month trends, finding a person by email/phone/name, duplicates, tags, segments and customer-company links.
---

Every recipe below ran against the live API. Copy selections and variables as written; a guessed field fails validation.

## Domain map

- **One collection, three states.** `customers` holds every contact. `type` filters the `state` field: `"visitor"` (anonymous web/messenger session, usually no name or email), `"lead"`, `"customer"`. Visitors are the vast majority, so pass `type` whenever the user says customers or leads; leave it out only for "all contacts". Deleted contacts are excluded automatically.
- **Customer names are top level** (`firstName lastName primaryEmail emails primaryPhone phones`). **Team member names are nested** under `User.details` (below).
- **Companies** are a separate collection: `companies`, `companyDetail`.
- **Links** between records live in Relations, written by the UI. Content types: `core:customer`, `core:company`, `sales:deal`, `frontline:ticket`, `frontline:conversation`, `operation:task`, `operation:project`.
- **Tags** have a `type` per record kind: `core:customer`, `core:company`. Customers carry `tagIds`.
- **Segments** are saved condition trees. Content types: `core:contacts.customers`, `core:contacts.leads`, `core:contacts.companies`, `core:organization.users`. The segmentation worker writes `segmentIds` onto member records.

## Count, never page

`totalCount` applies every filter. Ask for `limit: 1` and read `totalCount`; one document can carry many aliased counts. Listing 100 records and counting them answers a different question.

```graphql
query ContactTotals {
  leads: customers(type: "lead", limit: 1) { totalCount }
  customers: customers(type: "customer", limit: 1) { totalCount }
  visitors: customers(type: "visitor", limit: 1) { totalCount }
  companies: companies(limit: 1) { totalCount }
}
```

### Per month (new customers each month)

`dateFilters` is a JSON **string**: `{"<field>":{"gte":"<ISO>","lte":"<ISO>"}}`. Fields: `createdAt`, `updatedAt`, `lastSeenAt`, `birthDate`. One alias per month, all months in one call:

```graphql
query NewCustomersByMonth($m01: String, $m02: String, $m03: String) {
  m01: customers(type: "customer", dateFilters: $m01, limit: 1) { totalCount }
  m02: customers(type: "customer", dateFilters: $m02, limit: 1) { totalCount }
  m03: customers(type: "customer", dateFilters: $m03, limit: 1) { totalCount }
}
```
```json
{ "m01": "{\"createdAt\":{\"gte\":\"2026-01-01T00:00:00.000Z\",\"lte\":\"2026-01-31T23:59:59.999Z\"}}",
  "m02": "{\"createdAt\":{\"gte\":\"2026-02-01T00:00:00.000Z\",\"lte\":\"2026-02-28T23:59:59.999Z\"}}",
  "m03": "{\"createdAt\":{\"gte\":\"2026-03-01T00:00:00.000Z\",\"lte\":\"2026-03-31T23:59:59.999Z\"}}" }
```

Extend to twelve aliases for a full year; stop at the current month. Boundaries are UTC unless you write an offset (`2026-01-01T00:00:00+08:00` works). `createdAt` is when the record was created; there is no "became a customer" timestamp. Run the same document with `type: "lead"` for new leads.

### Engaged recently (last 14 days)

`lastSeenAt` is the contact's own last activity (web or messenger session). `updatedAt` is touched by imports and syncs, so it says nothing about engagement.

```graphql
query EngagedSince($since: String) {
  all: customers(dateFilters: $since, limit: 1) { totalCount }
  leads: customers(type: "lead", dateFilters: $since, limit: 1) { totalCount }
  customers: customers(type: "customer", dateFilters: $since, limit: 1) { totalCount }
}
```
```json
{ "since": "{\"lastSeenAt\":{\"gte\":\"2026-10-08T00:00:00.000Z\"}}" }
```

Say which signal you used. Engagement through conversations, deals or tickets belongs to those modules; count it there by date.

## Find a contact by email, phone or name

`searchValue` splits the input into words and matches each as a word prefix across names, emails, phones and `code`, all words required. Leave out `type` to search every state.

```graphql
query FindContact($q: String) {
  customers(searchValue: $q, limit: 20) {
    totalCount
    list { _id state firstName lastName primaryEmail emails primaryPhone phones createdAt lastSeenAt }
  }
}
```
```json
{ "q": "<email, phone or name>" }
```

Prefix matching returns near misses (`ann@x.com` also finds `anna@x.com`). Confirm an exact match against `primaryEmail`/`emails`/`primaryPhone`/`phones` before reporting it.

## Duplicates

**One value** ("is this email duplicated?"): run `FindContact`; two or more exact matches are duplicates, across all states.

**The whole base** has no grouping endpoint. The cheapest correct method is a sorted scan in code mode: sort by the field descending (empty values sort last), compare keys, stop at the first empty value. One state per scan; without `type` the sort covers every visitor and each page takes seconds. A program has 15 seconds, so it stops at 10 s and returns `nextCursor`; run it again with that cursor until `finished`, and merge groups that share a value across runs.

```js
const field = "primaryEmail"; // or "primaryPhone"
const type = "lead";          // or "customer"
let cursor = null;            // previous run's nextCursor
const query = `query DuplicateScan($type: String, $orderBy: JSON, $cursor: String) {
  customers(type: $type, orderBy: $orderBy, limit: 100, cursor: $cursor) {
    list { _id primaryEmail primaryPhone firstName lastName }
    pageInfo { hasNextPage endCursor }
  }
}`;
const groups = new Map();
let scanned = 0, finished = false;
const started = Date.now();
while (!finished && Date.now() - started < 10000) {
  const { data, errors } = await external_callGraphql({ query, variables: { type, orderBy: { [field]: -1 }, cursor } });
  if (errors) return { errors };
  const { list, pageInfo } = data.customers;
  for (const c of list) {
    const key = String(c[field] ?? "").replace(/\s+/g, "").toLowerCase();
    if (!key) { finished = true; break; }
    scanned += 1;
    groups.set(key, [...(groups.get(key) ?? []), c._id]);
  }
  finished ||= !pageInfo.hasNextPage;
  cursor = pageInfo.endCursor;
}
const duplicates = [...groups].filter(([, ids]) => ids.length > 1).map(([value, ids]) => ({ value, ids }));
return { scanned, finished, nextCursor: finished ? null : cursor, duplicates };
```

A run covers about 9,000 records. Get the denominator first, the number of records that have the field at all:

```graphql
query CountWithEmail($root: JSON!) {
  segmentsPreviewCount(contentType: "core:contacts.leads", root: $root) { count unsupported exceeded }
}
```
```json
{ "root": { "kind": "group", "conjunction": "and", "children": [
  { "kind": "field", "contentType": "core:contacts.leads", "fieldKey": "primaryEmail", "operator": "is" } ] } }
```

For the customer state use `contentType: "core:contacts.customers"` in both places and add `{ "kind": "field", "contentType": "core:contacts.customers", "fieldKey": "state", "operator": "e", "value": "customer" }` to `children`, since that content type also covers visitors. Treat the count as an upper bound.

Label the answer with its scope: the field, the state, "scanned X of Y", and that matching is exact after lowercasing. A lead and a customer sharing an email are invisible to per-state scans; check suspected cross-state pairs with `FindContact`. Name duplicates are weak evidence; report them as "possible" and pair names with a matching email or phone.

## Tags and segments

```graphql
query CustomerTags($q: String) {
  tags(type: "core:customer", searchValue: $q, limit: 100) {
    totalCount
    list { _id name parentId objectCount }
  }
}
```

`objectCount` counts every state. For one state, filter customers by tag (`excludeTagIds` inverts):

```graphql
query CustomersByTag($tagIds: [String]) {
  leads: customers(type: "lead", tagIds: $tagIds, limit: 1) { totalCount }
  customers: customers(type: "customer", tagIds: $tagIds, limit: 1) { totalCount }
}
```

`customersCount(types: [TAG])` returns `{ tag: { <tagId>: count } }` for every customer tag at once; join names from `CustomerTags`.

```graphql
query ContactSegments {
  segments(contentTypes: ["core:contacts.customers", "core:contacts.leads"]) {
    _id name contentType status membersCount membersCountedAt
  }
}
```

`membersCount` is the worker's last tally and lags. For a current number use `segmentMemberCount`, or `customers(segmentIds:)` to combine with `type` and dates:

```graphql
query SegmentSize($segmentId: String!, $segmentIds: [String]) {
  segmentMemberCount(segmentId: $segmentId) { count unsupported exceeded }
  customers(segmentIds: $segmentIds, limit: 1) { totalCount }
}
```

## Companies and links

```graphql
query FindCompany($q: String) {
  companies(searchValue: $q, limit: 20) {
    totalCount
    list { _id primaryName primaryEmail primaryPhone website industry createdAt }
  }
}
```

Read links from Relations, then fetch the records by id. `Customer.companies` and `Company.customers` read an older link store, miss links made in the UI, and `Customer.companies` stops at 10.

```graphql
query CustomerCompanies($customerId: String!) {
  getRelationsByEntity(contentType: "core:customer", contentId: $customerId, relatedContentType: "core:company") {
    entities { contentType contentId }
  }
}
```

Each relation lists both ends; keep the `contentId` whose `contentType` matches the related type. Swap the arguments for a company's customers, or use `relatedContentType: "sales:deal"` for deals. For up to 100 records at once use `getRelationsByContentIds(contentType:, contentIds:, relatedContentType:)`. Then fetch the records with `companies(ids: $ids, limit: 100) { list { _id primaryName primaryEmail primaryPhone } }` or `customers(ids: $ids, limit: 100)`.

## Team members and "me"

`User` has `_id username email isActive` at top level. Name, phone and job title sit in `details`, which needs a subselection. Phone is `details.operatorPhone`.

```graphql
query Me {
  currentUser { _id username email isOwner details { fullName firstName lastName position operatorPhone } departmentIds branchIds }
}
```

```graphql
query TeamMembers($q: String, $cursor: String) {
  active: usersTotalCount
  deactivated: usersTotalCount(isActive: false)
  users(searchValue: $q, limit: 100, cursor: $cursor) {
    totalCount
    list { _id username email isActive details { fullName firstName lastName position operatorPhone } }
    pageInfo { hasNextPage endCursor }
  }
}
```

`users` and `usersTotalCount` return active members unless you pass `isActive: false`. `searchValue` matches `email`, `username`, `employeeId`, `details.fullName` and `details.position`, case-insensitive substring. For "missing phone or email", list all active members with `TeamMembers` and check `details.operatorPhone` and `email` yourself; page with `cursor` when `totalCount` exceeds 100.

## Gotchas

- `limit` is 1 to 100 on `customers`, `companies`, `users`, `tags`; default 20. These lists have no `page`/`perPage`. Next page: pass `pageInfo.endCursor` as `cursor`.
- Sort with `orderBy: { createdAt: -1 }` (any field, `1` or `-1`). Without it the order is by `_id`, which is random.
- `customers` accepts but ignores `startDate`, `endDate`, `sortField`, `sortDirection`, `leadStatus`, `segment`, `formIds`, `emailValidationStatus`, `sex`, `birthDate`, `conformity*` and `aggregationPipeline`. Use `dateFilters`, `orderBy` and `segmentIds`.
- `segmentsPreviewCount` with `exceeded: true` gave up; that count is not an answer. Relation conditions (a customer's conversations, deals) hit this on large bases. Its counts include deleted contacts, and `core:contacts.customers` includes visitors, so use them for denominators, not headline numbers.
- `Customer.owner` and `Company.owner` are `User`: select `owner { _id details { fullName } }`. Tag names: `getTags { _id name }`.
