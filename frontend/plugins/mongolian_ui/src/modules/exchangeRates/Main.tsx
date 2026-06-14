import { SettingsLayout } from '~/modules/SettingsLayout';
import { AddExchangeRate } from './components/AddExchangeRate';
import { EditExchangeRate } from './components/EditExchangeRate';
import { ExchangeRatesBreadcrumb } from './components/ExchangeRatesBreadcrumb';
import { ExchangeRatesSearch } from './components/ExchangeRatesSearch';
import { ExchangeRatesTable } from './components/ExchangeRatesTable';

const Main = () => {
  return (
    <SettingsLayout
      sidebar={null}
      breadcrumbs={<ExchangeRatesBreadcrumb />}
      actions={
        <div className="flex items-center gap-2">
          <ExchangeRatesSearch />
          <AddExchangeRate />
        </div>
      }
    >
      <div className="flex flex-col h-full overflow-hidden">
        <div className="flex flex-auto p-3 overflow-hidden">
          <ExchangeRatesTable />
        </div>
        <EditExchangeRate />
      </div>
    </SettingsLayout>
  );
};

export default Main;
