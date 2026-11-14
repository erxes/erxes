import { db } from '@erxes/core-db';
import {
  createCategory,
  listCategories,
  removeCategory,
  updateCategory,
} from '~/modules/products/productCategories.service';
import { findProduct } from '~/modules/products/productChecks';
import { listProducts, lookupProducts } from '~/modules/products/productList';
import {
  createProduct,
  setProductStatus,
  updateProduct,
  useProducts,
} from '~/modules/products/products.service';
import { scoped } from '~/orpc';

/** Members and plugins alike: the catalog is shared, each write is audited as its caller. */
export const productsRouter = {
  list: scoped.products.list.handler(({ input }) => listProducts(db(), input)),
  get: scoped.products.get.handler(({ input }) => findProduct(db(), input.id)),
  lookup: scoped.products.lookup.handler(({ input }) => lookupProducts(db(), input.ids)),
  create: scoped.products.create.handler(({ input }) => createProduct(db(), input)),
  update: scoped.products.update.handler(({ input: { id, ...changes } }) =>
    updateProduct(db(), id, changes),
  ),
  use: scoped.products.use.handler(({ input }) => useProducts(db(), input.ids, input.used)),
  archive: scoped.products.archive.handler(({ input }) =>
    setProductStatus(db(), input.id, 'archived'),
  ),
  restore: scoped.products.restore.handler(({ input }) =>
    setProductStatus(db(), input.id, 'active'),
  ),
};

export const productCategoriesRouter = {
  list: scoped.productCategories.list.handler(() => listCategories(db())),
  create: scoped.productCategories.create.handler(({ input }) => createCategory(db(), input)),
  update: scoped.productCategories.update.handler(({ input: { id, ...changes } }) =>
    updateCategory(db(), id, changes),
  ),
  remove: scoped.productCategories.remove.handler(({ input }) => removeCategory(db(), input.id)),
};
