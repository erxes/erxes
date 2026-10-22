import type { IMessage } from '@/inbox/types/Conversation';

export type MailInternalNotesProps = {
  notes: IMessage[];
  totalCount: number;
  onLoadMore: () => Promise<unknown>;
  loading: boolean;
  error?: string;
  onRetry: () => Promise<unknown>;
};
