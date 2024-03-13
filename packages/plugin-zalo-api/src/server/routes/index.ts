import { connectAccount, receiveMessage } from '../controllers';
import userMiddleware from '../middlewares/userMiddleware';
import app from '@erxes/api-utils/src/app';

export const createRoutes = async () => {
  // app.use(userMiddleware);

  app.get('/login', async (req, res) => {
    await connectAccount(req, res);

    // res.send("<script>window.close();</script > ")
  });
  app.get('/receive', async (req, res, next) => {
    // GET methods for verify Zalo webhook
    res.sendStatus(200);
  });
  app.post('/receive', async (req, res, next) => {
    await receiveMessage(req);
    res.sendStatus(200);
  });
};
