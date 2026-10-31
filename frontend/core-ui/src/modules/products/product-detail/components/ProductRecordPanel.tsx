import { zodResolver } from '@hookform/resolvers/zod';
import {
  IconHierarchy2,
  IconHistory,
  IconId,
  IconLayoutGrid,
} from '@tabler/icons-react';
import { Button, Empty, Form, ScrollArea, Spinner, toast } from 'erxes-ui';
import { useContext, useState } from 'react';
import { PanelRecordContext } from '@/side-panel/contexts/PanelRecordContext';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  ActivityLogs,
  AddInternalNote,
  FieldsInDetail,
  IRecordViewProps,
  NEW_RECORD_ID,
  PrintDocument,
  RecordSidePanel,
  usePermissionCheck,
  useProductFileLinks,
} from 'ui-modules';
import { useFormWidgetTabs } from '@/widgets/hooks/useFormWidgetTabs';
import { ProductPanelNew } from '@/products/components/ProductPanelNew';
import { useProductsEdit } from '@/products/hooks/useProductsEdit';
import { ProductPanelIdContext } from '@/products/product-detail/contexts/ProductPanelIdContext';
import { useProductDetailWithQuery } from '@/products/product-detail/hooks/useProductDetailWithQuery';
import { useProductCustomFieldEdit } from '@/products/product-detail/hooks/useProductCustomFieldEdit';
import {
  useProductFormData,
  getProductFormDefaultValues,
} from '@/products/product-detail/hooks/useProductFormData';
import {
  EMPTY_PRODUCT_FORM_VALUES,
  ProductFormSchema,
  ProductFormValues,
} from '@/products/constants/ProductFormSchema';
import { productCustomActivities } from '@/products/product-detail/components/ProductActivityRows';
import { ProductDetailFields } from '@/products/product-detail/components/ProductDetailFields';
import { ProductDetailSimilarity } from '@/products/product-detail/components/ProductDetailSimilarity';
import { productsQueries } from '@/products/graphql';

export const ProductRecordPanel = (props: IRecordViewProps) => (
  <ProductPanelIdContext.Provider value={props.record.contentId}>
    {props.record.contentId === NEW_RECORD_ID ? (
      <ProductDraftPanel {...props} />
    ) : (
      <ProductSavedPanel {...props} />
    )}
  </ProductPanelIdContext.Provider>
);

const ProductDraftPanel = ({ onBack, onClose }: IRecordViewProps) => {
  const { t } = useTranslation('product', { keyPrefix: 'add' });
  const { hasActionPermission } = usePermissionCheck();
  return (
    <>
      <RecordSidePanel.Header
        title={t('create-product', 'Create product')}
        onBack={onBack}
        onClose={onClose}
      />
      {hasActionPermission('productsCreate') ? (
        <ProductPanelNew />
      ) : (
        <div className="p-4">Access denied</div>
      )}
    </>
  );
};

