import { createMQWorkerWithListeners } from 'erxes-api-shared/utils';
import { redis } from 'erxes-api-shared/utils/redis';
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
  () => console.log('[Worker] Worker for queue payments-payments is ready')
);
};