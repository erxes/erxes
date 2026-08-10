import { useRemoveTicketsFromView } from '@/ticket/hooks/useRemoveTicketsFromView';
import {
  TBulkUpdateResult,
  useBulkUpdateTickets,
} from '@/ticket/hooks/useBulkUpdateTickets';
import { useQueryState } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export type TToggleArchiveOptions = {
  /** Called with the tickets that failed, so callers roll back only those. */
  onError?: (failedIds: string[]) => void;
};

export type TUseToggleTicketArchive = {
  toggleArchive: (
    ticketIds: string[],
    archived: boolean,
    options?: TToggleArchiveOptions,
  ) => Promise<TBulkUpdateResult>;
};

export const useToggleTicketArchive = (): TUseToggleTicketArchive => {
  const { t } = useTranslation('frontline');
  const { bulkUpdateTickets } = useBulkUpdateTickets();
  const { removeTicketsFromView } = useRemoveTicketsFromView();
  const [stateFilter] = useQueryState<string>('state');

  const toggleArchive = async (
    ticketIds: string[],
    archived: boolean,
    options?: TToggleArchiveOptions,
  ) => {
    const nextState = archived ? 'active' : 'archived';

    const result = await bulkUpdateTickets(
      ticketIds,
      { state: nextState },
      {
        refetchList: true,
        onError: options?.onError,
        successMessage: archived
          ? t('ticket-restored-successfully')
          : t('ticket-archived-successfully'),
      },
    );

    if (
      result.succeededIds.length > 0 &&
      nextState !== (stateFilter || 'active')
    ) {
      removeTicketsFromView(result.succeededIds);
    }

    return result;
  };

  return { toggleArchive };
};
