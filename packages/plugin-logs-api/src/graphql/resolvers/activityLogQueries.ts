import { moduleRequireLogin } from '@erxes/api-utils/src/permissions';

import { fetchActivityLogs, fetchLogs } from '../../utils';
import { fetchService, getContentIds } from '../../messageBroker';
import { IContext } from '../../connectionResolver';
import { serviceDiscovery } from '../../configs';
import { IActivityLogDocument } from '../../models/ActivityLogs';

export interface IListArgs {
  contentType: string;
  contentId: string;
  activityType: string;
}

interface IListArgsByAction {
  contentType: string;
  action: string;
  pipelineId: string;
  perPage?: number;
  page?: number;
}

const activityLogQueries = {
  /**
   * Get activity log list
   */
  async activityLogs(
    _root,
    doc: IListArgs,
    { models, subdomain, serverTiming }: IContext
  ) {
    const { contentId, contentType, activityType } = doc;
    const activities: IActivityLogDocument[] = [];

    if (activityType && activityType !== 'activity') {
      const serviceName = activityType.split(':')[0];

      serverTiming.startTime(`collectecItems${serviceName}`);

      const result = await fetchService(
        subdomain,
        serviceName,
        'collectItems',
        { contentId, contentType, activityType },
        ''
      );

      const { data } = result;

      serverTiming.endTime(`collectecItems${serviceName}`);

      return data;
    }

    const services = await serviceDiscovery.getServices();

    for (const serviceName of services) {
      const service = await serviceDiscovery.getService(serviceName, true);
      const meta = service.config.meta || {};

      if (meta && meta.logs) {
        const logs = meta.logs;

        if (logs.providesActivityLog) {
          serverTiming.startTime(`collectItems${serviceName}`);

          const result = await fetchService(
            subdomain,
            serviceName,
            'collectItems',
            { contentId, contentType },
            ''
          );

          serverTiming.endTime(`collectItems${serviceName}`);

          const { data } = result;

          if (Array.isArray(data) && data.length > 0) {
            activities.push(...data);
          }
        }
      }
    }

    serverTiming.startTime(`activities`);

    activities.push(
      ...(await models.ActivityLogs.find({
        contentId
      }).lean())
    );

    activities.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    serverTiming.endTime(`activities`);

    return activities;
  },

  async activityLogsByAction(
    _root,
    {
      contentType,
      action,
      pipelineId,
      perPage = 10,
      page = 1
    }: IListArgsByAction,
    { models }: IContext
  ) {
    const allActivityLogs: any[] = [];
    let allTotalCount: number = 0;

    if (!action) {
      return {
        activityLogs: [],
        totalCount: 0
      };
    }

    let actionArr = action.split(',');

    const perPageForAction = perPage / actionArr.length;

    const contentIds = await getContentIds({ pipelineId, contentType });

    actionArr = actionArr.filter(a => a !== 'delete');

    if (actionArr.length > 0) {
      const { activityLogs, totalCount } = await fetchActivityLogs(models, {
        contentType,
        contentId: { $in: contentIds },
        action: { $in: actionArr },
        perPage: perPageForAction * 3,
        page
      });

      for (const log of activityLogs) {
        allActivityLogs.push({
          _id: log._id,
          action: log.action,
          createdAt: log.createdAt,
          createdBy: log.createdBy,
          contentType: log.contentType,
          contentId: log.contentId,
          content: log.content
        });
      }

      allTotalCount += totalCount;
    }

    if (action.includes('delete')) {
      const { logs, totalCount } = await fetchLogs(models, {
        action: 'delete',
        type: contentType,
        perPage: perPageForAction,
        page
      });

      for (const log of logs) {
        allActivityLogs.push({
          _id: log._id,
          action: log.action,
          contentType: log.type,
          contentId: log.objectId,
          createdAt: log.createdAt,
          createdBy: log.createdBy,
          content: log.description
        });
      }

      allTotalCount += totalCount;
    }

    return {
      activityLogs: allActivityLogs,
      totalCount: allTotalCount
    };
  }
};

moduleRequireLogin(activityLogQueries);

export default activityLogQueries;
