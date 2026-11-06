import { ProductDetailGeneral } from '@/products/product-detail/components/ProductDetailGeneral';
import { ProductDetailBarcode } from '@/products/product-detail/components/ProductDetailBarcode';
import { ProductDetailUom } from '@/products/product-detail/components/ProductDetailUom';
import { ProductDetailAttachment } from '@/products/product-detail/components/ProductDetailAttachment';
import { ProductDetailInfo } from '@/products/product-detail/components/ProductDetailInfo';
import { ProductDetail } from '@/products/product-detail/types/detailTypes';

export const ProductDetailFields = ({
  productDetail,
  compact = false,
  deferMediaDeletion = false,
  disabled = false,
}: {
  productDetail: ProductDetail | null;
  compact?: boolean;
  deferMediaDeletion?: boolean;
  disabled?: boolean;
}) => {
  if (!productDetail) return null;

  if (compact) {
    return (
      <div className="flex min-w-0 flex-col gap-3 p-3">
        <fieldset disabled={disabled} className="min-w-0 space-y-3">
          <ProductDetailGeneral compact />
          <div className="border-t pt-2">
            <ProductDetailInfo compact />
          </div>
        </fieldset>
        <div className="min-w-0">
          <ProductDetailBarcode
            productDetail={productDetail}
            compact
            disabled={disabled}
          />
          <ProductDetailUom compact disabled={disabled} />
          <ProductDetailAttachment
            compact
            disabled={disabled}
            deleteOnRemove={!deferMediaDeletion}
            attachment={productDetail.attachment}
            attachmentMore={productDetail.attachmentMore}
            videos={productDetail.videos}
            files={productDetail.files}
          />
        </div>
      </div>
    );
  }

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
        deleteOnRemove={!deferMediaDeletion}
        attachment={productDetail.attachment}
        attachmentMore={productDetail.attachmentMore}
        videos={productDetail.videos}
        files={productDetail.files}
      />
      <ProductDetailInfo compact={compact} />
    </div>
  );
};
