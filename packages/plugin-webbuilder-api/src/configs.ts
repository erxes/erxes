import typeDefs from './graphql/typeDefs';
import { sendRequest } from '@erxes/api-utils/src';
import resolvers from './graphql/resolvers';

import { initBroker } from './messageBroker';
import { getSubdomain } from '@erxes/api-utils/src/core';
import { generateModels } from './connectionResolver';
import { pageReplacer } from './utils';
import permissions = require('./permissions');

export let mainDb;
export let debug;
export let graphqlPubsub;
export let serviceDiscovery;

export default {
  name: 'webbuilder',
  permissions,
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

    app.get('/:sitename', async (req, res) => {
      const { sitename } = req.params;

      const subdomain = getSubdomain(req);
      const models = await generateModels(subdomain);

      const site = await models.Sites.findOne({ name: sitename }).lean();

      if (!site) {
        return res.status(404).send('Not found');
      }

      const page = await models.Pages.findOne({
        siteId: site._id,
        name: 'home'
      });

      if (!page) {
        return res.status(404).send('Not found');
      }

      const html = await pageReplacer(models, page, site);

      return res.send(
        `
          <style>
            ${page.css}
          </style>
          ${html}
        `
      );
    });

    app.get('/:sitename/detail/:contenttype/:entryid', async (req, res) => {
      const subdomain = getSubdomain(req);
      const models = await generateModels(subdomain);

      const { sitename, contenttype, entryid } = req.params;

      const site = await models.Sites.findOne({ name: sitename }).lean();

      if (!site) {
        return res.status(404).send('Not found');
      }

      const ct = await models.ContentTypes.findOne({
        siteId: site._id,
        code: contenttype
      });

      if (!ct) {
        return res.status(404).send('Not found');
      }

      const page = await models.Pages.findOne({
        siteId: site._id,
        name: `${contenttype}_detail`
      });

      if (!page) {
        return res.status(404).send('Page not found');
      }

      const entry = await models.Entries.findOne({ _id: entryid });

      if (!entry) {
        return res.status(404).send('Entry not found');
      }

      let html = await pageReplacer(models, page, site);

      for (const evalue of entry.values) {
        const { fieldCode, value } = evalue;
        const target = `{{entry.${fieldCode}}}`;

        html = html.replace(new RegExp(target, 'g'), value);
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

    app.get('/:sitename/page/:name', async (req, res) => {
      const subdomain = getSubdomain(req);
      const models = await generateModels(subdomain);

      const { sitename, name } = req.params;

      const site = await models.Sites.findOne({ name: sitename }).lean();

      if (!site) {
        return res.status(404).send('Not found');
      }

      const page = await models.Pages.findOne({ siteId: site._id, name });

      if (!page) {
        return res.status(404).send('Page not found');
      }

      const html = await pageReplacer(models, page, site);

      return res.send(
        `
          <style>
            ${page.css}
          </style>
          ${html}
        `
      );
    });

    app.get('/demo/:templateId', async (req, res) => {
      const HELPERS_DOMAIN = `https://helper.erxes.io`;

      const { templateId } = req.params;

      const url = `${HELPERS_DOMAIN}/get-webbuilder-demo-page?templateId=${templateId}`;

      const page = await sendRequest({
        url,
        method: 'get'
      });

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
