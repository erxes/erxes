import type { Product } from '@erxes/core-contract';
import { ScrollArea } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { CustomFieldSections } from '~/modules/properties/CustomFieldSections';
import { PRODUCT_SETTINGS } from '../paths';
import { useCanManageProducts } from '../useProducts';
import { ProductFieldset } from './ProductPanelFields';
import { useProductEdit } from './useProductEdit';

/** The organisation's product properties, as the product's own panel tab. */
export const ProductPanelProperties = ({ product }: { product: Product }) => {
  const { t } = useTranslation('product');
  const manage = useCanManageProducts();
  const edit = useProductEdit();

  return (
    <ScrollArea className="flex-1 min-h-0" viewportClassName="[&>div]:block!">
      <ProductFieldset>
        <div className="p-3">
          <CustomFieldSections
            contentType="product"
            scope={`product-panel.${product.id}.properties`}
            values={product.customFields}
            onSave={(customFields) => edit.mutate({ id: product.id, customFields })}
            empty={
              <p className="text-sm text-muted-foreground">
                {t('form.no-properties', 'No product properties yet.')}{' '}
                {manage && (
                  <Link to={PRODUCT_SETTINGS.properties} className="text-primary hover:underline">
                    {t('form.add-properties', 'Add them in settings')}
                  </Link>
                )}
              </p>
            }
          />
        </div>
      </ProductFieldset>
    </ScrollArea>
  );
};
