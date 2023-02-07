import * as _ from 'lodash';
import { sendProductsMessage } from '../messageBroker';

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

/**
 * Filter out the products that is passed to be discounted
 * @param subdomain
 * @param plan
 * @param productIds
 * @returns string array
 */
export const getAllowedProducts = async (
  subdomain: string,
  plan: any,
  productIds: string[]
): Promise<string[]> => {
  switch (plan.applyType) {
    case 'bundle': {
      let difference = _.difference(plan.productsBundle, productIds);
      if (difference.length === 0) return [...plan.productsBundle];
      else return [];
    }

    case 'product': {
      return _.intersection(productIds, plan.products);
    }

    case 'category': {
      let orderProducts: any[] = [];
      let orderProductCategories: any[] = [];
      let allOrderProductCategories: any[] = [];
      let isFetchedCategories: boolean = false;
      let allowedProductIds: string[] = [];

      if (!isFetchedCategories) {
        const limit = await sendProductsMessage({
          subdomain,
          action: 'count',
          data: {
            query: { _id: { $in: productIds } }
          },
          isRPC: true,
          defaultValue: []
        });

        orderProducts = await sendProductsMessage({
          subdomain,
          action: 'find',
          data: {
            query: { _id: { $in: productIds } },
            sort: { _id: 1, categoryId: 1 },
            limit
          },
          isRPC: true,
          defaultValue: []
        });

        orderProductCategories = await sendProductsMessage({
          subdomain,
          action: 'categories.find',
          data: {
            query: { _id: { $in: orderProducts.map(p => p.categoryId) } },
            sort: { _id: 1 }
          },
          isRPC: true,
          defaultValue: []
        });

        let allOrders: string[] = [];

        for (const category of orderProductCategories)
          allOrders = allOrders.concat(getParentsOrders(category.order));

        allOrderProductCategories = await sendProductsMessage({
          subdomain,
          action: 'categories.find',
          data: {
            query: { order: { $in: allOrders } },
            sort: { order: 1 }
          },
          isRPC: true,
          defaultValue: []
        });

        isFetchedCategories = true;
      }

      for (const item of orderProducts) {
        const order = orderProductCategories.find(
          category => category._id === item.categoryId
        ).order;
        const parentOrders = getParentsOrders(order);

        const categories = allOrderProductCategories.filter(category =>
          parentOrders.includes(category.order)
        );
        const categoryIds = categories.map(category => category._id);

        const isCategoryIncluded =
          _.intersection(categoryIds, plan.categories).length !== 0;
        const isCategoryExcluded =
          _.intersection(categoryIds, plan.categoriesExcluded).length === 0;
        const isProductExcluded =
          plan.productsExcluded.findIndex(id => id === item._id) === -1;

        if (isCategoryIncluded && isCategoryExcluded && isProductExcluded)
          allowedProductIds.push(item._id);
      }

      return allowedProductIds;
    }

    default:
      return [];
  }
};
