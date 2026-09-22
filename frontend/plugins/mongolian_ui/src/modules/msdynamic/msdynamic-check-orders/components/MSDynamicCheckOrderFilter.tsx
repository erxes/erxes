import { Filter } from 'erxes-ui';
import { useMSDynamicSessionKey } from '../../hooks/useMSDynamicSessionKey';
import { MSDynamicCheckOrderFilterBar } from './MSDynamicCheckOrderFilterBar';

/** Check order filter wrapper hiine. */
export const MSDynamicCheckOrderFilter = () => {
  const { sessionKey } = useMSDynamicSessionKey('syncedOrders');

  return (
    <Filter id="ms-dynamic-check-orders-filter" sessionKey={sessionKey}>
      <MSDynamicCheckOrderFilterBar />
    </Filter>
  );
};
