/** Shapes returned by the Frontline `cp*` ticket queries. */

export type TicketStatusRef = {
  _id: string;
  name: string | null;
  color: string | null;
  /** Pipeline status type — 3 marks a resolved/closed column. */
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

export const ticketPriorities = [4, 3, 2, 1] as const;

export type TicketPriority = (typeof ticketPriorities)[number];

export const priorityLabels: Record<number, string> = {
  4: 'Яаралтай',
  3: 'Өндөр',
  2: 'Дунд',
  1: 'Бага',
};

export const priorityLabel = (priority: number | null): string =>
  priorityLabels[priority ?? 0] ?? 'Тодорхойгүй';
