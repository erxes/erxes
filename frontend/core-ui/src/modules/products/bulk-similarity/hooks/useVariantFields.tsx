import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { useFields } from 'ui-modules';
import { BulkSimilarityFormValues } from '../constants/bulkSimilaritySchema';

export const useVariantFields = () => {
  const { control } = useFormContext<BulkSimilarityFormValues>();
  const { fields: fieldDefs } = useFields({ contentType: 'core:product' });

  const { append, update, remove } = useFieldArray({
    control,
    name: 'properties',
  });
  // read from useWatch, not useFieldArray.fields: multiple useVariantFields()
  // callers create separate field-array instances whose `.fields` snapshots don't
  // share updates, but useWatch always reflects the live form state.
  const watchedProperties = useWatch({ control, name: 'properties' }) || [];

  const fieldIds = watchedProperties.map((p) => p.fieldId);

  const labelOf = (fieldId: string, value: string) =>
    fieldDefs
      .find((f) => f._id === fieldId)
      ?.options?.find((o) => o.value === value)?.label ?? value;

  const handleToggleFieldValue = (fieldId: string, value: string) => {
    const index = watchedProperties.findIndex((p) => p.fieldId === fieldId);

    if (index === -1) return append({ fieldId, values: [value] });

    const current = watchedProperties[index].values || [];
    const values = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];

    update(index, { fieldId, values });
  };

  const handleRemoveField = (fieldId: string) => {
    const index = watchedProperties.findIndex((p) => p.fieldId === fieldId);
    if (index !== -1) remove(index);
  };

  return {
    fields: fieldDefs,
    properties: watchedProperties,
    fieldIds,
    labelOf,
    handleToggleFieldValue,
    handleRemoveField,
  };
};
