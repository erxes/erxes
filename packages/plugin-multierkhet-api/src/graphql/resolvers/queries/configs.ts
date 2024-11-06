import { requireLogin } from "@erxes/api-utils/src/permissions";

import * as dotenv from "dotenv";
import { IContext } from "../../../connectionResolver";
import { sendCoreMessage, sendSalesMessage } from "../../../messageBroker";

dotenv.config();

const configQueries = {
  /**
   * Config object
   */
  async multierkhetConfigs(_root, _args, { models }: IContext) {
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
    const deal = await sendSalesMessage({
      subdomain,
      action: "deals.findOne",
      data: { _id },
      isRPC: true
    });

    if (!deal || !deal.productsData || !deal.productsData.length) {
      return [];
    }

    const mainConfigs = await models.Configs.getConfig("erkhetConfig", {});

    const brandIds = Object.keys(mainConfigs);

    if (!brandIds.length) {
      return [
        {
          _id: "",
          name: "",
          amount: deal.productsData.reduce(
            (sum, pd) => Number(sum) + Number(pd.amount),
            0
          )
        }
      ];
    }

    const productsIds = deal.productsData.map(item => item.productId);

    const products = await sendCoreMessage({
      subdomain,
      action: "products.find",
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
        brandIds.includes("noBrand")
      ) {
        if (!amountByBrandId["noBrand"]) {
          amountByBrandId["noBrand"] = 0;
        }
        amountByBrandId["noBrand"] += productData.amount;
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
      amount: amountByBrandId[brandId],
      paymentIds: mainConfigs[brandId].paymentIds || []
    }));
  }
};

requireLogin(configQueries, "multierkhetConfigs");

export default configQueries;
