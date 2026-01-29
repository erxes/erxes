import { Empty, FocusSheet, ScrollArea, Tabs, useQueryState } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { ActivityLogs, FieldsInDetail } from 'ui-modules';
import { ProductDetailFields } from './ProductDetailFields';
import { useProductDetailWithQuery } from '../hooks/useProductDetailWithQuery';
import { useProductCustomFieldEdit } from '../hooks/useProductCustomFieldEdit';
import { IconAlertCircle, IconCloudExclamation } from '@tabler/icons-react';
import { ProductDetailSidebar } from './ProductDetailSidebar';
import { PRODUCT_QUERY_KEY } from '@/products/constants/productQueryKey';

export const ProductDetailSheet = () => {
  const { t } = useTranslation('product', {
    keyPrefix: 'detail',
  });
  const [open, setOpen] = useQueryState<string>(PRODUCT_QUERY_KEY);
  const { productDetail, loading, error } = useProductDetailWithQuery();
  const [selectedTab, setSelectedTab] = useQueryState<string>('tab');

  return (
    <FocusSheet open={!!open} onOpenChange={() => setOpen(null)}>
      <FocusSheet.View
        loading={loading}
        error={!!error}
        notFound={!productDetail}
        notFoundState={<ProductDetailEmptyState />}
        errorState={<ProductDetailErrorState />}
      >
        <FocusSheet.Header title={productDetail?.name || t('product-detail')} />
        <FocusSheet.Content className="flex-1 min-h-0">
          <FocusSheet.SideBar>
            <ProductDetailSidebar />
          </FocusSheet.SideBar>
          <div className="flex overflow-hidden flex-col flex-1">
            <ScrollArea className="flex-1" viewportClassName="h-full">
              <Tabs
                value={selectedTab ?? 'overview'}
                onValueChange={setSelectedTab}
              >
                <Tabs.Content value="overview">
                  <ProductDetailFields />
                </Tabs.Content>
                <Tabs.Content value="properties" className="p-6">
                  <FieldsInDetail
                    fieldContentType="core:product"
                    customFieldsData={productDetail?.customFieldsData || {}}
                    mutateHook={useProductCustomFieldEdit}
                    id={productDetail?._id || ''}
                  />
                </Tabs.Content>
                <Tabs.Content value="activity">
                  <ActivityLogs targetId={productDetail?._id || ''} />
                </Tabs.Content>
              </Tabs>
            </ScrollArea>
          </div>
        </FocusSheet.Content>
      </FocusSheet.View>
    </FocusSheet>
  );
};

const ProductDetailEmptyState = () => {
  return (
    <div className="flex justify-center items-center h-full">
      <Empty>
        <Empty.Header>
          <Empty.Media variant="icon">
            <IconCloudExclamation />
          </Empty.Media>
          <Empty.Title>Product not found</Empty.Title>
          <Empty.Description>
            There seems to be no product with this ID.
          </Empty.Description>
        </Empty.Header>
      </Empty>
    </div>
  );
};

const ProductDetailErrorState = () => {
  const { error } = useProductDetailWithQuery();
  return (
    <div className="flex justify-center items-center h-full">
      <Empty>
        <Empty.Header>
          <Empty.Media variant="icon">
            <IconAlertCircle />
          </Empty.Media>
          <Empty.Title>Error</Empty.Title>
          <Empty.Description>{error?.message}</Empty.Description>
        </Empty.Header>
      </Empty>
    </div>
  );
};
