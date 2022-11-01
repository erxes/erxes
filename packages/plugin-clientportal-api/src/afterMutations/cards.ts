import { IModels } from '../connectionResolver';
import { sendCardsMessage, sendCoreMessage } from '../messageBroker';
import { sendNotification } from '../utils';

export const ticketHandler = async (models: IModels, subdomain, params) => {
  const { type, action, user } = params;

  if (action === 'update') {
    const deal = params.updatedDocument;
    const oldDeal = params.object;
    const destinationStageId = deal.stageId || '';

    if (!(destinationStageId && destinationStageId !== oldDeal.stageId)) {
      return;
    }

    return;
  }
};

export const taskHandler = async (models: IModels, subdomain, params) => {
  const { type, action } = params;

  if (action === 'update') {
    const task = params.updatedDocument;
    const oldTask = params.object;
    const destinationStageId = task.stageId || '';

    if (!(destinationStageId && destinationStageId !== oldTask.stageId)) {
      return;
    }

    const userIds = await models.ClientPortalUserCards.getUserIds(
      'task',
      task._id
    );

    if (userIds.length === 0) {
      return;
    }

    const stage = await sendCardsMessage({
      subdomain,
      action: 'stages.findOne',
      data: { _id: destinationStageId },
      isRPC: true,
      defaultValue: null
    });

    const content = `Task ${task.name} has been moved to ${stage.name} stage`;

    const users = await models.ClientPortalUsers.find({
      _id: { $in: userIds }
    }).lean();

    for (const user of users) {
      const config = await models.ClientPortals.findOne({
        _id: user.clientPortalId
      });

      if (!config) {
        continue;
      }

      await sendNotification(models, subdomain, {
        receivers: [user._id],
        title: 'Your submitted task has been updated',
        content,
        notifType: 'system',
        link: `${config.url}/tasks?stageId=${destinationStageId}`
      });
    }

    return;
  }
};
