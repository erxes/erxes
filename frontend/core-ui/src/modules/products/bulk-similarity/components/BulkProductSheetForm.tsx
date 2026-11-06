import { Button, Form, InfoCard, Sheet, toast } from 'erxes-ui';
import { IconLoader2 } from '@tabler/icons-react';
import { FieldErrors, useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useBulkProductForm } from '../hooks/useBulkProductForm';
import { useBulkRows } from '../hooks/useBulkRows';
import { BulkSimilarityFormValues } from '../constants/bulkSimilaritySchema';
import { IBulkSaveInput, IProductSimilarity } from '../types';
import { BulkBaseInfo } from './BulkBaseInfo';
import { GeneratedProductsTable } from './GeneratedProductsTable';
import {
  VariantFieldAddButton,
  VariantFieldPicker,
} from './VariantFieldPicker';

interface BulkProductSheetFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  similarity?: IProductSimilarity;
  saving: boolean;
  onSave: (doc: IBulkSaveInput) => Promise<unknown>;
  callBack?: () => void;
}

interface BulkProductSheetFieldsProps {
  similarity?: IProductSimilarity;
  saving: boolean;
  fields: ReturnType<typeof useBulkProductForm>['fields'];
  onOpenChange: (open: boolean) => void;
}

const BulkProductSheetFields = ({
  similarity,
  saving,
  fields,
  onOpenChange,
}: BulkProductSheetFieldsProps) => {
  const { t } = useTranslation('product', { keyPrefix: 'bulk-similarity' });
  const { control } = useFormContext<BulkSimilarityFormValues>();
  const { includedCount, validation } = useBulkRows();

  const fieldName = (fieldId: string) =>
    fields.find((f) => f._id === fieldId)?.name || fieldId;

  const unitPrice = useWatch({ control, name: 'unitPrice' });

  return (
    <>
      <Sheet.Header className="flex-row items-center gap-3 space-y-0 p-5 border-b">
        <Sheet.Title>
          {similarity?._id
            ? t('edit-similarity', 'Edit similarity')
            : t('new-similarity', 'New similarity')}
        </Sheet.Title>
        <Sheet.Close />
        <Sheet.Description className="sr-only">
          {t('form-description', 'Similarity product form')}
        </Sheet.Description>
      </Sheet.Header>

      <Sheet.Content className="flex-auto overflow-auto">
        <div className="flex flex-col gap-4 p-5">
          <BulkBaseInfo />

          <div className="relative">
            <InfoCard title={t('property-fields', 'Property fields')}>
              <InfoCard.Content>
                <VariantFieldPicker />
              </InfoCard.Content>
            </InfoCard>
            <div className="top-0.5 right-3 absolute">
              <VariantFieldAddButton />
            </div>
          </div>

          <InfoCard
            title={t('products-count', {
              count: includedCount,
              defaultValue: 'Products ({{count}})',
            })}
          >
            <InfoCard.Content>
              <GeneratedProductsTable
                fieldName={fieldName}
                unitPrice={unitPrice}
              />
            </InfoCard.Content>
          </InfoCard>
        </div>
      </Sheet.Content>

      <Sheet.Footer className="flex-col items-stretch sm:items-stretch gap-2 bg-muted p-2.5 h-auto shrink-0">
        <div className="flex justify-end gap-1">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            {t('cancel', 'Cancel')}
          </Button>
          <Button type="submit" disabled={!validation.canSave || saving}>
            {saving && <IconLoader2 size={16} className="animate-spin" />}
            {saving ? t('saving', 'Saving…') : t('save', 'Save')}
          </Button>
        </div>
      </Sheet.Footer>
    </>
  );
};

export const BulkProductSheetForm = ({
  open,
  onOpenChange,
  similarity,
  saving,
  onSave,
  callBack,
}: BulkProductSheetFormProps) => {
  const { t } = useTranslation('product', { keyPrefix: 'bulk-similarity' });
  const { form, fields, buildSavePayload } = useBulkProductForm(similarity);

  const handleSave = async (values: BulkSimilarityFormValues) => {
    await onSave(buildSavePayload(values));
    onOpenChange(false);
    callBack?.();
  };

  const handleInvalid = (errors: FieldErrors<BulkSimilarityFormValues>) => {
    const firstMessage = Object.values(errors).find((error) => error?.message)
      ?.message as string | undefined;

    toast({
      variant: 'destructive',
      title: t('check-required-fields', 'Please fill in the required fields'),
      description: firstMessage,
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange} modal>
      <Sheet.View className="p-0 w-[70%] md:w-[70%] lg:w-3/4 sm:max-w-screen-2xl">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSave, handleInvalid)}
            className="flex flex-col h-full overflow-hidden"
          >
            <BulkProductSheetFields
              similarity={similarity}
              saving={saving}
              fields={fields}
              onOpenChange={onOpenChange}
            />
          </form>
        </Form>
      </Sheet.View>
    </Sheet>
  );
};
