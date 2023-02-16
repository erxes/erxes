import { ISendMessageArgs, sendMessage } from '@erxes/api-utils/src/core';
import { generateModels } from './connectionResolver';
import { serviceDiscovery } from './configs';
import { checkPricing } from './utils';
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

    const { product } = data;

    const plans = await models.PricingPlans.find({
      'quantityRules.0': { $exists: true }
    });

    let value = 0;
    let discountValue = 0;
    let adjustType;
    let adjustFactor;

    for (const plan of plans) {
      const allowedProductIds = await getAllowedProducts(
        subdomain,
        plan,
        product._id
      );

      const rules = plan.quantityRules || [];

      if (allowedProductIds.length > 0 && (rules || []).length > 0) {
        const firstRule = rules[0];

        if (firstRule.discountValue > discountValue) {
          discountValue = firstRule.discountValue;
          value = firstRule.value;
          adjustType = firstRule.priceAdjustType;
          adjustFactor = firstRule.priceAdjustFactor;
        }
      }
    }

    const unitPrice = product.unitPrice || 0;

    return {
      data: {
        value,
        price: calculatePriceAdjust(
          unitPrice,
          unitPrice - (unitPrice / 100) * discountValue,
          adjustType,
          adjustFactor
        )
      },
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

export default function() {
  return client;
}
