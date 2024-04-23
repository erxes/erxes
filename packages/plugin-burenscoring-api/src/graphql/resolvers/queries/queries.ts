import {  paginate } from '@erxes/api-utils/src';
import { IContext } from '../../../connectionResolver';
import { BurenScoringApi } from '../../../burenScoringConfig/api/getScoring';
import { getConfig } from '../../../messageBroker';

const generateFilter = async (params, commonQuerySelector) => {
  const filter: any = commonQuerySelector;

  if (params.ids) {
    filter._id = { $in: params.ids };
  }

  if (params.customerId) {
    filter.customerId = params.customerId;
  }

  if (params.startDate) {
    filter.createdAt = {
      $gte: new Date(params.startDate)
    };
  }

  if (params.endDate) {
    filter.createdAt = {
      $lte: new Date(params.endDate)
    };
  }

  if (params.startDate && params.endDate) {
    filter.createdAt = {
      $and: [
        { $gte: new Date(params.startDate) },
        { $lte: new Date(params.endDate) }
      ]
    };
  }

  return filter;
};

export const sortBuilder = params => {
  const {sortField} = params;
  const sortDirection = params.sortDirection || 0;

  if (sortField) {
    return { [sortField]: sortDirection };
  }

  return {};
};

const burenScoringQueries = {
  /**
   * Non Balance Transactions list
   */
  burenCustomerScoringsMain: async (
    _root,
    params,
    { commonQuerySelector, models }: IContext
  ) => {
    const filter = await generateFilter(params, commonQuerySelector);
    return {
      list: await paginate(
        models.BurenScorings.find(filter).sort(sortBuilder(params)),
        {
          page: params.page,
          perPage: params.perPage
        }
      ),
      totalCount: await models.BurenScorings.find(filter).count()
    };
  },
  getCustomerScore: async (_root, { customerId }, { models }: IContext) => {
    return models.BurenScorings.findOne({customerId: customerId}).sort({"createdAt": -1}).limit(1);
  },

   getCustomerScoring: async (
    _root,
      {keyword,
        reportPurpose},
      { subdomain }: IContext
  ) => {
    const config = await getConfig('burenScoringConfig', subdomain, '' )
    if (!config) {
      throw new Error('Buren scoring config not found.');
    }
    const burenConfig = new BurenScoringApi(config);
    const scoring = burenConfig.getScoring({
      keyword,
      reportPurpose
    });
    return scoring;
  }


};
export default burenScoringQueries;
