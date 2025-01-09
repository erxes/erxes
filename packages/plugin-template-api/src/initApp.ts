import * as bodyParser from 'body-parser';
import app from '@erxes/api-utils/src/app';
import { routeErrorHandling } from '@erxes/api-utils/src/requests';
import { buildFile } from './export';
import { getSubdomain } from '@erxes/api-utils/src/core';
import { generateModels } from './connectionResolver';
import { ITemplate } from './models/definitions/templates';

const verifyOrigin = (req, res, next) => {
  const origin = req.get('Origin') || req.get('Referer');

  if (origin && (origin.startsWith('https://erxes.io'))) {
    next();
  } else {
    res.status(403).json({ message: 'Access denied' });
  }
};

const initApp = async () => {
  app.use(
    bodyParser.urlencoded({
      limit: '10mb',
      extended: true
    })
  );

  app.use(bodyParser.json({ limit: '10mb' }));

  app.use(bodyParser.raw({ limit: '10mb', type: '*/*' }));

  app.get(
    `/file-export`,
    routeErrorHandling(async (req, res) => {
      const { query } = req;

      const subdomain = getSubdomain(req);
      const models = await generateModels(subdomain);

      const result = await buildFile(models, subdomain, query._id);

      res.attachment(`${result.name}.json`);

      return res.send(result.response);
    })
  );

  app.post('/install-template', verifyOrigin, async (req, res) => {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required.' });
    }

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const template = await response.json() as ITemplate;

      const subdomain = getSubdomain(req);
      const models = await generateModels(subdomain);

      const { _id, ...newTemplate } = template

      await models.Templates.create(newTemplate);

      return res.status(200).json({ message: 'Template installed successfully.' });

    } catch (error) {

      return res.status(500).json({ error: error.message });
    }
  })

  app.post('/file-import', async (req, res) => {
    const data = req.body;

    const subdomain = getSubdomain(req);
    const models = await generateModels(subdomain);

    try {
      await models.Templates.create(data);
      res.status(200).json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false });
    }
  });
};

export default initApp;
