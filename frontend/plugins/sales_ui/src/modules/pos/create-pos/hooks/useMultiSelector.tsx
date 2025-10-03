import type { UseFormReturn, FieldPath, FieldValues } from 'react-hook-form';

export function useMultiSelectToggle<T extends FieldValues>(
  form: UseFormReturn<T>
) {
  return <K extends FieldPath<T>>(
    fieldName: K,
    value: string
  ) => {
    const currentValues = (form.getValues(fieldName) || []) as string[];
    
    const newValues = currentValues.includes(value)
      ? currentValues.filter((item: string) => item !== value)
      : [...currentValues, value];
    
    form.setValue(fieldName, newValues as T[K]);
  };
}