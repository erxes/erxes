import { CheckCustomerFilter } from './CheckCustomerFilter';
import { CheckCustomerRecordTable } from './CheckCustomerRecordTable';
import { PageSubHeader, Button } from 'erxes-ui';
import { useCheckCustomer } from '../hooks/useCheckCustomer';
import { SelectBrand } from 'ui-modules';

export const InventoryCustomer = () => {
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
            placeholder="Choose brand"
          />
          <Button onClick={checkCustomers} disabled={checking}>
            {checking ? 'Checking...' : 'Check'}
          </Button>
        </div>
      </PageSubHeader>
      <CheckCustomerRecordTable />
    </>
  );
};
