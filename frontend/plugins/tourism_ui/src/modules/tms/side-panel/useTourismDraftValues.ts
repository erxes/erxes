import { useCallback, useEffect, useRef } from 'react';
import { FieldValues, UseFormReturn } from 'react-hook-form';
import { useLocation } from 'react-router-dom';
import { atom, useSetAtom, useStore } from 'jotai';
import { getTourismRouteBranchId } from '@/tms/side-panel/tourismRecordPage';

interface ITourismDraftEntry {
  branchId: string;
  values: unknown;
}

export const tourismDraftValuesState = atom<Record<string, ITourismDraftEntry>>(
  {},
);

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
  const { pathname } = useLocation();
  const branchId = getTourismRouteBranchId(pathname);
  const restored = useRef(false);

  useEffect(() => {
    if (!isNew || restored.current) return;

    restored.current = true;
    const saved = store.get(tourismDraftValuesState)[contentType];

    if (saved?.values && saved.branchId === branchId) {
      form.reset(saved.values as T);
    }
  }, [isNew, contentType, branchId, form, store]);

  useEffect(() => {
    if (!isNew) return undefined;

    const subscription = form.watch((values) =>
      setDraftValues((previous) => ({
        ...previous,
        [contentType]: { branchId, values },
      })),
    );

    return () => subscription.unsubscribe();
  }, [isNew, contentType, branchId, form, setDraftValues]);
};
