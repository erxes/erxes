import * as path from 'path';
import * as fs from 'fs';
import { getService, getServices } from '../../redis';
import fetch from 'node-fetch';
import { pipeline } from 'node:stream/promises';

async function downloadFile(url, path): Promise<void> {
  const res = await fetch(url);
  await pipeline(res.body, fs.createWriteStream(path));
}

export default async function downloadPlugins(): Promise<void> {
  const directory = path.join(__dirname, './downloads');

  if (!fs.existsSync(directory)) {
    await fs.promises.mkdir(directory, { recursive: true });
  }

  await clearDirectory(directory);

  const serviceNames = await getServices();

  const allServices: any[] = await Promise.all(
    serviceNames.map(async (serviceName) => {
      const service: any = await getService(serviceName);
      return { ...service, name: serviceName };
    }),
  );

  const services = allServices.filter(
    (service) => service.config && service.config.hasSubscriptions,
  );

  await Promise.all(
    services.map(async (service) => {
      const url = `${service.address}/subscriptionPlugin.js`;
      const target = path.resolve(directory, `${service.name}.js`);
      try {
        await downloadFile(url, target);
        console.log(
          `${service.name} subscription plugin downloaded from ${url} to ${target}.`,
        );
      } catch (e) {
        console.error(
          `${service.name} subscription plugin download from ${url} to ${target} failed. ${e.message}`,
          e,
        );
      }
    }),
  );
}

async function clearDirectory(directory: string) {
  const files = await fs.promises.readdir(directory);
  const unlinkPromises = files.map((file) =>
    fs.promises.unlink(`${directory}/${file}`),
  );
  await Promise.all(unlinkPromises);
}
