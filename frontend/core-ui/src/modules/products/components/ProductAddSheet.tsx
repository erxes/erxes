import { IconPlus } from '@tabler/icons-react';
import { Button, Kbd, useScopedHotkeys } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Can, usePermissionCheck, useSidePanel } from 'ui-modules';
import { ProductHotKeyScope } from '@/products/types/ProductsHotKeyScope';

export const ProductAddSheet = () => {
  const { t } = useTranslation('product', { keyPrefix: 'add' });
  const { openNewRecord } = useSidePanel();
  const { hasActionPermission } = usePermissionCheck();
  const create = () => {
    if (hasActionPermission('productsCreate')) openNewRecord('core:product');
  };
  useScopedHotkeys('c', create, ProductHotKeyScope.ProductsPage, [
    hasActionPermission,
  ]);
  return (
    <Can action="productsCreate">
      <Button onClick={create}>
        <IconPlus />
        {t('add-product')}
        <Kbd>C</Kbd>
      </Button>
    </Can>
  );
};
