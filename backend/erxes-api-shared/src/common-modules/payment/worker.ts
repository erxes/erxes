import {
  createMQWorkerWithListeners,
  initializePluginConfig,
  redis
} from '../../utils';

/** The api half: tells service discovery which payment methods the plugin handles. */
export const registerPayments = async (pluginName: string, config: any) =>
  initializePluginConfig(pluginName, 'payments', config);

/** The worker half: consumes the plugin's payments queue. */
export const startPaymentsWorker = (pluginName: string, config: any) =>
  new Promise<void>((resolve, reject) => {
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

/** Both halves in one process. */
export const startPayments = async (pluginName: string, config: any) => {
  await registerPayments(pluginName, config);
  await startPaymentsWorker(pluginName, config);
};
