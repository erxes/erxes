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
  increaseInventories,
  listInventories,
  productRemainders,
  productStock,
  setInventories,
} from '~/modules/products/productInventories.service';
import {
  createProduct,
  setProductStatus,
  updateProduct,
  useProducts,
} from '~/modules/products/products.service';
import { withDataValues, withDataValuesOf } from '~/modules/dataExtensions/hostValues.service';
import { scoped } from '~/orpc';

const TYPE = 'core.product';

/** Members and plugins alike: the catalog is shared, each write is audited as its caller. */
export const productsRouter = {
  list: scoped.products.list.handler(async ({ input }) => {
    const page = await listProducts(db(), input);

    return { ...page, data: await withDataValues(db(), TYPE, page.data) };
  }),
  get: scoped.products.get.handler(async ({ input }) =>
    withDataValuesOf(db(), TYPE, await findProduct(db(), input.id)),
  ),
  lookup: scoped.products.lookup.handler(({ input }) => lookupProducts(db(), input.ids)),
  create: scoped.products.create.handler(async ({ input }) =>
    withDataValuesOf(db(), TYPE, await createProduct(db(), input)),
  ),
  update: scoped.products.update.handler(async ({ input: { id, ...changes } }) =>
    withDataValuesOf(db(), TYPE, await updateProduct(db(), id, changes)),
  ),
  use: scoped.products.use.handler(({ input }) => useProducts(db(), input.ids, input.used)),
  archive: scoped.products.archive.handler(async ({ input }) =>
    withDataValuesOf(db(), TYPE, await setProductStatus(db(), input.id, 'archived')),
  ),
  restore: scoped.products.restore.handler(async ({ input }) =>
    withDataValuesOf(db(), TYPE, await setProductStatus(db(), input.id, 'active')),
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

/** Stock by branch and department: everyone with the catalog reads it, the plugin that keeps it writes. */
export const productInventoriesRouter = {
  list: scoped.productInventories.list.handler(({ input }) => listInventories(db(), input)),
  remainders: scoped.productInventories.remainders.handler(({ input }) =>
    productRemainders(db(), input),
  ),
  stock: scoped.productInventories.stock.handler(({ input }) => productStock(db(), input.ids)),
  set: scoped.productInventories.set.handler(({ input }) => setInventories(db(), input)),
  increase: scoped.productInventories.increase.handler(({ input }) =>
    increaseInventories(db(), input),
  ),
};
