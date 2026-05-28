# Core: Products Module

**Backend root:** `backend/core-api/src/modules/products/`
**Frontend root:** `frontend/core-ui/src/modules/products/`

Manages the catalog of products, services, and their categories.

## Entities

### Product
An item or service sold or tracked.
- **File:** `db/models/Products.ts`
- **Fields:** `name`, `code`, `unitPrice`, `categoryId`, `uom` (unit of measurement), `sku`
- **Dynamic Fields:** Supports customProperties.
- **Federation:** `@key(fields: "_id")`

### ProductCategory
Hierarchical categories for products.
- **File:** `db/models/Categories.ts`
- **Fields:** `name`, `code`, `parentId`, `order`
- **Federation:** `@key(fields: "_id")`

## Integration with other plugins
- **sales:** Deals attach products via `productsData`. POS and Ecommerce use the catalog heavily.
- **inventory / accounting:** Tracks quantities and COGS.

## GraphQL
Exposes `products`, `productCategories`, `uoms` queries and mutations.
