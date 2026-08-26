export const MAIL_MESSAGE_TYPES = {
  INBOX: 'INBOX',
  SENT: 'SENT',
} as const;

export const MAIL_DELIVERY_STATUSES = {
  PENDING: 'pending',
  SENT: 'sent',
  BOUNCED: 'bounced',
  FAILED: 'failed',
} as const;

export const MAIL_HEALTH_STATUSES = {
  HEALTHY: 'healthy',
  UNHEALTHY: 'unHealthy',
} as const;

export const MAIL_SIGNATURE_HEADER = 'x-erxes-signature';

export const MAIL_TIMESTAMP_HEADER = 'x-erxes-timestamp';

export const MAIL_CLOUDFLARE_STATUSES = {
  PENDING: 'pending',
  CONNECTED: 'connected',
  ERROR: 'error',
} as const;

export const MAIL_PROVISION_STEPS = [
  'verifyToken',
  'resolveAccount',
  'checkZone',
  'enableEmailRouting',
  'ensureBucket',
  'ensureLifecycle',
  'ensureQueues',
  'uploadScript',
  'putSecret',
  'enableWorkersDev',
  'attachConsumer',
  'setCatchAll',
  'enableEmailSending',
  'checkSendingDns',
] as const;

export const MAIL_OPTIONAL_PROVISION_STEPS = [
  'enableEmailSending',
  'checkSendingDns',
] as const;

export const MAIL_WORKER_NAME = 'erxes-mail';

export const MAIL_BUCKET_NAME = 'erxes-mail-inbound';

export const MAIL_QUEUE_NAME = 'erxes-mail-inbound';

export const MAIL_DLQ_NAME = 'erxes-mail-dlq';

export const MAIL_RETENTION_DAYS = 14;

export const MAIL_SEND_MAX_BYTES = 5 * 1024 * 1024;

export const MAIL_SEND_MAX_RECIPIENTS = 50;

export const MAIL_SEND_MAX_HEADER_BYTES = 16 * 1024;

export const MAIL_SEND_MAX_SUBJECT_LENGTH = 998;

export const MAIL_SENDING_STATUSES = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  FAILED: 'failed',
} as const;

export const MAIL_SENDING_PROVIDERS = ['SES', 'sendgrid'] as const;

export const MAIL_SENDING_ENV_PREFIX = 'MAIL_SENDING_';

export const MAIL_SENDING_PROOF_HOST = '_erxes-verify';

export const MAIL_SENDING_PROOF_PREFIX = 'erxes-verification=';

export const MAIL_SENDING_PROOF_LENGTH = 32;
