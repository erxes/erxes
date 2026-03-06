import { ProductsPath } from '@/types/paths/ProductsPath';
import { useTranslation } from 'react-i18next';

export function useProductFieldTypes() {
  const { t } = useTranslation('product');
  return [
    {
      value: ProductsPath.Products,
      label: t('product-service'),
    },
    {
      value: ProductsPath.Categories,
      label: t('categories'),
    },
    {
      value: ProductsPath.Uoms,
      label: t('uom'),
    },
    {
      value: ProductsPath.GeneralConfig,
      label: t('general-config'),
    },
    {
      value: ProductsPath.SimilarityGroup,
      label: t('similarity-group'),
    },
    {
      value: ProductsPath.BundleCondition,
      label: t('bundle-condition'),
    },
    {
      value: ProductsPath.BundleRule,
      label: t('bundle-rule'),
    },
    {
      value: ProductsPath.ProductRule,
      label: t('product-rule'),
    },
  ];
}
