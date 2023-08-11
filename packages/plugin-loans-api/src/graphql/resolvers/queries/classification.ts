import { paginate } from '@erxes/api-utils/src';
import { IContext } from '../../../connectionResolver';
import { moduleRequireLogin } from '@erxes/api-utils/src/permissions';

const generateFilter = async (params, commonQuerySelector) => {
  const filter: any = commonQuerySelector;

  if (params.searchValue) {
    filter.$or = [
      { number: { $in: [new RegExp(`.*${params.searchValue}.*`, 'i')] } }
    ];
  }

  return filter;
};

export const sortBuilder = params => {
  const sortField = params.sortField;
  const sortDirection = params.sortDirection || 0;

  if (sortField) {
    return { [sortField]: sortDirection };
  }

  return {};
};

const classificationsQueries = {
  /**
   * ContractTypes list
   */
  classifications: async (
    _root,
    params,
    { commonQuerySelector, models }: IContext
  ) => {
    const filter = await generateFilter(params, commonQuerySelector);

    return {
      list: paginate(
        models.Classification.find(filter).sort(sortBuilder(params)),
        {
          page: params.page,
          perPage: params.perPage
        }
      ),
      totalCount: models.Classification.find(filter).count()
    };
  },

  /**
   * Get one contractType
   */

  classificationDetail: async (_root, { _id }, { models }: IContext) => {
    return models.Classification.findOne({ _id });
  }
};

moduleRequireLogin(classificationsQueries);

export default classificationsQueries;
