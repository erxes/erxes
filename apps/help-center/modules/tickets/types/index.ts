import type { MessageKey, Translate } from '@/modules/i18n/translate';

export type TicketStatusRef = {
  _id: string;
  name: string | null;
  color: string | null;
  type: number | null;
} | null;

export type Ticket = {
  _id: string;
  number: string | null;
  name: string | null;
  description: string | null;
  priority: number | null;
  createdAt: string | null;
  updatedAt: string | null;
  statusChangedDate: string | null;
  status: TicketStatusRef;
};

export type TicketNote = {
  _id: string;
  content: string | null;
  createdAt: string | null;
  createdBy: string | null;
};

const PRIORITY_KEYS: Record<number, MessageKey> = {
  4: 'priority.urgent',
  3: 'priority.high',
  2: 'priority.medium',
  1: 'priority.low',
};

export const priorityLabel = (priority: number | null, t: Translate): string =>
  t(PRIORITY_KEYS[priority ?? 0] ?? 'priority.unknown');
