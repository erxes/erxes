import {
  DashboardItems,
  Dashboards,
  Integrations,
  Pipelines,
  Stages,
  Users
} from '../../../db/models';
import { DashboardFilters } from '../../dashboardConstants';
import { checkPermission } from '../../permissions/wrappers';
import { IContext } from '../../types';
import { paginate } from '../../utils';

const dashBoardQueries = {
  dashboards(
    _root,
    args: { page: number; perPage: number },
    { commonQuerySelector }: IContext
  ) {
    return paginate(Dashboards.find(commonQuerySelector), args);
  },

  dashboardDetails(_root, { _id }: { _id: string }) {
    return Dashboards.findOne({ _id });
  },

  dashboardsTotalCount() {
    return Dashboards.find({}).countDocuments();
  },

  async dashboardItems(_root, { dashboardId }: { dashboardId: string }) {
    return DashboardItems.find({ dashboardId });
  },

  dashboardItemDetail(_root, { _id }: { _id: string }) {
    return DashboardItems.findOne({ _id });
  },

  async dashboardInitialDatas(
    _root,
    { type }: { type: string },
    { dataSources }: IContext
  ) {
    return dataSources.HelpersApi.fetchApi('/get-dashboards', { type });
  },

  async dashboardFilters(_root, { type }: { type: string }) {
    if (type) {
      let filters = DashboardFilters[type];

      if (filters) {
        return filters;
      } else {
        filters = [] as any;

        if (type.includes('pipelineName')) {
          const pipelineIds = await Stages.find({ type: 'deal' }).distinct(
            'pipelineId'
          );

          const pipelines = await Pipelines.find({ _id: { $in: pipelineIds } });
          await Promise.all(
            pipelines.map(async pipeline => {
              const stageIds = await Stages.find({
                pipelineId: pipeline._id
              }).distinct('_id');
              filters.push({ label: pipeline.name, value: stageIds });
            })
          );
        }

        if (
          type.includes('modifiedBy') ||
          type.includes('firstRespondedUser')
        ) {
          const users = await Users.find({ username: { $exists: true } });

          users.map(user => {
            filters.push({ label: user.username, value: user._id });
          });
        }

        if (type.includes('integrationName')) {
          const integrations = await Integrations.find({});

          integrations.map(integration => {
            filters.push({
              label: integration.name,
              value: integration._id
            });
          });
        }
      }

      return filters;
    }

    return null;
  }
};

checkPermission(dashBoardQueries, 'dashboards', 'showDashboards', []);

export default dashBoardQueries;
