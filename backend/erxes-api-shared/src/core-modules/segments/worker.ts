import {
  createMQWorkerWithListeners,
  initializePluginConfig,
  keyForConfig,
  redis,
} from '../../utils';
import { SegmentConfigs } from './types';

export const startSegments = (pluginName: string, config: SegmentConfigs) => {
  return new Promise<void>((resolve, reject) => {
    try {
      createMQWorkerWithListeners(
        pluginName,
        'segments',
        async ({ name, id, data: jobData }) => {
          try {
            const { subdomain, data } = jobData;

            if (!subdomain) {
              throw new Error('You should provide subdomain on message');
            }

            const resolverName = name as keyof SegmentConfigs;

            if (
              !(name in config) ||
              typeof config[resolverName] !== 'function'
            ) {
              throw new Error(`Segments method ${name} not registered`);
            }

            const resolver = config[resolverName];

            return await resolver({ subdomain }, data);
          } catch (error: any) {
            console.error(`Error processing job ${id}: ${error.message}`);
            throw error;
          }
        },
        redis,
        async () => {
          await initializePluginConfig(pluginName, 'segments', config);

          resolve();
        },
      );
    } catch (error) {
      reject(error);
    }
  });
};
