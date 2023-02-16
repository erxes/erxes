import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';

import { generateModels } from './connectionResolver';
import { getSubdomain } from '@erxes/api-utils/src/core';
import { initBroker, sendCommonMessage } from './messageBroker';
import * as permissions from './permissions';

export let mainDb;
export let graphqlPubsub;
export let serviceDiscovery;

export let debug;

export default {
  name: 'documents',
  permissions,
  graphql: sd => {
    serviceDiscovery = sd;
    return {
      typeDefs,
      resolvers
    };
  },
  hasSubscriptions: true,
  segment: {},
  apolloServerContext: async (context, req) => {
    const subdomain = getSubdomain(req);

    context.subdomain = subdomain;
    context.models = await generateModels(subdomain);
  },

  getHandlers: [
    {
      path: '/print',
      method: async (req, res, next) => {
        const { _id, copies, width } = req.query;
        const subdomain = getSubdomain(req);
        const models = await generateModels(subdomain);
        const document = await models.Documents.findOne({ _id });

        if (!document) {
          return res.send('Not found');
        }

        const userId = req.headers.userid;

        if (!document) {
          return res.send('Not found');
        }

        if (!userId) {
          return next(new Error('Permission denied'));
        }

        let replacedContents = await sendCommonMessage({
          subdomain,
          serviceName: document.contentType,
          action: 'documents.replaceContent',
          isRPC: true,
          data: {
            ...(req.query || {}),
            content: document.content
          }
        });

        let results: string = '';

        const replacers = (document.replacer || '').split('\n');

        for (let replacedContent of replacedContents) {
          for (const replacer of replacers) {
            const [key, value] = replacer.split(',');

            if (key) {
              const regex = new RegExp(key, 'g');
              replacedContent = replacedContent.replace(regex, value);
            }
          }

          if (copies) {
            results = `
             ${results}
              <div style="margin-right: 20px; margin-bottom: 20px;width: ${width}px;float: left;">
                ${replacedContent}
              </div>
            `;
          } else {
            results = results + replacedContent;
          }
        }

        let multipliedResults: string[] = [];

        if (copies) {
          let i = 0;
          while (i < copies) {
            i++;
            multipliedResults.push(`
              <div style="margin-right: 20px; margin-bottom: 20px;float: left;">
              ${results}
              </div>
            `);
          }
        } else {
          multipliedResults = [results];
        }

        const style = `
          <style type="text/css">
            /*receipt*/
            html {
              color: #000;
              font-size: 13px;
              font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif;
            }

            body {
              margin: 0;
            }

            table {
              width: 100%;
              max-width: 100%;
            }

            table tr:last-child td {
              border-bottom: 1px dashed #444;
            }

            table thead th {
              padding: 5px;
              border-top: 1px dashed #444;
              border-bottom: 1px dashed #444;
              text-align: left;
            }

            table tbody td {
              padding: 5px;
              text-align: left;
            }
          </style>
      `;

        return res.send(multipliedResults + style);
      }
    }
  ],

  onServerInit: async options => {
    mainDb = options.db;

    initBroker(options.messageBrokerClient);

    debug = options.debug;
    graphqlPubsub = options.pubsubClient;
  }
};
