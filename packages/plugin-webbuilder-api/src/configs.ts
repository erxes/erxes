import { routeErrorHandling } from '@erxes/api-utils/src/requests';
import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';

import { initBroker } from './messageBroker';
import { Pages } from './models/pages';
import { Entries } from './models/entries';
import { ContentTypes } from './models/contentTypes';

export let mainDb;
export let debug;
export let graphqlPubsub;
export let serviceDiscovery;

export default {
  name: 'webbuilder',
  graphql: async sd => {
    serviceDiscovery = sd;

    return {
      typeDefs: await typeDefs(sd),
      resolvers: await resolvers(sd)
    };
  },
  apolloServerContext: async (context, req) => {
    context.subdomain = req.hostname;

    return context;
  },
  onServerInit: async options => {
    mainDb = options.db;

    initBroker(options.messageBrokerClient);

    graphqlPubsub = options.pubsubClient;

    debug = options.debug;

    const { app } = options;

    app.get('/', async (req, res) => {
      const page = await Pages.findOne({ name: 'home' });

      if (!page) {
        return res.status(404).send('Not found');
      }

      let html = page.html;

      const pages = await Pages.find({ name: { $ne: 'home' } });

      for (const p of pages) {
        const holder = `{{${p.name}}}`;

        if (html.includes(holder)) {
          let subHtml = '';

          if (p.name.includes('_entry')) {
            const contentTypeCode = p.name.replace('_entry', '');
            const contentType = await ContentTypes.findOne({
              code: contentTypeCode
            });
            const entries = await Entries.find({
              contentTypeId: contentType?._id
            });

            for (const entry of entries) {
              let entryHtml = p.html.replace('{{entry._id}}', entry._id);

              for (const evalue of entry.values) {
                const { fieldCode, value } = evalue;
                entryHtml = entryHtml.replace(`{{entry.${fieldCode}}}`, value);
              }

              subHtml += entryHtml + `<style>${p.css}</style>`;
            }
          } else {
            subHtml = p.html;
          }

          html = html.replace(holder, subHtml);
        }
      }

      return res.send(
        `
          <style>
            ${page.css}
          </style>
          ${html}
        `
      );
    });

    app.get('/detail/:contentType/:entryId', async (req, res) => {
      const { contentType, entryId } = req.params;

      const ct = await ContentTypes.findOne({ code: contentType });

      if (!ct) {
        return res.status(404).send('Not found');
      }

      const page = await Pages.findOne({ name: `${contentType}_detail` });

      if (!page) {
        return res.status(404).send('Page not found');
      }

      const entry = await Entries.findOne({ _id: entryId });

      if (!entry) {
        return res.status(404).send('Entry not found');
      }

      let html = page.html;

      for (const evalue of entry.values) {
        const { fieldCode, value } = evalue;
        html = html.replace(`{{entry.${fieldCode}}}`, value);
      }

      return res.send(
        `
          <style>
            ${page.css}
          </style>
          ${html}
        `
      );
    });
  }
};
