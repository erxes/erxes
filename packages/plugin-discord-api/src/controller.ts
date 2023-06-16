import { sendContactsMessage, sendInboxMessage } from './messageBroker';
import { loginMiddleware } from './middlewares/loginMiddleware';
import { redirectMiddleware } from './middlewares/redirectMiddleware';
import { Customers, Messages } from './models';

const searchMessages = (linkedin, criteria) => {
  return new Promise((resolve, reject) => {
    const messages: any = [];
  });
};

// Example for save messages to inbox and create or update customer

// controller for discord
const init = async app => {
  app.get('/login', loginMiddleware);

  app.get('/redirect', redirectMiddleware);

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
