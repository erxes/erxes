import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';

import { generateModels } from './connectionResolver';
import { getSubdomain } from '@erxes/api-utils/src/core';
import { getServices, getService } from '@erxes/api-utils/src/serviceDiscovery';
import { setupMessageConsumers, sendCommonMessage } from './messageBroker';
import * as permissions from './permissions';
import common from './common';

export default {
  name: 'documents',
  permissions,
  graphql: () => {
    return {
      typeDefs,
      resolvers,
    };
  },
  segment: {},
  apolloServerContext: async (context, req) => {
    const subdomain = getSubdomain(req);

    context.subdomain = subdomain;
    context.models = await generateModels(subdomain);
  },
  meta: {
    permissions,
  },

  getHandlers: [
    {
      path: '/print',
      method: async (req, res, next) => {
        const { _id, copies, width, itemId } = req.query;
        const subdomain = getSubdomain(req);
        const models = await generateModels(subdomain);

        let document;
        try {
          document = await models.Documents.findOne({
            $or: [{ _id }, { code: _id }],
          });
        } catch (e) {
          document = await models.Documents.findOne({ code: _id });
        }

        if (!document) {
          return res.send('Not found');
        }

        const userId = req.headers.userid;

        if (!userId) {
          return next(new Error('Permission denied'));
        }

        const services = await getServices();

        for (const serviceName of services) {
          const service = await getService(serviceName);
          const meta = service.config?.meta || {};

          if (meta && meta.documentPrintHook) {
            try {
              await sendCommonMessage({
                subdomain,
                action: 'documentPrintHook',
                isRPC: true,
                serviceName,
                data: { document, userId },
              });
            } catch (e) {
              return next(e);
            }
          }
        }

        const regex = /\{{ (\b\w+\.\b\w+\.\b\w+) }}/g;
        const matches = document?.content?.match(regex) || [];
        let replaceContentNormal = document?.content;
        let array: string[] = [];
        for (const x of matches) {
          const pattern = x.replace('{{ ', '').replace(' }}', '').split('.');
          const serviceName = pattern[0];
          array.push(serviceName);
        }
        const uniqueServices = [...new Set(array)];
        for (const serviceName of uniqueServices) {
          if (services.includes(serviceName)) {
            try {
              const result = await sendCommonMessage({
                subdomain,
                serviceName: serviceName,
                action: 'documents.replaceContentFields',
                isRPC: true,
                data: {
                  ...(req.query || {}),
                  content: replaceContentNormal,
                  isArray: false,
                },
                timeout: 50000,
              });
              replaceContentNormal = result;
            } catch (e) {
              console.log(e);
            }
          }
        }

        let replacedContents: any[] = [];
        let scripts = '';
        let styles = '';
        let heads = '';

        try {
          if (document.contentType.includes('core:')) {
            const [_serviceName, type] = document.contentType.split(':');
            console.log({ _serviceName, type });
            const replaceContent = common.replaceContent[type];
            replacedContents = await replaceContent({
              subdomain,
              data: {
                ...(req.query || {}),
                content: replaceContentNormal,
                contentType: document.contentType,
              },
            });
          } else {
            const [serviceName, contentType] = document.contentType.split(':');

            replacedContents = await sendCommonMessage({
              subdomain,
              serviceName,
              action: 'documents.replaceContent',
              isRPC: true,
              data: {
                ...(req.query || {}),
                content: replaceContentNormal,
                contentType,
              },
              timeout: 50000,
            });
          }
        } catch (e) {
          replacedContents = [e.message];
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
              <div style="margin-right: 2mm; margin-bottom: 2mm; width: ${width}mm; float: left;">
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
        `,
        ];

        if (copies) {
          let i = 0;
          while (i < copies) {
            i++;
            multipliedResults.push(`
              <div style="margin-right: 2mm; margin-bottom: 2mm; float: left;">
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
              font-size: 11px;
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
      },
    },
  ],

  onServerInit: async () => {},
  setupMessageConsumers,
};
