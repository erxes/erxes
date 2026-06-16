import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { sendPosclientMessage } from '~/initWorker';
import { IPosDocument } from '~/modules/pos/@types/pos';
import { getProductsData } from '~/modules/pos/routes';
import { getChildCategories } from '~/modules/pos/utils';

export const productMutationNames = [
  'productsAdd',
  'productsEdit',
  'productsRemove',
  'productCategoriesAdd',
  'productCategoriesEdit',
  'productCategoriesRemove',
];

const productMutations = ['productsAdd', 'productsEdit', 'productsRemove'];
const productCategoryMutations = [
  'productCategoriesAdd',
  'productCategoriesEdit',
  'productCategoriesRemove',
];

const createOrUpdateProductMutations = ['productsAdd', 'productsEdit'];
const createOrUpdateProductCategoryMutations = [
  'productCategoriesAdd',
  'productCategoriesEdit',
];

type ProductSnapshot = {
  _id?: string;
  categoryId?: string;
};

type ProductCategorySnapshot = {
  _id?: string;
  products?: ProductSnapshot[];
};

type ProductGroupSnapshot = {
  categoryIds?: string[];
  excludedCategoryIds?: string[];
  excludedProductIds?: string[];
  categories?: ProductCategorySnapshot[];
};

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isString = (value: unknown): value is string =>
  typeof value === 'string' && value.length > 0;

const stringArray = (value: unknown) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(isString);
};

const resultObject = (result: unknown) =>
  isObject(result) ? (result as ProductSnapshot) : {};

const getSingleId = (args: Record<string, unknown>, result: unknown) =>
  resultObject(result)._id || (isString(args._id) ? args._id : undefined);

const getProductSyncAction = (mutationName: string) =>
  mutationName === 'productsAdd'
    ? 'create'
    : createOrUpdateProductMutations.includes(mutationName)
      ? 'update'
      : 'delete';

const getProductCategorySyncAction = (mutationName: string) =>
  mutationName === 'productCategoriesAdd'
    ? 'create'
    : createOrUpdateProductCategoryMutations.includes(mutationName)
      ? 'update'
      : 'delete';

const getProductGroupPos = async (models: IModels) =>
  models.Pos.find({
    status: { $ne: 'deleted' },
    _id: {
      $in: await models.ProductGroups.distinct('posId'),
    },
  }).lean();

const getRawProductGroups = async (models: IModels, posId: string) =>
  models.ProductGroups.find({ posId }).lean();

const getProducts = async (subdomain: string, productIds: string[]) => {
  const products = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    module: 'products',
    action: 'find',
    input: {
      query: {
        _id: { $in: productIds },
      },
      fields: {
        _id: 1,
        categoryId: 1,
      },
    },
    defaultValue: [],
  });

  return Array.isArray(products) ? (products as ProductSnapshot[]) : [];
};

const getPosProductData = async (
  subdomain: string,
  models: IModels,
  pos: IPosDocument,
) => {
  const productGroups = await getProductsData(subdomain, models, pos);

  return Array.isArray(productGroups)
    ? (productGroups as ProductGroupSnapshot[])
    : [];
};

const findProduct = (
  productGroups: ProductGroupSnapshot[],
  productId: string,
) => {
  for (const group of productGroups) {
    for (const category of group.categories || []) {
      const product = (category.products || []).find(
        (currentProduct) => currentProduct._id === productId,
      );

      if (product) {
        return product;
      }
    }
  }
};

const isInProduct = (
  productGroups: ProductGroupSnapshot[],
  productId: string,
) => !!findProduct(productGroups, productId);

const isInProductGroup = async (
  subdomain: string,
  productGroups: ProductGroupSnapshot[],
  product: ProductSnapshot,
) => {
  if (!product._id || !product.categoryId) {
    return false;
  }

  for (const productGroup of productGroups) {
    if ((productGroup.excludedProductIds || []).includes(product._id)) {
      continue;
    }

    const includedCategoryIds = await getChildCategories(
      subdomain,
      productGroup.categoryIds || [],
    );
    const excludedCategoryIds = await getChildCategories(
      subdomain,
      productGroup.excludedCategoryIds || [],
    );

    if (
      includedCategoryIds.includes(product.categoryId) &&
      !excludedCategoryIds.includes(product.categoryId)
    ) {
      return true;
    }
  }

  return false;
};

const getProductFromGroups = async (
  subdomain: string,
  models: IModels,
  pos: IPosDocument,
  productId: string,
) => findProduct(await getPosProductData(subdomain, models, pos), productId);

const findProductCategory = (
  productGroups: ProductGroupSnapshot[],
  categoryId: string,
) => {
  for (const group of productGroups) {
    const category = (group.categories || []).find(
      (currentCategory) => currentCategory._id === categoryId,
    );

    if (category) {
      const { products, ...categoryDoc } = category;
      return categoryDoc;
    }
  }
};

const isInCategory = (
  productGroups: ProductGroupSnapshot[],
  categoryId: string,
) => !!findProductCategory(productGroups, categoryId);

