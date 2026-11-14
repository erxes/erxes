import { useAtomValue, useSetAtom, type WritableAtom } from 'jotai';
import { useEffect, type SetStateAction } from 'react';
import { isDeeplyEqual } from 'erxes-ui';
import { type FieldValues, type UseFormReturn } from 'react-hook-form';

type MessengerFormAtom<T extends FieldValues> = WritableAtom<
  T | null,
  [SetStateAction<T | null>],
  unknown
>;

export const EMFormValueEffectComponent = <T extends FieldValues>({
  form,
  atom,
}: {
  atom: MessengerFormAtom<T>;
  form: UseFormReturn<T>;
}) => {
  const value = useAtomValue(atom);
  const setValue = useSetAtom(atom);
  useEffect(() => {
    if (value && !isDeeplyEqual(form.getValues(), value, { strict: true }))
      form.reset(value);
  }, [value, form]);
  useEffect(() => {
    const subscription = form.watch((_values, { name }) => {
      if (name) setValue(form.getValues());
    });
    return () => subscription.unsubscribe();
  }, [form, setValue]);
  return null;
};
