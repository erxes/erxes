import dotenv from 'dotenv';
import path from "path";
import fs from "fs";
import Downloader from "nodejs-file-downloader";
import redis, { getService, getServices } from "../../redis";

const { NODE_ENV } = process.env;

export default async function downloadPlugins(): Promise<void> {
  const directory = path.join(__dirname, "./downloads");

  if (!fs.existsSync(directory)) {
    await fs.promises.mkdir(directory, { recursive: true });
  }

  await clearDirectory(directory);

  const serviceNames = await getServices();

  const allServices: any[] = await Promise.all(
    serviceNames.map( async (serviceName) => {
        const service: any = await getService(serviceName, true)
        service.name = serviceName
        return service;
    })
  );

  const services = allServices.filter(service => service.meta.hasSubscriptions);

  if(NODE_ENV !== 'development') {
    try {
      await redis.disconnect();
    } catch (e) {}
  }

  await Promise.all(
    services.map(async (service, i) => {
      const url =`${service.address}/subscriptionPlugin.ts`;
      const fileName = `${service.name}.ts`;
      const downloader = new Downloader({
        url ,
        directory,
        cloneFiles: false,
        fileName,
      });
      try {
        await downloader.download();
        console.log(`${service.name} subscription plugin downloaded from ${url} to ${fileName}.`);
      } catch (e) {
        console.error(`${service.name} subscription plugin download from ${url} to ${fileName} failed.`, e);
      }
    })
  );
}

async function clearDirectory(directory: string) {
  const files = await fs.promises.readdir(directory);
  const unlinkPromises = files.map((file) =>
    fs.promises.unlink(`${directory}/${file}`)
  );
  await Promise.all(unlinkPromises);
}
