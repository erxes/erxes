import { IContext } from '@erxes/api-utils/src/types';
import { Messages } from '../../models';

const queries = {
  async {name}ConversationDetail(
    _root,
    { conversationId },
    {}: IContext
  ) {
    const messages = await Messages.find({
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
        }
      };
    });
  },
};

export default queries;
