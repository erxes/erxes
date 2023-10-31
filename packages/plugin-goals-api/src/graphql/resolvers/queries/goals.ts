import {
  checkPermission,
  requireLogin
} from '@erxes/api-utils/src/permissions';
import { IContext } from '../../../connectionResolver';
import { paginate } from '@erxes/api-utils/src';
import * as dayjs from 'dayjs';

const generateFilter = async (params, commonQuerySelector) => {
  const { branch, department, unit, contribution, date } = params;
  let filter: any = {};
  // if (params.branch) {
  //   filter.branch = params.branch;
  // }
  // if (params.department) {
  //   filter.department = params.department;
  // }
  // if (params.unit) {
  //   filter.unit = params.unit;
  // }
  // return filter;
  // const filter: any = { status: 'active' };
  // const filter: any = {};
  // if (branch) {
  //   filter.branchIds = { $in: [branch] };
  // }
  if (branch) {
    filter.branch = branch;
  }
  if (department) {
    filter.department = { $in: [department] };
  }
  if (unit) {
    filter.unit = { $in: [unit] };
  }
  if (contribution) {
    filter.contribution = { $in: [contribution] };
  }
  if (date) {
    const now = dayjs(date);
    const nowISO = now.toISOString();
    filter.$or = [
      {
        isStartDateEnabled: false,
        isEndDateEnabled: false
      },
      {
        isStartDateEnabled: true,
        isEndDateEnabled: false,
        startDate: {
          $lt: nowISO
        }
      },
      {
        isStartDateEnabled: false,
        isEndDateEnabled: true,
        endDate: {
          $gt: nowISO
        }
      },
      {
        isStartDateEnabled: true,
        isEndDateEnabled: true,
        startDate: {
          $lt: nowISO
        },
        endDate: {
          $gt: nowISO
        }
      }
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
const goalQueries = {
  /**
   * Goals list
   */

  // tslint:disable-next-line:no-empty
  async goals(_root, _args, { models }: IContext) {
    return await models.Goals.find({}).lean();
    // return paginate(
    //   models.Goals.find(
    //     await generateFilter(models, params, commonQuerySelector)
    //   ),
    //   {
    //     page: params.page,
    //     perPage: params.perPage
    //   }
    // );
  },
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
    { commonQuerySelector, models }: IContext
  ) => {
    await models.Goals.progressIdsGoals();
    const filter = await generateFilter(params, commonQuerySelector);
    return {
      list: paginate(models.Goals.find(filter).sort(sortBuilder(params)), {
        page: params.page,
        perPage: params.perPage
      }),
      totalCount: models.Goals.find(filter).count()
    };
  },

  goalTypeMainProgress: async (
    _root,
    params,
    { commonQuerySelector, models }: IContext
  ) => {
    const goals = await models.Goals.progressIdsGoals();

    return goals;
  },
  /**
   * Get one goal
   */
  async goalDetail(_root, { _id }: { _id: string }, { models }: IContext) {
    const goal = await models.Goals.progressGoal(_id);
    return goal;
  }
};

// requireLogin(goalQueries, 'goalDetail');
// checkPermission(goalQueries, 'goals', 'showGoals', []);

export default goalQueries;
