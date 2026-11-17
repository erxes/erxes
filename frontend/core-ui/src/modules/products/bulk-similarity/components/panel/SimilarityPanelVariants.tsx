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

// The fields whose chosen values make the variants. Adding a field is shown
// in place of the list.
export const SimilarityPanelProperties = ({
  disabled = false,
}: {
  disabled?: boolean;
}) => {
  const { t } = useTranslation('product', { keyPrefix: 'bulk-similarity' });
  const [adding, setAdding] = useState(false);

  return (
    <section className="flex min-w-0 flex-col gap-1 pt-1">
      {adding ? (
        <VariantFieldAddView
          disabled={disabled}
          onDone={() => setAdding(false)}
        />
      ) : (
        <>
          <div className="flex h-7 items-center justify-between gap-2 px-1">
            <h3 className="text-xs font-normal text-muted-foreground">
              {t('property-fields')}
            </h3>
            {!disabled && (
              <VariantFieldAddButton onClick={() => setAdding(true)} />
            )}
          </div>
          <VariantFieldPicker disabled={disabled} />
        </>
      )}
    </section>
  );
};

// One row per combination, each a product on Save. `disabled` while
// read-only or saving.
export const SimilarityPanelProducts = ({
  disabled = false,
}: {
  disabled?: boolean;
}) => {
  const { t } = useTranslation('product', { keyPrefix: 'bulk-similarity' });
  const { control } = useFormContext<BulkSimilarityFormValues>();
  const unitPrice = useWatch({ control, name: 'unitPrice' });
  const { includedCount, validation } = useBulkRows();
  const { fields } = useFields({ contentType: 'core:product', limit: 100 });
  const fieldName = (fieldId: string) =>
    fields.find((field) => field._id === fieldId)?.name || fieldId;

  return (
    <section className="flex min-w-0 flex-col gap-1 pt-1">
      <h3 className="flex h-7 items-center px-1 text-xs font-normal text-muted-foreground">
        {t('products-count', { count: includedCount })}
      </h3>
      {validation.errors.map((error) => (
        <p key={error} className="px-1 text-xs text-destructive">
          {error}
        </p>
      ))}
      <GeneratedProductsTable
        fieldName={fieldName}
        unitPrice={unitPrice}
        disabled={disabled}
      />
    </section>
  );
};
