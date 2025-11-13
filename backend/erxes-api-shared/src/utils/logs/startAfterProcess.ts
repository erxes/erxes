import { createMQWorkerWithListeners } from "../mq-worker";
import { initializePluginConfig } from "../service-discovery";
import { AfterProcessConfigs } from "./logTypes";
import { redis } from "../redis";

export const startAfterProcess = async (
    pluginName: string,
    config: AfterProcessConfigs,
  ) => {
    await initializePluginConfig(pluginName, 'afterProcess', config);
  
    return new Promise<void>((resolve, reject) => {
      try {
        createMQWorkerWithListeners(
          pluginName,
          'afterProcess',
          async ({ name, id, data: jobData }) => {
            try {
              const {
                subdomain,
                data: { processId, ...data },
              } = jobData;
  
              if (!subdomain) {
                throw new Error('You should provide subdomain on message');
              }
  
              const resolverName = name as keyof AfterProcessConfigs;
  
              if (
                !(name in config) ||
                typeof config[resolverName] !== 'function'
              ) {
                throw new Error(`Automations method ${name} not registered`);
              }
  
              const resolver = config[resolverName];
  
              resolver({ subdomain, processId }, data);
            } catch (error: any) {
              console.error(`Error processing job ${id}: ${error.message}`);
              throw error;
            }
          },
          redis,
          () => {
            resolve();
          },
        );
      } catch (error) {
        reject(error);
      }
    });
  };
  