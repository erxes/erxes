import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { sendPosclientMessage } from '~/initWorker';
import { IPosDocument } from '~/modules/pos/@types/pos';
import { getProductsData } from '~/modules/pos/routes';
import { getChildCategories } from '~/modules/pos/utils';

// Bulk condition writes bypass productsEdit, so they need their own resend.
const posConditionSyncMutationNames = [
  'productsSetConditionCodes',
  'productCategorySetConditionCodes',
];

export const posSyncMutationNames = [
  'productsAdd',
  'productsEdit',
  'productsRemove',
  'productsMerge',
  'productCategoriesAdd',
  'productCategoriesEdit',
  'productCategoriesRemove',
  'tagsTag',
  'tagsEdit',
  'tagsRemove',
  ...posConditionSyncMutationNames,
];

const posProductSyncMutationNames = [
  'productsAdd',
  'productsEdit',
  'productsRemove',
  'productsMerge',
];
const posProductCategorySyncMutationNames = [
  'productCategoriesAdd',
  'productCategoriesEdit',
  'productCategoriesRemove',
];

const createOrUpdateProductMutations = [
  'productsAdd',
  'productsEdit',
  ...posConditionSyncMutationNames,
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
  ['productsAdd', 'productsMerge'].includes(mutationName)
    ? 'create'
    : createOrUpdateProductMutations.includes(mutationName)
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

const getPosProductData = async (
  subdomain: string,
  models: IModels,
  pos: IPosDocument,
): Promise<ProductGroupSnapshot[]> => getProductsData(subdomain, models, pos);

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

const getProductFromGroups = async (
  subdomain: string,
  models: IModels,
  pos: IPosDocument,
  productId: string,
) => findProduct(await getPosProductData(subdomain, models, pos), productId);

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
}) => {
  if (product?.categoryId) {
    const productCategory: ProductCategorySnapshot | null =
      await sendTRPCMessage({
        subdomain,
        pluginName: 'core',
        module: 'productCategories',
        action: 'findOne',
        input: { query: { _id: product.categoryId } },
        throwOnError: true,
      });
    if (productCategory) {
      await sendProductCategoryToPosClient({
        subdomain,
        pos,
        mutationName: 'productCategoriesEdit',
        categoryId: product.categoryId,
        productCategory,
      });
    }
  }
  return sendPosclientMessage({
    subdomain,
    action: 'crudData',
    method: 'mutation',
    throwOnError: true,
    input: {
      type: 'product',
      action: getProductSyncAction(mutationName),
      object: product || { _id: productId },
      updatedDocument: product,
    },
    pos,
  });
};

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
    throwOnError: true,
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
    throwOnError: true,
    input: {
      type: 'productCategory',
      action: mutationName === 'productCategoriesAdd' ? 'create' : 'update',
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

  if (mutationName === 'productsMerge') {
    const oldProductIds = stringArray(args.productIds);
    const newProductId = resultObject(result)._id;

    for (const pos of posList) {
      if (oldProductIds.length) {
        await sendProductsRemoveToPosClient({
          subdomain,
          pos,
          productIds: oldProductIds,
        });
      }

      if (newProductId) {
        const product = await getProductFromGroups(
          subdomain,
          models,
          pos,
          newProductId,
        );

        if (product) {
          await sendProductToPosClient({
            subdomain,
            pos,
            mutationName,
            productId: newProductId,
            product,
          });
        }
      }
    }

    return;
  }

  if (mutationName === 'productsRemove') {
    const productIds = stringArray(args.productIds);
    if (productIds.length) {
      for (const pos of posList) {
        await sendProductsRemoveToPosClient({ subdomain, pos, productIds });
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
    } else {
      await sendProductsRemoveToPosClient({
        subdomain,
        pos,
        productIds: [productId],
      });
    }
  }
};

const syncConditionProducts = async (
  subdomain: string,
  models: IModels,
  mutationName: string,
  args: Record<string, unknown>,
) => {
  const productIds = stringArray(args.productIds);
  const categoryIds = isString(args.categoryId)
    ? await getChildCategories(subdomain, [args.categoryId])
    : [];

  const isTouched = (
    product: ProductSnapshot,
  ): product is ProductSnapshot & { _id: string } =>
    !!product._id &&
    (productIds.includes(product._id) ||
      (!!product.categoryId && categoryIds.includes(product.categoryId)));

  for (const pos of await getProductGroupPos(models)) {
    const productGroups = await getPosProductData(subdomain, models, pos);

    for (const group of productGroups) {
      for (const category of group.categories || []) {
        for (const product of (category.products || []).filter(isTouched)) {
          await sendProductToPosClient({
            subdomain,
            pos,
            mutationName,
            productId: product._id,
            product,
          });
        }
      }
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
  if (
    [
      'tagsTag',
      'tagsEdit',
      'tagsRemove',
      ...posProductCategorySyncMutationNames,
    ].includes(mutationName)
  ) {
    if (mutationName === 'tagsTag' && args.type !== 'core:product') return;
    for (const pos of await getProductGroupPos(models)) {
      const groups = await getRawProductGroups(models, pos._id);
      if (
        posProductCategorySyncMutationNames.includes(mutationName) ||
        groups.some(
          (group) => group.tagIds?.length || group.excludeTagIds?.length,
        )
      ) {
        const productGroups = await getProductsData(subdomain, models, pos);
        await sendPosclientMessage({
          subdomain,
          pos,
          action: 'crudData',
          method: 'mutation',
          throwOnError: true,
          input: { type: 'productGroups', token: pos.token, productGroups },
        });
      }
    }
    return;
  }

  if (posProductSyncMutationNames.includes(mutationName)) {
    await syncProducts(subdomain, models, mutationName, args, result);
    return;
  }

  if (posConditionSyncMutationNames.includes(mutationName)) {
    await syncConditionProducts(subdomain, models, mutationName, args);
  }
};
