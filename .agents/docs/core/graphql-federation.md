# Core GraphQL Federation

The core plugin acts as the base of the Apollo Federation graph. It defines the core types that all other plugins extend.

## Types Exposed (Base)
These types are defined in `backend/core-api/src/graphql/typeDefs.ts` with `@key(fields: "_id")` so other plugins can reference or extend them.

- `User`
- `Customer`
- `Company`
- `Product`
- `ProductCategory`
- `Tag`
- `Branch`
- `Department`
- `Field`
- `Group`

## How Plugins Consume Core Types
Plugins do not fetch Customer data directly from MongoDB. Instead, they store a `customerId` and extend the type in their own schemas:

```graphql
# Example from sales_api/src/modules/sales/graphql/schemas/extensions.ts
extend type Customer @key(fields: "_id") {
  _id: String! @external
  deals: [Deal] # Sales plugin adds this field
}

extend type Deal @key(fields: "_id") {
  customerId: String
  customer: Customer @provides(fields: "_id") # Gateway resolves this to core
}
```

## Cross-plugin resolution
When a client requests a `Deal` and its `customer { firstName }`, the Gateway:
1. Calls `sales_api` to get the Deal and `customerId`.
2. Calls `core-api`'s `__resolveReference` for `Customer` with `_id: customerId` to fetch the `firstName`.
3. Merges the response.

Therefore, **never direct import** core database models from a plugin. Always use Federation.
