import { useRemoveTicketsFromView } from '@/ticket/hooks/useRemoveTicketsFromView';
import { useBulkUpdateTickets } from '@/ticket/hooks/useBulkUpdateTickets';
import { useQueryState } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export type TToggleArchiveOptions = {
  /** Called when at least one ticket failed, so callers can roll back. */
  onError?: () => void;
};

export type TUseToggleTicketArchive = {
  toggleArchive: (
    ticketIds: string[],
    archived: boolean,
    options?: TToggleArchiveOptions,
  ) => Promise<boolean>;
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

    const succeeded = await bulkUpdateTickets(
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

    if (succeeded && nextState !== (stateFilter || 'active')) {
      removeTicketsFromView(ticketIds);
    }

    return succeeded;
  };

  return { toggleArchive };
};
