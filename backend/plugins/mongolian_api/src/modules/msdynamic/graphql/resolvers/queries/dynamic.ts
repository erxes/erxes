import {
  cursorPaginate,
  escapeRegExp,
  getPureDate,
  sendTRPCMessage,
} from 'erxes-api-shared/utils';

import fetch from 'node-fetch';
import { IContext, generateModels } from '~/connectionResolvers';

/**
 * Get DYNAMIC config from new mnconfigs module
 */
const getDynamicConfig = async (models: any, brandId?: string) => {
  const configs = await models.Configs.getConfigs('DYNAMIC');

  if (!configs?.length) {
    throw new Error('MS Dynamic config not found.');
  }

  const map = configs.reduce((acc: any, conf: any) => {
    acc[conf.subId || 'noBrand'] = conf.value;
    return acc;
  }, {});

  const config = map[brandId || 'noBrand'];

  if (!config) {
    throw new Error('MS Dynamic config not found.');
  }

  return config;
};

/**
 * Sync log filter builder
 */
const generateFilter = (params: any) => {
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

  if (userId) query.createdBy = userId;
  if (contentType)
    query.contentType = { $regex: `.*${escapeRegExp(contentType)}.*` };
  if (contentId) query.contentId = contentId;
  if (searchConsume)
    query.consumeStr = { $regex: `.*${escapeRegExp(searchConsume)}.*` };
  if (searchSend) query.sendStr = { $regex: `.*${escapeRegExp(searchSend)}.*` };
  if (searchResponse)
    query.responseStr = { $regex: `.*${escapeRegExp(searchResponse)}.*` };
  if (searchError) query.error = { $regex: `.*${escapeRegExp(searchError)}.*` };

  const dateQuery: any = {};
  if (startDate) dateQuery.$gte = getPureDate(startDate);
  if (endDate) dateQuery.$lte = getPureDate(endDate);

  if (Object.keys(dateQuery).length) {
    query.createdAt = dateQuery;
  }

  return query;
};

/**
 * ============================
 * MS Dynamic Queries
 * ============================
 */
export const msdynamicQueries = {
  async syncMsdHistories(_root, params, { models }: IContext) {
    return cursorPaginate({
      model: models.SyncLogs,
      params,
      query: generateFilter(params),
    });
  },

  async syncMsdHistoriesCount(_root, params, { models }: IContext) {
    return models.SyncLogs.countDocuments(generateFilter(params));
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
    { subdomain }: IContext,
  ) {
    const models = await generateModels(subdomain);

    let resolvedBrandId = brandId;

    /**
     * Resolve brandId from POS token if needed
     */
    if (!resolvedBrandId && posToken) {
      const posConfig = await sendTRPCMessage({
        subdomain,
        pluginName: 'pos',
        module: 'configs',
        action: 'findOne',
        method: 'query',
        input: { token: posToken },
        defaultValue: {},
      });

      resolvedBrandId = posConfig?.scopeBrandIds?.[0] || '';
    }

    const config = await getDynamicConfig(models, resolvedBrandId);

    if (
      !config.itemApi ||
      !config.username ||
      !config.password ||
      !config.reminderCode
    ) {
      throw new Error('MS Dynamic config not valid.');
    }

    const { itemApi, username, password, reminderCode } = config;

    const filterSection = productCodes
      .map((code) => `No eq '${code}'`)
      .join(' or ');

    const locationFilterSection = reminderCode
      .split(',')
      .map((loc: string) => `Location_Filter eq '${loc.trim()}'`)
      .join(' or ');

    const url = `${itemApi}?$filter=(${filterSection}) and (${locationFilterSection})&$select=No,Inventory`;

    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
        Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString(
          'base64',
        )}`,
      },
    }).then((r) => r.json());

    return response?.value || [];
  },

  async msdCustomerRelations(
    _root,
    { customerId }: { customerId: string },
    { models, subdomain }: IContext,
  ) {
    const relations = await models.CustomerRelations.find({
      customerId,
    }).lean();

    if (!relations.length) return relations;

    const brands = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      module: 'brands',
      action: 'find',
      method: 'query',
      input: {
        _id: { $in: relations.map((r) => r.brandId) },
      },
      defaultValue: [],
    });

    return relations.map((r) => ({
      ...r,
      brand: brands.find((b) => b._id === r.brandId),
    }));
  },
};
