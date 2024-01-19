import typeDefs from './graphql/typeDefs';
import fetch from 'node-fetch';
import resolvers from './graphql/resolvers';

import { initBroker } from './messageBroker';
import { getSubdomain } from '@erxes/api-utils/src/core';
import { generateModels } from './connectionResolver';
import { pageReplacer } from './utils';
const permissions = require('./permissions');
import app from '@erxes/api-utils/src/app';

export let mainDb;
export let debug;

export default {
  name: 'webbuilder',
  permissions,
  meta: { permissions },
  graphql: async () => {
    return {
      typeDefs: await typeDefs(),
      resolvers: await resolvers(),
    };
  },
  apolloServerContext: async (context, req) => {
    const subdomain = getSubdomain(req);

    const models = await generateModels(subdomain);

    context.subdomain = subdomain;
    context.models = models;

    return context;
  },
  onServerInit: async (options) => {
    mainDb = options.db;

    initBroker(options.messageBrokerClient);

    debug = options.debug;

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
        name: 'home',
      });

      if (!page) {
        return res.status(404).send('Not found');
      }

      const html = await pageReplacer(models, subdomain, page, site);

      return res.send(
        `
          ${html}
          <style>
            ${page.css}
          </style>
        `,
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
        code: contenttype,
      });

      if (!ct) {
        return res.status(404).send('Not found');
      }

      const page = await models.Pages.findOne({
        siteId: site._id,
        name: `${contenttype}_detail`,
      });

      if (!page) {
        return res.status(404).send('Page not found');
      }

      const entry = await models.Entries.findOne({ _id: entryid });

      if (!entry) {
        return res.status(404).send('Entry not found');
      }

      let html = await pageReplacer(models, subdomain, page, site);

      for (const evalue of entry.values) {
        const { fieldCode, value } = evalue;
        const target = `{{entry.${fieldCode}}}`;

        html = html.replace(new RegExp(target, 'g'), value);
      }

      return res.send(
        `
          ${html}
          <style>
            ${page.css}
          </style>
        `,
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

      const html = await pageReplacer(models, subdomain, page, site);

      return res.send(
        `
          ${html}
          <style>
            ${page.css}
          </style>
        `,
      );
    });

    app.get('/:sitename/get-data', async (req, res) => {
      const subdomain = getSubdomain(req);
      const models = await generateModels(subdomain);

      const { sitename } = req.params;

      const site = await models.Sites.findOne({ name: sitename }).lean();

      if (!site) {
        return res.status(404).send('Not found');
      }

      const pages = await models.Pages.find({ siteId: site._id }).lean();

      const responses = await models.ContentTypes.find({
        siteId: site._id,
      }).lean();
      const contentTypes: any[] = [];

      for (const contentType of responses) {
        contentTypes.push({
          ...contentType,
          entries: await models.Entries.find({
            contentTypeId: contentType._id,
          }).lean(),
        });
      }

      return res.json({
        pages,
        contentTypes,
      });
    });

    app.get('/demo/:templateId', async (req, res) => {
      const HELPERS_DOMAIN = `https://helper.erxes.io`;

      const { templateId } = req.params;

      const url = `${HELPERS_DOMAIN}/get-webbuilder-demo-page?templateId=${templateId}`;

      const page = await fetch(url).then((res) => res.json());

      return res.send(
        `
          ${page.html}
          <style>
            ${page.css}
          </style>
        `,
      );
    });
  },
};
