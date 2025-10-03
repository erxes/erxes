import {
  createMQWorkerWithListeners,
  initializePluginConfig,
  redis
} from '../../utils';


export const startPayments = async (
  pluginName: string,
  config: any,
) => {
  await initializePluginConfig(pluginName, 'payments', config);

  return new Promise<void>((resolve, reject) => {
    try {
      createMQWorkerWithListeners(
        pluginName,
        'payments',
        async ({ name, id, data: jobData }) => {
          try {
            const { subdomain, data } = jobData;

            if (!subdomain) {
              throw new Error('You should provide subdomain on message');
            }

            const resolverName = name as keyof any;

            if (
              !(name in config) ||
              typeof config[resolverName] !== 'function'
            ) {
              throw new Error(`Payments method ${name} not registered`);
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
