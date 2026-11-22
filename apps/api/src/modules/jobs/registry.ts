import { MAINTENANCE } from '~/lib/maintenance';
import { auditStreamJob, auditStreamsSchedule } from '~/modules/audit/streamDelivery';
import { pollSchedule } from '~/modules/integrations/polls';
import { APP_WIDE_JOBS } from '~/modules/integrations/appWideEvents';
import { subscriptionSync } from '~/modules/integrations/subscriptionSync';
import { resealSchedule } from '~/modules/secrets/vault';
import { advanceJob, callJob } from '~/modules/automations/engine';
import { broadcastRepeat } from '~/modules/broadcasts/repeating';
import { BROADCAST_JOBS } from '~/modules/broadcasts/starting';
import { fireJob } from '~/modules/automations/triggers';
import { ebarimtSyncJob } from '~/modules/ebarimt/sync';
import { emailJob } from '~/modules/email/email';
import { rampSchedule } from '~/modules/email/rampEvaluation';
import { rampNoticeJob } from '~/modules/email/rampNotices';
import { cloudflareMoveJob } from '~/modules/files/cloudflareMove';
import { CONSUMER_JOBS } from '~/modules/events/consumers';
import { exampleDataJob } from '~/modules/organizations/exampleData';
import { paymentCheckJob } from '~/modules/payments/invoiceState';
import { pluginEventJob } from '~/modules/plugins/pluginEvents';
import { pluginJob, pluginJobSchedules } from '~/modules/plugins/pluginJobs';
import { smsJob } from '~/modules/sms/sms';
import { exportRunJob } from '~/modules/transfer/exports.service';
import { importCheckJob, importRunJob, importUndoJob } from '~/modules/transfer/importJobs';
import { importParseJob } from '~/modules/transfer/importParse';
import { pluginImportCheckJob, pluginImportRunJob } from '~/modules/transfer/pluginImport';
import { deliverJob } from '~/modules/webhooks/webhookDelivery';

/** Every queue core runs: its jobs, the event consumers and the schedules. */
export const JOBS = [
  deliverJob,
  advanceJob,
  callJob,
  fireJob,
  emailJob,
  rampSchedule,
  rampNoticeJob,
  smsJob,
  paymentCheckJob,
  ebarimtSyncJob,
  pluginEventJob,
  pluginJob,
  pluginJobSchedules,
  auditStreamJob,
  importParseJob,
  importCheckJob,
  importRunJob,
  importUndoJob,
  pluginImportCheckJob,
  pluginImportRunJob,
  exportRunJob,
  exampleDataJob,
  cloudflareMoveJob,
  ...BROADCAST_JOBS,
  broadcastRepeat,
  ...CONSUMER_JOBS,
  ...MAINTENANCE,
  auditStreamsSchedule,
  resealSchedule,
  subscriptionSync,
  ...APP_WIDE_JOBS,
  pollSchedule,
].flatMap((definition) => definition.queues);
