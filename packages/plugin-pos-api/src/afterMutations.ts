import { generateModels, IModels } from './connectionResolver';
import { sendPosclientMessage, sendProductsMessage } from './messageBroker';
import { IPos, IPosDocument } from './models/definitions/pos';
import { getChildCategories } from './utils';

const handler = async (
  subdomain,
  params: any,
  action: string,
  type: string,
  pos?: IPos
) => {
  // TODO: check filter
  await sendPosclientMessage({
    subdomain,
    action: 'crudData',
    data: { ...params, action, type, pos }
  });
};

const isInProduct = async (
  subdomain: string,
  models: IModels,
  pos: IPosDocument,
  productId: string
) => {
  const groups = await models.ProductGroups.groups(pos._id);

  let allProductIds: string[] = [];

  for (const group of groups) {
    const includeCatIds = await getChildCategories(
      subdomain,
      group.categoryIds
    );
    const excludeCatIds = await getChildCategories(
      subdomain,
      group.excludedCategoryIds
    );

    const productCategoryIds = includeCatIds.filter(
      c => !excludeCatIds.includes(c)
    );

    const products = await sendProductsMessage({
      subdomain,
      action: 'find',
      data: {
        query: {
          status: { $ne: 'deleted' },
          categoryId: { $in: productCategoryIds },
          _id: { $nin: group.excludedProductIds }
        }
      },
      isRPC: true,
      defaultValue: []
    });

    allProductIds = allProductIds.concat(products.map(p => p._id));
  } // end product group for loop

  return allProductIds.includes(productId);
};

const isInProductCategory = async (
  subdomain: string,
  models: IModels,
  pos: IPosDocument,
  categoryId: string
) => {
  const groups = await models.ProductGroups.groups(pos._id);

  let categoryIds: string[] = [];

  for (const group of groups) {
    const includeCatIds = await getChildCategories(
      subdomain,
      group.categoryIds
    );
    const excludeCatIds = await getChildCategories(
      subdomain,
      group.excludedCategoryIds
    );

    const productCategoryIds = includeCatIds.filter(
      c => !excludeCatIds.includes(c)
    );

    const productCategories = await sendProductsMessage({
      subdomain,
      action: 'categories.find',
      data: { query: { _id: { $in: productCategoryIds } }, sort: { order: 1 } },
      isRPC: true,
      defaultValue: []
    });

    categoryIds = categoryIds.concat(productCategories.map(p => p._id));
  } // end product group for loop
  return categoryIds.includes(categoryId);
};

const isInUser = (pos: IPosDocument, userId: string) => {
  const allUserIds = pos.adminIds.concat(pos.cashierIds);
  return allUserIds.includes(userId);
};

export default {
  'core:user': ['update', 'delete'],
  'products:productCategory': ['create', 'update', 'delete'],
  'products:product': ['create', 'update', 'delete']
};

export const afterMutationHandlers = async (subdomain, params) => {
  const { type, action } = params;
  const models = await generateModels(subdomain);
  const poss = await models.Pos.find({});

  if (type === 'products:product') {
    for (const pos of poss) {
      if (await isInProduct(subdomain, models, pos, params.object._id)) {
        await handler(subdomain, params, action, 'product', pos);
      }
    }
    return;
  }

  if (type === 'products:productCategory') {
    for (const pos of poss) {
      if (
        await isInProductCategory(subdomain, models, pos, params.object._id)
      ) {
        await handler(subdomain, params, action, 'product', pos);
      }
    }
    await handler(subdomain, params, action, 'productCategory');
    return;
  }

  if (type === 'core:users') {
    for (const pos of poss) {
      if (await isInUser(pos, params.object._id)) {
        await handler(subdomain, params, action, 'user', pos);
      }
    }
    return;
  }
};
