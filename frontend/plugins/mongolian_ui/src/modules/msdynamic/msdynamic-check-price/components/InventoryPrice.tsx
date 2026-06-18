import { PageContainer, PageSubHeader, Button } from 'erxes-ui';
import { SelectBrand } from 'ui-modules';
import { useCheckPrice } from '../hooks/useCheckPrice';
import { CheckPriceFilter } from './CheckPriceFilter';
import { CheckPriceRecordTable } from './CheckPriceRecordTable';

export const InventoryPrice = () => {
  const { selectedBrandId, setBrand, checking, checkPrice } = useCheckPrice();

  return (
    <PageContainer>
      <PageSubHeader className="flex flex-wrap justify-between items-center gap-3">
        <CheckPriceFilter />
        <div className="flex items-center gap-3">
          <SelectBrand
            value={selectedBrandId}
            onValueChange={(value) => setBrand(value as string)}
            mode="single"
            placeholder="Choose brand"
          />
          <Button onClick={checkPrice} disabled={checking || !selectedBrandId}>
            {checking ? 'Checking...' : 'Check'}
          </Button>
        </div>
      </PageSubHeader>
      <CheckPriceRecordTable />
    </PageContainer>
  );
};
