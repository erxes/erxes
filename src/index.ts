import { ApolloServer, PlaygroundConfig } from 'apollo-server-express';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as cors from 'cors';
import * as dotenv from 'dotenv';
import * as express from 'express';
import * as formidable from 'formidable';
import * as fs from 'fs';
import { createServer } from 'http';
import * as path from 'path';
import { userMiddleware } from './auth';
import resolvers from './data/resolvers';
import { handleEngageUnSubscribe } from './data/resolvers/mutations/engageUtils';
import typeDefs from './data/schema';
import { checkFile, getEnv, importXlsFile, readFileRequest, uploadFile } from './data/utils';
import { connect } from './db/connection';
import { Conversations, Customers } from './db/models';
import { graphqlPubsub } from './pubsub';
import { init } from './startup';
import { getAttachment } from './trackers/gmail';

// load environment variables
dotenv.config();

const NODE_ENV = getEnv({ name: 'NODE_ENV' });
const MAIN_APP_DOMAIN = getEnv({ name: 'MAIN_APP_DOMAIN', defaultValue: '' });
const WIDGETS_DOMAIN = getEnv({ name: 'WIDGETS_DOMAIN', defaultValue: '' });

// firebase app initialization
fs.exists(path.join(__dirname, '..', '/google_cred.json'), exists => {
  if (!exists) {
    return;
  }

  const admin = require('firebase-admin').default;
  const serviceAccount = require('../google_cred.json');
  const firebaseServiceAccount = serviceAccount;

  if (firebaseServiceAccount.private_key) {
    admin.initializeApp({
      credential: admin.credential.cert(firebaseServiceAccount),
    });
  }
});

// connect to mongo database
connect();

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  bodyParser.json({
    limit: '10mb',
  }),
);
app.use(cookieParser());

const corsOptions = {
  credentials: true,
  origin: [MAIN_APP_DOMAIN, WIDGETS_DOMAIN],
};

app.use(cors(corsOptions));

app.use(userMiddleware);

let playground: PlaygroundConfig = false;

if (NODE_ENV !== 'production') {
  playground = {
    settings: {
      'general.betaUpdates': false,
      'editor.theme': 'dark',
      'editor.cursorShape': 'line',
      'editor.reuseHeaders': true,
      'tracing.hideTracingResponse': true,
      'editor.fontSize': 14,
      'editor.fontFamily': `'Source Code Pro', 'Consolas', 'Inconsolata', 'Droid Sans Mono', 'Monaco', monospace`,
      'request.credentials': 'include',
    },
  };
}

const clients: string[] = [];
const connectedClients: string[] = [];

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  playground,
  context: ({ req, res }) => {
    return {
      user: req && req.user,
      res,
    };
  },
  subscriptions: {
    keepAlive: 10000,
    path: '/subscriptions',

    onConnect(_connectionParams, webSocket) {
      webSocket.on('message', async message => {
        const parsedMessage = JSON.parse(message).id || {};

        if (parsedMessage.type === 'messengerConnected') {
          const messengerData = parsedMessage.value;
          const integrationId = messengerData.integrationId;
          webSocket.messengerData = parsedMessage.value;

          const customerId = webSocket.messengerData.customerId;

          if (!connectedClients.includes(customerId)) {
            connectedClients.push(customerId);
          }

          // Waited for 5 seconds to reconnect in disconnect hook and disconnect hook
          // removed this customer from connected clients list. So it means this customer
          // is back online
          if (!clients.includes(customerId)) {
            clients.push(customerId);

            // mark as online
            await Customers.markCustomerAsActive(customerId);

            // customer has joined + time
            const conversationMessages = await Conversations.changeCustomerStatus('joined', customerId, integrationId);

            for (const _message of conversationMessages) {
              graphqlPubsub.publish('conversationMessageInserted', {
                conversationMessageInserted: _message,
              });
            }

            // notify as connected
            graphqlPubsub.publish('customerConnectionChanged', {
              customerConnectionChanged: {
                _id: customerId,
                status: 'connected',
              },
            });
          }
        }
      });
    },

    async onDisconnect(webSocket) {
      const messengerData = webSocket.messengerData;

      if (messengerData) {
        const customerId = messengerData.customerId;
        const integrationId = messengerData.integrationId;

        // Temporarily marking as disconnected
        // If client refreshes his browser, It will trigger disconnect, connect hooks.
        // So to determine this issue. We are marking as disconnected here and waiting
        // for 5 seconds to reconnect.
        connectedClients.splice(connectedClients.indexOf(customerId), 1);

        setTimeout(async () => {
          if (connectedClients.includes(customerId)) {
            return;
          }

          clients.splice(clients.indexOf(customerId), 1);

          // mark as offline
          await Customers.markCustomerAsNotActive(customerId);

          // customer has left + time
          const conversationMessages = await Conversations.changeCustomerStatus('left', customerId, integrationId);

          for (const message of conversationMessages) {
            graphqlPubsub.publish('conversationMessageInserted', {
              conversationMessageInserted: message,
            });
          }

          // notify as disconnected
          graphqlPubsub.publish('customerConnectionChanged', {
            customerConnectionChanged: {
              _id: customerId,
              status: 'disconnected',
            },
          });
        }, 10000);
      }
    },
  },
});

