export interface ForwardableEmailMessage {
  readonly from: string;
  readonly to: string;
  readonly raw: ReadableStream<Uint8Array>;
  readonly rawSize: number;
  setReject(reason: string): void;
}

export interface QueuedMail {
  id: string;
  tenant: string;
  to: string;
  messageId: string;
}

export interface DeadLetteredMail extends QueuedMail {
  status?: number;
  error?: string;
}

export interface TenantRoute {
  endpoint: string;
  secret?: string;
}

export interface DeliveryReceipt {
  keepStored?: boolean;
}

export interface Env {
  ERXES_ENDPOINT: string;
  ERXES_ENDPOINT_TEMPLATE: string;
  DEFAULT_TENANT: string;
  ATTACHMENT_BASE_URL: string;
  WEBHOOK_SECRET: string;
  MAIL_QUEUE: Queue<QueuedMail>;
  MAIL_DLQ: Queue<DeadLetteredMail>;
  MAIL_STORE: R2Bucket;
  MAIL_ROUTES?: KVNamespace;
}

export interface InboundAddress {
  name?: string;
  address?: string;
}

export interface ParsedAttachment {
  filename: string;
  mimeType?: string;
  contentId?: string;
  disposition?: string;
  bytes: Uint8Array;
}

export interface PayloadAttachment {
  filename: string;
  mimeType?: string;
  contentId?: string;
  disposition?: string;
  size: number;
  url?: string;
}

export interface InboundPayload {
  to: string;
  messageId: string;
  envelopeFrom: string;
  inReplyTo?: string;
  references: string[];
  from: InboundAddress;
  recipients: InboundAddress[];
  cc: InboundAddress[];
  bcc: InboundAddress[];
  subject?: string;
  html: string;
  receivedAt: string;
  headers: Record<string, string>;
  attachments: PayloadAttachment[];
}
