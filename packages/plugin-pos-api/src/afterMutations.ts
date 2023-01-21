import { generateModels, IModels } from './connectionResolver';
import {
  sendPosclientMessage,
  sendPricingMessage,
  sendProductsMessage
} from './messageBroker';
import { IPosDocument } from './models/definitions/pos';
import { getChildCategories } from './utils';

const handler = async (
  subdomain,
  params: any,
  action: string,
  type: string,
  pos: IPosDocument
) => {
  await sendPosclientMessage({
    subdomain,
    action: 'crudData',
    data: { ...params, action, type },
    pos
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

  if (pos.deliveryConfig && pos.deliveryConfig.productId) {
    allProductIds.push(pos.deliveryConfig.productId);
  }

  let allExcludedProductIds: string[] = [];
  let allCategoryIds: string[] = [];

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

    allExcludedProductIds = allExcludedProductIds.concat(
      group.excludedProductIds
    );
    allCategoryIds = allCategoryIds.concat(productCategoryIds);
  } // end product group for loop

  if (allExcludedProductIds.includes(productId)) {
    return false;
  }

  const products = await sendProductsMessage({
    subdomain,
    action: 'find',
    data: {
      query: {
        status: { $ne: 'deleted' },
        categoryId: { $in: allCategoryIds },
        _id: productId
      }
    },
    isRPC: true,
    defaultValue: []
  });

  if (!products.length) {
    return false;
  }

  return true;
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
  const allUserIds = (pos.adminIds || []).concat(pos.cashierIds || []);
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
        const item = params.updatedDocument || params.object;

        const pricing = await sendPricingMessage({
          subdomain,
          action: 'checkPricing',
          data: {
            prioritizeRule: 'only',
            totalAmount: 0,
            departmentId: pos.departmentId,
            branchId: pos.branchId,
            products: [
              {
                productId: item._id,
                quantity: 1,
                price: item.unitPrice
              }
            ]
          },
          isRPC: true,
          defaultValue: {}
        });

        const discount = pricing[item._id] || {};

        if (Object.keys(discount).length) {
          let unitPrice = (item.unitPrice -= discount.value);
          if (unitPrice < 0) {
            unitPrice = 0;
          }

          if (params.updatedDocument) {
            params.updatedDocument.unitPrice = unitPrice;
          } else {
            params.object.unitPrice = unitPrice;
          }
        }

        await handler(subdomain, { ...params }, action, 'product', pos);
      }
    }
    return;
  }

  if (type === 'products:productCategory') {
    for (const pos of poss) {
      if (
        await isInProductCategory(subdomain, models, pos, params.object._id)
      ) {
        await handler(subdomain, params, action, 'productCategory', pos);
      }
    }
    return;
  }

  if (type === 'core:user') {
    for (const pos of poss) {
      if (await isInUser(pos, params.object._id)) {
        await handler(subdomain, params, action, 'user', pos);
      }
    }
    return;
  }
};
