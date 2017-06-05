import { SyncedCron } from 'meteor/percolate:synced-cron';
import { Messages } from '/imports/api/engage/engage';
import { send } from '/imports/api/engage/utils';

const sendAutoMessage = () => Messages.find({ isAuto: true }).forEach(message => send(message));

SyncedCron.add({
  name: 'Send auto messages',

  schedule(parser) {
    return parser.text('every 1 minutes');
  },

  job() {
    sendAutoMessage();
  },
});
