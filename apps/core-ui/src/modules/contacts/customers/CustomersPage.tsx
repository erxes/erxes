import type { CustomerState } from '@erxes/core-contract';
import { PageContainer, PageSubHeader } from 'erxes-ui';
import { CustomersFilter } from './CustomersFilter';
import { CustomersHeader } from './CustomersHeader';
import { CustomersRecordTable } from './CustomersRecordTable';

/**
 * Contacts › Customers (or Leads): old core-ui CustomersIndexPage. A customer
 * opens in the side panel beside the list.
 */
export const CustomersPage = ({ state }: { state: CustomerState }) => (
  <PageContainer>
    <CustomersHeader state={state} />
    <PageSubHeader>
      <CustomersFilter state={state} />
    </PageSubHeader>
    <CustomersRecordTable state={state} />
  </PageContainer>
);
