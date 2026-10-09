import { Skeleton } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';
import {
  ticketTotalCountBoardAtom,
  ticketTotalCountAtom,
} from '@/ticket/states/ticketsTotalCountState';
import { ticketViewAtom } from '@/ticket/states/ticketViewState';

export const TicketsTotalCount = () => {
  const totalCount = useAtomValue(ticketTotalCountAtom);
  const ticketCountByBoard = useAtomValue(ticketTotalCountBoardAtom);
  const view = useAtomValue(ticketViewAtom);

  const totalCountToShow = view === 'list' ? totalCount : ticketCountByBoard;

  return <TicketsTotalCountContent totalCount={totalCountToShow} />;
};

export const TicketsTotalCountContent = ({
  totalCount,
}: {
  totalCount?: number | null;
}) => {
  const { t } = useTranslation('frontline');
  return (
    <div className="text-muted-foreground font-medium text-sm whitespace-nowrap h-7 leading-7">
      {totalCount === null || totalCount === undefined ? (
        <Skeleton className="w-20 h-4 inline-block mt-1.5" />
      ) : (
        t('records-found', '{{count}} records found', {
          count: totalCount,
        })
      )}
    </div>
  );
};
