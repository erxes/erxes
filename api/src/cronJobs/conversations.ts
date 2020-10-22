import * as moment from 'moment';
import * as schedule from 'node-schedule';
import * as _ from 'underscore';
import utils, { IEmailParams } from '../data/utils';
import { Brands, ConversationMessages, Conversations, Customers, Integrations, Users } from '../db/models';
import { IMessageDocument } from '../db/models/definitions/conversationMessages';
import { debugCrons } from '../debuggers';

/**
 * Send conversation messages to customer
 */
export const sendMessageEmail = async () => {
  // new or open conversations
  const conversations = await Conversations.newOrOpenConversation();

  debugCrons(`Found ${conversations.length} conversations`);

  for (const conversation of conversations) {
    const customer = await Customers.findOne({ _id: conversation.customerId }).lean();

    const integration = await Integrations.findOne({
      _id: conversation.integrationId,
    });

    if (!integration) {
      continue;
    }

    if (!customer || !(customer.emails && customer.emails.length > 0)) {
      continue;
    }

    const brand = await Brands.findOne({ _id: integration.brandId }).lean();

    if (!brand) {
      continue;
    }

    // user's last non answered question
    const question: IMessageDocument = await ConversationMessages.getNonAsnweredMessage(conversation._id);

    const adminMessages = await ConversationMessages.getAdminMessages(conversation._id);

    if (adminMessages.length < 1) {
      continue;
    }

    // generate admin unread answers
    const answers: any = [];

    for (const message of adminMessages) {
      const answer = {
        ...message.toJSON(),
        createdAt: new Date(moment(message.createdAt).format('DD MMM YY, HH:mm')),
      };

      const usr = await Users.findOne({ _id: message.userId }).lean();

      if (usr) {
        answer.user = usr;
        answer.user.avatar = usr.details.avatar;
        answer.user.fullName = usr.details.fullName;
      }

      if (message.attachments.length !== 0) {
        for (const attachment of message.attachments) {
          answer.content = answer.content.concat(`<p><img src="${attachment.url}" alt="${attachment.name}"></p>`);
        }
      }

      // add user object to answer
      answers.push(answer);
    }

    customer.name = Customers.getCustomerName(customer);

    const data = {
      customer,
      question: {},
      answers,
      brand,
    };

    if (question) {
      const questionData = {
        ...question.toJSON(),
        createdAt: new Date(moment(question.createdAt).format('DD MMM YY, HH:mm')),
      };

      if (question.attachments.length !== 0) {
        for (const attachment of question.attachments) {
          questionData.content = questionData.content.concat(
            `<p><img src="${attachment.url}" alt="${attachment.name}"></p>`,
          );
        }
      }

      data.question = questionData;
    }

    const email = customer.primaryEmail || customer.emails[0];

    const emailOptions: IEmailParams = {
      toEmails: [email],
      title: `Reply from "${brand.name}"`,
    };

    const emailConfig = brand.emailConfig;

    if (emailConfig && emailConfig.type === 'custom') {
      emailOptions.customHtml = emailConfig.template;
      emailOptions.customHtmlData = data;
    } else {
      emailOptions.template = {
        name: 'conversationCron',
        data,
      };
    }

    // send email

    await utils.sendEmail(emailOptions);

    // mark sent messages as read
    await ConversationMessages.markSentAsReadMessages(conversation._id);
  }
};

export default {
  sendMessageEmail,
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
schedule.scheduleJob('*/10 * * * *', async () => {
  debugCrons('Ran conversation crons');

  await sendMessageEmail();
});
