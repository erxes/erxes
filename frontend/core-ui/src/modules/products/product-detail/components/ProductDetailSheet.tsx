import { cn, Sheet, useQueryState } from 'erxes-ui';
import { renderingProductDetailAtom } from '../../states/productDetailStates';
import { useAtom } from 'jotai';

export const ProductDetailSheet = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [activeTab] = useAtom(renderingProductDetailAtom);
  const [productId, setProductId] = useQueryState<string>('product_id');

  return (
    <Sheet
      open={!!productId}
      onOpenChange={() => {
        setProductId(null);
      }}
    >
      <Sheet.View
        className={cn(
          'p-0 md:max-w-screen-lg flex flex-col gap-0 transition-all duration-100 ease-out overflow-hidden flex-none',
          !!activeTab && 'md:w-[calc(100vw-theme(spacing.4))]',
        )}
      >
        {children}
      </Sheet.View>
    </Sheet>
  );
};
