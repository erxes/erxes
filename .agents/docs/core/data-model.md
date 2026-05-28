# Core Data Model

The core plugin manages foundational, cross-cutting entities. Unlike specific plugins (sales, frontline), core entities are almost entirely federated and rely heavily on dynamic schema extensions (`customFieldsData`).

## Customer & Company
The CRM primitives.

```typescript
// Customer
{
  _id: string,
  firstName: string,
  lastName: string,
  primaryEmail: string,
  primaryPhone: string,
  visitorId: string, // for web tracking matching
  customFieldsData: any, // mapped by Field IDs
  tagIds: string[],
  ownerId: string // -> User
}

// Company
{
  _id: string,
  primaryName: string,
  size: number,
  industry: string,
  plan: string,
  customFieldsData: any,
  tagIds: string[],
  ownerId: string
}
```

## Product & Category
The catalog primitives.

```typescript
// Product
{
  _id: string,
  name: string,
  code: string,
  unitPrice: number,
  categoryId: string, // -> ProductCategory
  uom: string,
  customFieldsData: any
}

// ProductCategory
{
  _id: string,
  name: string,
  order: string,
  parentId: string // tree structure
}
```

## Dynamic Properties Engine
Entities with `customFieldsData` rely on `Field` and `Group` documents.

```typescript
// Field
{
  _id: string,
  contentType: string, // "core:customer", "sales:deal"
  type: string, // "input", "select", "date"
  text: string, // label
  options: string[], // for select fields
  groupId: string // -> Group
}

// Group
{
  _id: string,
  name: string,
  contentType: string,
  order: number
}
```

## Segments
Dynamic filters. `conditions` are serialized JSON arrays evaluated by Elasticsearch.

```typescript
{
  _id: string,
  name: string,
  contentType: string,
  conditions: any[],
  color: string
}
```
