import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as cors from 'cors';
import * as dotenv from 'dotenv';
import * as express from 'express';
import * as graph from 'fbgraph';
import * as formidable from 'formidable';
import { execute, subscribe } from 'graphql';
import { graphiqlExpress, graphqlExpress } from 'graphql-server-express';
import { createServer } from 'http';
import * as path from 'path';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import { userMiddleware } from './auth';
import schema from './data';
import { handleEngageUnSubscribe } from './data/resolvers/mutations/engageUtils';
import { pubsub } from './data/resolvers/subscriptions';
import { checkFile, importXlsFile, uploadFile } from './data/utils';
import { connect } from './db/connection';
import { Accounts, Customers } from './db/models';
import { init } from './startup';
import { graphRequest } from './trackers/facebookTracker';

// load environment variables
dotenv.config();

const { MAIN_APP_DOMAIN } = process.env;

// connect to mongo database
connect();

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

app.use(
  cors({
    credentials: true,
    origin: MAIN_APP_DOMAIN,
  }),
);

app.use(userMiddleware);

app.use(
  '/graphql',
  graphqlExpress((req: any, res) => ({
    schema,
    context: { user: req.user, res },
  })),
);

app.use('/static', express.static(path.join(__dirname, 'private')));

// for health check
app.get('/status', async (_req, res) => {
  res.end('ok');
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

app.get('/fblogin', (req, res) => {
  const { FACEBOOK_APP_ID, FACEBOOK_APP_SECRET, DOMAIN } = process.env;

  const conf = {
    client_id: FACEBOOK_APP_ID,
    client_secret: FACEBOOK_APP_SECRET,
    scope:
      'manage_pages, pages_show_list, pages_messaging, publish_pages, pages_messaging_phone_number, pages_messaging_subscriptions',
    redirect_uri: `${DOMAIN}/fblogin`,
  };

  // we don't have a code yet
  // so we'll redirect to the oauth dialog
  if (!req.query.code) {
    const authUrl = graph.getOauthUrl({
      client_id: conf.client_id,
      redirect_uri: conf.redirect_uri,
      scope: conf.scope,
    });

    if (!req.query.error) {
      // checks whether a user denied the app facebook login/permissions
      res.redirect(authUrl);
    } else {
      // req.query.error == 'access_denied'
      res.send('access denied');
    }
  }
  // If this branch executes user is already being redirected back with
  // code (whatever that is)
  else {
    // code is set
    // we'll send that and get the access token
    graph.authorize(
      {
        client_id: conf.client_id,
        redirect_uri: conf.redirect_uri,
        client_secret: conf.client_secret,
        code: req.query.code,
      },
      async (_err, facebookRes) => {
        const { access_token } = facebookRes;
        const userAccount: any = await graphRequest.get('me?fields=id,first_name,last_name', access_token);
        const name = `${userAccount.first_name} ${userAccount.last_name}`;

        await Accounts.createAccount({
          token: access_token,
          name,
          kind: 'facebook',
          uid: userAccount.id,
        });

        res.redirect(`${MAIN_APP_DOMAIN}/settings/integrations?fbAuthorized=true`);
      },
    );
  }
});

// engage unsubscribe
app.get('/unsubscribe', async (req, res) => {
  const unsubscribed = await handleEngageUnSubscribe(req.query);

  if (unsubscribed) {
    res.end('Unsubscribed');
  }

  res.end();
});

// Wrap the Express server
const server = createServer(app);

// subscriptions server
const { PORT } = process.env;

server.listen(PORT, () => {
  console.log(`GraphQL Server is now running on ${PORT}`);

  // execute startup actions
  init(app);

  // Set up the WebSocket for handling GraphQL subscriptions
  SubscriptionServer.create(
    {
      execute,
      subscribe,
      schema,

      keepAlive: 10000,

      onConnect(_connectionParams, webSocket) {
        webSocket.on('message', async message => {
          const parsedMessage = JSON.parse(message).id || {};

          if (parsedMessage.type === 'messengerConnected') {
            webSocket.messengerData = parsedMessage.value;

            const customerId = webSocket.messengerData.customerId;

            // mark as online
            await Customers.markCustomerAsActive(customerId);

            // notify as connected
            pubsub.publish('customerConnectionChanged', {
              customerConnectionChanged: {
                _id: customerId,
                status: 'connected',
              },
            });
          }
        });
      },

      async onDisconnect(webSocket) {
        const messengerData = webSocket.messengerData;

        if (messengerData) {
          const customerId = messengerData.customerId;

          // mark as offline
          await Customers.markCustomerAsNotActive(customerId);

          // notify as disconnected
          pubsub.publish('customerConnectionChanged', {
            customerConnectionChanged: {
              _id: customerId,
              status: 'disconnected',
            },
          });
        }
      },
    } as any,
    {
      server,
      path: '/subscriptions',
    },
  );
});

if (process.env.NODE_ENV === 'development') {
  app.use(
    '/graphiql',
    graphiqlExpress({
      endpointURL: '/graphql',
      subscriptionsEndpoint: `ws://localhost:${PORT}/subscriptions`,
    }),
  );
}
