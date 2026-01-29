import { ScrollArea } from 'erxes-ui';
import { ProductDetailGeneral } from './ProductDetailGeneral';
import { ProductDetailBarcode } from './ProductDetailBarcode';
import { ProductDetailUom } from './ProductDetailUom';
import { ProductDetailAttachment } from './ProductDetailAttachment';
import { ProductDetailInfo } from './ProductDetailInfo';
import { ProductDetailVariants } from './ProductDetailVariants';
import { useProductDetailWithQuery } from '../hooks/useProductDetailWithQuery';

export const ProductDetailFields = () => {
  const { productDetail } = useProductDetailWithQuery();
  if (!productDetail) return null;

  return (
    <ScrollArea className="h-full" viewportClassName="p-4">
      <div className="grid gap-4 lg:grid-cols-5">
        <div className="grid gap-4 lg:col-span-3">
          <ProductDetailGeneral {...productDetail} />
        </div>
        <div className="grid gap-4 lg:col-span-2 lg:grid-cols-1">
          <ProductDetailBarcode
            barcodes={productDetail.barcodes}
            barcodeDescription={productDetail.barcodeDescription}
          />
          <ProductDetailUom
            uom={productDetail.uom}
            subUoms={productDetail.subUoms}
          />
        </div>
      </div>
      <div className="pt-4">
        <ProductDetailAttachment
          attachment={productDetail.attachment}
          attachmentMore={productDetail.attachmentMore}
        />
      </div>

      <div className="pt-4">
        <ProductDetailInfo
          scopeBrandIds={productDetail.scopeBrandIds}
          vendorId={productDetail.vendorId}
          currency={productDetail.currency}
        />
      </div>
      <div className="pt-4">
        <ProductDetailVariants />
      </div>
    </ScrollArea>
  );
};
