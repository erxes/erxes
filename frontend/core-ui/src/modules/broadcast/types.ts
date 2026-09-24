import type { JSONContent } from 'erxes-ui';
import type { TCampaignLockState } from './utils/campaignActions';
import type { TStoredSchedule } from './utils/scheduleForm';
export enum IBroadcastMethodEnum {
  EMAIL = 'email',
  MESSENGER = 'messenger',
  NOTIFICATION = 'notification',
  WORKFLOW = 'workflow',
}

export type TBroadcastRecipientStatus =
  | 'pending'
  | 'claimed'
  | 'sent'
  | 'skipped'
  | 'failed'
  | 'missing';

/**
 * What the campaign says happened to one person.
 *
 * The manifest and the flow each answer for part of it — the manifest up to
 * dispatch, the flow after — and a reader wants one answer, not two
 * vocabularies. `processing` also covers the moment after dispatch where the
 * flow has not been created yet, so that gap needs no case of its own.
 */
export type TRecipientOutcome =
  | 'queued'
  | 'processing'
  | 'done'
  | 'failed'
  | 'skipped';

/**
 * What the status filter can honestly offer.
 *
 * `done`, `processing` and a flow that failed all share the manifest status
 * `sent` — the difference lives in the execution — so the filter, which reads
 * the manifest, stops where the manifest does.
 */
export const RECIPIENT_FILTER_STATUSES: {
  value: TBroadcastRecipientStatus;
  labelKey: string;
}[] = [
  { value: 'sent', labelKey: 'recipients.status.sent' },
  { value: 'pending', labelKey: 'recipients.status.pending' },
  { value: 'skipped', labelKey: 'recipients.status.skipped' },
  { value: 'failed', labelKey: 'recipients.status.failed' },
  { value: 'missing', labelKey: 'recipients.status.missing' },
];

/**
 * Prefixed because these live in the URL beside the campaign list's own
 * filters: a bare `searchValue` is the one the list behind the sheet reads.
 */
export const RECIPIENT_FILTER_KEYS = {
  status: 'recipientStatus',
  updatedAt: 'recipientUpdatedAt',
  searchValue: 'recipientSearch',
} as const;

export type TRecipientFilterQueries = {
  recipientStatus?: TBroadcastRecipientStatus;
  recipientUpdatedAt?: string;
  recipientSearch?: string;
};

export type TBroadcastAudienceItem = { _id: string; name?: string };

/** A campaign as the detail query reads it back. */
export type TBroadcastMessage = {
  _id: string;
  title?: string;
  kind?: string;
  method?: IBroadcastMethodEnum;
  status?: string;
  isDraft?: boolean;
  isLive?: boolean;
  createdAt?: string;
  targetType?: string;
  targetIds?: string[];
  targetCount?: number;
  totalCustomersCount?: number;
  validCustomersCount?: number;
  runCount?: number;
  lastRunAt?: string;
  nextRunAt?: string;
  fromEmail?: string;
  fromUserId?: string;
  cpId?: string;
  brandId?: string;
  workflowAutomationId?: string;
  stats?: Record<string, number> | null;
  email?: {
    sender?: string;
    subject?: string;
    content?: string;
    contentJson?: JSONContent;
    previewText?: string;
    replyTo?: string;
  } | null;
  notification?: {
    title?: string;
    content?: string;
    inApp?: boolean;
    isMobile?: boolean;
  } | null;
  messenger?: Record<string, unknown> | null;
  scheduleDate?: TStoredSchedule | null;
  approvalLockState?: TCampaignLockState;
  segments?: TBroadcastAudienceItem[];
  customerTags?: TBroadcastAudienceItem[];
};

export type TBroadcastTrace = {
  _id: string;
  type?: string;
  message?: string;
  createdAt: string;
};

export type TBroadcastRun = {
  _id: string;
  runCount: number;
  status: string;
  totalCount: number;
  startedAt?: string;
  finishedAt?: string;
  counts: Record<string, number>;
};

export type TBroadcastRecipient = {
  _id: string;
  status: TBroadcastRecipientStatus;
  execution?: {
    _id: string;
    status: string;
    failedActionType?: string;
  } | null;
  reason?: string;
  attempts?: number;
  finishedAt?: string;
  createdAt?: string;
  customerId: string;
  updatedAt?: string;
  customer?: {
    _id: string;
    firstName?: string;
    lastName?: string;
    primaryEmail?: string;
    primaryPhone?: string;
  } | null;
};
