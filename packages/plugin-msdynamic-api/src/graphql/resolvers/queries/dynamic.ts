import { paginate } from '@erxes/api-utils/src';
import { escapeRegExp, getPureDate } from '@erxes/api-utils/src/core';
import fetch from 'node-fetch';
import {
  IContext,
  sendCoreMessage,
  sendInventoriesMessage,
  sendPosMessage,
} from '../../../messageBroker';
import { getConfig } from '../../../utils';

const generateFilter = (params) => {
  const {
    userId,
    startDate,
    endDate,
    contentType,
    contentId,
    searchConsume,
    searchSend,
    searchResponse,
    searchError,
  } = params;

  const query: any = {};

  if (userId) {
    query.createdBy = userId;
  }
  if (contentType) {
    query.contentType = { $regex: `.*${escapeRegExp(contentType)}.*` };
  }
  if (contentId) {
    query.contentId = contentId;
  }
  if (searchConsume) {
    query.consumeStr = { $regex: `.*${escapeRegExp(searchConsume)}.*` };
  }
  if (searchSend) {
    query.sendStr = { $regex: `.*${escapeRegExp(searchSend)}.*` };
  }
  if (searchResponse) {
    query.responseStr = { $regex: `.*${escapeRegExp(searchResponse)}.*` };
  }
  if (searchError) {
    query.error = { $regex: `.*${escapeRegExp(searchError)}.*` };
  }

  const qry: any = {};
  if (startDate) {
    qry.$gte = getPureDate(startDate);
  }
  if (endDate) {
    qry.$lte = getPureDate(endDate);
  }
  if (Object.keys(qry).length) {
    query.createdAt = qry;
  }

  return query;
};

const msdynamicQueries = {
  async syncMsdHistories(_root, params, { models }: IContext) {
    const selector = generateFilter(params);
    return paginate(models.SyncLogs.find(selector), params).sort({
      createdAt: -1,
    });
  },

  async syncMsdHistoriesCount(_root, params, { models }: IContext) {
    const selector = generateFilter(params);
    return models.SyncLogs.find(selector).countDocuments();
  },

  async msdProductsRemainder(
    _root,
    {
      productCodes,
      brandId,
      posToken,
      branchId,
    }: {
      productCodes: string[];
      brandId: string;
      posToken?: string;
      branchId?: string;
    },
    { subdomain }: IContext
  ) {
    const configs = await getConfig(subdomain, 'DYNAMIC', {});
    let posConfig;

    if (!brandId && posToken) {
      posConfig = await sendPosMessage({
        subdomain,
        action: 'configs.findOne',
        data: { token: posToken },
        isRPC: true,
        defaultValue: {},
      });
      brandId = posConfig?.scopeBrandIds?.length
        ? posConfig.scopeBrandIds[0]
        : '';
    }

    const config = configs[brandId || 'noBrand'];

    if (
      !config ||
      !config.itemApi ||
      !config.username ||
      !config.password ||
      !config.locationCode
    ) {
      throw new Error('MS Dynamic config not found.');
    }

    const { itemApi, username, password, reminderCode } = config;

    let filterSection = productCodes
      .map((code) => `No eq '${code}'`)
      .join(' or ');

    const locationCodes = reminderCode.split(',').map((loc) => loc.trim());

    let locationFilterSection = locationCodes
      .map((loc) => `Location_Filter eq '${loc}'`)
      .join(' or ');

    const url = `${itemApi}?$filter=(${filterSection}) and (${locationFilterSection})&$select=No,Inventory`;

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
        Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString(
          'base64'
        )}`,
      },
      timeout: 60000,
    }).then((res) => res.json());

    if (!response.value?.length) {
      return [];
    }

    const result = response.value || [];

    if (posToken) {
      posConfig =
        posConfig ||
        (await sendPosMessage({
          subdomain,
          action: 'configs.findOne',
          data: { token: posToken },
          isRPC: true,
          defaultValue: {},
        }));

      if (
        posConfig?._id &&
        posConfig.departmentId &&
        (posConfig?.branchId || branchId)
      ) {
        const products = await sendCoreMessage({
          subdomain,
          action: 'products.find',
          data: {
            query: { code: { $in: productCodes } },
            fields: { _id: 1, code: 1 },
          },
          isRPC: true,
          defaultValue: [],
        });

        const productCodeById = {};
        for (const product of products) {
          productCodeById[product._id] = product.code;
        }

        const remainders = await sendInventoriesMessage({
          subdomain,
          action: 'reserveRemainders.find',
          data: {
            productIds: Object.keys(productCodeById),
            branchId: posConfig?.branchId || branchId,
            departmentId: posConfig.departmentId,
          },
          isRPC: true,
          defaultValue: [],
        });

        const remByCode = {};
        for (const rem of remainders) {
          const procuctCode = productCodeById[rem.productId];
          remByCode[procuctCode] = rem.remainder;
        }

        for (const row of result) {
          if (remByCode[row.No]) {
            row.reserveRemainder = remByCode[row.No];
          }
        }
      }
    }
    return result;
  },

  async msdCustomerRelations(_root, params, { models, subdomain }: IContext) {
    const { customerId } = params;
    const relations = await models.CustomerRelations.find({
      customerId,
    }).lean();

    if (!relations.length) {
      return relations;
    }

    const brands = await sendCoreMessage({
      subdomain,
      action: 'brands.find',
      data: { _id: { $in: (relations || []).map((r) => r.brandId) } },
      isRPC: true,
    });

    return relations.map((r) => ({
      ...r,
      brand: brands.find((b) => b._id === r.brandId),
    }));
  },
};

export default msdynamicQueries;
