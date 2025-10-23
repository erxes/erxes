import { Sheet, Spinner, useQueryState, Empty } from 'erxes-ui';
import { useProductDetail } from '../hooks/useProductDetail';
import { IconPackageOff } from '@tabler/icons-react';
import { ProductDetailGeneral } from './ProductDetailGeneral';

export const ProductDetail = () => {
  const [productId] = useQueryState<string>('product_id');
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
      <Sheet.Content className="p-6">
        <ProductDetailGeneral {...productDetail} />
      </Sheet.Content>
    </>
  );
};
