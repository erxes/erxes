import { createMQWorkerWithListeners, redis } from 'erxes-api-shared/utils';
import { handlePaymentCallback } from './handlers/paymentCallback';

export const initPaymentsWorker = () => {
  createMQWorkerWithListeners(
    'sales',
    'payments',
    async (job) => {
      const { subdomain, data } = job.data;
      console.log(`[SalesWorker] Received job: ${job.name}`);

      if (job.name === 'paymentCallback' || job.name === 'callback') {
        await handlePaymentCallback(subdomain, data);
      } else {
        console.log(`[SalesWorker] Unhandled job name: ${job.name}`);
      }
    },
    redis,
    () => console.log('[Worker] Sales worker for queue payments is ready'),
  );
};