import type { Db } from '@erxes/core-db';
import { z } from 'zod';
import { config } from '~/config';
import { logger } from '~/logger';
import { defineJob } from '~/modules/jobs/jobs';

const log = logger.child({ component: 'sms' });

const SmsPayload = z.object({ to: z.string(), text: z.string() });

type SmsPayload = z.infer<typeof SmsPayload>;

/** Sent messages while `SMS_DRIVER=log` (development, tests). */
export const loggedSms: SmsPayload[] = [];

/** A driver sends one message or throws (the job retries). */
const DRIVERS: Record<typeof config.sms.driver, (message: SmsPayload) => Promise<void>> = {
  async log(message) {
    loggedSms.push(message);

    if (loggedSms.length > 100) loggedSms.shift();
    log.info(message, 'sms (not sent: SMS_DRIVER=log)');
  },
};

/** Sends one text message now, or throws. */
export const deliverSms = (message: SmsPayload) => DRIVERS[config.sms.driver](message);

export const smsJob = defineJob({
  queue: 'sms.send',
  timeoutSeconds: 60,
  retry: { attempts: 4 },
  payload: SmsPayload,
  async handle(job) {
    await deliverSms(job.payload);
  },
});

/** Queues text messages in the caller's transaction; the `sms.send` job delivers each. */
export const sendSms = (client: Db, orgId: string, message: SmsPayload | SmsPayload[]) =>
  smsJob.enqueueAll(
    client,
    (Array.isArray(message) ? message : [message]).map((payload) => ({ orgId, payload })),
  );
