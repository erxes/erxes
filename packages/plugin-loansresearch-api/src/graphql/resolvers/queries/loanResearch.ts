import { paginate } from '@erxes/api-utils/src';
import { IContext } from '../../../connectionResolver';

export const sortBuilder = (params) => {
  const sortField = params.sortField;
  const sortDirection = params.sortDirection || 0;

  if (sortField) {
    return { [sortField]: sortDirection };
  }

  return {};
};

const generateFilter = (params, commonQuerySelector) => {
  const filter: any = commonQuerySelector;

  const {
    userId,
    contentType,
    contentId,
    searchConsume,
    searchSend,
    searchResponse,
    searchError,
  } = params;

  if (userId) {
    filter.createdBy = userId;
  }
  // if (contentType) {
  //   query.contentType = { $regex: `.*${escapeRegExp(contentType)}.*` };
  // }
  // if (contentId) {
  //   query.contentId = contentId;
  // }
  // if (searchConsume) {
  //   query.consumeStr = { $regex: `.*${escapeRegExp(searchConsume)}.*` };
  // }
  // if (searchSend) {
  //   query.sendStr = { $regex: `.*${escapeRegExp(searchSend)}.*` };
  // }
  // if (searchResponse) {
  //   query.responseStr = { $regex: `.*${escapeRegExp(searchResponse)}.*` };
  // }
  // if (searchError) {
  //   query.error = { $regex: `.*${escapeRegExp(searchError)}.*` };
  // }

  return filter;
};

const lsQueries = {
  /**
   * loan Research for only main list
   */

  loansResearchMain: async (
    _root,
    params,
    { commonQuerySelector, models }: IContext
  ) => {
    const filter = await generateFilter(params, commonQuerySelector);

    return {
      list: await paginate(
        models.LoansResearch.find(filter).sort(sortBuilder(params)),
        {
          page: params.page,
          perPage: params.perPage,
        }
      ),
      totalCount: await models.LoansResearch.find(filter).countDocuments(),
    };
  },

  /**
   * Get one loans Research detail
   */

  loanResearchDetail: async (_root, { _id }, { models }: IContext) => {
    return models.LoansResearch.getLoanResearch({ _id });
  },
};

export default lsQueries;
