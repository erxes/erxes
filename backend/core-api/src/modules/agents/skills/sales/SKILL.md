---
name: sales
description: Sales playbook with verified GraphQL for deals, boards, pipelines and stages. Load for deal lists or counts, deal amounts, won revenue or forecasts, deals stuck in a stage, top customers by deal value, deals per owner or product.
---

Every document below ran clean against the live schema. Copy it, fill the variables, and call it. Reach for `searchGraphql` only for a field this page leaves out.

## Domain map

- **board → pipeline → stage → deal.** A deal stores only `stageId`. `pipeline`, `pipelineId` and `boardId` on a deal resolve through its stage.
- **Outcome lives on the stage.** `SalesStage.probability` is a string: `"10%"` … `"90%"`, `"Won"`, `"Lost"`, sometimes `""`. Open = any stage that is neither Won nor Lost. `Deal.status` is only `active`/`archived`; the API leaves archived deals out by default.
- **Owner = assignee.** `assignedUserIds` / `assignedUsers`. `userId` / `createdUser` is the creator. Filters: `assignedUserIds: [<userId>]`, `assignedToMe: "true"`, `userIds` (creator).
- **Money sits in product lines.** `productsData` is a JSON array of lines `{ productId, quantity, unitPrice, discount, tax, amount, currency, tickUsed }`. `Deal.amount` is a JSON map `{ "<CURRENCY>": total }` over lines with `tickUsed: true`; `unUsedAmount` sums the unticked lines. Report each currency separately; amounts in different currencies never add up.
- **Contacts.** `customers: [Customer]` and `companies: [Company]`; filter with `customerIds` / `companyIds`.
- **Dates.** `closeDate` is the expected close date a user sets. `stageChangedDate` is when the deal entered its current stage, so for a deal in a Won stage it is the won date. `createdAt` is creation. Date filters take ISO strings: `closeDateStartDate/EndDate`, `stageChangedStartDate/EndDate`, `createdStartDate/EndDate`, `startDateStartDate/EndDate`. `closeDateType`: `nextDay`, `nextWeek`, `nextMonth`, `noCloseDate`, `overdue`.

## Scope first

Archived pipelines still hold most old deals. An unscoped `dealsTotalCount` counts them and an unscoped `dealsTotalAmounts` errors. Start every aggregate with the active pipelines and pass their ids as `pipelineIds`:

```graphql
query { salesPipelines(limit: 100) { totalCount list { _id name itemsTotalCount } } }
```

`itemsTotalCount` is the deal count per pipeline. There is no name filter: match a named pipeline against `list[].name` (case-insensitive, partial). Board grouping comes from `salesBoards`, which skips pipelines whose board was deleted:

```graphql
query { salesBoards { _id name pipelines { _id name } } }
```

## Recipes

**1. Pipeline snapshot: per-stage count and amount, one call.** Pass `pipelineId` or `pipelineIds`.

```graphql
query Snapshot($pipelineIds: [String], $extraParams: JSON) {
  salesStages(pipelineIds: $pipelineIds, extraParams: $extraParams) {
    _id name pipelineId order probability itemsTotalCount amount
  }
}
```
```json
{ "pipelineIds": ["<pipelineId>"], "extraParams": { "assignedToMe": "true" } }
```

`itemsTotalCount` and `amount` take their deal filters from the `$extraParams` JSON variable. Put every filter there, named exactly like the `deals` arguments (`assignedUserIds`, `closeDateStartDate`, `stageChangedEndDate`, `productIds` …); `{}` means no filter. Sum the rows yourself: open = rows whose probability is neither Won nor Lost.

**2. Counts.** `dealsTotalCount` takes every `deals` filter and returns an Int.

```graphql
query Count($pipelineIds: [String], $assignedUserIds: [String], $closeDateType: String) {
  dealsTotalCount(pipelineIds: $pipelineIds, assignedUserIds: $assignedUserIds, closeDateType: $closeDateType)
}
```
```json
{ "pipelineIds": ["<pipelineId>"], "assignedUserIds": ["<userId>"], "closeDateType": "overdue" }
```

**3. Totals by currency and outcome.**

```graphql
query Totals($pipelineIds: [String], $closeDateStartDate: Date, $closeDateEndDate: Date) {
  dealsTotalAmounts(pipelineIds: $pipelineIds, closeDateStartDate: $closeDateStartDate, closeDateEndDate: $closeDateEndDate) {
    name currencies { name amount }
  }
}
```
```json
{ "pipelineIds": ["<pipelineId>"], "closeDateStartDate": "2026-01-01", "closeDateEndDate": "2026-12-31" }
```

