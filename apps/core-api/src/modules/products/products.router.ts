import { db } from '@erxes/core-db';
import {
  createCategory,
  listCategories,
  removeCategory,
  updateCategory,
} from '~/modules/products/productCategories.service';
import {
  createProduct,
  getProduct,
  listProducts,
  lookupProducts,
  setProductStatus,
  updateProduct,
  useProducts,
} from '~/modules/products/products.service';
import { anyone } from '~/orpc';

/** Members and plugins alike: the catalog is shared, each write is audited as its caller. */
export const productsRouter = {
  list: anyone.products.list.handler(({ input, context }) =>
    listProducts(db(), context.caller, input),
  ),
  get: anyone.products.get.handler(({ input, context }) =>
    getProduct(db(), context.caller, input.id),
  ),
  lookup: anyone.products.lookup.handler(({ input, context }) =>
    lookupProducts(db(), context.caller, input.ids),
  ),
  create: anyone.products.create.handler(({ input, context }) =>
    createProduct(db(), context.caller, input),
  ),
  update: anyone.products.update.handler(({ input: { id, ...changes }, context }) =>
    updateProduct(db(), context.caller, id, changes),
  ),
  use: anyone.products.use.handler(({ input, context }) =>
    useProducts(db(), context.caller, input.ids, input.used),
  ),
  archive: anyone.products.archive.handler(({ input, context }) =>
    setProductStatus(db(), context.caller, input.id, 'archived'),
  ),
  restore: anyone.products.restore.handler(({ input, context }) =>
    setProductStatus(db(), context.caller, input.id, 'active'),
  ),
};

export const productCategoriesRouter = {
  list: anyone.productCategories.list.handler(({ context }) =>
    listCategories(db(), context.caller),
  ),
  create: anyone.productCategories.create.handler(({ input, context }) =>
    createCategory(db(), context.caller, input),
  ),
  update: anyone.productCategories.update.handler(({ input: { id, ...changes }, context }) =>
    updateCategory(db(), context.caller, id, changes),
  ),
  remove: anyone.productCategories.remove.handler(({ input, context }) =>
    removeCategory(db(), context.caller, input.id),
  ),
};
