import { useEffect } from 'react';
import { FieldValues, useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ZodType } from 'zod';

// Collapses the create/edit form boilerplate shared by the plugin's form pages:
// a zod-resolved react-hook-form plus the effect that resets it from loaded data
// once it arrives in edit mode. `load` maps the fetched record to form values.
export const useResourceForm = <T extends FieldValues, R>({
  schema,
  defaults,
  isEdit,
  record,
  load,
  onLoaded,
}: {
  schema: ZodType<T>;
  defaults: T;
  isEdit: boolean;
  record: R | null | undefined;
  load: (record: R) => T;
  onLoaded?: () => void;
}): UseFormReturn<T> => {
  const form = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues: defaults as never,
  });

  useEffect(() => {
    if (isEdit && record) {
      form.reset(load(record));
      onLoaded?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [record, isEdit, form]);

  return form;
};
