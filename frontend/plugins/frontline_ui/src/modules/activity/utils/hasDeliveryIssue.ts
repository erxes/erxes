import type { ITicketNoteMailDelivery } from '@/activity/types';

export const hasDeliveryIssue = (delivery?: ITicketNoteMailDelivery | null) =>
  delivery?.status === 'failed' || delivery?.status === 'bounced';