app.use('/static', express.static(path.join(__dirname, 'private')));

// for health check
app.get('/status', async (_req, res) => {
  res.end('ok');
});

// read file
app.get('/read-file', async (req: any, res) => {
  const key = req.query.key;

  if (!key) {
    return res.send('Invalid key');
  }

  try {
    const response = await readFileRequest(key);

    res.attachment(key);

    return res.send(response);
  } catch (e) {
    return res.end(e.message);
  }
});

// file upload
app.post('/upload-file', async (req, res) => {
  const form = new formidable.IncomingForm();

  form.parse(req, async (_error, _fields, response) => {
    const status = await checkFile(response.file);

    if (status === 'ok') {
      try {
        const url = await uploadFile(response.file);
        return res.end(url);
      } catch (e) {
        return res.status(500).send(e.message);
      }
    }

    return res.status(500).send(status);
  });
});

// file import
app.post('/import-file', (req: any, res) => {
  const form = new formidable.IncomingForm();

  // require login
  if (!req.user) {
    return res.end('foribidden');
  }

  form.parse(req, async (_err, fields: any, response) => {
    const status = await checkFile(response.file);

    // if file is not ok then send error
    if (status !== 'ok') {
      return res.json(status);
    }

    importXlsFile(response.file, fields.type, { user: req.user })
      .then(result => {
        res.json(result);
      })
      .catch(e => {
        res.json(e);
      });
  });
});

// get gmail attachment file
app.get('/read-gmail-attachment', async (req: any, res) => {
  if (!req.query.message || !req.query.attach) {
    return res.status(404).send('Attachment not found');
  }

  const attachment: { filename?: string; data?: string } = await getAttachment(req.query.message, req.query.attach);

  if (!attachment.data) {
    return res.status(404).send('Attachment not found');
  }

  res.attachment(attachment.filename);
  res.write(attachment.data, 'base64');
  res.end();
});

// engage unsubscribe
app.get('/unsubscribe', async (req, res) => {
  const unsubscribed = await handleEngageUnSubscribe(req.query);

  if (unsubscribed) {
    res.setHeader('Content-Type', 'text/html');
    const template = fs.readFileSync(__dirname + '/private/emailTemplates/unsubscribe.html');
    res.send(template);
  }

  res.end();
});

apolloServer.applyMiddleware({ app, path: '/graphql', cors: corsOptions });

// Wrap the Express server
const httpServer = createServer(app);

// subscriptions server
const PORT = getEnv({ name: 'PORT' });

apolloServer.installSubscriptionHandlers(httpServer);

httpServer.listen(PORT, () => {
  console.log(`GraphQL Server is now running on ${PORT}`);

  // execute startup actions
  init(app);
});
