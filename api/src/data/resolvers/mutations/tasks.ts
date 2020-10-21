import { Tasks } from '../../../db/models';
import { IItemCommonFields as ITask, IItemDragCommonFields } from '../../../db/models/definitions/boards';
import { checkPermission } from '../../permissions/wrappers';
import { IContext } from '../../types';
import { registerOnboardHistory } from '../../utils';
import { itemsAdd, itemsArchive, itemsChange, itemsCopy, itemsEdit, itemsRemove } from './boardUtils';

interface ITasksEdit extends ITask {
  _id: string;
}

const taskMutations = {
  /**
   * Creates a new task
   */
  async tasksAdd(_root, doc: ITask & { proccessId: string; aboveItemId: string }, { user, docModifier }: IContext) {
    return itemsAdd(doc, 'deal', user, docModifier, Tasks.createTask);
  },

  /**
   * Edit task
   */
  async tasksEdit(_root, { _id, proccessId, ...doc }: ITasksEdit & { proccessId: string }, { user }: IContext) {
    const oldTask = await Tasks.getTask(_id);

    const updatedTask = await itemsEdit(_id, 'task', oldTask, doc, proccessId, user, Tasks.updateTask);

    if (updatedTask.assignedUserIds) {
      await registerOnboardHistory({ type: 'taskAssignUser', user });
    }

    return updatedTask;
  },

  /**
   * Change task
   */
  async tasksChange(_root, doc: IItemDragCommonFields, { user }: IContext) {
    return itemsChange(doc, 'task', user, Tasks.updateTask);
  },

  /**
   * Remove task
   */
  async tasksRemove(_root, { _id }: { _id: string }, { user }: IContext) {
    return itemsRemove(_id, 'task', user);
  },

  /**
   * Watch task
   */
  async tasksWatch(_root, { _id, isAdd }: { _id: string; isAdd: boolean }, { user }: IContext) {
    return Tasks.watchTask(_id, isAdd, user._id);
  },

  async tasksCopy(_root, { _id, proccessId }: { _id: string; proccessId: string }, { user }: IContext) {
    return itemsCopy(_id, proccessId, 'task', user, [], Tasks.createTask);
  },

  async tasksArchive(_root, { stageId, proccessId }: { stageId: string; proccessId: string }, { user }: IContext) {
    return itemsArchive(stageId, 'task', proccessId, user);
  },

  async taskUpdateTimeTracking(
    _root,
    { _id, status, timeSpent, startDate }: { _id: string; status: string; timeSpent: number; startDate: string },
  ) {
    return Tasks.updateTimeTracking(_id, status, timeSpent, startDate);
  },
};

checkPermission(taskMutations, 'tasksAdd', 'tasksAdd');
checkPermission(taskMutations, 'tasksEdit', 'tasksEdit');
checkPermission(taskMutations, 'tasksRemove', 'tasksRemove');
checkPermission(taskMutations, 'tasksWatch', 'tasksWatch');
checkPermission(taskMutations, 'tasksArchive', 'tasksArchive');
checkPermission(taskMutations, 'taskUpdateTimeTracking', 'taskUpdateTimeTracking');

export default taskMutations;
