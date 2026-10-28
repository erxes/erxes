import { ProductDetailGeneral } from '@/products/product-detail/components/ProductDetailGeneral';
import { ProductDetailBarcode } from '@/products/product-detail/components/ProductDetailBarcode';
import { ProductDetailUom } from '@/products/product-detail/components/ProductDetailUom';
import { ProductDetailAttachment } from '@/products/product-detail/components/ProductDetailAttachment';
import { ProductDetailInfo } from '@/products/product-detail/components/ProductDetailInfo';
import { ProductDetail } from '@/products/product-detail/types/detailTypes';

export const ProductDetailFields = ({
  productDetail,
  compact = false,
}: {
  productDetail: ProductDetail | null;
  compact?: boolean;
}) => {
  if (!productDetail) return null;

  return (
    <div className="p-4 space-y-4">
      <div className={compact ? 'grid gap-4' : 'grid gap-4 lg:grid-cols-5'}>
        <div className={compact ? 'grid gap-4' : 'grid gap-4 lg:col-span-3'}>
          <ProductDetailGeneral compact={compact} />
        </div>
        <div
          className={
            compact ? 'grid gap-4' : 'grid gap-4 lg:col-span-2 lg:grid-cols-1'
          }
        >
          <ProductDetailBarcode productDetail={productDetail} />
          <ProductDetailUom />
        </div>
      </div>
      <ProductDetailAttachment
        attachment={productDetail.attachment}
        attachmentMore={productDetail.attachmentMore}
        videos={productDetail.videos}
        files={productDetail.files}
      />
      <ProductDetailInfo compact={compact} />
    </div>
  );
};
