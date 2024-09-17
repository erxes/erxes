import { IContext } from "../../../connectionResolver";

const generateFilter = async params => {
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

const DashboardQueries = {
  /**
   * Dashboard list
   */

  dashboardList: async (_root, params, { models }: IContext) => {
    const totalCount = await models.Dashboards.countDocuments({});
    const filter = await generateFilter(params);
    const list = await models.Dashboards.find(filter).sort({ createdAt: -1 });

    return { list, totalCount };
  },

  /**
   * Get one dashboard
   */
  async dashboardDetail(_root, { _id }: { _id: string }, { models }: IContext) {
    const dashboard = await models.Dashboards.getDashboard(_id);
    return dashboard;
  }
};

export default DashboardQueries;
