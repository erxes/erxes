import { TelegramBot } from '../../bot';
import { Accounts, Chats } from '../../models';
import { IContext } from '@erxes/api-utils/src/types';

const telegramMutations = {
  async telegramAccountRemove(
    _root,
    { _id }: { _id: string },
    _context: IContext
  ) {
    await Accounts.removeAccount(_id);

    return 'deleted';
  },

  async telegramAccountAdd(_root, { token }, _context: IContext) {
    const currentAccount = await Accounts.findOne({ token });

    if (!currentAccount) {
      const bot = new TelegramBot(token);
      const info = await bot.getMe();
      const account = await Accounts.create({
        token,
        name: info.username
      });

      bot.run(account.id);

      return 'Account created';
    }

    throw new Error(`Account already exists: ${currentAccount.name}`);
  }
};

export default telegramMutations;
