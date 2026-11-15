import type { CustomerState } from '@erxes/core-contract';
import { DisplayMenu } from 'erxes-ui';
import { LEADS_DISPLAY } from '~/modules/leads/LeadsBoard';
import { ListFilter } from '~/modules/views/filter/ListFilter';
import { useContactOptionLabel } from '../components/contactOptionLabel';
import { useCustomers } from './useCustomers';

/** People (customers or leads) filter by any field, property, their company or activity (`F`). */
export const CustomersFilter = ({ state }: { state: CustomerState }) => {
  const optionLabel = useContactOptionLabel();
  const { totalCount, totalCapped } = useCustomers(state);

  return (
    <ListFilter
      recordType={state}
      optionLabel={optionLabel}
      totalCount={totalCount}
      totalCapped={totalCapped}
    >
      {state === 'lead' && <DisplayMenu list={LEADS_DISPLAY} />}
    </ListFilter>
  );
};
