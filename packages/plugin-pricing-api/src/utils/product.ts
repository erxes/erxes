import * as _ from 'lodash';
import { sendProductsMessage, sendSegmentsMessage } from '../messageBroker';
import { IPricingPlanDocument } from '../models/definitions/pricingPlan';

/**
 * Get parent orders of products
 * @param order
 * @returns string array
 */
export const getParentsOrders = (order: string): string[] => {
  const orders: string[] = [];
  const splitOrders = order.split('/');
  let currentOrder = '';

  for (const oStr of splitOrders) {
    if (oStr) {
      currentOrder = `${currentOrder}${oStr}/`;
      orders.push(currentOrder);
    }
  }

  return orders;
};

export const getChildCategories = async (subdomain: string, categoryIds) => {
  const childs = await sendProductsMessage({
    subdomain,
    action: 'categories.withChilds',
    data: { ids: categoryIds },
    isRPC: true,
    defaultValue: []
  });

  const catIds: string[] = (childs || []).map(ch => ch._id) || [];
  return Array.from(new Set(catIds));
};

/**
 * Filter out the products that is passed to be discounted
 * @param subdomain
 * @param plan
 * @param productIds
 * @returns string array
 */
export const getAllowedProducts = async (
  subdomain: string,
  plan: IPricingPlanDocument,
  productIds: string[]
): Promise<string[]> => {
  switch (plan.applyType) {
    case 'bundle': {
      let pIds: string[] = [];
      for (const bundles of plan.productsBundle || []) {
        let difference = _.difference(bundles, productIds);
        if (difference.length === 0)
          pIds = pIds.concat(_.intersection(productIds, bundles));
      }
      return pIds;
    }

    case 'product': {
      return _.intersection(productIds, plan.products);
    }

    case 'segment': {
      let productIdsInSegments: string[] = [];
      for (const segment of plan.segments || []) {
        productIdsInSegments = productIdsInSegments.concat(
          await sendSegmentsMessage({
            subdomain,
            action: 'fetchSegment',
            data: { segmentId: segment },
            isRPC: true,
            defaultValue: []
          })
        );
      }
      return _.intersection(productIds, productIdsInSegments);
    }

    case 'vendor': {
      const limit = await sendProductsMessage({
        subdomain,
        action: 'count',
        data: {
          query: {
            vendorId: { $in: plan.vendors || [] }
          }
        },
        isRPC: true,
        defaultValue: 0
      });

      const products = await sendProductsMessage({
        subdomain,
        action: 'find',
        data: {
          query: {
            vendorId: { $in: plan.vendors || [] }
          },
          field: { _id: 1 },
          limit
        },
        isRPC: true,
        defaultValue: []
      });
      const productIdsInVendors = products.map(p => p._id);
      return _.intersection(productIds, productIdsInVendors);
    }

    case 'category': {
      const filterProductIds = productIds.filter(
        pId => !(plan.productsExcluded || []).includes(pId)
      );

      if (!filterProductIds.length) {
        return [];
      }

      if (!(plan.categories && plan.categories.length)) {
        return [];
      }

      const products = await sendProductsMessage({
        subdomain,
        action: 'find',
        data: {
          query: { _id: { $in: filterProductIds } },
          sort: { _id: 1, categoryId: 1 },
          limit: filterProductIds.length
        },
        isRPC: true,
        defaultValue: []
      });

      const includeCatIds = await getChildCategories(
        subdomain,
        plan.categories
      );
      const excludeCatIds = await getChildCategories(
        subdomain,
        plan.categoriesExcluded || []
      );

      const plansCategoryIds = includeCatIds.filter(
        c => !excludeCatIds.includes(c)
      );

      return products
        .filter(p => plansCategoryIds.includes(p.categoryId))
        .map(p => p._id);
    }

    default:
      return [];
  }
};
