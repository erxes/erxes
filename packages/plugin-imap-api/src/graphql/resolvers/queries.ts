import { moduleRequireLogin } from '@erxes/api-utils/src/permissions';
import { IContext } from '../../connectionResolver';

const queries = {
  async imapConversationDetail(
    _root,
    { conversationId },
    { models }: IContext
  ) {
    const messages = await models.Messages.find({
      inboxConversationId: conversationId
    });

    const convertEmails = emails =>
      (emails || []).map(item => ({ name: item.name, email: item.address }));

    return messages.map(message => {
      return {
        _id: message._id,
        mailData: {
          messageId: message.messageId,
          from: convertEmails(message.from),
          to: convertEmails(message.to),
          cc: convertEmails(message.cc),
          bcc: convertEmails(message.bcc),
          subject: message.subject,
          body: message.body,
          attachments: message.attachments
        },
        createdAt: message.createdAt
      };
    });
  },

  async imapGetIntegrations(_root, _args, { models }: IContext) {
    return models.Integrations.find();
  },

  async imapLogs(_root, _args, { models }: IContext) {
    return models.Logs.find()
      .sort({ date: -1 })
      .limit(100);
  }
};

moduleRequireLogin(queries);

export default queries;
