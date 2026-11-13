import { LeadDisplayMenu } from '~/modules/leads/LeadDisplayMenu';
import { ListFilter } from '~/modules/views/filter/ListFilter';
import { useContactOptionLabel } from '../components/contactOptionLabel';
import { companiesSessionKey, useCompanies } from './useCompanies';

/** Company lists (customers or leads) filter by any field, property or activity (`F`). */
export const CompaniesFilter = ({ state = 'customer' }: { state?: 'lead' | 'customer' }) => {
  const optionLabel = useContactOptionLabel();
  const { totalCount, totalCapped } = useCompanies(state);

  return (
    <ListFilter
      recordType={state === 'lead' ? 'company_lead' : 'company'}
      sessionKey={companiesSessionKey(state)}
      optionLabel={optionLabel}
      totalCount={totalCount}
      totalCapped={totalCapped}
    >
      {state === 'lead' && <LeadDisplayMenu />}
    </ListFilter>
  );
};
