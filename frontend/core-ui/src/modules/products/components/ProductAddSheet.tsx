import { IconPlus } from '@tabler/icons-react';

import {
  Button,
  cn,
  FocusSheet,
  Kbd,
  Sheet,
  useFocusSheet,
  usePreviousHotkeyScope,
  useScopedHotkeys,
  useQueryState,
} from 'erxes-ui';
import { ReactNode, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ProductHotKeyScope } from '@/products/types/ProductsHotKeyScope';
import {
  AddProductForm,
  Can,
  EMPTY_PRODUCT_FORM_VALUES,
  IProductFormValues,
  PRODUCT_FORM_SCHEMA,
  usePermissionCheck,
} from 'ui-modules';
import { productsQueries } from '../graphql';
import { useTranslation } from 'react-i18next';
import { ProductCreateSidebar } from './ProductCreateSidebar';
import { FormWidgetSideTabs } from '@/widgets/components/FormWidgets';

export const ProductAddSheet = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [showMoreInfo, setShowMoreInfo] = useState<boolean>(false);
  const [, setSelectedTab] = useQueryState<string>('tab');
  const form = useForm<IProductFormValues>({
    resolver: zodResolver(PRODUCT_FORM_SCHEMA),
    defaultValues: EMPTY_PRODUCT_FORM_VALUES,
  });
  const {
    setHotkeyScopeAndMemorizePreviousScope,
    goBackToPreviousHotkeyScope,
  } = usePreviousHotkeyScope();

  const onOpen = () => {
    setOpen(true);
    setHotkeyScopeAndMemorizePreviousScope(ProductHotKeyScope.ProductAddSheet);
  };

  const onClose = () => {
    setOpen(false);
    setShowMoreInfo(false);
    setSelectedTab(null);
    goBackToPreviousHotkeyScope();
  };
  const { t } = useTranslation('product', {
    keyPrefix: 'add',
  });
  const { hasActionPermission } = usePermissionCheck();
  const canCreateProduct = hasActionPermission('productsCreate');

  useScopedHotkeys(
    `c`,
    () => {
      if (!canCreateProduct) return;
      onOpen();
    },
    ProductHotKeyScope.ProductsPage,
    [canCreateProduct],
  );

  return (
    <FocusSheet
      modal
      onOpenChange={(isOpen) => (isOpen ? onOpen() : onClose())}
      open={open}
    >
      <Can action="productsCreate">
        <Sheet.Trigger asChild>
          <Button>
            <IconPlus />
            {t('add-product')}
            <Kbd>C</Kbd>
          </Button>
        </Sheet.Trigger>
      </Can>
      <ProductAddSheetView showMoreInfo={showMoreInfo}>
        <FocusSheet.Header title={t('create-product')} />
        <FocusSheet.Content className="flex-1 min-h-0">
          {showMoreInfo && (
            <FocusSheet.SideBar>
              <ProductCreateSidebar />
            </FocusSheet.SideBar>
          )}
          <div className="flex overflow-hidden flex-col flex-1 min-w-0">
            <AddProductForm
              embed
              form={form}
              onOpenChange={(isOpen) => {
                if (!isOpen) {
                  onClose();
                } else {
                  setOpen(true);
                }
              }}
              showMoreInfo={showMoreInfo}
              onShowMoreInfoChange={setShowMoreInfo}
              options={{ refetchQueries: [productsQueries.productsMain] }}
            />
          </div>
          <FormWidgetSideTabs contentType="core:product" form={form} />
        </FocusSheet.Content>
      </ProductAddSheetView>
    </FocusSheet>
  );
};

const ProductAddSheetView = ({
  showMoreInfo,
  children,
}: {
  showMoreInfo: boolean;
  children: ReactNode;
}) => {
  const { activeSideTab } = useFocusSheet();

  const baseWidthClass = showMoreInfo
    ? 'w-[70%] md:w-[70%] lg:w-[70%]'
    : 'w-[30%] md:w-[30%] lg:w-[30%]';

  const widenedWidthClass = showMoreInfo
    ? 'w-[90%] md:w-[90%] lg:w-[90%]'
    : 'w-[50%] md:w-[50%] lg:w-[50%]';

  const widthClass = activeSideTab ? widenedWidthClass : baseWidthClass;

  return (
    <FocusSheet.View
      className={cn(
        'transition-[width] duration-300 ease-in-out',
        widthClass,
      )}
    >
      {children}
    </FocusSheet.View>
  );
};

export const ProductAddSheetHeader = () => {
  const { t } = useTranslation('product', {
    keyPrefix: 'add',
  });
  return (
    <Sheet.Header className="gap-3 border-b">
      <Sheet.Title>{t('create-product')}</Sheet.Title> <Sheet.Close />
    </Sheet.Header>
  );
};
