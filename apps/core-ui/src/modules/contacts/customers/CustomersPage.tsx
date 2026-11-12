import type { CustomerState } from '@erxes/core-contract';
import { PageContainer, PageSubHeader, useQueryState } from 'erxes-ui';
import { LeadsBoard } from '~/modules/leads/LeadsBoard';
import { LeadStageTabs } from '~/modules/leads/LeadStageTabs';
import { CustomersFilter } from './CustomersFilter';
import { CustomersHeader } from './CustomersHeader';
import { CustomersRecordTable } from './CustomersRecordTable';

/**
 * Contacts › Customers (or Leads): old core-ui CustomersIndexPage. A customer
 * opens in the side panel beside the list. Leads also have stage tabs, and a
 * board (`?view=board`) with a column per stage.
 */
export const CustomersPage = ({ state }: { state: CustomerState }) => {
  const [view] = useQueryState<string>('view');
  const board = state === 'lead' && view === 'board';

  return (
    <PageContainer>
      <CustomersHeader state={state} />
      <PageSubHeader>
        <CustomersFilter state={state} />
      </PageSubHeader>
      {state === 'lead' && !board && <LeadStageTabs />}
      {board ? <LeadsBoard /> : <CustomersRecordTable state={state} />}
    </PageContainer>
  );
};
