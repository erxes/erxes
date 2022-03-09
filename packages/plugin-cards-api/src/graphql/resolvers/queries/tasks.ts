import { Tasks } from '../../../models';
import {
  checkPermission,
  moduleRequireLogin
} from '@erxes/api-utils/src/permissions';
import { IContext } from '@erxes/api-utils/src';
import { IListParams } from './boards';
import {
  archivedItems,
  archivedItemsCount,
  checkItemPermByUser,
  generateTaskCommonFilters,
  getItemList,
  IArchiveArgs
} from './utils';
import { sendConformityMessage, sendInboxRPCMessage } from '../../../messageBroker';

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
    { user, commonQuerySelector }: IContext
  ) {
    const filter = {
      ...commonQuerySelector,
      ...(await generateTaskCommonFilters(user._id, args))
    };

    return await getItemList(filter, args, user, 'task');
  },

  async tasksTotalCount(
    _root,
    args: IListParams,
    { user, commonQuerySelector }: IContext
  ) {
    const filter = {
      ...commonQuerySelector,
      ...(await generateTaskCommonFilters(user._id, args))
    };

    return Tasks.find(filter).countDocuments();
  },

  /**
   * Archived list
   */
  archivedTasks(_root, args: IArchiveArgs) {
    return archivedItems(args, Tasks);
  },

  archivedTasksCount(_root, args: IArchiveArgs) {
    return archivedItemsCount(args, Tasks);
  },

  /**
   * Tasks detail
   */
  async taskDetail(_root, { _id }: { _id: string }, { user }: IContext) {
    const task = await Tasks.getTask(_id);

    return checkItemPermByUser(user._id, task);
  },
  async tasksAsLogs(_root, { contentId, contentType }: ITasksAsLogsParams) {
    let tasks: any[] = [];

    const relatedTaskIds = await sendConformityMessage('savedConformity', {
      mainType: contentType,
      mainTypeId: contentId,
      relTypes: ['task']
    });

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
      const conversations = await sendInboxRPCMessage(
        'logs:getConversations',
        { query: { _id: { $in: contentIds } } }
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
