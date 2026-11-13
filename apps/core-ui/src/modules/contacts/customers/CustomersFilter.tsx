import type { CustomerState } from '@erxes/core-contract';
import { LeadDisplayMenu } from '~/modules/leads/LeadDisplayMenu';
import { ListFilter } from '~/modules/views/filter/ListFilter';
import { RecordCount } from '~/modules/views/filter/RecordCount';
import { useContactOptionLabel } from '../components/contactOptionLabel';
import { customersSessionKey, useCustomers } from './useCustomers';

const CustomerTotalCount = ({ state }: { state: CustomerState }) => {
  const { totalCount, totalCapped } = useCustomers(state);

  return <RecordCount totalCount={totalCount} totalCapped={totalCapped} />;
};

/** People (customers or leads) filter by any field, property, their company or activity (`F`). */
export const CustomersFilter = ({ state }: { state: CustomerState }) => {
  const optionLabel = useContactOptionLabel();

  return (
    <ListFilter
      recordType={state}
      sessionKey={customersSessionKey(state)}
      optionLabel={optionLabel}
    >
      <CustomerTotalCount state={state} />
      {state === 'lead' && <LeadDisplayMenu />}
    </ListFilter>
  );
};
