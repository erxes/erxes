import * as moment from 'moment';
import { generateModels } from '../connectionResolver';
import { sendCoreMessage, sendNotificationsMessage } from '../messageBroker';

/**
 * Send notification Deals, Tasks and Tickets dueDate
 */
export const sendNotifications = async (subdomain: string) => {
  const models = await generateModels(subdomain);

  const now = new Date();
  const collections = {
    deal: models.Deals,
    task: models.Tasks,
    ticket: models.Tickets,
    purchase: models.Purchases,
    all: ['deal', 'task', 'ticket', 'purchase']
  };

  for (const type of collections.all) {
    const objects = await collections[type].find({
      closeDate: {
        $gte: now,
        $lte: moment()
          .add(2, 'days')
          .toDate()
      }
    });

    for (const object of objects) {
      const stage = await models.Stages.getStage(object.stageId || '');
      const pipeline = await models.Pipelines.getPipeline(
        stage.pipelineId || ''
      );

      const user = await sendCoreMessage({
        subdomain,
        action: 'users.findOne',
        data: {
          _id: object.modifiedBy
        },
        isRPC: true
      });

      if (!user) {
        return;
      }

      const diffMinute = Math.floor(
        (object.closeDate.getTime() - now.getTime()) / 60000
      );

      if (Math.abs(diffMinute - (object.reminderMinute || 0)) < 5) {
        const content = `${object.name} ${type} is due in upcoming`;

        await sendNotificationsMessage({
          subdomain,
          action: 'send',
          data: {
            notifType: `${type}DueDate`,
            title: content,
            content,
            action: `Reminder:`,
            link: `${type}/board?id=${pipeline.boardId}&pipelineId=${pipeline._id}&itemId=${object._id}`,
            createdUser: user,
            // exclude current user
            contentType: type,
            contentTypeId: object._id,
            receivers: object.assignedUserIds || []
          }
        });
      }
    }
  }
};

export default {
  handle10MinutelyJob: async ({ subdomain }) => {
    await sendNotifications(subdomain);
  }
};
