import { z } from 'zod';
import { securityAlert } from '~/modules/audit/alerts';
import { defineJob } from '~/modules/jobs/jobs';
import { EMAIL_FAILING_QUEUE } from './transport';

/**
 * Tells the owners in erxes, not by email (it is the email that broke), that
 * the organisation's server stopped taking its emails (`markFailing`).
 */
export const emailFailingJob = defineJob({
  queue: EMAIL_FAILING_QUEUE,
  timeoutSeconds: 60,
  payload: z.object({ failure: z.string() }),
  atomic: true,
  async handle(job, tx) {
    await securityAlert(tx, {
      key: 'email-sending-failing',
      title: 'Your emails can’t be sent',
      body: `The mail server answered: ${job.payload.failure}. Invitations, password resets, notifications and broadcasts wait until the settings are fixed.`,
      link: '/settings/email?tab=settings',
    });
  },
});
