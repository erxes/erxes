import { IconPackage, IconPlus } from '@tabler/icons-react';
import { Button, Kbd, PageContainer, PageHeader } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { AppBreadcrumb } from '~/components/AppBreadcrumb';
import { usePageHotkey } from '~/lib/usePageHotkey';
import { ViewBar } from '~/modules/views/ViewBar';
import { paths } from '~/lib/paths';
import { useCanManageProducts, useOpenProduct } from '../useProducts';
import { ProductsFilter } from './ProductsFilter';
import { ProductsRecordTable } from './ProductsRecordTable';

/** Opens a new product in the side panel (`C` too). */
const AddProductButton = () => {
  const { t } = useTranslation('product');
  const { openNewProduct } = useOpenProduct();

  usePageHotkey('c', openNewProduct);

  return (
    <Button onClick={openNewProduct}>
      <IconPlus />
      {t('add', 'Add product')}
      <Kbd>C</Kbd>
    </Button>
  );
};

/** Products: the organisation's catalog, with each product opening in the side panel. */
export const ProductsPage = () => {
  const { t } = useTranslation('product');
  const manage = useCanManageProducts();

  return (
    <PageContainer>
      <PageHeader>
        <PageHeader.Start variant="flush">
          <AppBreadcrumb
            items={[
              { label: t('products', 'Products'), to: paths.products.list, icon: IconPackage },
            ]}
          />
        </PageHeader.Start>
        <PageHeader.End>{manage && <AddProductButton />}</PageHeader.End>
      </PageHeader>
      <ViewBar recordType="product" allLabel={t('all-products', 'All products')}>
        <ProductsFilter />
      </ViewBar>
      <ProductsRecordTable />
    </PageContainer>
  );
};
