import { IConfigDocument } from '~/modules/posclient/@types/configs';
import { IProductDocument } from '~/modules/posclient/@types/products';

export const checkRemainders = async (
  subdomain: string,
  config: IConfigDocument,
  checkProducts: IProductDocument[],
  paramBranchId?: string,
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
          const response = await fetch(
            configs.getRemainderApiUrl +
              '?' +
              new URLSearchParams({
                kind: 'remainder',
                api_key: configs.apiKey,
                api_secret: configs.apiSecret,
                check_relate: products.length < 4 ? '1' : '',
                accounts: account,
                locations: location,
                inventories: products.map((p) => p.code).join(','),
              }),
          );

          const jsonRes = await response.json();
          let responseByCode = {};

          if (account && location) {
            const accounts = account.split(',') || [];
            const locations = location.split(',') || [];

            for (const acc of accounts) {
              for (const loc of locations) {
                const resp = (jsonRes[acc] || {})[loc] || {};
                for (const invCode of Object.keys(resp)) {
                  if (!Object.keys(responseByCode).includes(invCode)) {
                    responseByCode[invCode] = { rem: 0, rems: [] };
                  }
                  const remainder = Number(resp[invCode]) || 0;

                  responseByCode[invCode].rem =
                    responseByCode[invCode].rem + remainder;
                  responseByCode[invCode].rems.push({
                    account: acc,
                    location: loc,
                    remainder,
                  });
                }
              }
            }
          }

          for (const product of products) {
            product.remainders = (responseByCode[product.code] || {}).rems;
            product.remainder = (responseByCode[product.code] || {}).rem;
          }
        }
      } catch (e) {
        debugError(`fetch remainder from erkhet, Error: ${e.message}`);
      }
    }

    return products;
  }

  const branchIds = paramBranchId
    ? [paramBranchId]
    : config.isOnline
    ? config.allowBranchIds || []
    : (config.branchId && [config.branchId]) || [];
  const departmentIds = config.departmentId ? [config.departmentId] : [];
  const productIds = products.map((p) => p._id);

  if (config.checkRemainder) {
    // const inventoryResponse = await sendInventoriesMessage({
    //   subdomain,
    //   action: 'remainders',
    //   data: {
    //     productIds,
    //     departmentIds,
    //     branchIds,
    //   },
    //   isRPC: true,
    //   defaultValue: [],
    // });
    // const remainderByProductId = {};
    // for (const rem of inventoryResponse) {
    //   if (!Object.keys(remainderByProductId).includes(rem.productId)) {
    //     remainderByProductId[rem.productId] = [];
    //   }
    //   remainderByProductId[rem.productId].push(rem);
    // }
    // for (const product of products) {
    //   product.remainders = remainderByProductId[product._id];
    //   product.remainder = (remainderByProductId[product._id] || []).reduce(
    //     (sum, cur) => sum + (Number(cur.count) || 0),
    //     0,
    //   );
    //   product.soonIn = (remainderByProductId[product._id] || []).reduce(
    //     (sum, cur) => sum + (Number(cur.soonIn) || 0),
    //     0,
    //   );
    //   product.soonOut = (remainderByProductId[product._id] || []).reduce(
    //     (sum, cur) => sum + (Number(cur.soonOut) || 0),
    //     0,
    //   );
    // }
  }

  return products;
};
function debugError(arg0: string) {
  throw new Error('Function not implemented.');
}
