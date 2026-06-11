import { Button, Form, InfoCard, Sheet } from 'erxes-ui';
import { IconAlertTriangle, IconLoader2 } from '@tabler/icons-react';
import { useBulkProductForm } from '../hooks/useBulkProductForm';
import { useProductSimilarityMutations } from '../hooks/useProductSimilarities';
import { BulkSimilarityFormValues } from '../constants/bulkSimilaritySchema';
import { IProductSimilarity } from '../types';
import { BulkBaseInfo } from './BulkBaseInfo';
import { GeneratedProductsTable } from './GeneratedProductsTable';
import {
  VariantFieldAddButton,
  VariantFieldPicker,
} from './VariantFieldPicker';

interface BulkProductSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  similarity?: IProductSimilarity;
}

export const BulkProductSheet = ({
  open,
  onOpenChange,
  similarity,
}: BulkProductSheetProps) => {
  const { bulkSave, saving } = useProductSimilarityMutations();

  const {
    form,
    info,
    selection,
    fieldIds,
    fields,
    matrix,
    starRowKey,
    setStarRowKey,
    toggleFieldValue,
    removeField,
    setRowCode,
    setRowPrice,
    toggleRowExcluded,
    setAllExcluded,
    labelOf,
    duplicateCodes,
    includedCount,
    validation,
    buildSavePayload,
  } = useBulkProductForm(similarity);

  const fieldName = (fieldId: string) =>
    fields.find((f) => f._id === fieldId)?.name || fieldId;

  const onSubmit = async (values: BulkSimilarityFormValues) => {
    if (!validation.canSave || saving) return;
    await bulkSave(similarity?._id, buildSavePayload(values));
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange} modal>
      <Sheet.View className="p-0 sm:max-w-5xl">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col h-full overflow-hidden"
          >
            <Sheet.Header className="flex-row items-center gap-3 space-y-0 p-5 border-b">
              <Sheet.Title>
                {similarity ? 'Edit similarity' : 'New similarity'}
              </Sheet.Title>
              <Sheet.Close />
              <Sheet.Description className="sr-only">
                Bulk similarity product form
              </Sheet.Description>
            </Sheet.Header>

            <Sheet.Content className="flex-auto overflow-auto">
              <div className="flex flex-col gap-4 p-5">
                <BulkBaseInfo />

                <div className="relative">
                  <InfoCard title="Property fields">
                    <InfoCard.Content>
                      <VariantFieldPicker
                        selection={selection}
                        fieldIds={fieldIds}
                        onToggleValue={toggleFieldValue}
                        onRemoveField={removeField}
                      />
                    </InfoCard.Content>
                  </InfoCard>
                  <div className="absolute right-3 top-0.5">
                    <VariantFieldAddButton
                      fieldIds={fieldIds}
                      onToggleValue={toggleFieldValue}
                    />
                  </div>
                </div>

                <InfoCard title={`Products (${includedCount})`}>
                  <InfoCard.Content>
                    <GeneratedProductsTable
                      matrix={matrix}
                      fieldIds={fieldIds}
                      labelOf={labelOf}
                      fieldName={fieldName}
                      starRowKey={starRowKey}
                      duplicateCodes={duplicateCodes}
                      defaultUnitPrice={info.unitPrice}
                      onSetStar={setStarRowKey}
                      onSetCode={setRowCode}
                      onSetPrice={setRowPrice}
                      onToggleExcluded={toggleRowExcluded}
                      onSetAllExcluded={setAllExcluded}
                    />
                  </InfoCard.Content>
                </InfoCard>
              </div>
            </Sheet.Content>

            <Sheet.Footer className="flex-col items-stretch sm:items-stretch gap-2 bg-muted p-2.5 h-auto shrink-0">
              {validation.errors.length > 0 && (
                <ul className="space-y-1 px-1">
                  {validation.errors.map((error) => (
                    <li
                      key={error}
                      className="flex gap-1.5 items-center text-xs text-destructive"
                    >
                      <IconAlertTriangle size={13} className="shrink-0" />
                      {error}
                    </li>
                  ))}
                </ul>
              )}
              <div className="flex gap-1 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!validation.canSave || saving}
                >
                  {saving && <IconLoader2 size={16} className="animate-spin" />}
                  {saving ? 'Saving…' : 'Save'}
                </Button>
              </div>
            </Sheet.Footer>
          </form>
        </Form>
      </Sheet.View>
    </Sheet>
  );
};
