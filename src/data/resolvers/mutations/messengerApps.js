import moment from 'moment';

import { MessengerApps, Conversations, ConversationMessages, Customers } from '../../../db/models';

import { requireLogin } from '../../permissions';
import { createMeetEvent } from '../../../trackers/googleTracker';
import { publishMessage } from './conversations';

const messengerAppMutations = {
  async messengerAppsAdd(root, doc) {
    const prev = await MessengerApps.findOne({ kind: doc.kind });

    if (prev && prev._id) {
      await MessengerApps.update({ _id: prev._id }, { $set: doc });

      return MessengerApps.findOne({ _id: prev._id });
    }

    return MessengerApps.createApp(doc);
  },

  async messengerAppsExecute(root, { _id, conversationId }) {
    const conversation = await Conversations.findOne({ _id: conversationId });
    const customer = await Customers.findOne({ _id: conversation.customerId });
    const app = await MessengerApps.findOne({ _id });

    // get customer email
    let email = customer.primaryEmail;

    if (!email && customer.visitorContactInfo) {
      email = customer.visitorContactInfo.email;
    }

    const eventData = await createMeetEvent(app.credentials, {
      summary: `Meet with ${customer.firstName} ${customer.lastName}`,
      attendees: [{ email }],
      start: {
        dateTime: new Date(),
      },
      end: {
        dateTime: moment().add(1, 'hour'),
      },
    });

    const message = await ConversationMessages.createMessage({
      conversationId,
      messengerAppData: {
        kind: 'googleMeet',
        hangoutLink: eventData.hangoutLink,
      },
    });

    publishMessage(message, conversation.customerId);

    return app;
  },
};

requireLogin(messengerAppMutations, 'messengerAppsAdd');
requireLogin(messengerAppMutations, 'messengerAppsExecute');

export default messengerAppMutations;
