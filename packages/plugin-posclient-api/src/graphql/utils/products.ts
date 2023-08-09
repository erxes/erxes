import { debugError } from '@erxes/api-utils/src/debuggers';
import { sendRequest } from '@erxes/api-utils/src/requests';
import { sendInventoriesMessage } from '../../messageBroker';
import { IConfigDocument } from '../../models/definitions/configs';
import { IProductDocument } from '../../models/definitions/products';

export const checkRemainders = async (
  subdomain: string,
  config: IConfigDocument,
  checkProducts: IProductDocument[],
  paramBranchId?: string
) => {
  const products: any = checkProducts;

  if (config.erkhetConfig && config.erkhetConfig.getRemainder) {
    const configs = config.erkhetConfig;
    if (
      configs &&
      configs.getRemainderApiUrl &&
      configs.apiKey &&
      configs.apiSecret
    ) {
      try {
        let account = configs.account;
        let location = configs.location;

        if (config.isOnline && paramBranchId) {
          const accLocConf = configs[paramBranchId];

          if (accLocConf) {
            account = accLocConf.account;
            location = accLocConf.location;
          }
        }

        if (account && location) {
          const response = await sendRequest({
            url: configs.getRemainderApiUrl,
            method: 'GET',
            params: {
              kind: 'remainder',
              api_key: configs.apiKey,
              api_secret: configs.apiSecret,
              check_relate: products.length < 4 ? '1' : '',
              accounts: account,
              locations: location,
              inventories: products.map(p => p.code).join(',')
            }
          });

          const jsonRes = JSON.parse(response);

          let responseByCode = jsonRes;

          responseByCode =
            (jsonRes[account] && jsonRes[account][location]) || {};

          products.map((item: any) => {
            item.remainder = responseByCode[item.code]
              ? responseByCode[item.code]
              : undefined;
            return item;
          });
        }
      } catch (e) {
        debugError(`fetch remainder from erkhet, Error: ${e.message}`);
      }
    }
  }

  let branchIds = paramBranchId
    ? [paramBranchId]
    : config.isOnline
    ? config.allowBranchIds
    : config.branchId;
  const productIds = products.map(p => p._id);

  if (config.checkRemainder) {
    const inventoryResponse = await sendInventoriesMessage({
      subdomain,
      action: 'remainders',
      data: {
        productIds,
        departmentIds: config.departmentId,
        branchIds
      },
      isRPC: true,
      defaultValue: []
    });

    const remainderByProductId = {};
    for (const rem of inventoryResponse) {
      if (!Object.keys(remainderByProductId).includes(rem.productId)) {
        remainderByProductId[rem.productId] = [];
      }

      remainderByProductId[rem.productId].push(rem);
    }

    for (const product of products) {
      product.remainders = remainderByProductId[product._id];
      product.remainder = (remainderByProductId[product._id] || []).reduce(
        (sum, cur) => sum + cur.count,
        0
      );
    }
  }

  return products;
};
