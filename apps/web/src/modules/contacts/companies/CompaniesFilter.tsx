import { DisplayMenu } from 'erxes-ui';
import { LEADS_DISPLAY } from '~/modules/leads/LeadsBoard';
import { CoreListFilter } from '~/modules/views/CoreListFilter';
import { useContactOptionLabel } from '../components/contactOptionLabel';
import { useCompanies } from './useCompanies';

/** Company lists (customers or leads) filter by any field, property or activity (`F`). */
export const CompaniesFilter = ({ state = 'customer' }: { state?: 'lead' | 'customer' }) => {
  const optionLabel = useContactOptionLabel();
  const { totalCount, totalCapped } = useCompanies(state);

  return (
    <CoreListFilter
      recordType={state === 'lead' ? 'company_lead' : 'company'}
      optionLabel={optionLabel}
      totalCount={totalCount}
      totalCapped={totalCapped}
    >
      {state === 'lead' && <DisplayMenu list={LEADS_DISPLAY} />}
    </CoreListFilter>
  );
};
