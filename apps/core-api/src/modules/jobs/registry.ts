import { advanceJob, callJob } from '~/modules/automations/engine';
import { fireJob } from '~/modules/automations/triggers';
import { emailJob } from '~/modules/email/email';
import { paymentCheckJob } from '~/modules/payments/invoiceState';
import { pluginEventJob } from '~/modules/plugins/pluginEvents';
import { auditStreamJob } from '~/modules/audit/streamDelivery';
import { exportRunJob } from '~/modules/transfer/exports.service';
import { importCheckJob, importRunJob, importUndoJob } from '~/modules/transfer/importJobs';
import { importParseJob } from '~/modules/transfer/importParse';
import { deliverJob } from '~/modules/webhooks/webhookDelivery';
import { exampleDataJob } from '~/modules/organizations/exampleData';
import { smsJob } from '~/modules/sms/sms';
import type { JobDefinition } from './jobs';

/** Every kind of background job the worker runs. */
export const JOBS: JobDefinition[] = [
  deliverJob,
  advanceJob,
  callJob,
  fireJob,
  emailJob,
  smsJob,
  paymentCheckJob,
  pluginEventJob,
  auditStreamJob,
  importParseJob,
  importCheckJob,
  importRunJob,
  importUndoJob,
  exportRunJob,
  exampleDataJob,
];
