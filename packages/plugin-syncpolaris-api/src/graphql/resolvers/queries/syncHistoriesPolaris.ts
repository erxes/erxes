import { IContext } from '../../../connectionResolver';
import { paginate } from '@erxes/api-utils/src';
import { escapeRegExp, getPureDate } from '@erxes/api-utils/src/core';
import { getLoanDetail } from '../../../utils/loan/getLoanDetail';
import { getDepositStatement } from '../../../utils/deposit/getDepositStatement';
import { getDepositBalance } from '../../../utils/deposit/getDepositBalance';
import { getLoanCollaterials } from '../../../utils/loan/getLoanCollaterials';
import { getSavingTransactions } from '../../../utils/saving/getSavingTransactions';

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

const polarisQueries = {
  async syncHistoriesPolaris(_root, params, { models }: IContext) {
    const selector = generateFilter(params);
    return paginate(models.SyncLogs.find(selector), params);
  },

  async syncHistoriesCountPolaris(_root, params, { models }: IContext) {
    const selector = generateFilter(params);
    return models.SyncLogs.find(selector).count();
  },

  async getPolarisData(_root, params, { subdomain }: IContext) {
    const { method, data } = params;
    switch (method) {
      case 'getLoanDetail':
        return await getLoanDetail(subdomain, data);
      case 'getDepositStatement':
        return await getDepositStatement(subdomain, data);
      case 'getDepositBalance':
        return await getDepositBalance(subdomain, data);
      case 'getLoanCollaterals':
        return await getLoanCollaterials(subdomain, data);
      case 'getSavingTransactions':
        return await getSavingTransactions(subdomain, data);

      default:
        break;
    }
  },
};

export default polarisQueries;
