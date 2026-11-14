import type { CustomerState } from '@erxes/core-contract';
import { LeadDisplayMenu } from '~/modules/leads/LeadDisplayMenu';
import { ListFilter } from '~/modules/views/filter/ListFilter';
import { useContactOptionLabel } from '../components/contactOptionLabel';
import { customersSessionKey, useCustomers } from './useCustomers';

/** People (customers or leads) filter by any field, property, their company or activity (`F`). */
export const CustomersFilter = ({ state }: { state: CustomerState }) => {
  const optionLabel = useContactOptionLabel();
  const { totalCount, totalCapped } = useCustomers(state);

  return (
    <ListFilter
      recordType={state}
      sessionKey={customersSessionKey(state)}
      optionLabel={optionLabel}
      totalCount={totalCount}
      totalCapped={totalCapped}
    >
      {state === 'lead' && <LeadDisplayMenu />}
    </ListFilter>
  );
};
