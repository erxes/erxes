import { ISendMessageArgs, sendMessage } from '@erxes/api-utils/src/core';
import { generateModels } from './connectionResolver';
import { serviceDiscovery } from './configs';
import { checkPricing, getMainConditions } from './utils';
import { getAllowedProducts } from './utils/product';
import { calculatePriceAdjust } from './utils/rule';

let client;

export const initBroker = async cl => {
  client = cl;

  const { consumeRPCQueue } = client;

  consumeRPCQueue('pricing:checkPricing', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    const {
      prioritizeRule,
      totalAmount,
      departmentId,
      branchId,
      products
    } = data;

    return {
      data:
        (await checkPricing(
          models,
          subdomain,
          prioritizeRule,
          totalAmount,
          departmentId,
          branchId,
          products
        )) || {},
      status: 'success'
    };
  });

  consumeRPCQueue('pricing:getQuanityRules', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    const { products, branchId, departmentId } = data;

    const productsById = {};
    for (const product of products) {
      productsById[product._id] = product;
    }

    const productIds = products.map(pr => pr._id);
    const rulesByProductId = {};

    const conditions = getMainConditions(branchId, departmentId);
    conditions.isPriority = false;

    const plans = await models.PricingPlans.find({
      ...conditions,
      'quantityRules.0': { $exists: true }
    }).sort({ value: -1 });

    let value = 0;
    let discountValue = 0;
    let adjustType;
    let adjustFactor;

    for (const plan of plans) {
      const allowedProductIds = await getAllowedProducts(
        subdomain,
        plan,
        productIds || []
      );

      const rules = plan.quantityRules || [];
      if (!(allowedProductIds.length > 0 && rules.length > 0)) {
        continue;
      }

      const firstRule = rules[0];
      discountValue = firstRule.discountValue;
      value = firstRule.value;
      adjustType = firstRule.priceAdjustType;
      adjustFactor = firstRule.priceAdjustFactor;

      for (const allowProductId of allowedProductIds) {
        const product = productsById[allowProductId];

        const unitPrice = product.unitPrice || 0;
        const prePrice =
          (rulesByProductId[allowProductId] || {}).price || unitPrice;

        const price =
          unitPrice -
          calculatePriceAdjust(
            unitPrice,
            (unitPrice / 100) * discountValue,
            adjustType,
            adjustFactor
          );

        if (price < prePrice) {
          rulesByProductId[allowProductId] = {
            value,
            price
          };
        }
      }
    }

    return {
      data: rulesByProductId,
      status: 'success'
    };
  });
};

export const sendProductsMessage = async (
  args: ISendMessageArgs
): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'products',
    ...args
  });
};

export const sendSegmentsMessage = async (
  args: ISendMessageArgs
): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'segments',
    ...args
  });
};

export default function() {
  return client;
}
