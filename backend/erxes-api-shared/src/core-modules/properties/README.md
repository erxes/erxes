# Filtering by `propertiesData`

Custom properties are stored in a single `propertiesData` bag on the record.
This module owns the one filter format every query uses, so a query only has to
accept a string and hand it to `buildPropertyFilter`.

## What the data looks like

```js
propertiesData: {
  // a plain field: key is the field _id, value is whatever that type stores
  'r3i7wgefyiavf': 'MUIS',
  'kEpqOxKa8gRLW': ['mn', 'en'],

  // a repeating group: key is the group _id behind `g:`, value is a row array
  'g:7TEEie5SOcmJWlsFMf68C': [
    { _id: '8qA2BosS7qquYlQ073X1r', ACMWGZ65G_ipgH: '10', buBHlIEfOv4W: '21312412' },
    { _id: 'kobCVPjoZjaQYG9cekTHg', ACMWGZ65G_ipgH: '5',  buBHlIEfOv4W: '1' },
  ],
}
```

Rows carry their own `_id` so they can be reordered and addressed. The schema is
`Schema.Types.Mixed` — nothing is coerced, values are stored exactly as the form
sent them.

## The filter string

One condition per entry, entries joined by `;`:

```
<fieldKey>:<operator>[:<value>]
```

- Every segment is percent-encoded, so a value may contain `:` `;` `,` `/` `~`.
- No-value operators (`isSet`, `isTrue`, …) omit the value segment.
- Multi-value operators (`in`, `notIn`, `fileType`) take a comma-separated list.

```
plan:eq:pro;kEpqOxKa8gRLW:in:mn,en;note:contains:a%3Ab
```

## Field keys

| Key                     | Meaning                               |
| ----------------------- | ------------------------------------- |
| `<fieldId>`             | a plain property                      |
| `g:<groupId>/<fieldId>` | a repeating-group field, **same row** |
| `g:<groupId>~<fieldId>` | a repeating-group field, **any row**  |

`:` `/` `~` never occur in a nanoid, so no split can cut an id in half. Build
keys with `toPropertyRowKey(groupId, fieldId, anyRow)` rather than by hand.

### same row vs any row

Only matters when one group carries two or more conditions.

**Same row** folds them into a single `$elemMatch` — one row has to satisfy all
of them:

```js
{ 'propertiesData.g:edu': { $elemMatch: { school: {...}, year: {...} } } }
```

**Any row** keeps them apart — each condition may be satisfied by a different
row:

```js
$and: [
  { 'propertiesData.g:edu': { $elemMatch: { school: {...} } } },
  { 'propertiesData.g:edu': { $elemMatch: { year: {...} } } },
]
```

Use same row when the conditions describe one entry ("graduated MUIS in 2020").
Use any row when the group is just a list ("speaks English" and "has a licence",
which need not be the same line). The filter UI defaults to any row and lets the
user flip a group; segments always compile to same row.

Conditions of _different_ groups are always independent.

## Operators

| Operator              | Value | Mongo                                                  |
| --------------------- | ----- | ------------------------------------------------------ |
| `eq`                  | one   | `$in: [value]` (numeric strings also match the number) |
| `ne`                  | one   | `$nin: [value]`                                        |
| `gt` `gte` `lt` `lte` | one   | `$gt` … (numeric strings become numbers)               |
| `contains`            | one   | `$regex`, case-insensitive, escaped                    |
| `doesNotContain`      | one   | `$not: $regex`                                         |
| `in`                  | many  | `$in: [...]`                                           |
| `notIn`               | many  | `$nin: [...]`                                          |
| `isTrue`              | —     | `$in: [true, 'true', 'Yes', 'yes']`                    |
| `isFalse`             | —     | `$in: [false, 'false', 'No', 'no', null]`              |
| `isSet`               | —     | `$exists: true, $nin: [null, '', []]`                  |
| `isNotSet`            | —     | missing, `null` or `''`                                |
| `fileType`            | many  | `$regex` on `<path>.type`                              |

When a condition carries a `type` but no operator, the default comes from
`PROPERTY_FILTER_OPERATOR_BY_TYPE`: `boolean → isTrue`, `number → eq`,
`date → eq`, `multiSelect`/`check` → `in`, everything else `contains`.

## Applying it in a query

```ts
import { buildPropertyFilter } from 'erxes-api-shared/core-modules';

if (propertiesData) {
  const propertyConditions = buildPropertyFilter(propertiesData);

  if (propertyConditions.length) {
    filter.$and = [...(filter.$and || []), ...propertyConditions];
  }
}
```

`buildPropertyFilter` takes the encoded string or an already-parsed
`IPropertyFilterCondition[]`. Pass `{ prefix }` when the bag is not at
`propertiesData` on the document.

To expose it on a new query, add the argument to the schema as a `String`:

```graphql
propertiesData: String
```

Wired today: `customers` (`modules/contacts/utils.ts`), `products`
(`modules/products/.../product.ts`) and `poscProducts` (`posclient_api`).

Not wired, though the surrounding code would support it: `companies` /
`cpCompanies` (the shared contacts `generateFilter` already handles
`propertiesData`, but the schema never declares the argument) and
`cpPoscProducts`.

## The filter UI

`PropertiesFilter` (in `ui-modules`) reads and writes the same string on the
`propertiesData` query-string key, so the URL is the whole filter state.

```tsx
<PropertiesFilter.Bar contentType="core:customer" />   // active chips
<PropertiesFilter.View contentType="core:customer" />  // the picker
<PropertiesFilter />                                    // the command entry
```

Which operators a field offers comes from `OPERATOR_BY_TYPE` in
`ui-modules/.../constants/field_operators.ts`. `propertyUtils.ts` mirrors the
key helpers for the browser; keep the two in step.

## Things that will bite you

- **A malformed entry is dropped silently.** An unknown operator, a missing
  `:`, or JSON passed instead of the DSL produces no condition and no error —
  the query then returns everything. Check the built filter, not the input.
- **`contains` is a regex, so it only matches strings.** A field stored as a
  number will never match it. Number-typed fields are offered `eq`/`gt`/… for
  exactly this reason.
- **Row keys are not document keys.** `g:<gid>/<fid>` addresses a field for
  filtering; inside the document the row object is keyed by the bare `<fid>`.
- **Export columns use their own suffix.** `propertiesData.g:<gid>/<fid>#2` is
  the second row's column — see `importExport.ts`, not this file.
