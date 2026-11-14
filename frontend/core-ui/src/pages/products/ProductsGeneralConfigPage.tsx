import { GeneralConfigForm } from '@/products/settings/components/productsConfig/generalConfig/GeneralConfigForm';
import { ProductsHeader } from '@/products/components/ProductsHeader';
import { PageContainer, ScrollArea } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ProductEditorPanel,
  ProductEditorHeader,
} from '@/products/components/ProductEditorPanel';
import { ProductSidebar } from '@/products/components/ProductSidebar';

export const ProductsGeneralConfigPage = () => {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation('product');
  return (
    <PageContainer className="flex-row">
      <ProductSidebar />
      <div className="flex min-w-0 flex-auto flex-col overflow-hidden">
        <ProductsHeader />
        <div className="flex overflow-hidden flex-col flex-auto w-full">
          <div className="p-3">
            <GeneralConfigForm onEdit={() => setOpen(true)} />
          </div>
        </div>
      </div>
      <ProductEditorPanel
        name="general-config"
        open={open}
        onOpenChange={setOpen}
        requiredPermission="productsConfigsManage"
      >
        <ProductEditorHeader
          title={t('general-config', 'General configuration')}
        />
        <ScrollArea className="min-h-0 flex-1" viewportClassName="p-4">
          <GeneralConfigForm />
        </ScrollArea>
      </ProductEditorPanel>
    </PageContainer>
  );
};
