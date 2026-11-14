import { useCallback, useEffect, useRef } from 'react';
import { FieldValues, UseFormReturn } from 'react-hook-form';
import { useLocation } from 'react-router-dom';
import { atom, useSetAtom, useStore } from 'jotai';
import { useSidePanelDraft } from 'ui-modules';
import type { ITourismPanelDraftDefaults } from '@/tms/side-panel/tourismPanelTypes';
import { getTourismRouteBranchId } from '@/tms/side-panel/tourismRecordPage';

interface ITourismDraftEntry {
  scope: string;
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
  const draft = useSidePanelDraft<ITourismPanelDraftDefaults>(contentType);
  const scope = [
    getTourismRouteBranchId(pathname),
    draft.groupId ?? '',
    draft.parentId ?? '',
  ].join('|');
  const restored = useRef(false);

  useEffect(() => {
    if (!isNew || restored.current) return;

    restored.current = true;
    const saved = store.get(tourismDraftValuesState)[contentType];

    if (saved?.values && saved.scope === scope) {
      form.reset(saved.values as T);
    }
  }, [isNew, contentType, scope, form, store]);

  useEffect(() => {
    if (!isNew) return undefined;

    const subscription = form.watch((values) =>
      setDraftValues((previous) => ({
        ...previous,
        [contentType]: { scope, values },
      })),
    );

    return () => subscription.unsubscribe();
  }, [isNew, contentType, scope, form, setDraftValues]);
};
