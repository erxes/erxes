import * as moment from 'moment';
import { Accounts, ConversationMessages, Conversations, Customers, Forms, MessengerApps } from '../../../db/models';
import { createMeetEvent } from '../../../trackers/googleTracker';
import { requireLogin } from '../../permissions';
import { publishMessage } from './conversations';

const messengerAppMutations = {
  /*
   * Google meet
   */
  async messengerAppsAddGoogleMeet(_root, { name, accountId }: { name: string; accountId: string }) {
    return MessengerApps.createApp({
      name,
      kind: 'googleMeet',
      showInInbox: true,
      accountId,
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
    const form = await Forms.findOne({ _id: formId });

    if (!form) {
      throw new Error('Form not found');
    }

    return MessengerApps.createApp({
      name,
      kind: 'lead',
      showInInbox: false,
      credentials: {
        integrationId,
        formCode: form.code || '',
      },
    });
  },

  /*
   * Remove app
   */
  async messengerAppsRemove(_root, { _id }: { _id: string }) {
    return MessengerApps.deleteOne({ _id });
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

    const account = await Accounts.findOne({ _id: app.accountId });

    if (!account) {
      throw new Error('Account not found');
    }

    // get customer email
    let email = customer.primaryEmail;

    if (!email && customer.visitorContactInfo) {
      email = customer.visitorContactInfo.email;
    }

    const credentials = {
      access_token: account.token,
      scope: 'https://www.googleapis.com/auth/calendar',
      token_type: 'Bearer',
      expiry_date: account.expireDate,
    };

    const eventData: any = await createMeetEvent(credentials, {
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
