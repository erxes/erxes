import { PageContainer } from 'erxes-ui';
import { BroadcastsCalendar } from './calendar/BroadcastsCalendar';
import { BroadcastsFilter } from './list/BroadcastsFilter';
import { BroadcastsListHeader } from './list/BroadcastsListHeader';
import { BroadcastsRecordTable } from './list/BroadcastsRecordTable';
import { useBroadcastsDisplay } from './list/useBroadcastsList';

/** Broadcasts: what went or goes to whom and how it did, as a table or on a calendar. */
export const BroadcastsListPage = () => {
  const { display } = useBroadcastsDisplay();

  return (
    <PageContainer>
      <BroadcastsListHeader />
      <BroadcastsFilter />
      {display === 'calendar' ? <BroadcastsCalendar /> : <BroadcastsRecordTable />}
    </PageContainer>
  );
};
