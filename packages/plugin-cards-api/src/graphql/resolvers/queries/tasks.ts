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
  }
};

moduleRequireLogin(taskQueries);

checkPermission(taskQueries, 'tasks', 'showTasks', []);

export default taskQueries;
