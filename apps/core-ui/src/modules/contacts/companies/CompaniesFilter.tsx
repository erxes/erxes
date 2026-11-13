import { LeadDisplayMenu } from '~/modules/leads/LeadDisplayMenu';
import { ListFilter } from '~/modules/views/filter/ListFilter';
import { RecordCount } from '~/modules/views/filter/RecordCount';
import { useContactOptionLabel } from '../components/contactOptionLabel';
import { companiesSessionKey, useCompanies } from './useCompanies';

const CompaniesTotalCount = ({ state = 'customer' }: { state?: 'lead' | 'customer' }) => {
  const { totalCount, totalCapped } = useCompanies(state);

  return <RecordCount totalCount={totalCount} totalCapped={totalCapped} />;
};

/** Company lists (customers or leads) filter by any field, property or activity (`F`). */
export const CompaniesFilter = ({ state = 'customer' }: { state?: 'lead' | 'customer' }) => {
  const optionLabel = useContactOptionLabel();

  return (
    <ListFilter
      recordType={state === 'lead' ? 'company_lead' : 'company'}
      sessionKey={companiesSessionKey(state)}
      optionLabel={optionLabel}
    >
      <CompaniesTotalCount state={state} />
      {state === 'lead' && <LeadDisplayMenu />}
    </ListFilter>
  );
};
