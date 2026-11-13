import { isUndefinedOrNull, Skeleton } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { formatTotal } from '~/lib/cursorList';
import { LeadDisplayMenu } from '~/modules/leads/LeadDisplayMenu';
import { ListFilter } from '~/modules/views/filter/ListFilter';
import { useContactOptionLabel } from '../components/contactOptionLabel';
import { companiesSessionKey, useCompanies } from './useCompanies';

const CompaniesTotalCount = ({ state = 'customer' }: { state?: 'lead' | 'customer' }) => {
  const { t } = useTranslation('contact', { keyPrefix: 'company' });
  const { totalCount, totalCapped } = useCompanies(state);

  return (
    <div className="h-7 whitespace-nowrap text-sm font-medium leading-7 text-muted-foreground">
      {isUndefinedOrNull(totalCount) ? (
        <Skeleton className="mt-1.5 inline-block h-4 w-20" />
      ) : (
        t('records-found', { count: totalCount, formatted: formatTotal(totalCount, totalCapped) })
      )}
    </div>
  );
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
