import { advanceJob } from '~/modules/automations/engine';
import { fireJob } from '~/modules/automations/triggers';
import { emailJob } from '~/modules/email/email';
import { paymentCheckJob } from '~/modules/payments/payments.service';
import { pluginEventJob } from '~/modules/plugins/pluginEvents';
import { auditStreamJob } from '~/modules/audit/streams';
import { exportRunJob } from '~/modules/transfer/exports.service';
import { importCheckJob, importParseJob, importRunJob, importUndoJob } from '~/modules/transfer/imports.service';
import { deliverJob } from '~/modules/webhooks/webhooks.service';
import { exampleDataJob } from '~/modules/organizations/exampleData';
import type { JobDefinition } from './jobs';

/** Every kind of background job the worker runs. */
export const JOBS: JobDefinition[] = [deliverJob, advanceJob, fireJob, emailJob, paymentCheckJob, pluginEventJob, auditStreamJob, importParseJob, importCheckJob, importRunJob, importUndoJob, exportRunJob, exampleDataJob];
