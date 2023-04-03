import * as fs from 'fs';
import { Base64Decode } from 'base64-stream';
import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';

import { initBroker } from './messageBroker';
import { generateModels } from './connectionResolver';
import { getSubdomain } from '@erxes/api-utils/src/core';
import listen, { findAttachmentParts, generateImap, toUpper } from './utils';
import { debugError } from '@erxes/api-utils/src/debuggers';
import { routeErrorHandling } from '@erxes/api-utils/src/requests';
import logs from './logUtils';

export let mainDb;
export let graphqlPubsub;
export let serviceDiscovery;

export let debug;

export default {
  name: 'imap',
  graphql: sd => {
    serviceDiscovery = sd;
    return {
      typeDefs,
      resolvers
    };
  },
  meta: {
    inboxIntegrations: [
      {
        kind: 'imap',
        label: 'IMap'
      }
    ],
    logs: { providesActivityLog: true, consumers: logs }
  },
  apolloServerContext: async (context, req) => {
    const subdomain = getSubdomain(req);

    context.subdomain = subdomain;
    context.models = await generateModels(subdomain);
  },

  onServerInit: async options => {
    mainDb = options.db;
    const app = options.app;

    debug = options.debug;
    graphqlPubsub = options.pubsubClient;

    initBroker(options.messageBrokerClient);

    app.get(
      '/read-mail-attachment',
      routeErrorHandling(
        async (req, res, next) => {
          const subdomain = getSubdomain(req);
          const models = await generateModels(subdomain);

          const { messageId, integrationId, filename } = req.query;

          const integration = await models.Integrations.findOne({
            inboxId: integrationId
          });

          if (!integration) {
            throw new Error('Integration not found');
          }

          const imap = generateImap(integration);

          imap.once('ready', () => {
            imap.openBox('INBOX', true, async (err, box) => {
              imap.search([['HEADER', 'MESSAGE-ID', messageId]], function(
                err,
                results
              ) {
                if (err) {
                  imap.end();
                  return next(err);
                }

                let f;

                try {
                  f = imap.fetch(results, { bodies: '', struct: true });
                } catch (e) {
                  imap.end();
                  debugError('messageId ', messageId);
                  return next(e);
                }

                f.on('message', function(msg) {
                  msg.once('attributes', function(attrs) {
                    const attachments = findAttachmentParts(attrs.struct);

                    if (attachments.length === 0) {
                      imap.end();
                      return res.status(404).send('Not found');
                    }

                    for (let i = 0, len = attachments.length; i < len; ++i) {
                      const attachment = attachments[i];

                      if (attachment.params.name === filename) {
                        const f = imap.fetch(attrs.uid, {
                          bodies: [attachment.partID],
                          struct: true
                        });

                        f.on('message', msg => {
                          const filename = attachment.params.name;
                          const encoding = attachment.encoding;

                          msg.on('body', function(stream) {
                            const writeStream = fs.createWriteStream(
                              `${__dirname}/${filename}`
                            );

                            if (toUpper(encoding) === 'BASE64') {
                              stream.pipe(new Base64Decode()).pipe(writeStream);
                            } else {
                              stream.pipe(writeStream);
                            }
                          });

                          msg.once('end', function() {
                            imap.end();
                            return res.download(`${__dirname}/${filename}`);
                          });
                        });
                      }
                    }
                  });
                });
              });
            });
          });

          imap.connect();
        },
        res => res.send('ok')
      )
    );

    await listen('os');
  }
};
