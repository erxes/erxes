import { IconHash } from '@tabler/icons-react';
import { Filter, useFilterQueryState } from 'erxes-ui';
import { AccountingCheckSyncedOrderRuleSelect } from './AccountingCheckSyncedOrderRuleSelect';
import { AccountingCheckSyncedOrdersTotalCount } from './AccountingCheckSyncedOrdersTotalCount';

export const AccountingCheckSyncedOrdersFilter = () => {
  const [number] = useFilterQueryState<string>('number');

  return (
    <Filter id="accounting-check-synced-orders-filter">
      <Filter.Bar>
        <AccountingCheckSyncedOrderRuleSelect />
        <Filter.BarItem queryKey="number">
          <Filter.BarName>
            <IconHash />
            Number
          </Filter.BarName>
          <Filter.BarButton filterKey="number" inDialog>
            {number}
          </Filter.BarButton>
        </Filter.BarItem>
        <AccountingCheckSyncedOrdersTotalCount />
      </Filter.Bar>
      <Filter.Dialog>
        <Filter.View filterKey="number" inDialog>
          <Filter.DialogStringView filterKey="number" />
        </Filter.View>
      </Filter.Dialog>
    </Filter>
  );
};
