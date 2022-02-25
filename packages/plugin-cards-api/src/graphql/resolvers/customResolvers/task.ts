import {
  sendConformityMessage,
  sendContactRPCMessage,
  sendNotificationMessage,
} from '../../../messageBroker';
import { PipelineLabels, Pipelines, Stages } from '../../../models';
import { ITaskDocument } from '../../../models/definitions/tasks';
import { IContext } from '@erxes/api-utils/src';
import { boardId } from '../../utils';

export default {
  async companies(task: ITaskDocument) {
    const companyIds = await sendConformityMessage('savedConformity', {
      mainType: 'task',
      mainTypeId: task._id,
      relTypes: ['company']
    });

    const activeCompanies = await sendContactRPCMessage('findActiveCompanies', {
      selector: { _id: { $in: companyIds } }
    });

    return (activeCompanies || []).map(({_id }) => ({ __typename: "Company", _id }));
  },

  createdUser(task: ITaskDocument) {
    return { __typename: "User", _id: task.userId };
  },

  async customers(task: ITaskDocument) {
    const customerIds = await sendConformityMessage('savedConformity', {
      mainType: 'task',
      mainTypeId: task._id,
      relTypes: ['customer']
    });

    const customers =  await sendContactRPCMessage('findActiveCustomers', {
      selector: { _id: { $in: customerIds } }
    });

    return (customers || []).map(({ _id }) => ({ __typename: "Customer", _id }))
  },

  assignedUsers(task: ITaskDocument) {
    return (task.assignedUserIds || []).map(_id => ({ __typename: "User", _id }));
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
    return sendNotificationMessage('checkIfRead', {
      userId: user._id,
      itemId: task._id
    }, true, true);
  },

  labels(task: ITaskDocument) {
    return PipelineLabels.find({ _id: { $in: task.labelIds || [] } });
  }
};
