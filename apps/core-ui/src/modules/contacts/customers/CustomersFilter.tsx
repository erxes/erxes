import type { CustomerState } from '@erxes/core-contract';
import { isUndefinedOrNull, Skeleton } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { formatTotal } from '~/lib/cursorList';
import { LeadDisplayMenu } from '~/modules/leads/LeadDisplayMenu';
import { ListFilter } from '~/modules/views/filter/ListFilter';
import { useContactOptionLabel } from '../components/contactOptionLabel';
import { customersSessionKey, useCustomers } from './useCustomers';

const CustomerTotalCount = ({ state }: { state: CustomerState }) => {
  const { t } = useTranslation();
  const { totalCount, totalCapped } = useCustomers(state);

  return (
    <div className="h-7 whitespace-nowrap text-sm font-medium leading-7 text-muted-foreground">
      {isUndefinedOrNull(totalCount) ? (
        <Skeleton className="mt-1.5 inline-block h-4 w-20" />
      ) : (
        `${formatTotal(totalCount, totalCapped)} ${t('records-found', { count: totalCapped ? 2 : totalCount })}`
      )}
    </div>
  );
};

/** People (customers or leads) filter by any field, property, their company or activity (`F`). */
export const CustomersFilter = ({ state }: { state: CustomerState }) => {
  const optionLabel = useContactOptionLabel();

  return (
    <ListFilter
      recordType={state}
      sessionKey={customersSessionKey(state)}
      optionLabel={optionLabel}
    >
      <CustomerTotalCount state={state} />
      {state === 'lead' && <LeadDisplayMenu />}
    </ListFilter>
  );
};
