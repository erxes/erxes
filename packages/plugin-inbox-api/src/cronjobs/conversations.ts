import * as moment from 'moment';
import * as schedule from 'node-schedule';
import * as _ from 'underscore';
import { IModels } from '../connectionResolver';
// import { debugCrons } from '../debuggers';
import {
  sendAutomationsMessage,
  sendContactsMessage,
  sendCoreMessage
} from '../messageBroker';
import { IMessageDocument } from '../models/definitions/conversationMessages';

/**
 * Send conversation messages to customer
 */
export const sendMessageEmail = async (models: IModels, subdomain: string) => {
  // new or open conversations
  const conversations = await models.Conversations.newOrOpenConversation();

  // debugCrons(`Found ${conversations.length} conversations`);

  for (const conversation of conversations) {
    const customer = await sendContactsMessage({
      subdomain,
      action: 'customers.findOne',
      data: {
        _id: conversation.customerId
      },
      isRPC: true
    });

    const integration = await models.Integrations.findOne({
      _id: conversation.integrationId
    });

    if (!integration || integration.kind !== 'messenger') {
      continue;
    }

    if (!customer || !(customer.emails && customer.emails.length > 0)) {
      continue;
    }

    const brand = await sendCoreMessage({
      subdomain,
      action: 'brands.findOne',
      data: {
        query: {
          _id: integration.brandId
        }
      },
      isRPC: true
    });

    if (!brand) {
      continue;
    }

    // user's last non answered question
    const question: IMessageDocument = await models.ConversationMessages.getNonAsnweredMessage(
      conversation._id
    );

    const adminMessages = await models.ConversationMessages.getAdminMessages(
      conversation._id
    );

    if (adminMessages.length < 1) {
      continue;
    }

    // generate admin unread answers
    const answers: any = [];

    for (const message of adminMessages) {
      const answer = {
        ...message,
        createdAt: new Date(
          moment(message.createdAt).format('DD MMM YY, HH:mm')
        )
      };

      const usr = await sendCoreMessage({
        subdomain,
        action: 'users.findOne',
        data: {
          _id: message.userId
        },
        isRPC: true
      });

      if (usr) {
        answer.user = usr;
        answer.user.avatar = usr.details.avatar;
        answer.user.fullName = usr.details.fullName;
      }

      if (message.attachments.length !== 0) {
        for (const attachment of message.attachments) {
          answer.content = answer.content.concat(
            `<p><img src="${attachment.url}" alt="${attachment.name}"></p>`
          );
        }
      }

      // add user object to answer
      answers.push(answer);
    }

    customer.name = await sendContactsMessage({
      subdomain,
      action: 'customers.getCustomerName',
      data: customer,
      isRPC: true
    });

    const data = {
      customer,
      question: {},
      answers,
      brand
    };

    if (question) {
      const questionData = {
        ...question,
        createdAt: new Date(
          moment(question.createdAt).format('DD MMM YY, HH:mm')
        )
      };

      if (question.attachments.length !== 0) {
        for (const attachment of question.attachments) {
          questionData.content = (questionData.content || '').concat(
            `<p><img src="${attachment.url}" alt="${attachment.name}"></p>`
          );
        }
      }

      data.question = questionData;
    }

    const email = customer.primaryEmail || customer.emails[0];
    const emailConfig = brand.emailConfig || {};

    const emailOptions: any = {
      toEmails: [email],
      title: `Reply from "${brand.name}"`,
      fromEmail: emailConfig.email
    };

    if (emailConfig.type === 'custom') {
      emailOptions.customHtml = emailConfig.template;
      emailOptions.customHtmlData = data;
    } else {
      emailOptions.template = {
        name: 'conversationCron',
        data
      };
    }

    // send email
    await sendCoreMessage({
      subdomain,
      action: 'sendEmail',
      data: emailOptions
    });

    // mark sent messages as read
    await models.ConversationMessages.markSentAsReadMessages(conversation._id);
  }

  await sendAutomationsMessage({
    subdomain,
    action: 'trigger',
    data: {
      type: `conversation`,
      targets: [conversations]
    }
  });
};

export default {
  sendMessageEmail
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
// schedule.scheduleJob('*/10 * * * *', async () => {
//   debugCrons('Ran conversation crons');

//   await sendMessageEmail();
// });
