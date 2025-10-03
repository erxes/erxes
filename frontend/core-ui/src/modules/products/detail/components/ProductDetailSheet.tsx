import { IconLayoutSidebarLeftCollapse } from '@tabler/icons-react';
import { Button, cn, Sheet, useSetHotkeyScope } from 'erxes-ui';
import { renderingProductDetailAtom } from '../../states/productDetailStates';
import { useEffect } from 'react';
import { useAtom } from 'jotai';
import { useSearchParams } from 'react-router-dom';
import { ProductHotKeyScope } from '@/products/types/ProductsHotKeyScope';

export const ProductDetailSheet = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [activeTab] = useAtom(renderingProductDetailAtom);
  const setHotkeyScope = useSetHotkeyScope();
  const [searchParams, setSearchParams] = useSearchParams();

  const productId = searchParams.get('product_id');

  useEffect(() => {
    if (productId) {
      setHotkeyScope(ProductHotKeyScope.ProductEditSheet);
    }
  }, [productId, setHotkeyScope]);

  const setOpen = (newProductId: string | null) => {
    const newSearchParams = new URLSearchParams(searchParams);
    if (newProductId) {
      newSearchParams.set('product_id', newProductId);
    } else {
      newSearchParams.delete('product_id');
    }
    setSearchParams(newSearchParams);

    if (!newProductId) {
      setHotkeyScope(ProductHotKeyScope.ProductsPage);
    }
  };

  return (
    <Sheet
      open={!!productId}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          setOpen(null);
          setHotkeyScope(ProductHotKeyScope.ProductsPage);
        }
      }}
    >
      <Sheet.View
        className={cn(
          'p-0 md:max-w-screen-2xl flex flex-col gap-0 transition-all duration-100 ease-out overflow-hidden flex-none',
          !!activeTab && 'md:w-[calc(100vw-theme(spacing.4))]',
        )}
      >
        <Sheet.Header className="border-b p-3 flex-row items-center space-y-0 gap-3">
          <Button variant="ghost" size="icon">
            <IconLayoutSidebarLeftCollapse />
          </Button>
          <Sheet.Title>Product Detail</Sheet.Title>
          <Sheet.Close />
          <Sheet.Description className="sr-only">
            Product Detail
          </Sheet.Description>
        </Sheet.Header>
        {children}
      </Sheet.View>
    </Sheet>
  );
};
