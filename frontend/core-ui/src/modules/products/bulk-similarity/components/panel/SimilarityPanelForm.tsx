import {
  IconForms,
  IconId,
  IconListCheck,
  IconPhoto,
} from '@tabler/icons-react';
import { Button, Form, Spinner, toast } from 'erxes-ui';
import type { ReactNode } from 'react';
import type { FieldErrors } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { type IRecordSidePanelTab, RecordSidePanel } from 'ui-modules';
import { PanelReadOnlyTab } from '@/products/product-detail/components/panel/PanelReadOnlyTab';
import { BulkSimilarityFormValues } from '../../constants/bulkSimilaritySchema';
import { useBulkProductForm } from '../../hooks/useBulkProductForm';
import { useBulkRows } from '../../hooks/useBulkRows';
import { IBulkSaveInput, IProductSimilarity } from '../../types';
import { SimilarityPanelFields } from './SimilarityPanelFields';
import { SimilarityPanelMedia } from './SimilarityPanelMedia';
import {
  SimilarityPanelProducts,
  SimilarityPanelProperties,
} from './SimilarityPanelVariants';

const DETAIL_TAB = 'detail';

type TSimilarityPanelFormProps = {
  // The saved group; a new one starts empty.
  similarity?: IProductSimilarity;
  tab: string;
  onTabChange: (tab: string) => void;
  overviewHeader?: ReactNode;
  saving: boolean;
  // Rejects when the group was not saved; the caller has said why.
  onSave: (doc: IBulkSaveInput) => Promise<unknown>;
  // Leaves a new group, or puts a saved one's values back.
  onCancel: () => void;
  cancelLabel: string;
  saveLabel: string;
  // Why it cannot be saved, e.g. no permission: shown, never saved.
  readOnlyReason?: string | null;
};

// The tabs and the Save row, inside the form so they read its rows.
const SimilarityPanelTabs = ({
  tab,
  onTabChange,
  overviewHeader,
  saving,
  onSubmit,
  onCancel,
  cancelLabel,
  saveLabel,
  readOnlyReason,
  draft,
}: Omit<TSimilarityPanelFormProps, 'similarity' | 'onSave'> & {
  onSubmit: () => void;
  draft: boolean;
}) => {
  const { t } = useTranslation('product', { keyPrefix: 'bulk-similarity' });
  const { includedCount, validation } = useBulkRows();
  const editable = (content: ReactNode) => (
    <PanelReadOnlyTab reason={readOnlyReason ?? null}>
      {content}
    </PanelReadOnlyTab>
  );

  const tabs: IRecordSidePanelTab[] = [
    {
      value: DETAIL_TAB,
      label: t('details', 'Details'),
      icon: IconId,
      content: editable(<SimilarityPanelFields draft={draft} />),
    },
    {
      value: 'media',
      label: t('media', 'Media'),
      icon: IconPhoto,
      content: editable(<SimilarityPanelMedia />),
    },
    {
      value: 'properties',
      label: t('property-fields'),
      icon: IconForms,
      content: editable(<SimilarityPanelProperties />),
    },
    {
      value: 'products',
      label: t('products-count', { count: includedCount }),
      icon: IconListCheck,
      content: editable(<SimilarityPanelProducts />),
    },
  ];
  const value = tabs.some((item) => item.value === tab) ? tab : DETAIL_TAB;

  return (
    <>
      {/* Details stays mounted and so does each tab once opened, and Save
          is offered on every tab. */}
      <RecordSidePanel.Tabs
        tabs={tabs}
        value={value}
        onValueChange={onTabChange}
        visibleCount={tabs.length}
        overviewTab={DETAIL_TAB}
        overviewHeader={overviewHeader}
      />
      {!readOnlyReason && (
        <div className="flex shrink-0 justify-end gap-2 border-t bg-background px-3 py-2.5">
          <Button
            type="button"
            variant="outline"
            disabled={saving}
            onClick={onCancel}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            disabled={!validation.canSave || saving}
            onClick={onSubmit}
          >
            {saving && <Spinner size="sm" />}
            {saving ? t('saving') : saveLabel}
          </Button>
        </div>
      )}
    </>
  );
};

/**
 * A similarity group's form as side panel tabs: the shared product info,
 * its images, the variant fields and the products generated from them.
 * Nothing is saved until Save, which generates the group's products.
 */
export const SimilarityPanelForm = ({
  similarity,
  onSave,
  ...props
}: TSimilarityPanelFormProps) => {
  const { t } = useTranslation('product', { keyPrefix: 'bulk-similarity' });
  const { form, buildSavePayload } = useBulkProductForm(similarity);

  const handleSave = async (values: BulkSimilarityFormValues) => {
    try {
      await onSave(buildSavePayload(values));
    } catch {
      // The save hook has shown the error; the values stay to fix.
    }
  };

  const handleInvalid = (errors: FieldErrors<BulkSimilarityFormValues>) => {
    const firstMessage = Object.values(errors).find((error) => error?.message)
      ?.message as string | undefined;

    // Every required field is on Details, where each shows its error.
    if (!errors.rows) props.onTabChange(DETAIL_TAB);
    toast({
      variant: 'destructive',
      title: t('check-required-fields', 'Please fill in the required fields'),
      description: firstMessage,
    });
  };

  return (
    <Form {...form}>
      <SimilarityPanelTabs
        {...props}
        draft={!similarity}
        onSubmit={form.handleSubmit(handleSave, handleInvalid)}
      />
    </Form>
  );
};
