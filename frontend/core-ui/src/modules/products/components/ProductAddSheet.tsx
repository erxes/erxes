import { IconPlus } from '@tabler/icons-react';

import {
  Button,
  FocusSheet,
  Kbd,
  Sheet,
  usePreviousHotkeyScope,
  useScopedHotkeys,
  useQueryState,
} from 'erxes-ui';
import { useState } from 'react';
import { ProductHotKeyScope } from '@/products/types/ProductsHotKeyScope';
import { AddProductForm } from 'ui-modules';
import { productsQueries } from '../graphql';
import { useTranslation } from 'react-i18next';
import { ProductCreateSidebar } from './ProductCreateSidebar';

export const ProductAddSheet = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [showMoreInfo, setShowMoreInfo] = useState<boolean>(false);
  const [, setSelectedTab] = useQueryState<string>('tab');
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

  useScopedHotkeys(`c`, () => onOpen(), ProductHotKeyScope.ProductsPage);

  return (
    <FocusSheet
      modal
      onOpenChange={(isOpen) => (isOpen ? onOpen() : onClose())}
      open={open}
    >
      <Sheet.Trigger asChild>
        <Button>
          <IconPlus />
          {t('add-product')}
          <Kbd>C</Kbd>
        </Button>
      </Sheet.Trigger>
      <FocusSheet.View
        className={
          showMoreInfo
            ? 'w-[70%] md:w-[70%] lg:w-[70%]'
            : 'w-[30%] md:w-[30%] lg:w-[30%]'
        }
      >
        <FocusSheet.Header title={t('create-product')} />
        <FocusSheet.Content className="flex-1 min-h-0">
          {showMoreInfo && (
            <FocusSheet.SideBar>
              <ProductCreateSidebar />
            </FocusSheet.SideBar>
          )}
          <div className="flex overflow-hidden flex-col flex-1">
            <AddProductForm
              embed
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
        </FocusSheet.Content>
      </FocusSheet.View>
    </FocusSheet>
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
