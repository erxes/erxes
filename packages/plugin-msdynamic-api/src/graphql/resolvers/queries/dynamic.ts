import fetch from 'node-fetch';
import { paginate } from '@erxes/api-utils/src';
import { escapeRegExp, getPureDate } from '@erxes/api-utils/src/core';
import { IContext } from '../../../messageBroker';
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
    return paginate(models.SyncLogs.find(selector), params);
  },

  async syncMsdHistoriesCount(_root, params, { models }: IContext) {
    const selector = generateFilter(params);
    return models.SyncLogs.find(selector).countDocuments();
  },

  async msdProductsRemainder(
    _root,
    { brandId, productCodes }: { brandId: string; productCodes: string[] },
    { subdomain }: IContext
  ) {
    const configs = await getConfig(subdomain, 'DYNAMIC', {});
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

    const { itemApi, username, password, locationCode } = config;

    let filterSection = '';

    for (let i = 0; i < productCodes.length; i++) {
      const code = productCodes[i];
      filterSection += `No eq '${code}' or `;
    }

    filterSection = filterSection.slice(0, -4) + '';

    const url = `${itemApi}?$filter=(${filterSection}) and Location_Filter eq '${locationCode}'&$select=No,Inventory`;

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

    if (response.value.length > 0) {
      return response.value || [];
    }

    if (response.value.length === 0) {
      return [];
    }

    if (!(response.value || []).length) {
      return [];
    }

    return response.value || [];
  },
};

export default msdynamicQueries;
