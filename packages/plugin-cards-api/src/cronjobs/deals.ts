import * as moment from 'moment';
import { generateModels } from '../connectionResolver';
import { sendCoreMessage, sendNotificationsMessage } from '../messageBroker';

/**
 * Send notification Deals, Tasks and Tickets dueDate
 */
export const sendNotifications = async (subdomain: string) => {
  const models = await generateModels(subdomain)

  const now = new Date();
  const collections = {
    deal: models.Deals,
    task: models.Tasks,
    ticket: models.Tickets,
    all: ['deal', 'task', 'ticket']
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
      const pipeline = await models.Pipelines.getPipeline(stage.pipelineId || '');

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
  sendNotifications
};

/**
 * *    *    *    *    *    *
 * ┬    ┬    ┬    ┬    ┬    ┬
 * │    │    │    │    │    |
 * │    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
 * │    │    │    │    └───── month (1 - 12)
 * │    │    │    └────────── day of month (1 - 31)
 * │    │    └─────────────── hour (0 - 23)
 * │    └──────────────────── minute (0 - 59)
 * └───────────────────────── second (0 - 59, OPTIONAL)
 */

// // every 5 minutes
// schedule.scheduleJob('*/5 * * * *', () => {
//   sendNotifications();
// });
