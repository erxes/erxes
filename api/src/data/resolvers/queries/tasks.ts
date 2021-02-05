import { Tasks } from '../../../db/models';
import {
  checkPermission,
  moduleRequireLogin
} from '../../permissions/wrappers';
import { IContext } from '../../types';
import { IListParams } from './boards';
import {
  archivedItems,
  archivedItemsCount,
  checkItemPermByUser,
  generateTaskCommonFilters,
  getItemList,
  IArchiveArgs
} from './boardUtils';

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
