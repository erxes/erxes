import { moduleRequireLogin } from '@erxes/api-utils/src/permissions';
import { IContext } from '@erxes/api-utils/src/types';

import { IActivityLogDocument } from '../../models/ActivityLogs';
import { collectPluginContent } from '../../pluginUtils';
import { fetchActivityLogs, fetchLogs, findActivityLogs } from '../../utils';
import { getCardContentIds, getInternalNotes } from '../../messageBroker';

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
    } else {
      collectItems(await findActivityLogs({ contentId, contentType }));
    }

    activities.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

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

    const contentIds = await getCardContentIds({ pipelineId, contentType });

    actionArr = actionArr.filter(a => a !== 'delete' && a !== 'addNote');

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

    if (action.includes('addNote')) {
      const { internalNotes, totalCount } =
        await getInternalNotes({ contentTypeIds: contentIds, page, perPageForAction });

      for (const note of internalNotes) {
        allActivityLogs.push({
          _id: note._id,
          action: 'addNote',
          contentType: note.contentType,
          contentId: note.contentTypeId,
          createdAt: note.createdAt,
          createdBy: note.createdUserId,
          content: note.content
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
