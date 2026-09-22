import { Button } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useCheckCustomer } from '../hooks/useCheckCustomer';
import { CustomerStatus, CUSTOMER_STATUS_LABELS } from '../types/checkCustomer';

const FILTERS: CustomerStatus[] = ['CREATE', 'UPDATE', 'DELETE'];

export const CheckCustomerFilter = () => {
  const { t } = useTranslation('mongolian');
  const { getCount, filter, setFilter } = useCheckCustomer();

  return (
    <div className="flex w-full items-center justify-between gap-4">
      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => {
          const count = getCount(f);
          const isActive = filter === f;
          return (
            <Button
              key={f}
              variant={isActive ? 'default' : 'outline'}
              onClick={() => setFilter(isActive ? null : f)}
            >
              {t(CUSTOMER_STATUS_LABELS[f])} ({count})
            </Button>
          );
        })}
      </div>
    </div>
  );
};
