import type { MailRecipientsResult } from '@/integrations/mail/composer/types/directMailComposer';
import type { QueryResult } from '@apollo/client';
import type { RefObject } from 'react';

export interface RecipientSuggestions {
  options: { email: string; customerId: string; name: string }[];
  showSuggestions: boolean;
  loading: boolean;
  error: QueryResult<MailRecipientsResult>['error'];
  refetch: QueryResult<MailRecipientsResult>['refetch'];
  loadMoreError: boolean;
  loadingMore: boolean;
  hasNextPage: boolean;
  listRef: RefObject<HTMLDivElement>;
  sentinelRef: RefObject<HTMLDivElement>;
  retryLoadMore: () => void;
}
