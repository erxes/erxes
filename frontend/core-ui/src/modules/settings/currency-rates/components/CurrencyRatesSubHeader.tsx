import { PageSubHeader, Select, useQueryState } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { CURRENCY_RATE_FILTER_QUERY_KEY } from '../constants';
import { useCurrencyRateCurrencies } from '../hooks/useCurrencyRateCurrencies';

const ALL = 'all';

export const CurrencyRatesSubHeader = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'currency-rates' });
  const { mainCurrency, rateCurrencies } = useCurrencyRateCurrencies();
  const [rateCurrency, setRateCurrency] = useQueryState<string>(
    CURRENCY_RATE_FILTER_QUERY_KEY,
  );

  return (
    <PageSubHeader className="gap-3">
      <Select
        value={rateCurrency || ALL}
        onValueChange={(value) => setRateCurrency(value === ALL ? null : value)}
      >
        <Select.Trigger className="w-44">
          <Select.Value />
        </Select.Trigger>
        <Select.Content>
          <Select.Item value={ALL}>
            {t('all-currencies', 'All currencies')}
          </Select.Item>
          {rateCurrencies.map((currency) => (
            <Select.Item key={currency} value={currency}>
              {currency}
            </Select.Item>
          ))}
        </Select.Content>
      </Select>
      {mainCurrency && (
        <span className="text-sm text-muted-foreground">
          {t('base-hint', {
            mainCurrency,
            defaultValue: 'Rates are stored as 1 unit = X {{mainCurrency}}',
          })}
        </span>
      )}
    </PageSubHeader>
  );
};
