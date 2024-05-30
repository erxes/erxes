import { paginate } from '@erxes/api-utils/src';
import { IContext } from '../../../connectionResolver';
import { BurenScoringApi } from '../../../burenScoringConfig/api/getScoring';
import { getBurenScoringConfig } from '../../../messageBroker';

const generateFilter = async (params, commonQuerySelector) => {
  const filter: any = commonQuerySelector;


  if (params.customerId) {
    filter.customerId = params.customerId;
  }
  return filter;
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
        models.BurenScorings.find(filter).lean(),
        {
          page: params.page,
          perPage: params.perPage
        }
      ),
      totalCount: await models.BurenScorings.find(filter).countDocuments()
    };
  },
  getCustomerScore: async (_root, { customerId }, { models }: IContext) => {
    return models.BurenScorings.findOne({ customerId }).sort({ "createdAt": -1 }).limit(1);
  },

  getCustomerScoring: async (
    _root,
    { keyword,
      reportPurpose },
    { subdomain }: IContext
  ) => {
    const config = await getBurenScoringConfig('burenScoringConfig', subdomain)
    if (!config) {
      throw new Error('Buren scoring config not found.');
    }
    const burenConfig = new BurenScoringApi(config);
    return burenConfig.getScoring({
      keyword,
      reportPurpose
    });
  }
};
export default burenScoringQueries;
