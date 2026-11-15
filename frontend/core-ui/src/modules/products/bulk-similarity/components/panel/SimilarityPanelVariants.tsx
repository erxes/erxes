import { ScrollArea } from 'erxes-ui';
import { useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useFields } from 'ui-modules';
import { BulkSimilarityFormValues } from '../../constants/bulkSimilaritySchema';
import { useBulkRows } from '../../hooks/useBulkRows';
import { GeneratedProductsTable } from '../GeneratedProductsTable';
import {
  VariantFieldAddButton,
  VariantFieldAddView,
  VariantFieldPicker,
} from '../VariantFieldPicker';

// The Properties tab: the fields whose chosen values make the variants.
// Adding a field is shown in the tab, in place of the list.
export const SimilarityPanelProperties = ({
  disabled = false,
}: {
  disabled?: boolean;
}) => {
  const { t } = useTranslation('product', { keyPrefix: 'bulk-similarity' });
  const [adding, setAdding] = useState(false);

  return (
    <ScrollArea className="flex-1 min-h-0" viewportClassName="[&>div]:block!">
      <section className="flex min-w-0 flex-col gap-2 p-3">
        {adding ? (
          <VariantFieldAddView
            disabled={disabled}
            onDone={() => setAdding(false)}
          />
        ) : (
          <>
            <div className="flex h-7 items-center justify-between gap-2">
              <h3 className="text-xs font-medium">{t('property-fields')}</h3>
              <VariantFieldAddButton onClick={() => setAdding(true)} />
            </div>
            <VariantFieldPicker disabled={disabled} />
          </>
        )}
      </section>
    </ScrollArea>
  );
};

// The Products tab: one row per combination, each a product on Save.
// `disabled` while read-only or saving.
export const SimilarityPanelProducts = ({
  disabled = false,
}: {
  disabled?: boolean;
}) => {
  const { control } = useFormContext<BulkSimilarityFormValues>();
  const unitPrice = useWatch({ control, name: 'unitPrice' });
  const { validation } = useBulkRows();
  const { fields } = useFields({ contentType: 'core:product', limit: 100 });
  const fieldName = (fieldId: string) =>
    fields.find((field) => field._id === fieldId)?.name || fieldId;

  return (
    <ScrollArea className="flex-1 min-h-0" viewportClassName="[&>div]:block!">
      <div className="flex min-w-0 flex-col gap-2 p-3">
        {validation.errors.map((error) => (
          <p key={error} className="text-xs text-destructive">
            {error}
          </p>
        ))}
        <GeneratedProductsTable
          fieldName={fieldName}
          unitPrice={unitPrice}
          disabled={disabled}
        />
      </div>
    </ScrollArea>
  );
};
