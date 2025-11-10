import type React from 'react';
import { Tabs, Resizable } from 'erxes-ui';
import { ProductDetailSheet } from './ProductDetailSheet';
import { useSearchParams } from 'react-router-dom';
import { ProductDetailFooter } from './ProductDetailFooter';
import type { useForm } from 'react-hook-form';
import { ProductFormValues } from '@/products/constants/ProductFormSchema';

export const ProductDetailLayout = ({
  children,
  form,
}: {
  children: React.ReactNode;
  form: ReturnType<typeof useForm<ProductFormValues>>;
}) => {
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';

  return (
    <ProductDetailSheet>
      <div className="flex h-full flex-auto overflow-auto">
        <div className="flex flex-col flex-auto min-h-full overflow-hidden">
          <div className="flex-1 overflow-auto">
            <Resizable.PanelGroup
              direction="horizontal"
              className="min-h-full overflow-hidden"
            >
              <Resizable.Panel defaultSize={100} minSize={30}>
                <ProductDetailTabs>{children}</ProductDetailTabs>
              </Resizable.Panel>
            </Resizable.PanelGroup>
          </div>
          <div className="bottom-0 left-0 right-0 border-t bg-white z-10 shadow-sm">
            <ProductDetailFooter form={form} activeTab={activeTab} />
          </div>
        </div>
      </div>
    </ProductDetailSheet>
  );
};

const ProductDetailTabs = ({ children }: { children: React.ReactNode }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedTab = searchParams.get('tab') || 'overview';

  const handleTabChange = (tab: string) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('tab', tab);
    setSearchParams(newSearchParams);
  };

  return (
    <Tabs
      value={selectedTab}
      onValueChange={handleTabChange}
      className="flex-auto flex flex-col bg-background"
    >
      <Tabs.List className="h-12">
        <Tabs.Trigger value="overview" className="text-base h-full">
          Overview
        </Tabs.Trigger>
        <Tabs.Trigger value="properties" className="text-base h-full">
          Properties
        </Tabs.Trigger>
      </Tabs.List>
      {children}
    </Tabs>
  );
};

export const ProductDetailTabContent = ({
  children,
  value,
}: {
  children: React.ReactNode;
  value: string;
}) => {
  return (
    <Tabs.Content value={value} className="flex-auto overflow-auto h-full">
      {children}
    </Tabs.Content>
  );
};
