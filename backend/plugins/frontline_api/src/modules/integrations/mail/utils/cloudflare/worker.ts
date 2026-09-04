import {
  WORKER_SCRIPT_BASE64,
  WORKER_SCRIPT_VERSION,
} from '@/integrations/mail/worker/bundle.generated';

interface IWorkerBindingsInput {
  endpoint: string;
  tenant: string;
  workerOrigin: string;
  bucketName: string;
  queueName: string;
  dlqName: string;
}

const COMPATIBILITY_DATE = '2026-07-01';

export const workerScript = () =>
  Buffer.from(WORKER_SCRIPT_BASE64, 'base64').toString('utf8');

export const workerScriptVersion = () => WORKER_SCRIPT_VERSION;

export const buildScriptMetadata = (input: IWorkerBindingsInput) => ({
  main_module: 'index.js',
  compatibility_date: COMPATIBILITY_DATE,
  compatibility_flags: ['nodejs_compat'],
  bindings: [
    { type: 'plain_text', name: 'ERXES_ENDPOINT', text: input.endpoint },
    { type: 'plain_text', name: 'ERXES_ENDPOINT_TEMPLATE', text: '' },
    { type: 'plain_text', name: 'DEFAULT_TENANT', text: input.tenant },
    {
      type: 'plain_text',
      name: 'ATTACHMENT_BASE_URL',
      text: input.workerOrigin,
    },
    { type: 'r2_bucket', name: 'MAIL_STORE', bucket_name: input.bucketName },
    { type: 'queue', name: 'MAIL_QUEUE', queue_name: input.queueName },
    { type: 'queue', name: 'MAIL_DLQ', queue_name: input.dlqName },
  ],
});
