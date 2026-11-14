import type { Product } from '@erxes/core-contract';
import { useTranslation } from 'react-i18next';
import { PanelDescriptionEditor } from '~/modules/side-panel/PanelDescriptionEditor';
import { PanelDescriptionField } from '~/modules/side-panel/PanelDescriptionField';
import { usePanelExpanded } from '~/modules/side-panel/RecordSidePanel';
import { ContactDetailScroll } from '~/modules/side-panel/details/ContactDetailFields';
import { ContactDetailSection } from '~/modules/side-panel/details/ContactDetailSection';
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
          <ContactDetailSection title={t('panel.general', 'General')} nested>
            <ProductKindRow product={product} />
            <ProductTextRow product={product} code="code" label={t('fields.code', 'Code')} />
            <ProductTextRow
              product={product}
              code="barcode"
              label={t('fields.barcode', 'Barcode')}
            />
            <ProductCategoryRow product={product} />
            <ProductTextRow product={product} code="unit" label={t('fields.unit', 'Unit')} />
          </ContactDetailSection>
          <ContactDetailSection title={t('panel.pricing', 'Pricing')} nested>
            <ProductPriceRows product={product} />
          </ContactDetailSection>
          {product.kind === 'goods' && (
            <ContactDetailSection title={t('panel.size', 'Size and weight')} nested>
              <ProductSizeRows product={product} />
            </ContactDetailSection>
          )}
          <ContactDetailSection title={t('panel.usage', 'Apps')} nested>
            <ProductPluginsRow product={product} />
          </ContactDetailSection>
          {!expanded && <ProductDescription product={product} />}
        </div>
        <ContactDetailSection title={t('fields.images', 'Images')}>
          <ProductPanelImages product={product} />
        </ContactDetailSection>
      </ProductFieldset>
    </ContactDetailScroll>
  );
};
