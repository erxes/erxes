import { Sheet, Spinner, useQueryState, Empty, ScrollArea } from 'erxes-ui';
import { useProductDetail } from '../hooks/useProductDetail';
import { IconPackageOff } from '@tabler/icons-react';
import { ProductDetailGeneral } from './ProductDetailGeneral';
import { PRODUCT_QUERY_KEY } from '../../constants/productQueryKey';
import { ProductDetailBarcode } from './ProductDetailBarcode';
import { ProductDetailUom } from './ProductDetailUom';
import { ProductDetailAttachment } from './ProductDetailAttachment';
import { ProductDetailVariants } from './ProductDetailVariants';

export const ProductDetail = () => {
  const [productId] = useQueryState<string>(PRODUCT_QUERY_KEY);
  const { productDetail, loading } = useProductDetail({
    variables: {
      _id: productId,
    },
    skip: !productId,
  });

  if (loading) return <Spinner />;

  if (!productDetail)
    return (
      <Empty>
        <Empty.Header>
          <Empty.Media variant="icon">
            <IconPackageOff />
          </Empty.Media>
          <Empty.Title>Product not found</Empty.Title>
          <Empty.Description>
            There seems to be no product with this ID.
          </Empty.Description>
        </Empty.Header>
      </Empty>
    );

  return (
    <>
      <Sheet.Header className="border-b p-3 px-6 flex-row items-center space-y-0 gap-3">
        <Sheet.Title>{productDetail.name}</Sheet.Title>
        <Sheet.Close />
        <Sheet.Description className="sr-only">
          Product Detail
        </Sheet.Description>
      </Sheet.Header>
      <Sheet.Content className="bg-transparent border-b-0 overflow-hidden">
        <ScrollArea className="h-full" viewportClassName="p-6">
          <div className="grid lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 grid gap-4">
              <ProductDetailGeneral {...productDetail} />
            </div>
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-1">
              <div>
                <ProductDetailBarcode />
              </div>
              <div>
                <ProductDetailUom />
              </div>
            </div>
          </div>
          <div className="pt-4">
            <ProductDetailAttachment />
          </div>
          <div className="pt-4">
            <ProductDetailVariants />
          </div>
        </ScrollArea>
      </Sheet.Content>
    </>
  );
};
