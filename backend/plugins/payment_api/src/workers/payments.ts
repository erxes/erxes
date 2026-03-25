import { createMQWorkerWithListeners, redis } from 'erxes-api-shared/utils';
import { handlePaymentCallback } from '../handlers/paymentCallback';

export const initPaymentsWorker = () => {
  createMQWorkerWithListeners(
    'payment',
    'payments',
    async (job) => {
      const { subdomain, data } = job.data;
      try {
        await handlePaymentCallback(subdomain, data);
      } catch (error) {
        throw error; // so BullMQ can retry if needed
      }
    },
    redis,
    () => console.info('[Worker] payments-payments queue ready'),
  );
};
