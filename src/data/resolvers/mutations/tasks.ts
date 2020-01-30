import * as _ from 'underscore';
import { ActivityLogs, Checklists, Conformities, Tasks } from '../../../db/models';
import { getCompanies, getCustomers } from '../../../db/models/boardUtils';
import { IItemCommonFields as ITask, IOrderInput } from '../../../db/models/definitions/boards';
import { NOTIFICATION_TYPES } from '../../../db/models/definitions/constants';
import { MODULE_NAMES } from '../../constants';
import { putCreateLog, putDeleteLog, putUpdateLog } from '../../logUtils';
import { checkPermission } from '../../permissions/wrappers';
import { IContext } from '../../types';
import { checkUserIds } from '../../utils';
import {
  copyChecklists,
  copyPipelineLabels,
  createConformity,
  IBoardNotificationParams,
  itemsChange,
  prepareBoardItemDoc,
  sendNotifications,
} from '../boardUtils';

interface ITasksEdit extends ITask {
  _id: string;
}

const taskMutations = {
  /**
   * Creates a new task
   */
  async tasksAdd(_root, doc: ITask, { user, docModifier }: IContext) {
    doc.watchedUserIds = [user._id];

    const extendedDoc = {
      ...docModifier(doc),
      modifiedBy: user._id,
      userId: user._id,
    };

    const task = await Tasks.createTask(extendedDoc);

    await createConformity({
      mainType: MODULE_NAMES.TASK,
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
      contentType: MODULE_NAMES.TASK,
    });

    await putCreateLog(
      {
        type: MODULE_NAMES.TASK,
        newData: extendedDoc,
        object: task,
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

    const extendedDoc = {
      ...doc,
      modifiedAt: new Date(),
      modifiedBy: user._id,
    };

    const updatedTask = await Tasks.updateTask(_id, extendedDoc);

    // labels should be copied to newly moved pipeline
    await copyPipelineLabels({ item: oldTask, doc, user });

    const notificationDoc: IBoardNotificationParams = {
      item: updatedTask,
      user,
      type: NOTIFICATION_TYPES.TASK_EDIT,
      contentType: MODULE_NAMES.TASK,
    };

    if (doc.assignedUserIds) {
      const { addedUserIds, removedUserIds } = checkUserIds(oldTask.assignedUserIds, doc.assignedUserIds);

      notificationDoc.invitedUsers = addedUserIds;
      notificationDoc.removedUsers = removedUserIds;
    }

    await sendNotifications(notificationDoc);

    await putUpdateLog(
      {
        type: MODULE_NAMES.TASK,
        object: oldTask,
        newData: extendedDoc,
        updatedDocument: updatedTask,
      },
      user,
    );

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

    const { content, action } = await itemsChange(user._id, task, MODULE_NAMES.TASK, destinationStageId);

    await sendNotifications({
      item: task,
      user,
      type: NOTIFICATION_TYPES.TASK_CHANGE,
      action,
      content,
      contentType: MODULE_NAMES.TASK,
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
      contentType: MODULE_NAMES.TASK,
    });

    await Conformities.removeConformity({ mainType: MODULE_NAMES.TASK, mainTypeId: task._id });
    await Checklists.removeChecklists(MODULE_NAMES.TASK, task._id);
    await ActivityLogs.removeActivityLog(task._id);

    const removed = await task.remove();

    await putDeleteLog({ type: MODULE_NAMES.TASK, object: task }, user);

    return removed;
  },

  /**
   * Watch task
   */
  async tasksWatch(_root, { _id, isAdd }: { _id: string; isAdd: boolean }, { user }: IContext) {
    return Tasks.watchTask(_id, isAdd, user._id);
  },

  async tasksCopy(_root, { _id }: { _id: string }, { user }: IContext) {
    const task = await Tasks.getTask(_id);

    const doc = await prepareBoardItemDoc(_id, 'task', user._id);

    const clone = await Tasks.createTask(doc);

    const companies = await getCompanies('task', _id);
    const customers = await getCustomers('task', _id);

    await createConformity({
      mainType: 'task',
      mainTypeId: clone._id,
      customerIds: customers.map(c => c._id),
      companyIds: companies.map(c => c._id),
    });
    await copyChecklists({
      contentType: 'task',
      contentTypeId: task._id,
      targetContentId: clone._id,
      user,
    });

    return clone;
  },
};

checkPermission(taskMutations, 'tasksAdd', 'tasksAdd');
checkPermission(taskMutations, 'tasksEdit', 'tasksEdit');
checkPermission(taskMutations, 'tasksUpdateOrder', 'tasksUpdateOrder');
checkPermission(taskMutations, 'tasksRemove', 'tasksRemove');
checkPermission(taskMutations, 'tasksWatch', 'tasksWatch');

export default taskMutations;
