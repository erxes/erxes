import { Button } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useCheckPrice } from '../hooks/useCheckPrice';
import { PriceStatus, PRICE_STATUS_LABELS } from '../types/checkPrice';

const FILTERS: PriceStatus[] = ['UPDATE', 'MATCH', 'CREATE', 'DELETE', 'ERROR'];

export const CheckPriceFilter = () => {
  const { t } = useTranslation('mongolian');
  const { getCount, selectedFilter, setSelectedFilter } = useCheckPrice();

  return (
    <div className="flex flex-wrap gap-2">
      {FILTERS.map((status) => {
        const count = getCount(status);
        return (
          <Button
            key={status}
            variant={selectedFilter === status ? 'default' : 'outline'}
            onClick={() =>
              setSelectedFilter(selectedFilter === status ? null : status)
            }
          >
            {t(PRICE_STATUS_LABELS[status])} ({count})
          </Button>
        );
      })}
    </div>
  );
};
