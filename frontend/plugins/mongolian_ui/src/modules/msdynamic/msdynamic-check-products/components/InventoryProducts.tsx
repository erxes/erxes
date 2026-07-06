import { PageContainer, PageSubHeader } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { SelectBrand } from 'ui-modules';

import { useMSDynamicCheckProducts } from '../hooks/useMSDynamicCheckProducts';
import { MSDynamicCheckProductsCheckButton } from './MSDynamicCheckProductsCheckButton';
import { MSDynamicCheckProductsFilter } from './MSDynamicCheckProductsFilter';
import { MSDynamicCheckProductsRecordTable } from './MSDynamicCheckProductsRecordTable';

/** Check products main layout with brand select and table */
export const MSDynamicCheckProducts = () => {
  const { t } = useTranslation('mongolian');
  const { selectedBrandId, setBrand } = useMSDynamicCheckProducts();

  return (
    <PageContainer>
      <PageSubHeader className="flex flex-wrap justify-between items-center gap-3">
        <MSDynamicCheckProductsFilter />
        <div className="flex items-center gap-3">
          <SelectBrand
            value={selectedBrandId}
            onValueChange={(value) => setBrand(value as string)}
            mode="single"
            placeholder={t('choose-brand')}
          />
          <MSDynamicCheckProductsCheckButton />
        </div>
      </PageSubHeader>
      <MSDynamicCheckProductsRecordTable />
    </PageContainer>
  );
};
