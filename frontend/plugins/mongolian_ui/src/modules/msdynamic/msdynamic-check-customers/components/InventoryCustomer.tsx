import { CheckCustomerFilter } from './CheckCustomerFilter';
import { CheckCustomerRecordTable } from './CheckCustomerRecordTable';
import { PageSubHeader, Button } from 'erxes-ui';
import { useCheckCustomer } from '../hooks/useCheckCustomer';
import { SelectBrand } from 'ui-modules';
import { useTranslation } from 'react-i18next';

export const InventoryCustomer = () => {
  const { t } = useTranslation('mongolian');
  const { brandId, setSelectedBrandId, checkCustomers, checking } =
    useCheckCustomer();
  return (
    <>
      <PageSubHeader>
        <CheckCustomerFilter />

        <div className="flex items-center gap-2">
          <SelectBrand
            value={brandId === 'noBrand' ? '' : brandId}
            onValueChange={(val) => setSelectedBrandId(val as string)}
            placeholder={t('choose-brand')}
          />
          <Button onClick={checkCustomers} disabled={checking}>
            {checking ? t('checking') : t('check')}
          </Button>
        </div>
      </PageSubHeader>
      <CheckCustomerRecordTable />
    </>
  );
};
