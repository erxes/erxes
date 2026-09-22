import { useFormContext, useWatch } from 'react-hook-form';
import { BulkSimilarityFormValues } from '../constants/bulkSimilaritySchema';

export const useBulkRows = () => {
  const { control, formState, setValue, trigger } =
    useFormContext<BulkSimilarityFormValues>();

  // render from useWatch, not useFieldArray.fields: the field array is generated
  // in useBulkProductForm via a separate instance, whose rows.replace() doesn't
  // reliably refresh this component's `.fields` snapshot. useWatch always reflects
  // the live form state. (rows are owned/generated in useBulkProductForm; this hook
  // only reads them and toggles per-row flags.)
  const watchedRows = useWatch({ control, name: 'rows' }) || [];

  const handleSetRowStar = (key: string) =>
    watchedRows.forEach((row, index) =>
      setValue(`rows.${index}.isStar`, row.key === key),
    );

  const handleSetAllExcluded = (isExcluded: boolean) => {
    watchedRows.forEach((_, index) =>
      setValue(`rows.${index}.isExcluded`, isExcluded),
    );
    trigger('rows');
  };

  const duplicateCodes = new Set(
    watchedRows
      .filter((row, i) => !row.isExcluded && formState.errors.rows?.[i]?.code)
      .map((row) => row.code),
  );

  const includedCount = watchedRows.filter((r) => !r.isExcluded).length;

  const validation = {
    canSave: duplicateCodes.size === 0,
    errors: duplicateCodes.size
      ? [
          `${duplicateCodes.size} duplicate ${
            duplicateCodes.size === 1 ? 'code' : 'codes'
          } across included products.`,
        ]
      : [],
  };

  return {
    rows: watchedRows,
    handleSetRowStar,
    handleSetAllExcluded,
    duplicateCodes,
    includedCount,
    validation,
  };
};
