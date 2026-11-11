import { advanceJob } from '~/modules/automations/engine';
import { emailJob } from '~/modules/email/email';
import { paymentCheckJob } from '~/modules/payments/payments.service';
import { deliverJob } from '~/modules/webhooks/webhooks.service';
import type { JobDefinition } from './jobs';

/** Every kind of background job the worker runs. */
export const JOBS: JobDefinition[] = [deliverJob, advanceJob, emailJob, paymentCheckJob];
