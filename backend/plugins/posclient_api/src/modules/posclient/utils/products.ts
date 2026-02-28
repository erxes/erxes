import { sendTRPCMessage } from 'erxes-api-shared/utils';
import fetch from 'node-fetch';
import { IModels } from '~/connectionResolvers';
import { IConfigDocument } from '~/modules/posclient/@types/configs';
import { IProductDocument } from '~/modules/posclient/@types/products';

export const getRemBranchId = (
  config: IConfigDocument,
  paramBranchId?: string,
) => {
  if (!paramBranchId) {
    return 'default';
  }

  if (config.branchId === paramBranchId) {
    return 'default';
  }

  if (!(config.allowBranchIds || []).includes(paramBranchId)) {
    return 'default';
  }

  return paramBranchId;
};
export const checkRemainders = async (
  subdomain: string,
  models: IModels,
  config: IConfigDocument,
  checkProducts: IProductDocument[],
  paramBranchId?: string,
) => {
  const products: any = checkProducts;
  const bulkOps: Array<{
    updateOne: {
      filter: { _id: string };
      update: { $set: any };
    };
  }> = [];
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
          let jsonRes = {};
          try {
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
            jsonRes = await response.json();
          } catch (e) {
            console.log(e.message);
          }
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
          const remBranchId = getRemBranchId(config, paramBranchId);
          for (const product of products) {
            product.remainders = (responseByCode[product.code] || {}).rems;
            product.remainder = (responseByCode[product.code] || {}).rem;
            if (config.saveRemainder) {
              if (!product.remainderByToken) {
                product.remainderByToken = {};
              }
              if (!product.remainderByToken[config.token]) {
                product.remainderByToken[config.token] = {};
              }

              product.remainderByToken[config.token][remBranchId] =
                product.remainder ?? 0;
              bulkOps.push({
                updateOne: {
                  filter: { _id: product._id },
                  update: {
                    $set: {
                      [`remainderByToken.${config.token}.${remBranchId}`]:
                        product.remainder ?? 0,
                    },
                  },
                },
              });
            }
          }
        }
      } catch (e) {
        console.log(`fetch remainder from erkhet, Error: ${e.message}`);
      }
    }

    return products;
  }

  if (config.checkRemainder) {
    const branchIds = paramBranchId
      ? [paramBranchId]
      : config.isOnline
        ? config.allowBranchIds || []
        : (config.branchId && [config.branchId]) || [];
    const departmentIds = config.departmentId ? [config.departmentId] : [];
    const productIds = products.map((p) => p._id);

    const inventoryResponse = await sendTRPCMessage({
      subdomain,
      pluginName: 'accounting',
      module: 'inventory',
      action: 'remainders',
      input: {
        productIds,
        departmentIds,
        branchIds,
      },
      defaultValue: [],
    });

    const remBranchId = getRemBranchId(config, paramBranchId);
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
        (sum, cur) => sum + (Number(cur.count) || 0),
        0,
      );
      product.soonIn = (remainderByProductId[product._id] || []).reduce(
        (sum, cur) => sum + (Number(cur.soonIn) || 0),
        0,
      );
      product.soonOut = (remainderByProductId[product._id] || []).reduce(
        (sum, cur) => sum + (Number(cur.soonOut) || 0),
        0,
      );
      if (config.saveRemainder) {
        if (!product.remainderByToken) {
          product.remainderByToken = {};
        }
        if (!product.remainderByToken[config.token]) {
          product.remainderByToken[config.token] = {};
        }

        product.remainderByToken[config.token][remBranchId] =
          product.remainder ?? 0;
        bulkOps.push({
          updateOne: {
            filter: { _id: product._id },
            update: {
              $set: {
                [`remainderByToken.${config.token}.${remBranchId}`]:
                  product.remainder ?? 0,
              },
            },
          },
        });
      }
    }

    if (bulkOps.length) {
      await models.Products.bulkWrite(bulkOps);
    }
  }

  return products;
};

export const syncRemainders = async (
  subdomain: string,
  models: IModels,
  config: IConfigDocument,
  products: IProductDocument[],
) => {
  const batchSize = 100;

  for (let i = 0; i < products.length; i += batchSize) {
    const checkProducts = products.slice(i, i + batchSize);
    for (const paramBranchId of config.allowBranchIds || []) {
      await checkRemainders(
        subdomain,
        models,
        config,
        checkProducts,
        paramBranchId,
      );
    }
    await checkRemainders(subdomain, models, config, checkProducts);
  }
};
