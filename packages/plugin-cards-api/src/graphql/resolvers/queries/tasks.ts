import {
  checkPermission,
  moduleRequireLogin
} from '@erxes/api-utils/src/permissions';
import { IListParams } from './boards';
import {
  archivedItems,
  archivedItemsCount,
  checkItemPermByUser,
  generateTaskCommonFilters,
  getItemList,
  IArchiveArgs
} from './utils';
import { IContext } from '../../../connectionResolver';
import { sendCoreMessage, sendInboxMessage } from '../../../messageBroker';

interface ITasksAsLogsParams {
  contentId: string;
  contentType: string;
  limit?: number;
}

const taskQueries = {
  /**
   * Tasks list
   */
  async tasks(
    _root,
    args: IListParams,
    { user, commonQuerySelector, models }: IContext
  ) {
    const filter = {
      ...commonQuerySelector,
      ...(await generateTaskCommonFilters(models, user._id, args))
    };

    return await getItemList(models, filter, args, user, 'task');
  },

  async tasksTotalCount(
    _root,
    args: IListParams,
    { user, commonQuerySelector, models }: IContext
  ) {
    const filter = {
      ...commonQuerySelector,
      ...(await generateTaskCommonFilters(models, user._id, args))
    };

    return models.Tasks.find(filter).countDocuments();
  },

  /**
   * Archived list
   */
  archivedTasks(_root, args: IArchiveArgs, { models }: IContext) {
    return archivedItems(models, args, models.Tasks);
  },

  archivedTasksCount(_root, args: IArchiveArgs, { models }: IContext) {
    return archivedItemsCount(models, args, models.Tasks);
  },

  /**
   * Tasks detail
   */
  async taskDetail(_root, { _id }: { _id: string }, { user, models }: IContext) {
    const task = await models.Tasks.getTask(_id);

    return checkItemPermByUser(models, user._id, task);
  },

  async tasksAsLogs(_root, { contentId, contentType }: ITasksAsLogsParams, { models: { Tasks } }: IContext) {
    let tasks: any[] = [];

    const relatedTaskIds = await sendCoreMessage('savedConformity', {
      mainType: contentType,
      mainTypeId: contentId,
      relTypes: ['task']
    }, true, []);

    if (contentType !== 'cards:task') {
      tasks = await Tasks.find({
        $and: [
          { _id: { $in: relatedTaskIds } },
          { status: { $ne: 'archived' } }
        ]
      }).sort({ closeDate: 1 }).lean()
    }

    const contentIds = tasks
      .filter(activity => activity.action === 'convert')
      .map(activity => activity.content);

    if (Array.isArray(contentIds)) {
      const conversations = await sendInboxMessage(
        'getConversations',
        { _id: { $in: contentIds } }
      ) || [];

      for (const conv of conversations) {
        tasks.push({
          _id: conv._id,
          contentType: 'inbox:conversation',
          contentId,
          createdAt: conv.createdAt
        });
      }
    }

    return tasks
  }
};

moduleRequireLogin(taskQueries);

checkPermission(taskQueries, 'tasks', 'showTasks', []);

export default taskQueries;