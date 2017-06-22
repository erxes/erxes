import { SyncedCron } from 'meteor/percolate:synced-cron';
import { Messages } from '/imports/api/engage/engage';
import { send } from '/imports/api/engage/utils';

const sendAutoMessage = () =>
  Messages.find({ kind: 'auto', isLive: true }).forEach(message => send(message));

SyncedCron.add({
  name: 'Send auto messages',

  schedule(parser) {
    return parser.text('every day at 11pm');
  },

  job() {
    sendAutoMessage();
  },
});
