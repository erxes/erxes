import { ProductsPath } from '@/types/paths/ProductsPath';
import { useTranslation } from 'react-i18next';

export function useProductFieldTypes() {
  const { t } = useTranslation('product');
  return [
    {
      value: ProductsPath.Products,
      label: t('product-service', 'Product Service'),
    },
    {
      value: ProductsPath.Categories,
      label: t('categories', 'Categories'),
    },
    {
      value: ProductsPath.Uoms,
      label: t('uom', 'UOM'),
    },
    {
      value: ProductsPath.GeneralConfig,
      label: t('general-config', 'General config'),
    },
    {
      value: ProductsPath.SimilarityGroup,
      label: t('similarity-group', 'Similarity Group'),
    },
    {
      value: ProductsPath.Similarities,
      label: t('similarities', 'Similarities'),
    },
    {
      value: ProductsPath.BundleCondition,
      label: t('bundle-condition', 'Bundle Condition'),
    },
    {
      value: ProductsPath.BundleRule,
      label: t('bundle-rule', 'Bundle Rule'),
    },
    {
      value: ProductsPath.ProductRule,
      label: t('product-rule', 'Product Rule'),
    },
    {
      value: ProductsPath.Packages,
      label: t('packages', 'Packages'),
    },
  ];
}
