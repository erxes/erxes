import {
  IconAlignLeft,
  IconBarcode,
  IconEye,
  IconForms,
  IconHistory,
  IconId,
  IconLayoutGrid,
  IconPhoto,
} from '@tabler/icons-react';
import { Alert, Button, Empty, ScrollArea, Spinner } from 'erxes-ui';
import { type ReactNode, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityLogs,
  AddInternalNote,
  FieldsInDetail,
  type IRecordSidePanelTab,
  type IRecordViewProps,
  NEW_RECORD_ID,
  RecordSidePanel,
  usePanelExpanded,
  usePermissionCheck,
  useSidePanel,
} from 'ui-modules';
import { ContactPanelIdentity } from '@/side-panel/components/details/ContactPanelActions';
import { ContactDescriptionEditor } from '@/side-panel/components/details/ContactDescriptionEditor';
import { useProductDetail } from '@/products/product-detail/hooks/useProductDetail';
import { useProductCustomFieldEdit } from '@/products/product-detail/hooks/useProductCustomFieldEdit';
import { useProductPanelSave } from '@/products/product-detail/hooks/useProductPanelSave';
import { productCustomActivities } from '@/products/product-detail/components/ProductActivityRows';
import { ProductDetailSimilarity } from '@/products/product-detail/components/ProductDetailSimilarity';
import {
  PRODUCT_DELETED_STATUS,
  ProductPanelActions,
} from './ProductPanelActions';
import { ProductPanelBreadcrumb } from './ProductPanelBreadcrumb';
import { ProductPanelDetail } from './ProductPanelDetail';
import { ProductPanelInventory } from './ProductPanelInventory';
import { ProductPanelMedia } from './ProductPanelMedia';
import { ProductPanelNew } from './ProductPanelNew';

// Radix sizes its content as a table, which lets wide values push past the
// panel; a block lets each value shrink and truncate instead.
const scroll = (content: ReactNode) => (
  <ScrollArea className="flex-1 min-h-0" viewportClassName="[&>div]:block!">
    {content}
  </ScrollArea>
);

// A read-only product's changes are never sent.
const skipSave = () => Promise.resolve(null);

/**
 * A read-only tab: why it cannot be edited, then its content with every
 * control disabled.
 */
const ReadOnlyTab = ({
  reason,
  children,
}: {
  reason: string | null;
  children: ReactNode;
}) =>
  reason ? (
    <fieldset disabled className="flex min-h-0 min-w-0 flex-1 flex-col">
      <Alert className="m-3 mb-0 w-auto shrink-0 items-center">
        <IconEye />
        <Alert.Description>{reason}</Alert.Description>
      </Alert>
      {children}
    </fieldset>
  ) : (
    children
  );

/**
 * A product in the app's side panel (`?panel=/detail/core:product/<id>`):
 * its fields, media, barcodes, properties, activity and similarity group as
 * tabs. Values save as they are changed. Expanded, it is the product's own
 * page: the details beside the other tabs. A new product (`NEW_RECORD_ID`)
 * is drawn the same way as a draft. A deleted product, or one the user may
 * not update, is shown read-only.
 */
