import * as _ from 'lodash';
import { IPricingPlanDocument } from '@/pricing/@types/pricingPlan';
import { sendTRPCMessage } from 'erxes-api-shared/utils';

/**
 * Get parent orders of products
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

export const getChildCategories = async (
  subdomain: string,
  categoryIds: string[],
): Promise<string[]> => {
  const childs = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    module: 'categories',
    action: 'withChilds',
    input: { ids: categoryIds },
    defaultValue: [],
  });

  const catIds = (childs || []).map((ch) => ch._id);
  return Array.from(new Set(catIds));
};

export const getChildTags = async (
  subdomain: string,
  tagIds: string[],
): Promise<string[]> => {
  const childs = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    module: 'tags',
    action: 'withChilds',
    input: {
      query: { _id: { $in: tagIds } },
      fields: { _id: 1 },
    },
    defaultValue: [],
  });

  const foundTagIds = (childs || []).map((ch) => ch._id);
  return Array.from(new Set(foundTagIds));
};

/**
 * Filter out the products that is passed to be discounted
 */
export const getAllowedProducts = async (
  subdomain: string,
  plan: IPricingPlanDocument,
  productIds: string[],
): Promise<string[]> => {
  switch (plan.applyType) {
    case 'bundle': {
      let pIds: string[] = [];

      for (const bundles of plan.productsBundle || []) {
        const difference = _.difference(bundles, productIds);
        if (!difference.length) {
          pIds = pIds.concat(_.intersection(productIds, bundles));
        }
      }

      return pIds;
    }

    case 'product':
      return _.intersection(productIds, plan.products);

    case 'segment': {
      let productIdsInSegments: string[] = [];

      for (const segment of plan.segments || []) {
        const ids = await sendTRPCMessage({
          subdomain,
          pluginName: 'core',
          module: 'segments',
          action: 'fetch',
          input: { segmentId: segment },
          defaultValue: [],
        });

        productIdsInSegments = productIdsInSegments.concat(ids);
      }

      return _.intersection(productIds, productIdsInSegments);
    }

    case 'vendor': {
      const products = await sendTRPCMessage({
        subdomain,
        pluginName: 'core',
        module: 'products',
        action: 'find',
        input: {
          query: { vendorId: { $in: plan.vendors || [] } },
          field: { _id: 1 },
        },
        defaultValue: [],
      });

      const productIdsInVendors = products.map((p) => p._id);
      return _.intersection(productIds, productIdsInVendors);
    }

    case 'category': {
      const filterProductIds = productIds.filter(
        (pId) => !(plan.productsExcluded || []).includes(pId),
      );

      if (!filterProductIds.length || !plan.categories?.length) {
        return [];
      }

      const products = await sendTRPCMessage({
        subdomain,
        pluginName: 'core',
        module: 'products',
        action: 'find',
        input: {
          query: { _id: { $in: filterProductIds } },
          sort: { _id: 1, categoryId: 1 },
          limit: filterProductIds.length,
        },
        defaultValue: [],
      });

      const includeCatIds = await getChildCategories(
        subdomain,
        plan.categories,
      );
      const excludeCatIds = await getChildCategories(
        subdomain,
        plan.categoriesExcluded || [],
      );

      const plansCategoryIds = includeCatIds.filter(
        (c) => !excludeCatIds.includes(c),
      );

      return products
        .filter((p) => plansCategoryIds.includes(p.categoryId))
        .map((p) => p._id);
    }

    case 'tag': {
      const filterProductIds = productIds.filter(
        (pId) => !(plan.productsExcluded || []).includes(pId),
      );

      if (!filterProductIds.length || !plan.tags?.length) {
        return [];
      }

      const products = await sendTRPCMessage({
        subdomain,
        pluginName: 'core',
        module: 'products',
        action: 'find',
        input: {
          query: { _id: { $in: filterProductIds } },
          sort: { _id: 1, categoryId: 1 },
          limit: filterProductIds.length,
        },
        defaultValue: [],
      });

      const includeTagIds = await getChildTags(subdomain, plan.tags);
      const excludeTagIds = await getChildTags(
        subdomain,
        plan.tagsExcluded || [],
      );

      const plansTagIds = includeTagIds.filter(
        (t) => !excludeTagIds.includes(t),
      );

      return products
        .filter((p) => _.intersection(plansTagIds, p.tagIds).length)
        .map((p) => p._id);
    }

    default:
      return [];
  }
};
