# `customersAdd` Mutation — Usage Guide

The `customersAdd` GraphQL mutation creates a new customer (contact) record in erxes. This guide covers the full signature, field reference, business rules, error cases, and example queries.

---

## Location in Codebase

| Layer             | File                                                                                |
| ----------------- | ----------------------------------------------------------------------------------- |
| GraphQL schema    | `backend/core-api/src/modules/contacts/graphql/schemas/customer.ts`                 |
| Resolver          | `backend/core-api/src/modules/contacts/graphql/resolvers/mutations/customer.ts`     |
| Model method      | `backend/core-api/src/modules/contacts/db/models/Customers.ts` — `createCustomer()` |
| Schema definition | `backend/core-api/src/modules/contacts/db/definitions/customers.ts`                 |
| Shared types      | `backend/erxes-api-shared/src/core-types/modules/contacts/customer.ts`              |

---

## Mutation Signature

```graphql
mutation customersAdd(
  state: String
  avatar: String
  firstName: String
  lastName: String
  middleName: String
  primaryEmail: String
  emails: [String]
  primaryPhone: String
  phones: [String]
  primaryAddress: JSON
  addresses: [JSON]
  ownerId: String
  position: String
  department: String
  leadStatus: String
  hasAuthority: String
  description: String
  isSubscribed: String
  links: JSON
  propertiesData: JSON
  code: String
  sex: Int
  birthDate: Date
  emailValidationStatus: String
  phoneValidationStatus: String
): Customer
```

All fields are optional. The mutation returns a `Customer` object.

---

## Field Reference

### Identity