Buckets by `name`: `Won`, `Lost`, `In progress` (all open stages) and `forecasted 10-90%` (open amounts weighted by stage probability). A bucket with no deals is missing from the list; read it as zero. The error `Float cannot represent non numeric value: NaN` means a stage has a blank probability: that forecast amount comes back null, and the other buckets are still correct.

**4. Deals stuck in a stage for N+ days.** Cutoff = now minus N days, as ISO. Count per stage for a whole pipeline with recipe 1 and `"extraParams": { "stageChangedEndDate": "<cutoff>" }`, skipping Won and Lost rows. List the oldest first:

```graphql
query Stuck($stageId: String, $stageChangedEndDate: Date, $orderBy: JSON, $limit: Int) {
  deals(stageId: $stageId, stageChangedEndDate: $stageChangedEndDate, orderBy: $orderBy, limit: $limit) {
    totalCount
    list { _id name stageChangedDate amount assignedUsers { _id details { fullName } } }
  }
}
```
```json
{ "stageId": "<stageId>", "stageChangedEndDate": "<cutoff>", "orderBy": { "stageChangedDate": 1 }, "limit": 20 }
```

Some imported deals have no `stageChangedDate` and never match a date filter. Their count = the stage's `itemsTotalCount` minus its count with `"stageChangedEndDate": "2100-01-01"`. Report them as "age unknown", next to the stuck count.

**5. List deals (e.g. my open deals).** `limit` is 1 to 100; page with `cursor: pageInfo.endCursor` while `hasNextPage`.

```graphql
query MyDeals($pipelineIds: [String], $assignedToMe: String, $limit: Int, $cursor: String) {
  deals(pipelineIds: $pipelineIds, assignedToMe: $assignedToMe, limit: $limit, cursor: $cursor) {
    totalCount
    pageInfo { hasNextPage endCursor }
    list { _id name number closeDate amount stage { _id name probability } pipeline { _id name } }
  }
}
```
```json
{ "pipelineIds": ["<pipelineId>"], "assignedToMe": "true", "limit": 100 }
```

Drop rows whose `stage.probability` is Won or Lost. For the open count alone, use recipe 1 instead of paging. Name search: `search: "<text>"` matches deal name, number and description.

**6. Won revenue by month, forecast input.** Use `execute_typescript`, one `dealsTotalAmounts` per month. `stageChangedStartDate/EndDate` dates the Won bucket by won date. To forecast open deals by expected close month, swap in `closeDateStartDate/EndDate` and read `In progress` and `forecasted 10-90%`.

```js
const q = (query, variables) => external_callGraphql({ query, variables });
const pl = await q(`query { salesPipelines(limit: 100) { list { _id name } } }`);
const wanted = '<pipeline name>'.toLowerCase(); // drop the filter for all pipelines
const pipelineIds = pl.data.salesPipelines.list.filter((p) => p.name.toLowerCase().includes(wanted)).map((p) => p._id);
const months = Array.from({ length: 12 }, (_, i) => new Date(Date.UTC(2026, i, 1)));
const rows = await Promise.all(months.map(async (start) => {
  const end = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 1));
  const r = await q(`query Won($pipelineIds: [String], $stageChangedStartDate: Date, $stageChangedEndDate: Date) {
    dealsTotalAmounts(pipelineIds: $pipelineIds, stageChangedStartDate: $stageChangedStartDate, stageChangedEndDate: $stageChangedEndDate) { name currencies { name amount } } }`,
    { pipelineIds, stageChangedStartDate: start.toISOString(), stageChangedEndDate: end.toISOString() });
  const won = r.data.dealsTotalAmounts.find((b) => b.name === 'Won');
  return { month: start.toISOString().slice(0, 7), won: won ? won.currencies : [] };
}));
return rows;
```

Won deal counts per month: recipe 1 with the same dates in `extraParams`, summing the Won rows.

**7. Top customers or companies by deal value.** No query groups by contact. Page all deals in scope in `execute_typescript` and sum `amount` per contact, per currency. Each linked customer and company gets the full deal amount, so say that when a deal has several.

