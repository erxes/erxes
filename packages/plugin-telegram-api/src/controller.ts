import { Accounts, Chats } from './models';
import { TelegramBot } from './bot';

const searchMessages = (linkedin, criteria) => {
  return new Promise((resolve, reject) => {
    const messages: any = [];
  });
};

// controller for telegram
const init = async app => {
  const accounts = await Accounts.find({});

  accounts.forEach(acct => {
    const bot = new TelegramBot(acct.token);
    bot.run(acct.id);
  });
  // TODO: read accounts from mongo and spawn a bot for each account

  app.get('/chats', async (req, res) => {
    const chats = await Chats.find({});
    res.send(chats);
  });

  app.post('/receive', async (req, res, next) => {
    try {
      // write receive code here

      res.send('Successfully receiving message');
    } catch (e) {
      return next(new Error(e));
    }

    res.sendStatus(200);
  });
};

export default init;
