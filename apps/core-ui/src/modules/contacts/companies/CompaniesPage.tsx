import { PageContainer, PageSubHeader } from 'erxes-ui';
import { LeadsBoard } from '~/modules/leads/LeadsBoard';
import { useLeadView } from '~/modules/leads/leadView';
import { CompaniesFilter } from './CompaniesFilter';
import { CompaniesHeader } from './CompaniesHeader';
import { CompaniesRecordTable } from './CompaniesRecordTable';

/**
 * Contacts › Companies (customers), or Leads › Companies (`state="lead"`): the
 * same screens as for people, with a board for leads.
 */
export const CompaniesPage = ({ state = 'customer' }: { state?: 'lead' | 'customer' }) => {
  const [view] = useLeadView();
  const board = state === 'lead' && view === 'board';

  return (
    <PageContainer>
      <CompaniesHeader state={state} />
      <PageSubHeader>
        <CompaniesFilter state={state} />
      </PageSubHeader>
      {board ? <LeadsBoard recordType="company" /> : <CompaniesRecordTable state={state} />}
    </PageContainer>
  );
};
