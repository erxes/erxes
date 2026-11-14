import type { CustomerState } from '@erxes/core-contract';
import { CursorRecordTable } from '~/components/CursorRecordTable';
import { stickyWithStage } from '~/modules/leads/leadColumns';
import { CustomersCommandBar } from './CustomersCommandBar';
import { useCustomersColumns } from './customersColumns';
import { useCustomers } from './useCustomers';

export const CustomersRecordTable = ({ state }: { state: CustomerState }) => {
  const cursor = useCustomers(state);

  return (
    <CursorRecordTable
      cursor={cursor}
      columns={useCustomersColumns(state)}
      stickyColumns={stickyWithStage(['more', 'checkbox', 'avatar', 'name'], state === 'lead')}
      tableId={state === 'lead' ? 'leads_record_table' : 'customers_record_table'}
    >
      <CustomersCommandBar rows={cursor.list} />
    </CursorRecordTable>
  );
};
