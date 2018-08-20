import * as schedule from 'node-schedule';
import { _ } from 'underscore';
import * as moment from 'moment';
import utils from '../data/utils';
import {
  Conversations,
  Brands,
  Customers,
  Users,
  ConversationMessages,
  Integrations,
} from '../db/models';

/**
* Send conversation messages to customer
*/
export const sendMessageEmail = async () => {
  // new or open conversations
  const conversations = await Conversations.newOrOpenConversation();

  for (let conversation of conversations) {
    const customer = await Customers.findOne({ _id: conversation.customerId });
    const integration = await Integrations.findOne({
      _id: conversation.integrationId,
    });

    if (!integration) {
      return;
    }

    const brand = await Brands.findOne({ _id: integration.brandId });

    if (!customer || !customer.primaryEmail) {
      return;
    }

    if (!brand) {
      return;
    }

    // user's last non answered question
    const question = (await ConversationMessages.getNonAsnweredMessage(conversation._id)) || {};

    question.createdAt = moment(question.createdAt).format('DD MMM YY, HH:mm');

    // generate admin unread answers
    const answers = [];

    const adminMessages = await ConversationMessages.getAdminMessages(conversation._id);

    for (let message of adminMessages) {
      const answer = message;

      // add user object to answer
      answer.user = await Users.findOne({ _id: message.userId });
      answer.createdAt = moment(answer.createdAt).format('DD MMM YY, HH:mm');
      answers.push(answer);
    }

    if (answers.length < 1) {
      return;
    }

    // template data
    const data = { customer, question, answers, brand };

    // add user's signature
    const user = await Users.findOne({ _id: answers[0].userId });

    if (user && user.emailSignatures) {
      const signature = await _.find(user.emailSignatures, s => brand._id === s.brandId);

      if (signature) {
        data.signature = signature.signature;
      }
    }

    // send email
    utils.sendEmail({
      to: customer.primaryEmail,
      title: `Reply from "${brand.name}"`,
      template: {
        name: 'conversationCron',
        isCustom: true,
        data,
      },
    });

    // mark sent messages as read
    ConversationMessages.markSentAsReadMessages(conversation._id);
  }
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
// every 10 minutes
schedule.scheduleJob('*/10 * * * *', function() {
  sendMessageEmail();
});
