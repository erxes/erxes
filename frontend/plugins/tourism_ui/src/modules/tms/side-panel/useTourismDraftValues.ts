import { useCallback, useEffect, useRef } from 'react';
import { FieldValues, UseFormReturn } from 'react-hook-form';
import { atom, useSetAtom, useStore } from 'jotai';

export const tourismDraftValuesState = atom<Record<string, unknown>>({});

export const useClearTourismDraftValues = () => {
  const setDraftValues = useSetAtom(tourismDraftValuesState);

  return useCallback(
    (contentType: string) =>
      setDraftValues((previous) =>
        contentType in previous
          ? Object.fromEntries(
              Object.entries(previous).filter(([key]) => key !== contentType),
            )
          : previous,
      ),
    [setDraftValues],
  );
};

export const useTourismDraftValues = <T extends FieldValues>(
  contentType: string,
  form: UseFormReturn<T>,
  isNew: boolean,
) => {
  const store = useStore();
  const setDraftValues = useSetAtom(tourismDraftValuesState);
  const restored = useRef(false);

  useEffect(() => {
    if (!isNew || restored.current) return;

    restored.current = true;
    const saved = store.get(tourismDraftValuesState)[contentType];

    if (saved) {
      form.reset(saved as T);
    }
  }, [isNew, contentType, form, store]);

  useEffect(() => {
    if (!isNew) return undefined;

    const subscription = form.watch((values) =>
      setDraftValues((previous) => ({ ...previous, [contentType]: values })),
    );

    return () => subscription.unsubscribe();
  }, [isNew, contentType, form, setDraftValues]);
};
