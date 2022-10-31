import { IModels } from '../connectionResolver';
import { sendCoreMessage } from '../messageBroker';
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
  const { type, action, user } = params;

  if (action === 'update') {
    const task = params.updatedDocument;
    const oldTask = params.object;
    const destinationStageId = task.stageId || '';

    if (!(destinationStageId && destinationStageId !== oldTask.stageId)) {
      return;
    }

    const conformities = await sendCoreMessage({
      subdomain,
      action: 'conformities.getConformities',
      data: {
        mainType: 'task',
        mainTypeIds: [task._id],
        relTypes: ['company', 'customer']
      },
      isRPC: true,
      defaultValue: []
    });

    const user = await models.ClientPortalUsers.findOne({ _id: task.userId });

    if (!user) {
      return;
    }

    await sendNotification(models, subdomain, {
      receivers: [user._id],
      title: 'Task moved',
      content: '',
      notifType: '',
      link: '',
      clientPortalId: user.clientPortalId
    });

    return;
  }
};
