import {
  IItemCommonFields as ITask,
  IItemDragCommonFields
} from '../../../models/definitions/boards';
import { checkPermission } from '@erxes/api-utils/src/permissions';
// import { registerOnboardHistory } from '../../utils';
import {
  itemsAdd,
  itemsArchive,
  itemsChange,
  itemsCopy,
  itemsEdit,
  itemsRemove
} from './utils';
import { IContext } from '../../../connectionResolver';

interface ITasksEdit extends ITask {
  _id: string;
}

const taskMutations = {
  /**
   * Creates a new task
   */
  async tasksAdd(
    _root,
    doc: ITask & { proccessId: string; aboveItemId: string },
    { user, docModifier, models }: IContext
  ) {
    return itemsAdd(models, doc, 'task', models.Tasks.createTask, user, docModifier);
  },

  /**
   * Edit task
   */
  async tasksEdit(
    _root,
    { _id, proccessId, ...doc }: ITasksEdit & { proccessId: string },
    { user, models }: IContext
  ) {
    const oldTask = await models.Tasks.getTask(_id);

    const updatedTask = await itemsEdit(
      models,
      _id,
      'task',
      oldTask,
      doc,
      proccessId,
      user,
      models.Tasks.updateTask
    );

    if (updatedTask.assignedUserIds) {
      // await registerOnboardHistory({ type: 'taskAssignUser', user });
    }

    return updatedTask;
  },

  /**
   * Change task
   */
  async tasksChange(_root, doc: IItemDragCommonFields, { user, models }: IContext) {
    return itemsChange(models, doc, 'task', user, models.Tasks.updateTask);
  },

  /**
   * Remove task
   */
  async tasksRemove(_root, { _id }: { _id: string }, { user, models }: IContext) {
    return itemsRemove(models, _id, 'task', user);
  },

  /**
   * Watch task
   */
  async tasksWatch(
    _root,
    { _id, isAdd }: { _id: string; isAdd: boolean },
    { user, models }: IContext
  ) {
    return models.Tasks.watchTask(_id, isAdd, user._id);
  },

  async tasksCopy(
    _root,
    { _id, proccessId }: { _id: string; proccessId: string },
    { user, models }: IContext
  ) {
    return itemsCopy(models, _id, proccessId, 'task', user, [], models.Tasks.createTask);
  },

  async tasksArchive(
    _root,
    { stageId, proccessId }: { stageId: string; proccessId: string },
    { user, models }: IContext
  ) {
    return itemsArchive(models, stageId, 'task', proccessId, user);
  }
};

checkPermission(taskMutations, 'tasksAdd', 'tasksAdd');
checkPermission(taskMutations, 'tasksEdit', 'tasksEdit');
checkPermission(taskMutations, 'tasksRemove', 'tasksRemove');
checkPermission(taskMutations, 'tasksWatch', 'tasksWatch');
checkPermission(taskMutations, 'tasksArchive', 'tasksArchive');

export default taskMutations;
