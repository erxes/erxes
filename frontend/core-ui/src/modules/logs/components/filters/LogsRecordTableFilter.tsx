import { Combobox, Filter, useMultiQueryState } from 'erxes-ui';
import { LogRecordTableFilterBars } from './LogRecordTableFilterBars';
import { LogRecordTableFilterDialogs } from './LogRecordTableFilterDialogs';
import { LogRecordTableFilterMenu } from './LogRecordTableFilterMenu';
import { LogRecordTableFilterViews } from './LogRecordTableFilterViews';
import { LOGS_CURSOR_SESSION_KEY } from '@/logs/constants/logFilter';

export const LogsRecordTableFilter = () => {
  const [queries] = useMultiQueryState<{
    status: string[];
    source: string;
    action: string;
    userIds: string[];
    createdAt: string;
  }>(['status', 'source', 'action', 'userIds', 'createdAt']);

  const hasFilters = Object.values(queries || {}).some(
    (value) => value !== null,
  );

  return (
    <Filter id="customers-filter" sessionKey={LOGS_CURSOR_SESSION_KEY}>
      <Filter.Popover scope={'logs_page'}>
        <Filter.Trigger isFiltered={hasFilters} />
        <Combobox.Content>
          <LogRecordTableFilterMenu />
          <LogRecordTableFilterViews />
        </Combobox.Content>
      </Filter.Popover>
      <LogRecordTableFilterDialogs />
      <LogRecordTableFilterBars />
    </Filter>
  );
};
