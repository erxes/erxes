import {
  sendConformityRPCMessage,
  sendContactRPCMessage,
  sendNotificationRPCMessage
} from 'messageBroker';
import { PipelineLabels, Pipelines, Stages } from '../../../models';
import { ITaskDocument } from '../../../models/definitions/tasks';
import { IContext } from '@erxes/api-utils/src';
import { boardId } from '../../utils';
import { getDocument, getDocumentList } from 'cacheUtils';

export default {
  async companies(task: ITaskDocument) {
    const companyIds = await sendConformityRPCMessage('savedConformity', {
      mainType: 'task',
      mainTypeId: task._id,
      relTypes: ['company']
    });

    return sendContactRPCMessage('findActiveCompanies', {
      selector: { _id: { $in: companyIds } }
    });
  },

  createdUser(task: ITaskDocument) {
    return getDocument('users', { _id: task.userId });
  },

  async customers(task: ITaskDocument) {
    const customerIds = await sendConformityRPCMessage('savedConformity', {
      mainType: 'task',
      mainTypeId: task._id,
      relTypes: ['customer']
    });

    return sendContactRPCMessage('findActiveCustomers', {
      selector: { _id: { $in: customerIds } }
    });
  },

  assignedUsers(task: ITaskDocument) {
    return getDocumentList('users', {
      _id: { $in: task.assignedUserIds || [] }
    });
  },

  async pipeline(task: ITaskDocument) {
    const stage = await Stages.getStage(task.stageId);

    return Pipelines.findOne({ _id: stage.pipelineId });
  },

  boardId(task: ITaskDocument) {
    return boardId(task);
  },

  stage(task: ITaskDocument) {
    return Stages.getStage(task.stageId);
  },

  isWatched(task: ITaskDocument, _args, { user }: IContext) {
    const watchedUserIds = task.watchedUserIds || [];

    if (watchedUserIds.includes(user._id)) {
      return true;
    }

    return false;
  },

  hasNotified(task: ITaskDocument, _args, { user }: IContext) {
    return sendNotificationRPCMessage('checkIfRead', {
      userId: user._id,
      itemId: task._id
    });
  },

  labels(task: ITaskDocument) {
    return PipelineLabels.find({ _id: { $in: task.labelIds || [] } });
  }
};
