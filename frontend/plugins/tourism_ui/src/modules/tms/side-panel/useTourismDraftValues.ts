import { useEffect, useRef } from 'react';
import { FieldValues, UseFormReturn } from 'react-hook-form';
import { atom, useAtom } from 'jotai';

export const tourismDraftValuesState = atom<Record<string, unknown>>({});

export const useTourismDraftValues = <T extends FieldValues>(
  contentType: string,
  form: UseFormReturn<T>,
  isNew: boolean,
) => {
  const [draftValues, setDraftValues] = useAtom(tourismDraftValuesState);
  const restored = useRef(false);

  useEffect(() => {
    if (!isNew || restored.current) return;

    restored.current = true;
    const saved = draftValues[contentType];

    if (saved) {
      form.reset(saved as T);
    }
  }, [isNew, contentType, draftValues, form]);

  useEffect(() => {
    if (!isNew) return undefined;

    const subscription = form.watch((values) =>
      setDraftValues((previous) => ({ ...previous, [contentType]: values })),
    );

    return () => subscription.unsubscribe();
  }, [isNew, contentType, form, setDraftValues]);
};
