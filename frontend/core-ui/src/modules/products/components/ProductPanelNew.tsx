import { zodResolver } from '@hookform/resolvers/zod';
import { IconId, IconHierarchy2 } from '@tabler/icons-react';
import { useContext, useState } from 'react';
import { PanelRecordContext } from '@/side-panel/contexts/PanelRecordContext';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  AddProductForm,
  EMPTY_PRODUCT_FORM_VALUES,
  IProductFormValues,
  PRODUCT_FORM_SCHEMA,
  RecordSidePanel,
  useSidePanel,
  useSidePanelDraft,
} from 'ui-modules';
import { useFormWidgetTabs } from '@/widgets/hooks/useFormWidgetTabs';
import { useCreatedPanelRecord } from '@/side-panel/hooks/useCreatedPanelRecord';
import { productsQueries } from '../graphql';

export const ProductPanelNew = () => {
  const { t } = useTranslation('product', { keyPrefix: 'add' });
  const { back, canGoBack, close } = useSidePanel();
  const onCreated = useCreatedPanelRecord('core:product');
  const defaults = useSidePanelDraft<IProductFormValues>('core:product');
  const form = useForm<IProductFormValues>({
    // The shared package and core currently resolve different Zod minor
    // versions; the resolver accepts the same runtime schema contract.
    resolver: zodResolver(
      PRODUCT_FORM_SCHEMA as unknown as Parameters<typeof zodResolver>[0],
    ),
    defaultValues: { ...EMPTY_PRODUCT_FORM_VALUES, ...defaults },
  });
  const parentView = useContext(PanelRecordContext);
  const [tab, setTab] = useState(parentView?.tab || 'overview');
  const [showMore, setShowMore] = useState(false);
  const widgets = useFormWidgetTabs({ contentType: 'core:product', form });
  const cancel = () => (canGoBack ? back() : close());
  const content = (activeTab: string, extraContent?: React.ReactNode) => (
    <AddProductForm
      embed
      form={form}
      activeTab={activeTab}
      extraContent={extraContent}
      showMoreInfo={showMore}
      onShowMoreInfoChange={setShowMore}
      onOpenChange={(open) => !open && cancel()}
      onCreated={onCreated}
      options={{ refetchQueries: [productsQueries.productsMain] }}
    />
  );

  return (
    <PanelRecordContext.Provider
      value={{
        ...parentView,
        contentType: 'core:product',
        contentId: 'new',
        tab,
      }}
    >
      <RecordSidePanel.Tabs
        value={tab}
        onValueChange={setTab}
        tabs={[
          {
            value: 'overview',
            label: t('product-information', 'Details'),
            icon: IconId,
            content: content('overview'),
          },
          {
            value: 'properties',
            label: t('properties', 'Properties'),
            icon: IconHierarchy2,
            content: content('properties'),
          },
          ...widgets.map((widget) => ({
            ...widget,
            content: content(widget.value, widget.content),
          })),
        ]}
      />
    </PanelRecordContext.Provider>
  );
};
