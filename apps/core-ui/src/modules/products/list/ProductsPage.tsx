import { IconPackage, IconPlus } from '@tabler/icons-react';
import { Button, Kbd, PageContainer, PageSubHeader } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { AppBreadcrumb } from '~/components/AppBreadcrumb';
import { ContactsPageHeader } from '~/modules/contacts/components/ContactsPageHeader';
import { useCreateHotkey } from '~/modules/contacts/customers/CustomersHeader';
import { ViewTabs } from '~/modules/views/ViewTabs';
import { ProductSheet } from '../form/ProductSheet';
import { useProductSheet } from '../form/useProductSheet';
import { PRODUCTS_PATH } from '../paths';
import { useCanManageProducts } from '../useProducts';
import { ProductsFilter } from './ProductsFilter';
import { ProductsRecordTable } from './ProductsRecordTable';

/** Opens an empty product in the sheet (`C` too). */
const AddProductButton = () => {
  const { t } = useTranslation('product');
  const { openNew } = useProductSheet();

  useCreateHotkey(openNew);

  return (
    <Button onClick={openNew}>
      <IconPlus />
      {t('add', 'Add product')}
      <Kbd>C</Kbd>
    </Button>
  );
};

/** Products: the organisation's catalog, with each product opening in a sheet. */
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
      <ViewTabs recordType="product" allLabel={t('all-products', 'All products')} />
      <PageSubHeader>
        <ProductsFilter />
      </PageSubHeader>
      <ProductsRecordTable />
      <ProductSheet />
    </PageContainer>
  );
};
