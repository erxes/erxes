import { advanceJob } from '~/modules/automations/engine';
import { fireJob } from '~/modules/automations/triggers';
import { emailJob } from '~/modules/email/email';
import { paymentCheckJob } from '~/modules/payments/payments.service';
import { pluginEventJob } from '~/modules/plugins/pluginEvents';
import { auditStreamJob } from '~/modules/audit/streams';
import { deliverJob } from '~/modules/webhooks/webhooks.service';
import type { JobDefinition } from './jobs';

/** Every kind of background job the worker runs. */
export const JOBS: JobDefinition[] = [deliverJob, advanceJob, fireJob, emailJob, paymentCheckJob, pluginEventJob, auditStreamJob];
