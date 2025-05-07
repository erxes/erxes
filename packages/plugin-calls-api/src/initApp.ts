import * as bodyParser from 'body-parser';

import systemStatus from './systemStatus';
import app from '@erxes/api-utils/src/app';
import graphqlPubsub from '@erxes/api-utils/src/graphqlPubsub';

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
      extended: true,
    }),
  );
  app.use(bodyParser.json({ limit: '10mb', verify: rawBodySaver }));

  app.use(bodyParser.raw({ limit: '10mb', verify: rawBodySaver, type: '*/*' }));

  app.use((_req, _res, next) => {
    next();
  });

  app.get('/system-status', async (_req, res) => {
    return res.json(await systemStatus());
  });

  // init bots
  app.post('/call/receiveWaitingCall', async (req, res) => {
    try {
      const data = JSON.parse(JSON.stringify(req.body));
      const history = JSON.parse(JSON.stringify(data.history));
      console.log('received waiting call:', history);
      graphqlPubsub.publish(`waitingCallReceived`, {
        waitingCallReceived: history,
      });
      res.status(200).json({ message: 'Call received successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.post('/call/receiveTalkingCall', async (req, res) => {
    try {
      const data = JSON.parse(JSON.stringify(req.body));
      const history = JSON.parse(JSON.stringify(data.history));
      console.log('received talking call:', history);
      graphqlPubsub.publish(`talkingCallReceived`, {
        talkingCallReceived: history,
      });
      res.status(200).json({ message: 'Call received successfully' });
    } catch (error) {
      console.error('Error receive talking the call:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.post('/call/receiveAgents', async (req, res) => {
    try {
      const data = JSON.parse(JSON.stringify(req.body));
      const history = JSON.parse(JSON.stringify(data.history));
      console.log('received agent history:', history);
      graphqlPubsub.publish(`agentCallReceived`, {
        agentCallReceived: history,
      });
      res.status(200).json({ message: 'Call Agents received successfully' });
    } catch (error) {
      console.error('Error receive agents the call:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  // Error handling middleware
  app.use((error, _req, res, _next) => {
    res.status(500).send(error.message);
  });
};

export default initApp;
