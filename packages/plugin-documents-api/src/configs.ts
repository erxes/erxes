import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';

import { generateModels } from './connectionResolver';
import { getSubdomain } from '@erxes/api-utils/src/core';
import { getServices, getService } from '@erxes/api-utils/src/serviceDiscovery';
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
        const { _id, copies, width, itemId } = req.query;
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

        const services = await getServices();

        for (const serviceName of services) {
          const service = await getService(serviceName, true);
          const meta = service.config?.meta || {};

          if (meta && meta.documentPrintHook) {
            try {
              await sendCommonMessage({
                subdomain,
                action: 'documentPrintHook',
                isRPC: true,
                serviceName,
                data: { document, userId }
              });
            } catch (e) {
              return next(e);
            }
          }
        }

        let replacedContents: any[] = [];
        let scripts = '';
        let styles = '';
        let heads = '';

        if (document.contentType === 'core:user') {
          const user = await sendCommonMessage({
            subdomain,
            serviceName: 'core',
            isRPC: true,
            action: 'users.findOne',
            data: {
              _id: itemId
            }
          });

          let content = document.content;

          const details = user.details || {};

          content = content.replace(/{{ username }}/g, user.username);
          content = content.replace(/{{ email }}/g, user.email);
          content = content.replace(
            /{{ details.firstName }}/g,
            details.firstName
          );
          content = content.replace(
            /{{ details.lastName }}/g,
            details.lastName
          );
          content = content.replace(
            /{{ details.middleName }}/g,
            details.middleName
          );
          content = content.replace(
            /{{ details.position }}/g,
            details.position
          );
          content = content.replace(/{{ details.avatar }}/g, details.avatar);
          content = content.replace(
            /{{ details.description }}/g,
            details.description
          );

          for (const data of user.customFieldsData || []) {
            const regex = new RegExp(
              `{{ customFieldsData.${data.field} }}`,
              'g'
            );
            content = content.replace(regex, data.stringValue);
          }

          replacedContents.push(content);
        } else {
          try {
            const serviceName = document.contentType.includes(':')
              ? document.contentType.substring(
                  0,
                  document.contentType.indexOf(':')
                )
              : document.contentType;

            replacedContents = await sendCommonMessage({
              subdomain,
              serviceName,
              action: 'documents.replaceContent',
              isRPC: true,
              data: {
                ...(req.query || {}),
                content: document.content
              },
              timeout: 50000
            });
          } catch (e) {
            replacedContents = [e.message];
          }
        }

        let results: string = '';

        const replacers = (document.replacer || '').split('\n');

        for (let replacedContent of replacedContents) {
          if (replacedContent.startsWith('::heads::')) {
            heads += replacedContent.replace('::heads::', '');
            continue;
          }

          if (replacedContent.startsWith('::scripts::')) {
            scripts += replacedContent.replace('::scripts::', '');
            continue;
          }

          if (replacedContent.startsWith('::styles::')) {
            styles += replacedContent.replace('::styles::', '');
            continue;
          }

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

        let multipliedResults: string[] = [
          `
          <head>
            <meta charset="utf-8">
            ${heads}
          </head>
        `
        ];

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
            ${styles}
          </style>
      `;
        const script = `
            ${scripts}
        `;
        return res.send(multipliedResults + style + script);
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
