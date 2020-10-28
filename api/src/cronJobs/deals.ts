import * as moment from 'moment';
import * as schedule from 'node-schedule';
import utils from '../data/utils';
import { Deals, Pipelines, Stages, Tasks, Tickets, Users } from '../db/models';

/**
 * Send notification Deals, Tasks and Tickets dueDate
 */
export const sendNotifications = async () => {
  const now = new Date();
  const collections = {
    deal: Deals,
    task: Tasks,
    ticket: Tickets,
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
      const stage = await Stages.getStage(object.stageId || '');
      const pipeline = await Pipelines.getPipeline(stage.pipelineId || '');

      const user = await Users.findOne({ _id: object.modifiedBy });

      if (!user) {
        return;
      }

      const diffMinute = Math.floor(
        (object.closeDate.getTime() - now.getTime()) / 60000
      );

      if (Math.abs(diffMinute - (object.reminderMinute || 0)) < 5) {
        const content = `${object.name} ${type} is due in upcoming`;

        const url =
          type === 'ticket' ? `/inbox/${type}/board` : `${type}/board`;

        utils.sendNotification({
          notifType: `${type}DueDate`,
          title: content,
          content,
          action: `Reminder:`,
          link: `${url}?id=${pipeline.boardId}&pipelineId=${pipeline._id}&itemId=${object._id}`,
          createdUser: user,
          // exclude current user
          contentType: type,
          contentTypeId: object._id,
          receivers: object.assignedUserIds || []
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

// every 5 minutes
schedule.scheduleJob('*/5 * * * *', () => {
  sendNotifications();
});
