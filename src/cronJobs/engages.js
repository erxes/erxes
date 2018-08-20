import * as schedule from 'node-schedule';
import { EngageMessages } from '../db/models';
import { send } from '../data/resolvers/mutations/engageUtils';

/**
* Send engage auto messages
*/
export const sendAutoMessage = async () => {
  const messages = await EngageMessages.find({ kind: 'auto', isLive: true });

  for (let message of messages) {
    send(message);
  }
};

// every day at 23 45
schedule.scheduleJob('* 45 23 * *', function() {
  sendAutoMessage();
});

export default {
  sendAutoMessage,
};
