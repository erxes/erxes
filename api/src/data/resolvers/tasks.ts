import {
  Companies,
  Conformities,
  Customers,
  Notifications,
  PipelineLabels,
  Pipelines,
  Stages,
  Users
} from '../../db/models';
import { ITaskDocument } from '../../db/models/definitions/tasks';
import { IContext } from '../types';
import { boardId } from './boardUtils';

export default {
  async companies(task: ITaskDocument) {
    const companyIds = await Conformities.savedConformity({
      mainType: 'task',
      mainTypeId: task._id,
      relTypes: ['company']
    });

    return Companies.find({ _id: { $in: companyIds || [] } });
  },

  async createdUser(task: ITaskDocument) {
    return Users.findOne({ _id: task.userId });
  },

  async customers(task: ITaskDocument) {
    const customerIds = await Conformities.savedConformity({
      mainType: 'task',
      mainTypeId: task._id,
      relTypes: ['customer']
    });

    return Customers.find({ _id: { $in: customerIds || [] } });
  },

  assignedUsers(task: ITaskDocument) {
    return Users.find({ _id: { $in: task.assignedUserIds || [] } });
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

  hasNotified(deal: ITaskDocument, _args, { user }: IContext) {
    return Notifications.checkIfRead(user._id, deal._id);
  },

  labels(task: ITaskDocument) {
    return PipelineLabels.find({ _id: { $in: task.labelIds || [] } });
  }
};
