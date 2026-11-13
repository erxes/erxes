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

export const smsJob = defineJob({
  queue: 'sms.send',
  leaseSeconds: 60,
  payload: SmsPayload,
  async handle(job) {
    await DRIVERS[config.sms.driver](job.payload);
  },
  async onDead(job, error) {
    log.error({ job: job.id, err: error }, 'sms could not be sent');
  },
});

/** Queues a text message in the caller's transaction; the `sms.send` job delivers it. */
export const sendSms = (client: Db, orgId: string, message: SmsPayload) =>
  smsJob.enqueue(client, { orgId, payload: message, maxAttempts: 4 });
