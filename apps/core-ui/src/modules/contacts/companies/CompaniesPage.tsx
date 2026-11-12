import { PageContainer, PageSubHeader } from 'erxes-ui';
import { LeadsBoard } from '~/modules/leads/LeadsBoard';
import { useLeadView } from '~/modules/leads/leadView';
import { CompaniesFilter } from './CompaniesFilter';
import { CompaniesHeader } from './CompaniesHeader';
import { ViewTabs } from '../views/ViewTabs';
import { useLeadsT } from '~/modules/leads/i18n';
import { CompaniesRecordTable } from './CompaniesRecordTable';

/**
 * Contacts › Companies (customers), or Leads › Companies (`state="lead"`): the
 * same screens as for people, with a board for leads.
 */
export const CompaniesPage = ({ state = 'customer' }: { state?: 'lead' | 'customer' }) => {
  const [view] = useLeadView();
  const t = useLeadsT();
  const board = state === 'lead' && view === 'board';

  return (
    <PageContainer>
      <CompaniesHeader state={state} />
      <ViewTabs recordType={state === 'lead' ? 'company_lead' : 'company'} allLabel={state === 'lead' ? t('views.all-company-leads') : t('views.all-companies')} />
      <PageSubHeader>
        <CompaniesFilter state={state} />
      </PageSubHeader>
      {board ? <LeadsBoard recordType="company" /> : <CompaniesRecordTable state={state} />}
    </PageContainer>
  );
};