const ProductSavedPanel = ({ onBack, onClose }: IRecordViewProps) => {
  const { t } = useTranslation('product', { keyPrefix: 'detail' });
  const { hasActionPermission } = usePermissionCheck();
  const canEdit = hasActionPermission('productsUpdate');
  const parentView = useContext(PanelRecordContext);
  const [selectedTab, setSelectedTab] = useState(parentView?.tab || 'overview');
  const { productDetail, productId, loading, error, refetch } =
    useProductDetailWithQuery();
  const { productsEdit, loading: editLoading } = useProductsEdit();
  const { linkFiles } = useProductFileLinks();
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(ProductFormSchema),
    defaultValues: EMPTY_PRODUCT_FORM_VALUES,
  });
  const saving = editLoading || form.formState.isSubmitting;
  const formVersion = useProductFormData(productDetail, form, productId);
  const widgets = useFormWidgetTabs({
    contentType: 'core:product',
    contentId: productId,
    form,
  });
  const toAttachmentInput = (
    obj: unknown,
  ):
    | { url?: string; name?: string; type?: string; size?: number }
    | undefined => {
    if (obj == null || typeof obj !== 'object') return undefined;
    return {
      url: 'url' in obj && typeof obj.url === 'string' ? obj.url : undefined,
      name:
        'name' in obj && typeof obj.name === 'string' ? obj.name : undefined,
      type:
        'type' in obj && typeof obj.type === 'string' ? obj.type : undefined,
      size:
        'size' in obj && typeof obj.size === 'number' ? obj.size : undefined,
    };
  };

  const normalizeSubUomRatio = (ratio: unknown): number => {
    if (typeof ratio === 'number' && Number.isFinite(ratio) && ratio > 0)
      return ratio;
    const num = Number(ratio);
    return Number.isFinite(num) && num > 0 ? num : 1;
  };

  const normalizePayload = (data: ProductFormValues) => {
    const attachment =
      data.attachment != null && !Array.isArray(data.attachment)
        ? toAttachmentInput(data.attachment)
        : undefined;
    const attachmentMore = Array.isArray(data.attachmentMore)
      ? data.attachmentMore
          .map((item: unknown) => toAttachmentInput(item))
          .filter((x): x is NonNullable<typeof x> => x != null)
      : undefined;
    const subUoms = Array.isArray(data.subUoms)
      ? data.subUoms.map((item: unknown) => ({
          uom:
            typeof item === 'object' && item !== null && 'uom' in item
              ? item.uom
              : undefined,
          ratio: normalizeSubUomRatio(
            typeof item === 'object' && item !== null && 'ratio' in item
              ? item.ratio
              : undefined,
          ),
        }))
      : data.subUoms;

    return {
      ...data,
      attachment,
      attachmentMore,
      subUoms,
    };
  };

  const handleSave = async (data: ProductFormValues) => {
    if (!canEdit) return;
    if (!productDetail?._id) {
      toast({
        title: t('errorTitle'),
        description: t('productIdMissing'),
        variant: 'destructive',
      });
      return;
    }
    const files = await linkFiles(data.files);

    if (!files) {
      return;
    }

    const variables = {
      ...normalizePayload({ ...data, files }),
      _id: productDetail._id,
    };
    return productsEdit({
      variables,
      refetchQueries: [productsQueries.productsMain],
      awaitRefetchQueries: true,
      onCompleted: () => {
        form.reset(data);
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

  const scroll = (children: React.ReactNode) => (
    <ScrollArea className="min-h-0 flex-1" viewportClassName="[&>div]:block!">
      {children}
    </ScrollArea>
  );
  const header = (
    <RecordSidePanel.Header
      title={productDetail?.name || t('product-detail', 'Product')}
      onBack={onBack}
      onClose={onClose}
    />
  );
  if (loading && !productDetail)
    return (
      <>
        {header}
        <Spinner containerClassName="py-12" />
      </>
    );
  if (error || !productDetail)
    return (
      <>
        {header}
        <Empty>
          <Empty.Header>
            <Empty.Title>{error ? t('errorTitle') : t('notFound')}</Empty.Title>
            <Empty.Description>
              {error?.message || t('notFoundDescription')}
            </Empty.Description>
          </Empty.Header>
          <Empty.Content>
            <Button onClick={() => refetch()}>{t('retry', 'Retry')}</Button>
          </Empty.Content>
        </Empty>
      </>
    );

  return (
    <>
      {header}
      <PanelRecordContext.Provider
        value={{
          ...parentView,
          contentType: 'core:product',
          contentId: productId,
          tab: selectedTab,
        }}
      >
        <Form {...form}>
          <form
            className="flex min-h-0 flex-1 flex-col"
            onSubmit={form.handleSubmit(handleSave, handleInvalid)}
          >
            <RecordSidePanel.Tabs
              value={selectedTab}
              onValueChange={setSelectedTab}
              tabs={[
                {
                  value: 'overview',
                  label: t('overview', 'Details'),
                  icon: IconId,
                  content: scroll(
                    <>
                      <div className="px-3 pt-3">
                        <PrintDocument
                          items={[{ _id: productId }]}
                          contentType="core:product"
                        />
                      </div>
                      <fieldset
                        disabled={!canEdit || saving}
                        className="min-w-0"
                      >
                        <ProductDetailFields
                          key={`${productId}-${formVersion}`}
                          productDetail={productDetail}
                          compact
                        />
                      </fieldset>
                    </>,
                  ),
                },
                {
                  value: 'properties',
                  label: t('properties', 'Properties'),
                  icon: IconHierarchy2,
                  content: scroll(
                    <fieldset
                      disabled={!canEdit || saving}
                      className="min-w-0 p-3"
                    >
                      <FieldsInDetail
                        fieldContentType="core:product"
                        propertiesData={productDetail.propertiesData || {}}
                        mutateHook={useProductCustomFieldEdit}
                        id={productId}
                      />
                    </fieldset>,
                  ),
                },
                {
                  value: 'similarity',
                  label: t('similarity', 'Similarity'),
                  icon: IconLayoutGrid,
                  content: (
                    <ProductDetailSimilarity
                      product={productDetail}
                      callBack={refetch}
                    />
                  ),
                },
                {
                  value: 'activity',
                  label: t('activity', 'Activity'),
                  icon: IconHistory,
                  content: scroll(
                    <div className="py-3">
                      <AddInternalNote
                        contentTypeId={productId}
                        contentType="core:product"
                      />
                      <ActivityLogs
                        targetId={productId}
                        customActivities={productCustomActivities}
                      />
                    </div>,
                  ),
                },
                ...widgets,
              ]}
            />
            {canEdit &&
              (selectedTab === 'overview' ||
                selectedTab.startsWith('form:')) && (
                <div className="flex shrink-0 justify-end gap-2 border-t p-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    {t('cancel', 'Cancel')}
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving
                      ? t('saving', 'Saving…')
                      : t('save-details', 'Save')}
                  </Button>
                </div>
              )}
          </form>
        </Form>
      </PanelRecordContext.Provider>
    </>
  );
};
