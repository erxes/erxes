import {
  Empty,
  FocusSheet,
  Form,
  ScrollArea,
  Tabs,
  useQueryState,
  useToast,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ActivityLogs, FieldsInDetail } from 'ui-modules';
import { useProductDetailWithQuery } from '@/products/product-detail/hooks/useProductDetailWithQuery';
import { useProductCustomFieldEdit } from '@/products/product-detail/hooks/useProductCustomFieldEdit';
import {
  useProductFormData,
  getProductFormDefaultValues,
} from '@/products/product-detail/hooks/useProductFormData';
import { IconAlertCircle, IconCloudExclamation } from '@tabler/icons-react';
import { ProductDetailSidebar } from '@/products/product-detail/components/ProductDetailSidebar';
import { ProductDetailFooter } from '@/products/product-detail/components/ProductDetailFooter';
import { ProductDetailFields } from '@/products/product-detail/components/ProductDetailFields';
import { PRODUCT_QUERY_KEY } from '@/products/constants/productQueryKey';
import {
  EMPTY_PRODUCT_FORM_VALUES,
  ProductFormSchema,
  ProductFormValues,
} from '@/products/constants/ProductFormSchema';
import { useProductsEdit } from '@/products/hooks/useProductsEdit';

export const ProductDetailSheet = () => {
  const { t } = useTranslation('product', {
    keyPrefix: 'detail',
  });
  const { toast } = useToast();
  const [open, setOpen] = useQueryState<string>(PRODUCT_QUERY_KEY);
  const { productDetail, loading, error } = useProductDetailWithQuery();
  const [selectedTab, setSelectedTab] = useQueryState<string>('tab');
  const { productsEdit, loading: editLoading } = useProductsEdit();

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(ProductFormSchema),
    defaultValues: EMPTY_PRODUCT_FORM_VALUES,
  });

  useProductFormData(productDetail, form);

  const toAttachmentInput = (
    obj: Record<string, unknown> | null | undefined,
  ):
    | { url?: string; name?: string; type?: string; size?: number }
    | undefined => {
    if (obj == null || typeof obj !== 'object') return undefined;
    const { url, name, type, size } = obj;
    return {
      url: url as string | undefined,
      name: name as string | undefined,
      type: type as string | undefined,
      size: size as number | undefined,
    };
  };

  const normalizeSubUomRatio = (ratio: number | string | undefined): number => {
    if (typeof ratio === 'number' && Number.isFinite(ratio) && ratio > 0)
      return ratio;
    const num = Number(ratio);
    return Number.isFinite(num) && num > 0 ? num : 1;
  };

  const normalizePayload = (data: ProductFormValues) => {
    const attachment =
      data.attachment != null && !Array.isArray(data.attachment)
        ? toAttachmentInput(data.attachment as Record<string, unknown>)
        : undefined;
    const attachmentMore = Array.isArray(data.attachmentMore)
      ? data.attachmentMore
          .map((item) => toAttachmentInput(item as Record<string, unknown>))
          .filter((x): x is NonNullable<typeof x> => x != null)
      : undefined;
    const subUoms = Array.isArray(data.subUoms)
      ? data.subUoms.map((item) => ({
          ...item,
          ratio: normalizeSubUomRatio(item?.ratio),
        }))
      : data.subUoms;
    return { ...data, attachment, attachmentMore, subUoms };
  };

  const handleSave = (data: ProductFormValues) => {
    if (!productDetail?._id) {
      toast({
        title: t('errorTitle'),
        description: t('productIdMissing'),
        variant: 'destructive',
      });
      return;
    }
    const variables = { ...normalizePayload(data), _id: productDetail._id };
    productsEdit({
      variables,
      onCompleted: () => {
        toast({
          title: t('successTitle'),
          description: t('productUpdated'),
          variant: 'success',
        });
      },
      onError: (err) => {
        toast({
          title: t('errorTitle'),
          description: err.message || t('unknownError'),
          variant: 'destructive',
        });
      },
    });
  };

  const handleInvalid = (errors: Record<string, { message?: string }>) => {
    const firstError = Object.values(errors)[0];
    toast({
      title: t('validationErrorTitle'),
      description: firstError?.message || t('validationErrorDescription'),
      variant: 'destructive',
    });
  };

  const handleCancel = () => {
    const defaults = getProductFormDefaultValues(productDetail);
    if (defaults) form.reset(defaults);
  };

  return (
    <FocusSheet open={!!open} onOpenChange={() => setOpen(null)}>
      <FocusSheet.View
        loading={loading}
        error={!!error}
        notFound={!productDetail}
        notFoundState={<ProductDetailEmptyState />}
        errorState={<ProductDetailErrorState />}
        className="w-[70%] md:w-[70%]"
      >
        <FocusSheet.Header title={productDetail?.name || t('product-detail')} />
        <FocusSheet.Content className="flex overflow-hidden flex-row flex-1 min-w-0 min-h-0">
          <FocusSheet.SideBar>
            <ProductDetailSidebar />
          </FocusSheet.SideBar>
          <div className="flex overflow-hidden flex-col flex-1 min-w-0 min-h-0">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSave, handleInvalid)}
                className="flex overflow-hidden flex-col flex-1 min-w-0 min-h-0"
              >
                <ScrollArea
                  className="flex-1 min-h-0"
                  viewportClassName="h-full min-h-[200px]"
                >
                  <Tabs
                    value={selectedTab ?? 'overview'}
                    onValueChange={setSelectedTab}
                    className="h-full"
                  >
                    <Tabs.Content
                      value="overview"
                      className="data-[state=active]:min-h-0"
                    >
                      <ProductDetailFields />
                    </Tabs.Content>
                    <Tabs.Content
                      value="properties"
                      className="p-4 data-[state=active]:min-h-0"
                    >
                      <FieldsInDetail
                        fieldContentType="core:product"
                        propertiesData={productDetail?.propertiesData || {}}
                        mutateHook={useProductCustomFieldEdit}
                        id={productDetail?._id || ''}
                      />
                    </Tabs.Content>
                    <Tabs.Content
                      value="activity"
                      className="data-[state=active]:min-h-0"
                    >
                      <ActivityLogs targetId={productDetail?._id || ''} />
                    </Tabs.Content>
                  </Tabs>
                </ScrollArea>
                <ProductDetailFooter
                  form={form}
                  activeTab={selectedTab ?? 'overview'}
                  onCancel={handleCancel}
                  onSave={() => form.handleSubmit(handleSave, handleInvalid)()}
                  editLoading={editLoading}
                />
              </form>
            </Form>
          </div>
        </FocusSheet.Content>
      </FocusSheet.View>
    </FocusSheet>
  );
};

const ProductDetailEmptyState = () => {
  const { t } = useTranslation('product', { keyPrefix: 'detail' });
  return (
    <div className="flex justify-center items-center h-full">
      <Empty>
        <Empty.Header>
          <Empty.Media variant="icon">
            <IconCloudExclamation />
          </Empty.Media>
          <Empty.Title>{t('notFound')}</Empty.Title>
          <Empty.Description>{t('notFoundDescription')}</Empty.Description>
        </Empty.Header>
      </Empty>
    </div>
  );
};

const ProductDetailErrorState = () => {
  const { t } = useTranslation('product', { keyPrefix: 'detail' });
  const { error } = useProductDetailWithQuery();
  return (
    <div className="flex justify-center items-center h-full">
      <Empty>
        <Empty.Header>
          <Empty.Media variant="icon">
            <IconAlertCircle />
          </Empty.Media>
          <Empty.Title>{t('errorTitle')}</Empty.Title>
          <Empty.Description>
            {error?.message ?? t('unknownError')}
          </Empty.Description>
        </Empty.Header>
      </Empty>
    </div>
  );
};
