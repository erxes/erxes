import { IContext } from '@erxes/api-utils/src/types';
import { Accounts, Chats, Messages } from '../../models';

const queries = {
  async telegramConversationDetail(
    _root,
    { conversationId },
    _context: IContext
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
          body: message.body
        }
      };
    });
  },

  async telegramAccounts(_root, _args, _context: IContext) {
    return Accounts.getAccounts();
  },

  async telegramChats(_root, _args, _context: IContext) {
    return Chats.getAllChats();
  }
};

export default queries;
