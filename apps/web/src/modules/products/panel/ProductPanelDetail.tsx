import type { Product } from '@erxes/core-contract';
import { useTranslation } from 'react-i18next';
import {
  PanelDescriptionEditor,
  PanelDescriptionField,
  PanelSection,
  usePanelExpanded,
} from 'erxes-ui';
import { ContactDetailScroll } from '~/modules/side-panel/details/ContactDetailFields';
import { useCanManageProducts } from '../useProducts';
import {
  PRODUCT_PANEL_SCOPE,
  ProductCategoryRow,
  ProductFieldset,
  ProductKindRow,
  ProductPluginsRow,
  ProductTextRow,
} from './ProductPanelFields';
import { ProductPanelImages } from './ProductPanelImages';
import { ProductPriceRows, ProductSizeRows } from './ProductPanelMeasures';
import { useProductEdit } from './useProductEdit';

/**
 * The product's description. Plugins show it to buyers (a shop's product
 * page), so it is kept as HTML, as old erxes did.
 */
export const ProductDescription = ({
  product,
  fullSize = false,
}: {
  product: Product;
  fullSize?: boolean;
}) => {
  const { t } = useTranslation('product');
  const manage = useCanManageProducts();
  const edit = useProductEdit();

  const props = {
    value: product.description ?? '',
    scope: `${PRODUCT_PANEL_SCOPE}.${product.id}.description`,
    readonly: !manage,
    isHTML: true,
    onSave: (description: string) =>
      edit.mutate({ id: product.id, description: description || null }),
  };

  return fullSize ? (
    <PanelDescriptionEditor {...props} />
  ) : (
    <PanelDescriptionField {...props} label={t('fields.description', 'Description')} />
  );
};

// The product's fields as record table cells: click a value to edit it.
export const ProductPanelDetail = ({ product }: { product: Product }) => {
  const { t } = useTranslation('product');
  const expanded = usePanelExpanded();

  return (
    <ContactDetailScroll>
      <ProductFieldset>
        <div className="border-b px-3 pb-2">
          <PanelSection title={t('panel.general', 'General')} nested>
            <ProductKindRow product={product} />
            <ProductTextRow product={product} code="code" label={t('fields.code', 'Code')} />
            <ProductTextRow
              product={product}
              code="barcode"
              label={t('fields.barcode', 'Barcode')}
            />
            <ProductCategoryRow product={product} />
            <ProductTextRow product={product} code="unit" label={t('fields.unit', 'Unit')} />
          </PanelSection>
          <PanelSection title={t('panel.pricing', 'Pricing')} nested>
            <ProductPriceRows product={product} />
          </PanelSection>
          {product.kind === 'goods' && (
            <PanelSection title={t('panel.size', 'Size and weight')} nested>
              <ProductSizeRows product={product} />
            </PanelSection>
          )}
          <PanelSection title={t('panel.usage', 'Apps')} nested>
            <ProductPluginsRow product={product} />
          </PanelSection>
          {!expanded && <ProductDescription product={product} />}
        </div>
        <PanelSection title={t('fields.images', 'Images')}>
          <ProductPanelImages product={product} />
        </PanelSection>
      </ProductFieldset>
    </ContactDetailScroll>
  );
};
