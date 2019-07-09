import { Tasks } from '../../../db/models';
import { IOrderInput } from '../../../db/models/definitions/boards';
import { NOTIFICATION_TYPES } from '../../../db/models/definitions/constants';
import { ITask } from '../../../db/models/definitions/tasks';
import { IUserDocument } from '../../../db/models/definitions/users';
import { checkPermission } from '../../permissions/wrappers';
import { itemsChange, manageNotifications, notifiedUserIds, sendNotifications } from '../boardUtils';

interface ITasksEdit extends ITask {
  _id: string;
}

const taskMutations = {
  /**
   * Create new task
   */
  async tasksAdd(_root, doc: ITask, { user }: { user: IUserDocument }) {
    return Tasks.createTask({
      ...doc,
      modifiedBy: user._id,
    });
  },

  /**
   * Edit task
   */
  async tasksEdit(_root, { _id, ...doc }: ITasksEdit, { user }) {
    const task = await Tasks.updateTask(_id, {
      ...doc,
      modifiedAt: new Date(),
      modifiedBy: user._id,
    });

    await manageNotifications(Tasks, task, user, 'task');

    return task;
  },

  /**
   * Change task
   */
  async tasksChange(
    _root,
    { _id, destinationStageId }: { _id: string; destinationStageId: string },
    { user }: { user: IUserDocument },
  ) {
    const task = await Tasks.updateTask(_id, {
      modifiedAt: new Date(),
      modifiedBy: user._id,
      stageId: destinationStageId,
    });

    const content = await itemsChange(Tasks, task, 'task', destinationStageId);

    await sendNotifications(
      task.stageId || '',
      user,
      NOTIFICATION_TYPES.TASK_CHANGE,
      await notifiedUserIds(task),
      content,
      'task',
    );

    return task;
  },

  /**
   * Update task orders (not sendNotifaction, ordered card to change)
   */
  tasksUpdateOrder(_root, { stageId, orders }: { stageId: string; orders: IOrderInput[] }) {
    return Tasks.updateOrder(stageId, orders);
  },

  /**
   * Remove task
   */
  async tasksRemove(_root, { _id }: { _id: string }, { user }: { user: IUserDocument }) {
    const task = await Tasks.findOne({ _id });

    if (!task) {
      throw new Error('Task not found');
    }

    await sendNotifications(
      task.stageId || '',
      user,
      NOTIFICATION_TYPES.TASK_DELETE,
      await notifiedUserIds(task),
      `'{userName}' deleted task: '${task.name}'`,
      'task',
    );

    return Tasks.removeTask(_id);
  },

  /**
   * Watch task
   */
  async tasksWatch(_root, { _id, isAdd }: { _id: string; isAdd: boolean }, { user }: { user: IUserDocument }) {
    const task = await Tasks.findOne({ _id });

    if (!task) {
      throw new Error('Task not found');
    }

    return Tasks.watchTask(_id, isAdd, user._id);
  },
};

checkPermission(taskMutations, 'tasksAdd', 'tasksAdd');
checkPermission(taskMutations, 'tasksEdit', 'tasksEdit');
checkPermission(taskMutations, 'tasksUpdateOrder', 'tasksUpdateOrder');
checkPermission(taskMutations, 'tasksRemove', 'tasksRemove');
checkPermission(taskMutations, 'tasksWatch', 'tasksWatch');

export default taskMutations;
