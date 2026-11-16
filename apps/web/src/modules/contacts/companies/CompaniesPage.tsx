import { PageContainer, useListDisplay } from 'erxes-ui';
import { LEADS_DISPLAY, LeadsBoard } from '~/modules/leads/LeadsBoard';
import { CompaniesFilter } from './CompaniesFilter';
import { CompaniesHeader } from './CompaniesHeader';
import { ViewBar } from '~/modules/views/ViewBar';
import { useLeadsT } from '~/modules/leads/i18n';
import { CompaniesRecordTable } from './CompaniesRecordTable';

/**
 * Contacts › Companies (customers), or Leads › Companies (`state="lead"`): the
 * same screens as for people, with a board for leads.
 */
export const CompaniesPage = ({ state = 'customer' }: { state?: 'lead' | 'customer' }) => {
  const [display] = useListDisplay(LEADS_DISPLAY);
  const t = useLeadsT();
  const board = state === 'lead' && display === 'board';

  return (
    <PageContainer>
      <CompaniesHeader state={state} />
      <ViewBar
        recordType={state === 'lead' ? 'company_lead' : 'company'}
        allLabel={state === 'lead' ? t('views.all-company-leads') : t('views.all-companies')}
      >
        <CompaniesFilter state={state} />
      </ViewBar>
      {board ? <LeadsBoard recordType="company" /> : <CompaniesRecordTable state={state} />}
    </PageContainer>
  );
};
