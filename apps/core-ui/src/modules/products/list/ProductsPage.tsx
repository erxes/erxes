import { IconPackage, IconPlus } from '@tabler/icons-react';
import { Button, Kbd, PageContainer } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { AppBreadcrumb } from '~/components/AppBreadcrumb';
import { ContactsPageHeader } from '~/modules/contacts/components/ContactsPageHeader';
import { useCreateHotkey } from '~/modules/contacts/customers/CustomersHeader';
import { ViewBar } from '~/modules/views/ViewBar';
import { PRODUCTS_PATH } from '../paths';
import { useCanManageProducts, useOpenProduct } from '../useProducts';
import { ProductsFilter } from './ProductsFilter';
import { ProductsRecordTable } from './ProductsRecordTable';

/** Opens a new product in the side panel (`C` too). */
const AddProductButton = () => {
  const { t } = useTranslation('product');
  const { openNewProduct } = useOpenProduct();

  useCreateHotkey(openNewProduct);

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
      <ContactsPageHeader>
        <ContactsPageHeader.Start>
          <AppBreadcrumb
            items={[{ label: t('products', 'Products'), to: PRODUCTS_PATH, icon: IconPackage }]}
          />
        </ContactsPageHeader.Start>
        <ContactsPageHeader.End>{manage && <AddProductButton />}</ContactsPageHeader.End>
      </ContactsPageHeader>
      <ViewBar recordType="product" allLabel={t('all-products', 'All products')}>
        <ProductsFilter />
      </ViewBar>
      <ProductsRecordTable />
    </PageContainer>
  );
};
