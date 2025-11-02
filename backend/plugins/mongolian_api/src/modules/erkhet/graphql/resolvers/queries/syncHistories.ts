import { ISyncHistoryParams } from '@/erkhet/@types';
import {
  cursorPaginate,
  escapeRegExp,
  getPureDate,
} from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';

const generateFilter = (params: ISyncHistoryParams) => {
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

const erkhetQueries = {
  async syncHistories(
    _root: undefined,
    params: ISyncHistoryParams,
    { models }: IContext,
  ) {
    const selector = generateFilter(params);

    return await cursorPaginate({
      model: models.SyncLogs,
      params,
      query: selector,
    });
  },

  async syncHistoriesCount(
    _root: undefined,
    params: ISyncHistoryParams,
    { models }: IContext,
  ) {
    const selector = generateFilter(params);

    return models.SyncLogs.find(selector).countDocuments();
  },
};

export default erkhetQueries;
