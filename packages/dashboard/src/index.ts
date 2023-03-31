import * as dotenv from 'dotenv';
import * as jwt from 'jsonwebtoken';
import * as Downloader from 'nodejs-file-downloader';
import * as fs from 'fs';
import * as path from 'path';

import { CubejsServer } from '@cubejs-backend/server';
import { getService, getServices } from './serviceDiscovery';

dotenv.config();

const { CUBEJS_API_SECRET, DB_NAME } = process.env;

async function clearDirectory(directory: string) {
  const files = await fs.promises.readdir(directory);
  const unlinkPromises = files.map(file =>
    fs.promises.unlink(`${directory}/${file}`)
  );
  await Promise.all(unlinkPromises);
}

const downloadPlugins = async () => {
  const directory = path.join(__dirname, '../dynamicSchema');

  if (!fs.existsSync(directory)) {
    await fs.promises.mkdir(directory, { recursive: true });
  }

  await clearDirectory(directory);

  const serviceNames = await getServices();

  const allServices: any[] = await Promise.all(
    serviceNames.map(async serviceName => {
      const service: any = await getService(serviceName, true);
      service.name = serviceName;
      return service;
    })
  );

  const services = allServices.filter(
    service => service.config && service.config.hasDashboard
  );

  for (const service of services) {
    const schemaNames = service.config.meta.dashboards.schemaNames || [];

    const url = `${service.address}/dashboard`;

    for (const schemaName of schemaNames) {
      const downloader = await new (Downloader as any)({
        url,
        directory,
        cloneFiles: false,
        fileName: `${schemaName}.js`,
        headers: { schemaName }
      });
      try {
        await downloader.download();
        console.log(
          `${service.name} schema downloaded from ${url} to ${schemaName}.`
        );
      } catch (e) {
        console.error(
          `${service.name} schema download from ${url} to ${schemaName} failed.`,
          e.message
        );
      }
    }
  }
};

(async () => {
  await downloadPlugins();

  const server = new CubejsServer({});

  server
    .listen()
    .then(async ({ app, port }) => {
      app.get('/get-token', async (_req, res) => {
        const dashboardToken = jwt.sign({}, CUBEJS_API_SECRET || 'secret', {
          expiresIn: '10day'
        });

        return res.send({
          dashboardToken
        });
      });

      console.log(
        `🚀 Cube.js server is listening on ${port} dbname ${DB_NAME}`
      );
    })
    .catch(e => {
      console.error('Fatal error during server start: ');
      console.error(e.stack || e);
    });
})();
