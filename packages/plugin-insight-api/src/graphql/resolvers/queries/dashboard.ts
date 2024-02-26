import { IContext } from '../../../connectionResolver';
import { paginate } from '@erxes/api-utils/src';
import graphqlPubsub from '@erxes/api-utils/src/graphqlPubsub';
import { sendReportsMessage } from '../../../messageBroker';

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

export const sortBuilder = (params) => {
  const sortField = params.sortField;
  const sortDirection = params.sortDirection || 0;

  if (sortField) {
    return { [sortField]: sortDirection };
  }

  return {};
};

const DashboardQueries = {
  /**
   * Dashboard list
   */

  dashboards: async (
    _root,
    params,
    { commonQuerySelector, models }: IContext,
  ) => {
    return paginate(
      models.Dashboards.find(await generateFilter(params, commonQuerySelector)),
      {
        page: params.page,
        perPage: params.perPage,
      },
    );
  },

  /**
   * Get one dashboard
   */
  async dashboardDetail(_root, { _id }: { _id: string }, { models }: IContext) {
    const dashboard = await models.Dashboards.getDashboard(_id);
    return dashboard;
  },

  /**
   * Get last dashboard
   */
  async dashboardGetLast(_root, params, { models, subdomain }: IContext) {
    const dashboard = await models.Dashboards.findOne({}).sort({
      createdAt: -1,
    });

    if (dashboard) {
      return { _id: dashboard._id, type: 'dashboard' };
    }

    const report = await sendReportsMessage({
      subdomain,
      action: 'findLast',
      data: {},
      isRPC: true,
    });

    if (report) {
      return { _id: report._id, type: 'report' };
    }
  },
};

export default DashboardQueries;