```js
const q = (query, variables) => external_callGraphql({ query, variables });
const pl = await q(`query { salesPipelines(limit: 100) { list { _id } } }`);
const pipelineIds = pl.data.salesPipelines.list.map((p) => p._id);
const totals = {};
let cursor = null, pages = 0, hasNext = true;
while (hasNext && pages < 40) {
  const r = await q(`query Page($pipelineIds: [String], $limit: Int, $cursor: String) {
    deals(pipelineIds: $pipelineIds, limit: $limit, cursor: $cursor) {
      totalCount pageInfo { hasNextPage endCursor }
      list { amount customers { _id firstName lastName primaryEmail } companies { _id primaryName } } } }`,
    { pipelineIds, limit: 100, cursor });
  const d = r.data.deals;
  for (const deal of d.list) {
    const owners = [
      ...deal.customers.map((c) => ({ id: c._id, name: [c.firstName, c.lastName].filter(Boolean).join(' ') || c.primaryEmail })),
      ...deal.companies.map((c) => ({ id: c._id, name: c.primaryName })),
    ];
    for (const o of owners) for (const [cur, amt] of Object.entries(deal.amount || {})) {
      const t = (totals[o.id + cur] ??= { ...o, currency: cur, amount: 0, deals: 0 });
      t.amount += amt; t.deals += 1;
    }
  }
  hasNext = d.pageInfo.hasNextPage; cursor = d.pageInfo.endCursor; pages += 1;
}
return { complete: !hasNext, pages, top: Object.values(totals).sort((a, b) => b.amount - a.amount).slice(0, 10) };
```

Add a won-only filter by running it per Won stage with `stageId`. When `complete` is false, label the ranking "first N deals only".

**8. Deals per owner.** One call returns counts per assignee per stage name:

```graphql
query ByOwner($pipelineId: String!) { salesItemsCountByAssignedUser(pipelineId: $pipelineId) }
```

The JSON is `{ groups: [{ _id, name }], usersWithInfo: [{ name, "<stage name>": count }] }`, names only. For one owner's amounts, run recipe 1 with `"extraParams": { "assignedUserIds": ["<userId>"] }`. Find the user id:

```graphql
query FindUser($searchValue: String) { users(searchValue: $searchValue, limit: 5) { list { _id email details { fullName } } } }
```

**9. One deal in full.**

```graphql
query Deal($_id: String!) {
  dealDetail(_id: $_id) {
    _id name number priority closeDate stageChangedDate createdAt amount productsData
    stage { name probability } pipeline { _id name } boardId
    assignedUsers { _id email details { fullName } } createdUser { _id details { fullName } }
    customers { _id firstName lastName primaryEmail primaryPhone } companies { _id primaryName }
    products { _id name code } labels { _id name } tags { _id name }
  }
}
```

## Field gotchas

| Thing | Write this |
| --- | --- |
| User name | `details { fullName firstName lastName }`, plus `email`. `User` has no `firstName` or `name`. |
| Customer name | `firstName lastName primaryEmail primaryPhone`. |
| Company name | `primaryName`. |
| `Deal.amount`, `unUsedAmount`, `productsData`, `SalesStage.amount` | JSON scalars: select with no subfields. |
| `dealsTotalAmounts` | Needs `name currencies { name amount }`. Leave out `_id`, it is a random number. |
| `Deal.products` | `[Product]`: `{ _id name code }`. Quantities and prices are in `productsData`. |
| Products filter | `productIds: ["<productId>"]` on `deals`, `dealsTotalCount` or `extraParams`. |
| `salesPipelines` | `limit` ≤ 100. Leave out `boardId` there: board-less pipelines make it error. |
| `deals` | `limit` 1 to 100 (101 errors), with `totalCount` and `pageInfo { hasNextPage endCursor }`. `orderBy: { <field>: 1 or -1 }`. |
| `salesStages`, `salesBoards` | Plain lists with no paging. |
| `stageId` | One stage per call. For several stages use `pipelineIds` or a loop. |
| Response size | 64 KB per call. Keep 100-row pages lean. |

## When the API cannot aggregate

There is no group-by for customer, owner amount, product, or time bucket. Use the cheapest exact method in this order: per-stage rows from recipe 1, then one count/total call per bucket in parallel in `execute_typescript` (it times out after 15 s), and full paging only as a last resort. Every answer built from a capped loop or a subset states it plainly: "based on the first 2,000 of 3,100 deals" or "active pipelines only".
