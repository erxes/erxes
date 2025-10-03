import {
  createMQWorkerWithListeners,
  initializePluginConfig,
  redis
} from '../../utils';
import { AutomationConfigs } from './types';

export const startAutomations = async (
  pluginName: string,
  config: AutomationConfigs,
) => {
  await initializePluginConfig(pluginName, 'automations', config);

  return new Promise<void>((resolve, reject) => {
    try {
      createMQWorkerWithListeners(
        pluginName,
        'automations',
        async ({ name, id, data: jobData }) => {
          try {
            const { subdomain, data } = jobData;

            if (!subdomain) {
              throw new Error('You should provide subdomain on message');
            }

            const resolverName = name as keyof AutomationConfigs;

            if (
              !(name in config) ||
              typeof config[resolverName] !== 'function'
            ) {
              throw new Error(`Automations method ${name} not registered`);
            }

            const resolver = config[resolverName];

            return await resolver({ subdomain }, data);
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
