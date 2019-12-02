import { Checklists, Conformities, Tasks } from '../../../db/models';
import { IItemCommonFields as ITask, IOrderInput } from '../../../db/models/definitions/boards';
import { NOTIFICATION_TYPES } from '../../../db/models/definitions/constants';
import { checkPermission } from '../../permissions/wrappers';
import { IContext } from '../../types';
import { checkUserIds, putCreateLog } from '../../utils';
import { createConformity, IBoardNotificationParams, itemsChange, sendNotifications } from '../boardUtils';

interface ITasksEdit extends ITask {
  _id: string;
}

const taskMutations = {
  /**
   * Create new task
   */
  async tasksAdd(_root, doc: ITask, { user }: IContext) {
    doc.watchedUserIds = [user._id];

    const task = await Tasks.createTask({
      ...doc,
      modifiedBy: user._id,
      userId: user._id,
    });

    await createConformity({
      mainType: 'task',
      mainTypeId: task._id,
      companyIds: doc.companyIds,
      customerIds: doc.customerIds,
    });

    await sendNotifications({
      item: task,
      user,
      type: NOTIFICATION_TYPES.TASK_ADD,
      action: `invited you to the`,
      content: `'${task.name}'.`,
      contentType: 'task',
    });

    await putCreateLog(
      {
        type: 'task',
        newData: JSON.stringify(doc),
        object: task,
        description: `${task.name} has been created`,
      },
      user,
    );

    return task;
  },

  /**
   * Edit task
   */
  async tasksEdit(_root, { _id, ...doc }: ITasksEdit, { user }: IContext) {
    const oldTask = await Tasks.getTask(_id);

    const updatedTask = await Tasks.updateTask(_id, {
      ...doc,
      modifiedAt: new Date(),
      modifiedBy: user._id,
    });

    const notificationDoc: IBoardNotificationParams = {
      item: updatedTask,
      user,
      type: NOTIFICATION_TYPES.TASK_EDIT,
      contentType: 'task',
    };

    if (doc.assignedUserIds) {
      const { addedUserIds, removedUserIds } = checkUserIds(oldTask.assignedUserIds || [], doc.assignedUserIds);

      notificationDoc.invitedUsers = addedUserIds;
      notificationDoc.removedUsers = removedUserIds;
    }

    await sendNotifications(notificationDoc);

    return updatedTask;
  },

  /**
   * Change task
   */
  async tasksChange(
    _root,
    { _id, destinationStageId }: { _id: string; destinationStageId: string },
    { user }: IContext,
  ) {
    const task = await Tasks.getTask(_id);

    await Tasks.updateTask(_id, {
      modifiedAt: new Date(),
      modifiedBy: user._id,
      stageId: destinationStageId,
    });

    const { content, action } = await itemsChange(task, 'task', destinationStageId);

    await sendNotifications({
      item: task,
      user,
      type: NOTIFICATION_TYPES.TASK_CHANGE,
      action,
      content,
      contentType: 'task',
    });

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
  async tasksRemove(_root, { _id }: { _id: string }, { user }: IContext) {
    const task = await Tasks.getTask(_id);

    await sendNotifications({
      item: task,
      user,
      type: NOTIFICATION_TYPES.TASK_DELETE,
      action: `deleted task:`,
      content: `'${task.name}'`,
      contentType: 'task',
    });

    await Conformities.removeConformity({ mainType: 'task', mainTypeId: task._id });
    await Checklists.removeChecklists('task', task._id);

    return task.remove();
  },

  /**
   * Watch task
   */
  async tasksWatch(_root, { _id, isAdd }: { _id: string; isAdd: boolean }, { user }: IContext) {
    return Tasks.watchTask(_id, isAdd, user._id);
  },
};

checkPermission(taskMutations, 'tasksAdd', 'tasksAdd');
checkPermission(taskMutations, 'tasksEdit', 'tasksEdit');
checkPermission(taskMutations, 'tasksUpdateOrder', 'tasksUpdateOrder');
checkPermission(taskMutations, 'tasksRemove', 'tasksRemove');
checkPermission(taskMutations, 'tasksWatch', 'tasksWatch');

export default taskMutations;
