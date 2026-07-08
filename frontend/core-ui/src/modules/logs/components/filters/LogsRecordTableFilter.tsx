import { Filter } from 'erxes-ui';

import { LOGS_CURSOR_SESSION_KEY } from '@/logs/constants/logFilter';
import { LogsFilterBar } from './LogsFilterBar';
import { LogsFilterPopover } from './LogsFilterPopover';

export const LogsRecordTableFilter = () => {
  return (
    <Filter id="logs-filter" sessionKey={LOGS_CURSOR_SESSION_KEY}>
      <Filter.Bar>
        <LogsFilterPopover />
        <LogsFilterBar />
      </Filter.Bar>
    </Filter>
  );
};
