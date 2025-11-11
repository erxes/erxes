import { cursorPaginate } from 'erxes-api-shared/utils';
import { escapeRegExp, getPureDate } from 'erxes-api-shared/utils';
import fetch from 'node-fetch';
import { IContext } from '~/connectionResolvers';
import { getConfig } from '../../../utils';
import { sendTRPCMessage } from 'erxes-api-shared/utils';

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
    return cursorPaginate({
        model: models.SyncLogs,
        params,
        query: selector
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
      const posConfig = await sendTRPCMessage({
        subdomain,
        pluginName: 'pos',
        module: 'configs',
        action: 'findOne',
        method: 'query',
        input: { token: posToken },
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

    console.log('msdProductsRemainder:', brandId, productCodes, posToken, branchId)

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
        (await sendTRPCMessage({
          subdomain,
          pluginName: 'pos',
          module: 'configs',
          action: 'findOne',
          method: 'query',
          input: { token: posToken },
          defaultValue: {},
        }));

      if (
        posConfig?._id &&
        posConfig.departmentId &&
        (posConfig?.branchId || branchId)
      ) {
        const products = await sendTRPCMessage({
          subdomain,
          pluginName: 'core',
          module: 'products',
          action: 'find',
          method: 'query',
          input: {
            query: { code: { $in: productCodes } },
            fields: { _id: 1, code: 1 },
          },
          defaultValue: [],
        });

        const productCodeById = {};
        for (const product of products) {
          productCodeById[product._id] = product.code;
        }

        const remainders = await sendTRPCMessage({
          subdomain,
          pluginName: 'inventories',
          module: 'reserveRemainders',
          action: 'find',
          method: 'query',
          input: {
            productIds: Object.keys(productCodeById),
            branchId: posConfig?.branchId || branchId,
            departmentId: posConfig.departmentId,
          },
          defaultValue: [],
        });


        const remByCode = {};
        for (const rem of remainders) {
          const productCode = productCodeById[rem.productId];
          remByCode[productCode] = rem.remainder;
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

    const brands = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      module: 'brands',
      action: 'find',
      method: 'query',
      input: {
        _id: { $in: (relations || []).map((r) => r.brandId) },
      },
    });


    return relations.map((r) => ({
      ...r,
      brand: brands.find((b) => b._id === r.brandId),
    }));
  },
};

export default msdynamicQueries;
