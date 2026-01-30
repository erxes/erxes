import { ProductDetailGeneral } from './ProductDetailGeneral';
import { ProductDetailBarcode } from './ProductDetailBarcode';
import { ProductDetailUom } from './ProductDetailUom';
import { ProductDetailAttachment } from './ProductDetailAttachment';
import { ProductDetailInfo } from './ProductDetailInfo';
import { useProductDetailWithQuery } from '../hooks/useProductDetailWithQuery';

export const ProductDetailFields = () => {
  const { productDetail } = useProductDetailWithQuery();
  if (!productDetail) return null;

  return (
    <div className="p-4 space-y-4">
      <div className="grid gap-4 lg:grid-cols-5">
        <div className="grid gap-4 lg:col-span-3">
          <ProductDetailGeneral />
        </div>
        <div className="grid gap-4 lg:col-span-2 lg:grid-cols-1">
          <ProductDetailBarcode />
          <ProductDetailUom />
        </div>
      </div>
      <ProductDetailAttachment
        attachment={productDetail.attachment}
        attachmentMore={productDetail.attachmentMore}
      />
      <ProductDetailInfo />
    </div>
  );
};
