export type TEmailHandoffStatus = 'queued' | 'sent' | 'failed';

export type TEmailDeliveryStatus =
  | 'delivered'
  | 'opened'
  | 'clicked'
  | 'bounced'
  | 'complained'
  | 'dropped';

export interface IEmailDeliveryRow {
  _id: string;
  createdAt: string;
  from?: string;
  toEmails: string[];
  subject?: string;
  provider: string;
  status: TEmailHandoffStatus;
  deliveryStatus?: TEmailDeliveryStatus;
  source?: string;
  error?: string;
}

export interface IEmailDelivery extends IEmailDeliveryRow {
  updatedAt?: string;
  ccEmails?: string[];
  messageId?: string;
  providerResponse?: string;
  sentAt?: string;
  rejected?: string[];
  sourceId?: string;
  userId?: string;
  deliveryStatusAt?: string;
  bounced?: string[];
  complained?: string[];
  opened?: string[];
  clicked?: string[];
}
