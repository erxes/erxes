import { CurrencyRateSheet } from '@/settings/currency-rates/components/CurrencyRateSheet';
import { CurrencyRatesHeader } from '@/settings/currency-rates/components/CurrencyRatesHeader';
import { CurrencyRatesSubHeader } from '@/settings/currency-rates/components/CurrencyRatesSubHeader';
import { CurrencyRatesTable } from '@/settings/currency-rates/components/CurrencyRatesTable';
import { PageContainer } from 'erxes-ui';

export function ExchangeRatesPage() {
  return (
    <PageContainer>
      <CurrencyRatesHeader />
      <CurrencyRatesSubHeader />
      <CurrencyRatesTable />
      <CurrencyRateSheet />
    </PageContainer>
  );
}
