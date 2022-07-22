import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';

import { initBroker } from './messageBroker';
import { getSubdomain } from '@erxes/api-utils/src/core';
import { generateModels } from './connectionResolver';

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
    const subdomain = getSubdomain(req);

    const models = await generateModels(subdomain);

    context.subdomain = subdomain;
    context.models = models;

    return context;
  },
  onServerInit: async options => {
    mainDb = options.db;

    initBroker(options.messageBrokerClient);

    graphqlPubsub = options.pubsubClient;

    debug = options.debug;

    const { app } = options;

    app.get('/', async (req, res) => {
      const subdomain = getSubdomain(req);
      const models = await generateModels(subdomain);

      const page = await models.Pages.findOne({ name: 'home' });

      if (!page) {
        return res.status(404).send('Not found');
      }

      let html = page.html;

      const pages = await models.Pages.find({ name: { $ne: 'home' } });

      for (const p of pages) {
        const holder = `{{${p.name}}}`;

        if (html.includes(holder)) {
          let subHtml = '';

          if (p.name.includes('_entry')) {
            const contentTypeCode = p.name.replace('_entry', '');
            const contentType = await models.ContentTypes.findOne({
              code: contentTypeCode
            });
            const entries = await models.Entries.find({
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
            subHtml = `${p.html} <style>${p.css}</style>`;
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
      const subdomain = getSubdomain(req);
      const models = await generateModels(subdomain);

      const { contentType, entryId } = req.params;

      const ct = await models.ContentTypes.findOne({ code: contentType });

      if (!ct) {
        return res.status(404).send('Not found');
      }

      const page = await models.Pages.findOne({
        name: `${contentType}_detail`
      });

      if (!page) {
        return res.status(404).send('Page not found');
      }

      const entry = await models.Entries.findOne({ _id: entryId });

      if (!entry) {
        return res.status(404).send('Entry not found');
      }

      let html = page.html;

      const pages = await models.Pages.find({ name: { $ne: 'home' } });

      for (const p of pages) {
        html = html.replace(
          `{{${p.name}}}`,
          `${p.html} <style>${p.css}</style>`
        );
      }

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

    app.get('/page/:name', async (req, res) => {
      const subdomain = getSubdomain(req);
      const models = await generateModels(subdomain);

      const { name } = req.params;

      const page = await models.Pages.findOne({ name });

      if (!page) {
        return res.status(404).send('Page not found');
      }

      return res.send(
        `
          <style>
            ${page.css}
          </style>
          ${page.html}
        `
      );
    });
  }
};