| Field        | Type     | Description                               |
| ------------ | -------- | ----------------------------------------- |
| `firstName`  | `String` | First name (+10 profile score)            |
| `lastName`   | `String` | Last name (+5 profile score)              |
| `middleName` | `String` | Middle name (+5 profile score)            |
| `avatar`     | `String` | URL to profile image                      |
| `birthDate`  | `Date`   | Date of birth                             |
| `sex`        | `Int`    | Gender code — see [Sex Codes](#sex-codes) |

### Contact

| Field            | Type       | Description                                                                                     |
| ---------------- | ---------- | ----------------------------------------------------------------------------------------------- |
| `primaryEmail`   | `String`   | Main email — must be unique, must not duplicate an existing active customer (+15 profile score) |
| `emails`         | `[String]` | All email addresses. Auto-populated from `primaryEmail` if omitted                              |
| `primaryPhone`   | `String`   | Main phone — must be unique (+10 profile score)                                                 |
| `phones`         | `[String]` | All phone numbers. Auto-populated from `primaryPhone` if omitted                                |
| `primaryAddress` | `JSON`     | Primary address object                                                                          |
| `addresses`      | `[JSON]`   | All address objects                                                                             |

### Classification

| Field        | Type     | Allowed Values                                                        | Default                                                                  |
| ------------ | -------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `state`      | `String` | `visitor`, `lead`, `customer`                                         | `visitor` (auto-upgraded — see [State Logic](#state-auto-upgrade-logic)) |
| `leadStatus` | `String` | `new`, `attemptedToContact`, `inProgress`, `badTiming`, `unqualified` | —                                                                        |
| `code`       | `String` | Any unique string (+10 profile score)                                 | —                                                                        |

### Ownership & Organization

| Field          | Type     | Description                                                               |
| -------------- | -------- | ------------------------------------------------------------------------- |
| `ownerId`      | `String` | User `_id` of the assigned owner. Defaults to the current user if omitted |
| `position`     | `String` | Job title                                                                 |
| `department`   | `String` | Department name                                                           |
| `hasAuthority` | `String` | Whether the contact has decision-making authority                         |
| `description`  | `String` | Free-text notes                                                           |
| `isSubscribed` | `String` | Subscription preference                                                   |
| `links`        | `JSON`   | Social/website links (e.g. `{ linkedIn: "...", twitter: "..." }`)         |

### Validation Statuses

| Field                   | Type     | Allowed Values                                                                                                  |
| ----------------------- | -------- | --------------------------------------------------------------------------------------------------------------- |
| `emailValidationStatus` | `String` | `valid`, `invalid`, `accept_all_unverifiable`, `unverifiable`, `unknown`, `disposable`, `catchall`, `badsyntax` |
| `phoneValidationStatus` | `String` | `valid`, `invalid`, `unknown`, `receives_sms`, `unverifiable`                                                   |

### Custom Fields

| Field            | Type   | Description                                                                                                                 |
| ---------------- | ------ | --------------------------------------------------------------------------------------------------------------------------- |
| `propertiesData` | `JSON` | Values for custom fields defined in the erxes field configuration. Validated server-side via `Fields.validateFieldValues()` |

---

## Sex Codes

| Value | Label          |
| ----- | -------------- |
| `0`   | Not known      |
| `1`   | Male           |
| `2`   | Female         |
| `9`   | Not applicable |

Additional pronoun/gender codes (`3`–`22`) are supported — check `CUSTOMER_SELECT_OPTIONS.SEX` in `erxes-api-shared/src/core-modules/users/constants.ts` for the full list.

---

## State Auto-Upgrade Logic

The `state` field is not stored as-is. The model computes it automatically via `calcPSS()`:

- A customer starts as `visitor`.
- If **any** identifying data is provided (name, email, phone, code, or `visitorContactInfo`), the state is set to **`lead`** — unless you explicitly pass `state: "customer"`.
- If you pass `state: "customer"`, that value is preserved regardless.

In practice, any call to `customersAdd` with even a name or email will result in state `lead`.

---

## Profile Score

`profileScore` is computed automatically and stored on the record. It is **not** an input field.

| Data provided        | Points |
| -------------------- | ------ |
| `primaryEmail`       | +15    |
| `firstName`          | +10    |
| `code`               | +10    |
| `primaryPhone`       | +10    |
| `middleName`         | +5     |
| `lastName`           | +5     |
| `visitorContactInfo` | +5     |

Maximum possible score: **60**.

---

## Permission Required

The caller must have the `contactsCreate` permission. The gateway enforces this via `checkPermission('contactsCreate')`. Calls without this permission will throw an authorization error.

The `cpCustomersAdd` variant (client portal) skips the permission check and is intended for unauthenticated portal submissions.

---

## Uniqueness Constraints

The following fields are checked for duplicates against active (non-deleted) customers before the record is created. Violation throws an error and aborts creation.

| Field          | Error message        |
| -------------- | -------------------- |
| `primaryEmail` | `"Duplicated email"` |
| `primaryPhone` | `"Duplicated phone"` |
| `code`         | `"Duplicated code"`  |

---

## Return Type

The mutation returns a `Customer` object with the following notable fields:

```graphql
type Customer {
  _id: String
  state: String # Computed (see State Logic)
  createdAt: Date
  updatedAt: Date
  avatar: String
  firstName: String
  lastName: String
  middleName: String
  primaryEmail: String
  emails: [String]
  primaryPhone: String
  phones: [String]
  primaryAddress: JSON
  addresses: [JSON]
  ownerId: String
  owner: User # Resolved relation
  position: String
  department: String
  leadStatus: String
  code: String
  sex: Int
  birthDate: Date
  score: Float # profileScore
  propertiesData: JSON
  emailValidationStatus: String
  phoneValidationStatus: String
  status: String # "Active" | "Deleted"
  companies: [Company] # Resolved relation
  getTags: [Tag] # Resolved relation
}
```

---

## Examples

### Minimal — create a lead by email

```graphql
mutation {
  customersAdd(primaryEmail: "jane.doe@example.com") {
    _id
    state
    primaryEmail
    score
  }
}
```

**Expected response:**

```json
{
  "data": {
    "customersAdd": {
      "_id": "abc123",
      "state": "lead",
      "primaryEmail": "jane.doe@example.com",
      "score": 15
    }
  }
}
```

---

### Full customer with classification

```graphql
mutation {
  customersAdd(firstName: "Jane", lastName: "Doe", primaryEmail: "jane.doe@example.com", primaryPhone: "+97699112233", state: "customer", leadStatus: "inProgress", position: "CTO", department: "Engineering", code: "CUST-001", sex: 2, birthDate: "1990-04-15", description: "Key enterprise contact.", links: { linkedIn: "https://linkedin.com/in/janedoe" }, isSubscribed: "Yes") {
    _id
    state
    score
    primaryEmail
    primaryPhone
    leadStatus
  }
}
```

---

### With custom fields (`propertiesData`)

Custom field IDs are defined in the erxes admin UI under **Settings → Properties**. Pass their field `_id` as the key.

```graphql
mutation {
  customersAdd(
    firstName: "John"
    primaryEmail: "john@example.com"
    propertiesData: {
      "field_abc123": "Enterprise",
      "field_def456": 42
    }
  ) {
    _id
    propertiesData
  }
}
```

---

## Error Reference

| Error                       | Cause                                                                |
| --------------------------- | -------------------------------------------------------------------- |
| `"Duplicated email"`        | Another active customer already has this `primaryEmail`              |
| `"Duplicated phone"`        | Another active customer already has this `primaryPhone`              |
| `"Duplicated code"`         | Another active customer already has this `code`                      |
| `"Permission denied"`       | Caller does not have `contactsCreate` permission                     |
| `"Field validation failed"` | A value in `propertiesData` does not match its field type definition |

---

## Side Effects

After a successful creation the following happen automatically:

1. **DB event log** — A `create` event is sent via `sendDbEventLog` for audit/change-stream consumers.
2. **Activity log** — A `"Customer created"` activity entry is recorded, visible in the contact's timeline.
3. **State & score** — `state`, `profileScore`, and `searchText` are computed and stored (not echoed as inputs).

---

## Related Mutations

| Mutation                                      | Permission       | Purpose                                  |
| --------------------------------------------- | ---------------- | ---------------------------------------- |
| `customersEdit(_id, ...fields)`               | `contactsUpdate` | Update an existing customer              |
| `customersRemove(customerIds)`                | `contactsDelete` | Soft-delete customers                    |
| `customersChangeState(_id, value)`            | —                | Change `state` only                      |
| `customersMerge(customerIds, customerFields)` | —                | Merge duplicate customers                |
| `cpCustomersAdd(...fields)`                   | none             | Client-portal variant (no auth required) |
