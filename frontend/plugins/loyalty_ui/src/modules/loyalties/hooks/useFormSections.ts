import { useEffect, useState } from 'react';
import {
  FieldErrors,
  FieldValues,
  UseFormReturn,
  useFormState,
} from 'react-hook-form';

// Which sections hold errors, and a failed save opens the first of them so
// an error in a hidden section never looks like a save that did nothing.
// `order` and `hasError` must be module constants.
export const useFormSections = <T extends FieldValues, K extends string>(
  form: UseFormReturn<T>,
  order: K[],
  hasError: Record<K, (errors: FieldErrors<T>) => boolean>,
) => {
  const [active, setActive] = useState<K>(order[0]);
  const { errors, submitCount } = useFormState({ control: form.control });

  const withErrors = new Set(order.filter((key) => hasError[key](errors)));

  useEffect(() => {
    const first = order.find((key) => hasError[key](form.formState.errors));

    if (submitCount && first) {
      setActive(first);
    }
  }, [submitCount, form, order, hasError]);

  return { active, setActive, withErrors };
};
