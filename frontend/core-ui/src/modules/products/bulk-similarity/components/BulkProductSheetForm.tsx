import { Button, Form, InfoCard, Sheet } from 'erxes-ui';
import { IconLoader2 } from '@tabler/icons-react';
import { useFormContext, useWatch } from 'react-hook-form';
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
  const { control } = useFormContext<BulkSimilarityFormValues>();
  const { includedCount, validation } = useBulkRows();

  const fieldName = (fieldId: string) =>
    fields.find((f) => f._id === fieldId)?.name || fieldId;

  const unitPrice = useWatch({ control, name: 'unitPrice' });

  return (
    <>
      <Sheet.Header className="flex-row items-center gap-3 space-y-0 p-5 border-b">
        <Sheet.Title>
          {similarity ? 'Edit similarity' : 'New similarity'}
        </Sheet.Title>
        <Sheet.Close />
        <Sheet.Description className="sr-only">
          Similarity product form
        </Sheet.Description>
      </Sheet.Header>

      <Sheet.Content className="flex-auto overflow-auto">
        <div className="flex flex-col gap-4 p-5">
          <BulkBaseInfo />

          <div className="relative">
            <InfoCard title="Property fields">
              <InfoCard.Content>
                <VariantFieldPicker />
              </InfoCard.Content>
            </InfoCard>
            <div className="absolute right-3 top-0.5">
              <VariantFieldAddButton />
            </div>
          </div>

          <InfoCard title={`Products (${includedCount})`}>
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
        <div className="flex gap-1 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={!validation.canSave || saving}>
            {saving && <IconLoader2 size={16} className="animate-spin" />}
            {saving ? 'Saving…' : 'Save'}
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
}: BulkProductSheetFormProps) => {
  const { form, fields, buildSavePayload } = useBulkProductForm(similarity);

  const handleSave = async (values: BulkSimilarityFormValues) => {
    await onSave(buildSavePayload(values));
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange} modal>
      <Sheet.View className="p-0 sm:max-w-5xl">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSave)}
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