export const ProductRecordPanel = ({
  record,
  onBack,
  onClose,
}: IRecordViewProps) => {
  const { t } = useTranslation('product', { keyPrefix: 'detail' });
  const { t: rootT } = useTranslation('product');
  const { t: panelT } = useTranslation('common', { keyPrefix: 'side-panel' });
  const productId = record.contentId;
  const isNew = productId === NEW_RECORD_ID;
  const { hasActionPermission } = usePermissionCheck();
  const { productDetail, loading, error, refetch } = useProductDetail({
    _id: productId,
    skip: isNew,
  });
  const { save } = useProductPanelSave(productId);
  const { tab: selectedTab, setTab, dismissPath, path } = useSidePanel();
  const expanded = usePanelExpanded();
  const product = useMemo(
    () =>
      productDetail?._id ? { ...productDetail, _id: productDetail._id } : null,
    [productDetail],
  );

  if (isNew) {
    return hasActionPermission('productsCreate') ? (
      <ProductPanelNew onBack={onBack} onClose={onClose} />
    ) : (
      <>
        <RecordSidePanel.Header
          title={rootT('new-product')}
          onBack={onBack}
          onClose={onClose}
        />
        <div className="p-4">{panelT('access-denied', 'Access denied')}</div>
      </>
    );
  }

  // The name is shown and edited on Details, where a long one wraps; the
  // header keeps to what the panel is.
  const title = t('product-detail');

  const header = (
    <RecordSidePanel.Header
      className={expanded ? 'h-10 bg-background px-3' : undefined}
      title={expanded ? <ProductPanelBreadcrumb title={title} /> : title}
      actions={
        product && (
          <ProductPanelActions
            product={product}
            // On its own page it goes back to the list; in the panel, to the
            // record before it.
            onDeleted={() =>
              !expanded && path ? dismissPath(path) : onClose()
            }
          />
        )
      }
      onBack={onBack}
      onClose={onClose}
    />
  );

  if (loading && !product) {
    return (
      <>
        {header}
        <Spinner containerClassName="py-12" />
      </>
    );
  }

  if (!product) {
    return (
      <>
        {header}
        <Empty className="py-12">
          <Empty.Header>
            <Empty.Title>{error ? t('errorTitle') : t('notFound')}</Empty.Title>
            <Empty.Description>
              {error?.message || t('notFoundDescription')}
            </Empty.Description>
          </Empty.Header>
          {error && (
            <Empty.Content>
              <Button onClick={() => refetch()}>{t('retry', 'Retry')}</Button>
            </Empty.Content>
          )}
        </Empty>
      </>
    );
  }

  // A deleted product's edits would make it active again: Restore does that.
  let readOnlyReason: string | null = null;
  if (product.status === PRODUCT_DELETED_STATUS) {
    readOnlyReason = t(
      'deleted-read-only',
      'This product is deleted. Restore it to edit.',
    );
  } else if (!hasActionPermission('productsUpdate')) {
    readOnlyReason = t(
      'no-update-permission',
      'You can view this product but not edit it.',
    );
  }
  const readOnly = !!readOnlyReason;
  const saveField = readOnly ? skipSave : save;
  const editable = (content: ReactNode) => (
    <ReadOnlyTab reason={readOnlyReason}>{content}</ReadOnlyTab>
  );

  const tabs: IRecordSidePanelTab[] = [
    {
      value: 'detail',
      label: t('details', 'Details'),
      icon: IconId,
      content: editable(
        <ProductPanelDetail
          product={product}
          save={saveField}
          readOnly={readOnly}
        />,
      ),
    },
    // On the product's page the description gets its own, full-size tab.
    ...(expanded
      ? [
          {
            value: 'description',
            label: t('description'),
            icon: IconAlignLeft,
            content: editable(
              <ContactDescriptionEditor
                // Restore makes it editable: a new editor reads that.
                key={`${product._id}-${readOnly}`}
                value={product.description || ''}
                scope={`product-page.${product._id}.description`}
                readonly={readOnly}
                onSave={(description) => saveField({ description })}
              />,
            ),
          },
        ]
      : []),
    {
      value: 'media',
      label: t('media', 'Media'),
      icon: IconPhoto,
      content: editable(
        <ProductPanelMedia product={product} save={saveField} />,
      ),
    },
    {
      value: 'inventory',
      label: t('barcodes'),
      icon: IconBarcode,
      content: editable(
        <ProductPanelInventory product={product} save={saveField} />,
      ),
    },
    {
      value: 'properties',
      label: t('properties', 'Properties'),
      icon: IconForms,
      content: editable(
        scroll(
          <div className="p-3">
            <FieldsInDetail
              bare
              fieldContentType="core:product"
              propertiesData={product.propertiesData || {}}
              mutateHook={useProductCustomFieldEdit}
              id={product._id}
            />
          </div>,
        ),
      ),
    },
    {
      value: 'activity',
      label: t('activity', 'Activity'),
      icon: IconHistory,
      content: (
        <div className="flex flex-col flex-1 min-h-0">
          {scroll(
            <div className="pt-3 [&_.px-6]:px-2">
              <ActivityLogs
                targetId={product._id}
                customActivities={productCustomActivities}
                variant="backward"
              />
            </div>,
          )}
          <div className="shrink-0 pb-4 pt-2 [&_.ml-10]:ml-4 [&_.mr-8]:mr-4">
            <AddInternalNote
              contentTypeId={product._id}
              contentType="core:product"
            />
          </div>
        </div>
      ),
    },
    {
      value: 'similarity',
      label: t('similarity', 'Similarity'),
      icon: IconLayoutGrid,
      content: <ProductDetailSimilarity product={product} callBack={refetch} />,
    },
  ];
  const tab = tabs.some(({ value }) => value === selectedTab)
    ? selectedTab
    : 'detail';

  return (
    <RecordSidePanel.Layout
      header={header}
      overviewHeader={<ContactPanelIdentity title={t('details', 'Details')} />}
      visibleCount={expanded ? tabs.length : undefined}
      value={tab}
      onValueChange={setTab}
      tabs={tabs}
    />
  );
};
