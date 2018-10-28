import * as moment from 'moment';
import { ConversationMessages, Conversations, Customers, MessengerApps } from '../../../db/models';
import { IGoogleCredentials } from '../../../db/models/definitions/messengerApps';
import { createMeetEvent } from '../../../trackers/googleTracker';
import { requireLogin } from '../../permissions';
import { publishMessage } from './conversations';

const messengerAppMutations = {
  /*
   * Google meet
   */
  async messengerAppsAddGoogleMeet(_root, { name, credentials }: { name: string; credentials: IGoogleCredentials }) {
    return MessengerApps.createApp({
      name,
      kind: 'googleMeet',
      showInInbox: true,
      credentials,
    });
  },

  /*
   * Knowledgebase
   */
  async messengerAppsAddKnowledgebase(
    _root,
    { name, integrationId, topicId }: { name: string; integrationId: string; topicId: string },
  ) {
    return MessengerApps.createApp({
      name,
      kind: 'knowledgebase',
      showInInbox: false,
      credentials: {
        integrationId,
        topicId,
      },
    });
  },

  /*
   * Lead
   */
  async messengerAppsAddLead(
    _root,
    { name, integrationId, formId }: { name: string; integrationId: string; formId: string },
  ) {
    return MessengerApps.createApp({
      name,
      kind: 'lead',
      showInInbox: false,
      credentials: {
        integrationId,
        formId,
      },
    });
  },

  /*
   * Execute google meet
   */
  async messengerAppsExecuteGoogleMeet(_root, { _id, conversationId }: { _id: string; conversationId: string }) {
    const conversation = await Conversations.findOne({ _id: conversationId });

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    const customer = await Customers.findOne({ _id: conversation.customerId });

    if (!customer) {
      throw new Error('Customer not found');
    }

    const app = await MessengerApps.findOne({ _id, kind: 'googleMeet' });

    if (!app) {
      throw new Error('App not found');
    }

    // get customer email
    let email = customer.primaryEmail;

    if (!email && customer.visitorContactInfo) {
      email = customer.visitorContactInfo.email;
    }

    const eventData: any = await createMeetEvent(app.credentials, {
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
        customer,
      },
    });

    publishMessage(message, conversation.customerId);

    return app;
  },
};

requireLogin(messengerAppMutations, 'messengerAppsAddGoogleMeet');
requireLogin(messengerAppMutations, 'messengerAppsAddKnowledgebase');
requireLogin(messengerAppMutations, 'messengerAppsAddLead');
requireLogin(messengerAppMutations, 'messengerAppsExecuteGoogleMeet');

export default messengerAppMutations;
