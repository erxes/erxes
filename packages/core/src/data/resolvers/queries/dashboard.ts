import { IContext } from '../../../connectionResolver';

export const sortBuilder = (params) => {
  const sortField = params.sortField;
  const sortDirection = params.sortDirection || 0;

  if (sortField) {
    return { [sortField]: sortDirection };
  }

  return {};
};

const DashboardQueries = {
  dashboardList: async (_root, params, { models, user }: IContext) => {
    const totalCount = await models.Dashboards.getDashboardsCount(params, user);

    const list = await models.Dashboards.getDashboards(params, user);

    return { list, totalCount };
  },

  async dashboardDetail(_root, { _id }: { _id: string }, { models }: IContext) {
    const dashboard = await models.Dashboards.getDashboard(_id);
    return dashboard;
  },
};

export default DashboardQueries;
