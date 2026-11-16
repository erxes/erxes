import type { CustomerState } from '@erxes/core-contract';
import { PageContainer, useListDisplay } from 'erxes-ui';
import { LEADS_DISPLAY, LeadsBoard } from '~/modules/leads/LeadsBoard';
import { CustomersFilter } from './CustomersFilter';
import { CustomersHeader } from './CustomersHeader';
import { ViewBar } from '~/modules/views/ViewBar';
import { useLeadsT } from '~/modules/leads/i18n';
import { CustomersRecordTable } from './CustomersRecordTable';

/**
 * Contacts › Customers (or Leads). A customer
 * opens in the side panel beside the list. Leads also have a
 * board (chosen under Display) with a column per stage; the table filters by stage in the filter bar.
 */
export const CustomersPage = ({ state }: { state: CustomerState }) => {
  const [display] = useListDisplay(LEADS_DISPLAY);
  const t = useLeadsT();
  const board = state === 'lead' && display === 'board';

  return (
    <PageContainer>
      <CustomersHeader state={state} />
      <ViewBar
        recordType={state}
        allLabel={state === 'lead' ? t('views.all-leads') : t('views.all-customers')}
      >
        <CustomersFilter state={state} />
      </ViewBar>
      {board ? <LeadsBoard recordType="customer" /> : <CustomersRecordTable state={state} />}
    </PageContainer>
  );
};
