import { IContext } from '../../../connectionResolver';
import { sendContactsMessage, sendCoreMessage, sendNotificationsMessage } from '../../../messageBroker';
import { ITaskDocument } from '../../../models/definitions/tasks';
import { boardId } from '../../utils';

export default {
  async companies(task: ITaskDocument) {
    const companyIds = await sendCoreMessage('savedConformity', {
      mainType: 'task',
      mainTypeId: task._id,
      relTypes: ['company']
    }, true, []);

    const activeCompanies = await sendContactsMessage('findActiveCompanies', { _id: { $in: companyIds } }, true, []);

    return (activeCompanies || []).map(({_id }) => ({ __typename: "Company", _id }));
  },

  createdUser(task: ITaskDocument) {
    return { __typename: "User", _id: task.userId };
  },

  async customers(task: ITaskDocument) {
    const customerIds = await sendCoreMessage('savedConformity', {
      mainType: 'task',
      mainTypeId: task._id,
      relTypes: ['customer']
    }, true, []);

    const customers =  await sendCoreMessage('findActiveCustomers', {
      _id: { $in: customerIds }
    }, true, []);

    return (customers || []).map(({ _id }) => ({ __typename: "Customer", _id }))
  },

  assignedUsers(task: ITaskDocument) {
    return (task.assignedUserIds || []).map(_id => ({ __typename: "User", _id }));
  },

  async pipeline(task: ITaskDocument, _args, { models: { Stages, Pipelines } }: IContext) {
    const stage = await Stages.getStage(task.stageId);

    return Pipelines.findOne({ _id: stage.pipelineId });
  },

  boardId(task: ITaskDocument, _args, { models }: IContext) {
    return boardId(models, task);
  },

  stage(task: ITaskDocument, _args, { models: { Stages } }: IContext) {
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
    return sendNotificationsMessage('checkIfRead', {
      userId: user._id,
      itemId: task._id
    }, true, true);
  },

  labels(task: ITaskDocument, _args, { models: { PipelineLabels } }: IContext) {
    return PipelineLabels.find({ _id: { $in: task.labelIds || [] } });
  }
};
