import { Filter } from 'erxes-ui';
import { useMSDynamicSessionKey } from '../../hooks/useMSDynamicSessionKey';
import { MSDynamicSyncHistoryFilterBar } from './MSDynamicSyncHistoryFilterBar';

export const MSDynamicSyncHistoryFilter = () => {
  const { sessionKey } = useMSDynamicSessionKey('syncHistory');

  return (
    <Filter id="ms-dynamic-sync-history-filter" sessionKey={sessionKey}>
      <MSDynamicSyncHistoryFilterBar />
    </Filter>
  );
};
