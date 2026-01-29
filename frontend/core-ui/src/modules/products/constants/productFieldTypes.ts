import { ProductsPath } from '@/types/paths/ProductsPath';
import { useTranslation } from 'react-i18next';

export const PRODUCT_FIELD_TYPES = () => {
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
      label: 'UOM',
    },
  ];
};
