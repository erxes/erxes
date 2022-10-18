import * as nodemailer from 'nodemailer';

import { moduleRequireLogin } from '@erxes/api-utils/src/permissions';
import { IContext } from '../../connectionResolver';
import { sendContactsMessage, sendInboxMessage } from '../../messageBroker';

const notificationMutations = {
  /**
   * Send mail
   */
  async imapSendMail(_root, args: any, { subdomain, models }: IContext) {
    const {
      integrationId,
      conversationId,
      subject,
      body,
      from,
      customerId,
      to,
      attachments,
      replyToMessageId
    } = args;

    let customer;

    const selector = customerId
      ? { _id: customerId }
      : { status: { $ne: 'deleted' }, emails: { $in: to } };

    customer = await sendContactsMessage({
      subdomain,
      action: 'customers.findOne',
      data: selector,
      isRPC: true
    });

    if (!customer) {
      const [primaryEmail] = to;

      customer = await sendContactsMessage({
        subdomain,
        action: 'customers.createCustomer',
        data: {
          state: 'lead',
          primaryEmail
        },
        isRPC: true
      });
    }

    let integration;

    if (from) {
      integration = await models.Integrations.findOne({
        user: from
      });
    }

    if (!integration) {
      integration = await models.Integrations.findOne({
        inboxId: integrationId
      });
    }

    if (!integration && conversationId) {
      const conversation = await sendInboxMessage({
        subdomain,
        action: 'conversations.findOne',
        data: { _id: conversationId },
        isRPC: true
      });

      integration = await models.Integrations.findOne({
        inboxId: conversation.integrationId
      });
    }

    if (!integration) {
      throw new Error('Integration not found');
    }

    const transporter = nodemailer.createTransport({
      host: integration.smtpHost,
      port: integration.smtpPort,
      secure: true,
      logger: true,
      debug: true,
      auth: {
        user: integration.user,
        pass: integration.password
      }
    });

    const info = await transporter.sendMail({
      from,
      to,
      subject: replyToMessageId ? `Re: ${subject}` : subject,
      html: body,
      inReplyTo: replyToMessageId,
      references: [replyToMessageId],
      attachments: attachments.map(attach => ({
        filename: attach.name,
        path: attach.url
      }))
    });

    return info.messageId;
  }
};

moduleRequireLogin(notificationMutations);

export default notificationMutations;
