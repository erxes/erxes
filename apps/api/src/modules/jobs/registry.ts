import { MAINTENANCE } from '~/lib/maintenance';
import { auditStreamJob, auditStreamsSchedule } from '~/modules/audit/streamDelivery';
import { advanceJob, callJob } from '~/modules/automations/engine';
import { fireJob } from '~/modules/automations/triggers';
import { emailJob } from '~/modules/email/email';
import { CONSUMER_JOBS } from '~/modules/events/consumers';
import { exampleDataJob } from '~/modules/organizations/exampleData';
import { paymentCheckJob } from '~/modules/payments/invoiceState';
import { pluginEventJob } from '~/modules/plugins/pluginEvents';
import { smsJob } from '~/modules/sms/sms';
import { exportRunJob } from '~/modules/transfer/exports.service';
import { importCheckJob, importRunJob, importUndoJob } from '~/modules/transfer/importJobs';
import { importParseJob } from '~/modules/transfer/importParse';
import { deliverJob } from '~/modules/webhooks/webhookDelivery';

/** Every queue core runs: its jobs, the event consumers and the schedules. */
export const JOBS = [
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
  ...CONSUMER_JOBS,
  ...MAINTENANCE,
  auditStreamsSchedule,
].flatMap((definition) => definition.queues);
