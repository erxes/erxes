import { IContext } from '@erxes/api-utils/src/types';
import { Accounts, Messages } from '../../models';
import { getGuildChannels } from '../../utils';
import { getConfig } from '../../messageBroker';

const queries = {
  async discordConversationDetail(
    _root,
    { conversationId },
    _context: IContext
  ) {
    const messages = await Messages.find({
      inboxConversationId: conversationId
    });

    const converMessageAddress = messages =>
      (messages || []).map(item => ({
        userId: item.address,
        username: `@${item.name}`
      }));

    return messages.map(message => {
      return {
        _id: message._id,
        messageData: {
          messageId: message.messageId,
          from: converMessageAddress(message.from),
          to: converMessageAddress(message.to),
          cc: converMessageAddress(message.cc),
          bcc: converMessageAddress(message.bcc),
          subject: message.subject,
          content: message.body,
          createdAt: message.createdAt
        }
      };
    });
  },

  async discordAccounts(_root, _args, _context: IContext) {
    return Accounts.getAccounts();
  },

  async discordChannels(_root, { accountId }, _context: IContext) {
    const account = await Accounts.getAccount({ _id: accountId });

    const botToken = await getConfig('DISCORD_BOT_TOKEN', 'os', '');
    if (botToken == '') {
      throw new Error('Missing DISCORD_BOT_TOKEN');
    }
    const channels = await getGuildChannels(account.guildId, `Bot ${botToken}`);

    const textChannels = channels.filter(channel => channel.type == 0);

    return textChannels;
  }
};

export default queries;
