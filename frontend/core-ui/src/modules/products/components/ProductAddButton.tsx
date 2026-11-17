import { IconPlus } from '@tabler/icons-react';
import { Button, Kbd, useScopedHotkeys } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Can, usePermissionCheck, useSidePanel } from 'ui-modules';
import { PRODUCT_CONTENT_TYPE } from '@/products/constants/productQueryKey';
import { ProductHotKeyScope } from '@/products/types/ProductsHotKeyScope';

/**
 * Opens a new product in the side panel as a draft; it is created on Create
 * there, then shown as the product.
 */
export const ProductAddButton = () => {
  const { t } = useTranslation('product', { keyPrefix: 'add' });
  const { openNewRecord } = useSidePanel();
  const { hasActionPermission } = usePermissionCheck();
  const canCreate = hasActionPermission('productsCreate');

  const create = () => openNewRecord(PRODUCT_CONTENT_TYPE);

  useScopedHotkeys(
    'c',
    () => canCreate && create(),
    ProductHotKeyScope.ProductsPage,
    [canCreate],
  );

  return (
    <Can action="productsCreate">
      {/* Just the icon while the list is narrow, e.g. beside a record. */}
      <Button
        aria-label={t('add-product')}
        title={t('add-product')}
        onClick={create}
      >
        <IconPlus />
        <span className="hidden @lg/products:inline">{t('add-product')}</span>
        <Kbd className="hidden @lg/products:inline-flex">C</Kbd>
      </Button>
    </Can>
  );
};
