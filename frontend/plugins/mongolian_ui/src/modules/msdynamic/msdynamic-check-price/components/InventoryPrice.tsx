import { PageContainer, PageSubHeader, Button } from 'erxes-ui';
import { SelectBrand } from 'ui-modules';
import { useTranslation } from 'react-i18next';
import { useCheckPrice } from '../hooks/useCheckPrice';
import { CheckPriceFilter } from './CheckPriceFilter';
import { CheckPriceRecordTable } from './CheckPriceRecordTable';

export const InventoryPrice = () => {
  const { t } = useTranslation('mongolian');
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
            placeholder={t('choose-brand')}
          />
          <Button onClick={checkPrice} disabled={checking || !selectedBrandId}>
            {checking ? t('checking') : t('check')}
          </Button>
        </div>
      </PageSubHeader>
      <CheckPriceRecordTable />
    </PageContainer>
  );
};
