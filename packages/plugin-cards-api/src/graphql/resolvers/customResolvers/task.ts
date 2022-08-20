import { IContext } from '../../../connectionResolver';
import {
  sendContactsMessage,
  sendCoreMessage,
  sendNotificationsMessage
} from '../../../messageBroker';
import { ITaskDocument } from '../../../models/definitions/tasks';
import { boardId } from '../../utils';

export default {
  __resolveReference({ _id }, { models }: IContext) {
    return models.Tasks.findOne({ _id });
  },

  async companies(task: ITaskDocument, _args, { subdomain }: IContext) {
    const companyIds = await sendCoreMessage({
      subdomain,
      action: 'conformities.savedConformity',
      data: {
        mainType: 'task',
        mainTypeId: task._id,
        relTypes: ['company']
      },
      isRPC: true,
      defaultValue: []
    });

    const activeCompanies = await sendContactsMessage({
      subdomain,
      action: 'companies.findActiveCompanies',
      data: { selector: { _id: { $in: companyIds } } },
      isRPC: true,
      defaultValue: []
    });

    return (activeCompanies || []).map(({ _id }) => ({
      __typename: 'Company',
      _id
    }));
  },

  createdUser(task: ITaskDocument) {
    if (!task.userId) {
      return;
    }

    return { __typename: 'User', _id: task.userId };
  },

  async customers(task: ITaskDocument, _args, { subdomain }: IContext) {
    const customerIds = await sendCoreMessage({
      subdomain,
      action: 'conformities.savedConformity',
      data: {
        mainType: 'task',
        mainTypeId: task._id,
        relTypes: ['customer']
      },
      isRPC: true,
      defaultValue: []
    });

    const customers = await sendContactsMessage({
      subdomain,
      action: 'customers.findActiveCustomers',
      data: {
        selector: {
          _id: { $in: customerIds }
        }
      },
      isRPC: true,
      defaultValue: []
    });

    return (customers || []).map(({ _id }) => ({
      __typename: 'Customer',
      _id
    }));
  },

  assignedUsers(task: ITaskDocument) {
    return (task.assignedUserIds || [])
      .filter(e => e)
      .map(_id => ({
        __typename: 'User',
        _id
      }));
  },

  async pipeline(
    task: ITaskDocument,
    _args,
    { models: { Stages, Pipelines } }: IContext
  ) {
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

  hasNotified(task: ITaskDocument, _args, { user, subdomain }: IContext) {
    return sendNotificationsMessage({
      subdomain,
      action: 'checkIfRead',
      data: {
        userId: user._id,
        itemId: task._id
      },
      isRPC: true,
      defaultValue: true
    });
  },

  labels(task: ITaskDocument, _args, { models: { PipelineLabels } }: IContext) {
    return PipelineLabels.find({ _id: { $in: task.labelIds || [] } });
  }
};
