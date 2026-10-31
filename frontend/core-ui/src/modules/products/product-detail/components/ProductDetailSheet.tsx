import { PRODUCT_QUERY_KEY } from '@/products/constants/productQueryKey';
import { RecordDetailLink } from '@/side-panel/components/RecordDetailLink';

export const ProductDetailSheet = () => (
  <RecordDetailLink queryKey={PRODUCT_QUERY_KEY} contentType="core:product" />
);
