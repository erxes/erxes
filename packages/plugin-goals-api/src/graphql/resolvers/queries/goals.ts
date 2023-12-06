import { IContext } from '../../../connectionResolver';
import { paginate } from '@erxes/api-utils/src';
import { graphqlPubsub } from '../../../configs';

const generateFilter = async (params, commonQuerySelector) => {
  const { branch, department, unit, contribution, date, endDate } = params;
  let filter: any = {};
  if (branch) {
    filter.branch = branch;
  }
  if (department) {
    filter.department = department;
  }
  if (unit) {
    filter.unit = unit;
  }
  if (contribution) {
    filter.contribution = { $in: [contribution] };
  }
  if (date) {
    filter.startDate = { $gt: new Date(date) };
  }
  if (endDate) {
    filter.endDate = { $gt: new Date(endDate) };
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
const goalQueries = {
  /**
   * Goals list
   */

  goalTypes: async (
    _root,
    params,
    { commonQuerySelector, models }: IContext
  ) => {
    return paginate(
      models.Goals.find(await generateFilter(params, commonQuerySelector)),
      {
        page: params.page,
        perPage: params.perPage
      }
    );
  },

  /**
   * goalTypes for only main list
   */

  goalTypesMain: async (
    _root,
    params,
    { commonQuerySelector, models, subdomain, user }: IContext
  ) => {
    const filter = await generateFilter(params, commonQuerySelector);
    await models.Goals.progressIdsGoals(filter, params);

    return {
      list: paginate(models.Goals.find(filter).sort(sortBuilder(params)), {
        page: params.page,
        perPage: params.perPage
      }),
      totalCount: models.Goals.find(filter).count()
    };
  },

  /**
   * Get one goal
   */
  async goalDetail(_root, { _id }: { _id: string }, { models }: IContext) {
    const goal = await models.Goals.progressGoal(_id);
    return goal;
  }
};

export default goalQueries;
