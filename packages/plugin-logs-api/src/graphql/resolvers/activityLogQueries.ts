import { moduleRequireLogin } from '@erxes/api-utils/src/permissions';
import { IContext } from '@erxes/api-utils/src/types';

import ActivityLogs, { IActivityLogDocument } from '../../models/ActivityLogs';
import { collectPluginContent } from '../../pluginUtils';
import { fetchActivityLogs, fetchLogs } from '../../utils';
import { collectServiceItems, getContentIds } from '../../messageBroker';

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
  async activityLogs(_root, doc: IListArgs, { user }: IContext) {
    const { activityType, contentId, contentType } = doc;
    let activities: IActivityLogDocument[] = [];

    const collectItems = (items: any, type?: string) => {
      (items || []).map(item => {
        let result: IActivityLogDocument = {} as any;

        if (!type) {
          result = item;
        }

        activities.push(result);
      });
    };

    if (activityType && activityType.startsWith('plugin')) {
      const pluginResponse = await collectPluginContent(
        doc,
        user,
        activities,
        collectItems
      );

      if (pluginResponse) {
        activities = activities.concat(pluginResponse);
      }
    }

    if (activityType === 'activity') {
      const relatedItems = await collectServiceItems(contentType, doc) || [];
      const relatedItemIds = relatedItems.map(r => r._id);

      activities = await ActivityLogs.find({ _id: { $in: [...relatedItemIds, contentId] } }).lean();

    } else {
      activities = await ActivityLogs.find({ contentId, contentType: activityType }).lean();
    }

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
    }: IListArgsByAction
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
      const { activityLogs, totalCount } = await fetchActivityLogs(
        {
          contentType,
          contentId: { $in: contentIds },
          action: { $in: actionArr },
          perPage: perPageForAction * 3,
          page
        }
      );

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
      const { logs, totalCount } = await fetchLogs(
        {
          action: 'delete',
          type: contentType,
          perPage: perPageForAction,
          page
        },
      );

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