const isInCategoryGroup = async (
  subdomain: string,
  productGroups: ProductGroupSnapshot[],
  categoryId: string,
) => {
  for (const productGroup of productGroups) {
    const includedCategoryIds = await getChildCategories(
      subdomain,
      productGroup.categoryIds || [],
    );
    const excludedCategoryIds = await getChildCategories(
      subdomain,
      productGroup.excludedCategoryIds || [],
    );

    if (
      includedCategoryIds.includes(categoryId) &&
      !excludedCategoryIds.includes(categoryId)
    ) {
      return true;
    }
  }

  return false;
};

const getProductCategoryFromGroups = async (
  subdomain: string,
  models: IModels,
  pos: IPosDocument,
  categoryId: string,
) =>
  findProductCategory(
    await getPosProductData(subdomain, models, pos),
    categoryId,
  );

const sendProductToPosClient = async ({
  subdomain,
  pos,
  mutationName,
  productId,
  product,
}: {
  subdomain: string;
  pos: IPosDocument;
  mutationName: string;
  productId: string;
  product?: ProductSnapshot;
}) =>
  sendPosclientMessage({
    subdomain,
    action: 'crudData',
    method: 'mutation',
    input: {
      type: 'product',
      action: getProductSyncAction(mutationName),
      object: product || { _id: productId },
      updatedDocument: product,
    },
    pos,
  });

const sendProductsRemoveToPosClient = async ({
  subdomain,
  pos,
  productIds,
}: {
  subdomain: string;
  pos: IPosDocument;
  productIds: string[];
}) =>
  sendPosclientMessage({
    subdomain,
    action: 'crudData',
    method: 'mutation',
    input: {
      type: 'productsRemove',
      productIds,
    },
    pos,
  });

const sendProductCategoryToPosClient = async ({
  subdomain,
  pos,
  mutationName,
  categoryId,
  productCategory,
}: {
  subdomain: string;
  pos: IPosDocument;
  mutationName: string;
  categoryId: string;
  productCategory?: ProductCategorySnapshot;
}) =>
  sendPosclientMessage({
    subdomain,
    action: 'crudData',
    method: 'mutation',
    input: {
      type: 'productCategory',
      action: getProductCategorySyncAction(mutationName),
      object: productCategory || { _id: categoryId },
      updatedDocument: productCategory,
    },
    pos,
  });

const syncProducts = async (
  subdomain: string,
  models: IModels,
  mutationName: string,
  args: Record<string, unknown>,
  result: unknown,
) => {
  const posList = await getProductGroupPos(models);

  if (mutationName === 'productsRemove') {
    const productIds = stringArray(args.productIds);
    const products = await getProducts(subdomain, productIds);

    for (const pos of posList) {
      const productGroups = await getRawProductGroups(models, pos._id);
      const posProductIds: string[] = [];

      for (const product of products) {
        if (
          product._id &&
          (await isInProductGroup(subdomain, productGroups, product))
        ) {
          posProductIds.push(product._id);
        }
      }

      if (posProductIds.length) {
        await sendProductsRemoveToPosClient({
          subdomain,
          pos,
          productIds: posProductIds,
        });
      }
    }

    return;
  }

  const productId = getSingleId(args, result);

  if (!productId) {
    return;
  }

  for (const pos of posList) {
    const product = await getProductFromGroups(
      subdomain,
      models,
      pos,
      productId,
    );

    if (product) {
      await sendProductToPosClient({
        subdomain,
        pos,
        mutationName,
        productId,
        product,
      });
    }
  }
};

const syncProductCategories = async (
  subdomain: string,
  models: IModels,
  mutationName: string,
  args: Record<string, unknown>,
  result: unknown,
) => {
  const posList = await getProductGroupPos(models);

  if (mutationName === 'productCategoriesRemove') {
    const categoryId = isString(args._id) ? args._id : undefined;

    if (!categoryId) {
      return;
    }

    for (const pos of posList) {
      const productGroups = await getRawProductGroups(models, pos._id);

      if (await isInCategoryGroup(subdomain, productGroups, categoryId)) {
        await sendProductCategoryToPosClient({
          subdomain,
          pos,
          mutationName,
          categoryId,
        });
      }
    }

    return;
  }

  const categoryId = getSingleId(args, result);

  if (!categoryId) {
    return;
  }

  for (const pos of posList) {
    const productCategory = await getProductCategoryFromGroups(
      subdomain,
      models,
      pos,
      categoryId,
    );

    if (productCategory) {
      await sendProductCategoryToPosClient({
        subdomain,
        pos,
        mutationName,
        categoryId,
        productCategory,
      });
    }
  }
};

export const syncPosProductGroups = async (
  subdomain: string,
  models: IModels,
  mutationName: string,
  args: Record<string, unknown>,
  result: unknown,
) => {
  if (productMutations.includes(mutationName)) {
    await syncProducts(subdomain, models, mutationName, args, result);
    return;
  }

  if (productCategoryMutations.includes(mutationName)) {
    await syncProductCategories(subdomain, models, mutationName, args, result);
  }
};
