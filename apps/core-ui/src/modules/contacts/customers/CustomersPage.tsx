import type { CustomerState } from '@erxes/core-contract';
import { PageContainer, PageSubHeader } from 'erxes-ui';
import { LeadsBoard } from '~/modules/leads/LeadsBoard';
import { useLeadView } from '~/modules/leads/leadView';
import { CustomersFilter } from './CustomersFilter';
import { CustomersHeader } from './CustomersHeader';
import { ViewTabs } from '../views/ViewTabs';
import { useLeadsT } from '~/modules/leads/i18n';
import { CustomersRecordTable } from './CustomersRecordTable';

/**
 * Contacts › Customers (or Leads). A customer
 * opens in the side panel beside the list. Leads also have a
 * board (chosen under Display) with a column per stage; the table filters by stage in the filter bar.
 */
export const CustomersPage = ({ state }: { state: CustomerState }) => {
  const [view] = useLeadView();
  const t = useLeadsT();
  const board = state === 'lead' && view === 'board';

  return (
    <PageContainer>
      <CustomersHeader state={state} />
      <ViewTabs
        recordType={state}
        allLabel={state === 'lead' ? t('views.all-leads') : t('views.all-customers')}
      />
      <PageSubHeader>
        <CustomersFilter state={state} />
      </PageSubHeader>
      {board ? <LeadsBoard recordType="customer" /> : <CustomersRecordTable state={state} />}
    </PageContainer>
  );
};
