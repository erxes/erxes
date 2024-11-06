import * as bodyParser from 'body-parser';

import { debugWhatsapp, debugRequest } from './debuggers';
import initFacebook from './controller';
import systemStatus from './systemStatus';
import userMiddleware from './middlewares/userMiddleware';
import app from '@erxes/api-utils/src/app';

const rawBodySaver = (req, _res, buf, encoding) => {
  if (buf && buf.length) {
    req.rawBody = buf.toString(encoding || 'utf8');

    if (req.headers.fromcore === 'true') {
      req.rawBody = req.rawBody.replace(/\//g, '\\/');
    }
  }
};

const initApp = async () => {
  app.use(
    bodyParser.urlencoded({
      limit: '10mb',
      verify: rawBodySaver,
      extended: true
    })
  );
  app.use(bodyParser.json({ limit: '10mb', verify: rawBodySaver }));

  app.use(userMiddleware);

  app.use(bodyParser.raw({ limit: '10mb', verify: rawBodySaver, type: '*/*' }));

  app.use((req, _res, next) => {
    debugRequest(debugWhatsapp, req);

    next();
  });

  app.get('/system-status', async (_req, res) => {
    return res.json(await systemStatus());
  });

  initFacebook(app);

  app.use((error, _req, res, _next) => {
    console.error(error.stack);
    res.status(500).send(error.message);
  });
};

export default initApp;
