import * as bodyParser from 'body-parser';
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
import { importXlsFile, uploadFile } from './data/utils';
import { connect } from './db/connection';
import { Customers, IntegrationAccounts } from './db/models';
import { init } from './startup';
import { graphRequest } from './trackers/facebookTracker';

// load environment variables
dotenv.config();

// connect to mongo database
connect();

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cors());

app.use(userMiddleware);

app.use('/graphql', graphqlExpress((req: any) => ({ schema, context: { user: req.user } })));

app.use('/static', express.static(path.join(__dirname, 'private')));

// for health check
app.get('/status', async (_req, res) => {
  res.end('ok');
});

// file upload
app.post('/upload-file', async (req, res) => {
  const form = new formidable.IncomingForm();

  form.parse(req, async (_err, _fields, response) => {
    const url = await uploadFile(response.file);

    return res.end(url);
  });
});

// engage unsubscribe
app.get('/unsubscribe', async (req, res) => {
  const unsubscribed = await handleEngageUnSubscribe(req.query);

  if (unsubscribed) {
    res.end('Unsubscribed');
  }

  res.end();
});

const conf = {
  client_id: '700381116804195',
  client_secret: '198eae60055634e5cefb5fa00053260c',
  scope: 'manage_pages, pages_show_list',
  // You have to set http://localhost:3000/ as your website
  // using Settings -> Add platform -> Website
  redirect_uri: 'https://2e7201ab.ngrok.io/fblogin',
};

app.get('/fblogin', (req, res) => {
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
        const { MAIN_APP_DOMAIN } = process.env;
        const { access_token } = facebookRes;
        const userAccount: any = await graphRequest.get('me?fields=id,first_name,last_name', access_token);
        const accountName = `${userAccount.first_name} ${userAccount.last_name}`;

        await IntegrationAccounts.createAccount({
          token: access_token,
          accountName,
          kind: 'facebook',
          accountId: userAccount.id,
        });

        res.end();
        res.redirect(`${MAIN_APP_DOMAIN}/settings/integrations?fbAuthorized=true`);
      },
    );
  }
});

// file import
app.post('/import-file', (req: any, res) => {
  const form = new formidable.IncomingForm();

  form.parse(req, (_err, fields: any, response) => {
    importXlsFile(response.file, fields.type, { user: req.user })
      .then(result => {
        res.json(result);
      })
      .catch(e => {
        res.json(e);
      });
  });
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
  // graphRequest.post(
  //   '2084915485108240/subscribed_apps',
  //   'EAAJ8ZCiZBsrGMBADhSv4KmPWlzw32yLreUH2FAKUo2caGTtnyHMXXhZCKrUxg3XpuRXVtD1CCb5zsFuNpR9ZCVw3ZBxx2ZCpdVPAENqyDntsKn25QZAwMqMXkr3FgZCMeiLxgZBqiaDDxoLBYujZCH5FCIN63GCsL3JKbNMZCZCY8xtlEGSaTf56MU4f7k2wCWN2Rc9TpPXaPCq76QZDZD',
  //   { subscribed_fields: ['conversations', 'messages', 'feed'] }
  // );

  app.use(
    '/graphiql',
    graphiqlExpress({
      endpointURL: '/graphql',
      subscriptionsEndpoint: `ws://localhost:${PORT}/subscriptions`,
    }),
  );
}
