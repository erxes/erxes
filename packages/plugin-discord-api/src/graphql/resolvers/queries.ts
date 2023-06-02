import { IContext } from '@erxes/api-utils/src/types';
import { Accounts, Messages } from '../../models';

const queries = {
  async discordConversationDetail(
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

  async discordAccounts(_root, _args, _context: IContext) {
    return Accounts.getAccounts();
  }
};

export default queries;
