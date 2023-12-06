import { requireLogin } from '@erxes/api-utils/src/permissions';

import * as dotenv from 'dotenv';
import { IContext } from '../../../connectionResolver';
import { sendCardsMessage, sendProductsMessage } from '../../../messageBroker';

dotenv.config();

const configQueries = {
  /**
   * Config object
   */
  multierkhetConfigs(_root, _args, { models }: IContext) {
    return models.Configs.find({});
  },

  async multierkhetConfigsGetValue(
    _root,
    { code }: { code: string },
    { models }: IContext
  ) {
    return models.Configs.findOne({ code }).lean();
  },

  async dealPayAmountByBrand(
    _root,
    { _id }: { _id: string },
    { models, subdomain }: IContext
  ) {
    const deal = await sendCardsMessage({
      subdomain,
      action: 'deals.findOne',
      data: { _id },
      isRPC: true
    });

    if (!deal || !deal.productsData || !deal.productsData.length) {
      return [];
    }

    const mainConfigs = await models.Configs.getConfig('erkhetConfig', {});

    const brandIds = Object.keys(mainConfigs);

    const productsIds = deal.productsData.map(item => item.productId);

    const products = await sendProductsMessage({
      subdomain,
      action: 'find',
      data: {
        query: { _id: { $in: productsIds } },
        limit: deal.productsData.length
      },
      isRPC: true,
      defaultValue: []
    });

    const productById = {};
    for (const product of products) {
      productById[product._id] = product;
    }

    const amountByBrandId: any = {};

    for (const productData of deal.productsData) {
      // not tickUsed product not sent
      if (!productData.tickUsed) {
        continue;
      }

      // if wrong productId then not sent
      if (!productById[productData.productId]) {
        continue;
      }

      const product = productById[productData.productId];

      if (
        !(product.scopeBrandIds || []).length &&
        brandIds.includes('noBrand')
      ) {
        if (!amountByBrandId['noBrand']) {
          amountByBrandId['noBrand'] = 0;
        }
        amountByBrandId['noBrand'] += productData.amount;
        continue;
      }

      for (const brandId of brandIds) {
        if (product.scopeBrandIds.includes(brandId)) {
          if (!amountByBrandId[brandId]) {
            amountByBrandId[brandId] = 0;
          }

          amountByBrandId[brandId] += productData.amount;
          continue;
        }
      }
    }

    return (Object.keys(amountByBrandId) || []).map(brandId => ({
      _id: brandId,
      name: mainConfigs[brandId].title,
      amount: amountByBrandId[brandId]
    }));
  }
};

requireLogin(configQueries, 'multierkhetConfigs');

export default configQueries;
