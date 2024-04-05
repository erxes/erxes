import {
  IItemCommonFields as ITask,
  IItemDragCommonFields
} from '../../../models/definitions/boards';
import { checkPermission } from '@erxes/api-utils/src/permissions';
import {
  itemsAdd,
  itemsArchive,
  itemsChange,
  itemsCopy,
  itemsEdit,
  itemsRemove
} from './utils';
import { IContext } from '../../../connectionResolver';
import { sendCoreMessage } from '../../../messageBroker';

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
    { user, models, subdomain }: IContext
  ) {
    return itemsAdd(
      models,
      subdomain,
      doc,
      'task',
      models.Tasks.createTask,
      user
    );
  },

  /**
   * Edit task
   */
  async tasksEdit(
    _root,
    { _id, proccessId, ...doc }: ITasksEdit & { proccessId: string },
    { user, models, subdomain }: IContext
  ) {
    const oldTask = await models.Tasks.getTask(_id);

    const updatedTask = await itemsEdit(
      models,
      subdomain,
      _id,
      'task',
      oldTask,
      doc,
      proccessId,
      user,
      models.Tasks.updateTask
    );

    if (updatedTask.assignedUserIds) {
      sendCoreMessage({
        subdomain,
        action: 'registerOnboardHistory',
        data: {
          type: `taskAssignUser`,
          user
        }
      });
    }

    return updatedTask;
  },

  /**
   * Change task
   */
  async tasksChange(
    _root,
    doc: IItemDragCommonFields,
    { user, models, subdomain }: IContext
  ) {
    return itemsChange(
      models,
      subdomain,
      doc,
      'task',
      user,
      models.Tasks.updateTask
    );
  },

  /**
   * Remove task
   */
  async tasksRemove(
    _root,
    { _id }: { _id: string },
    { user, models, subdomain }: IContext
  ) {
    return itemsRemove(models, subdomain, _id, 'task', user);
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
    { user, models, subdomain }: IContext
  ) {
    return itemsCopy(
      models,
      subdomain,
      _id,
      proccessId,
      'task',
      user,
      [],
      models.Tasks.createTask
    );
  },

  async tasksArchive(
    _root,
    { stageId, proccessId }: { stageId: string; proccessId: string },
    { user, models, subdomain }: IContext
  ) {
    return itemsArchive(models, subdomain, stageId, 'task', proccessId, user);
  }
};

checkPermission(taskMutations, 'tasksAdd', 'tasksAdd');
checkPermission(taskMutations, 'tasksEdit', 'tasksEdit');
checkPermission(taskMutations, 'tasksRemove', 'tasksRemove');
checkPermission(taskMutations, 'tasksWatch', 'tasksWatch');
checkPermission(taskMutations, 'tasksArchive', 'tasksArchive');

export default taskMutations;
