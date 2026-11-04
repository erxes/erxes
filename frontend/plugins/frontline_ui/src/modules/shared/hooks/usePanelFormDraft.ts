import { isDeeplyEqual, useConfirm } from 'erxes-ui';
import { atom, type PrimitiveAtom, useAtomValue, useStore } from 'jotai';
import { useCallback, useEffect, useRef } from 'react';
import {
  type FieldValues,
  type UseFormReturn,
  useFormState,
} from 'react-hook-form';

export type TPanelFormDrafts<T extends FieldValues> = Record<
  string,
  | {
      values: T;
      defaultValues: T;
      submittedValues?: T;
      updateToken?: symbol;
      pendingUpdates?: { token: symbol; field?: string }[];
    }
  | undefined
>;

const pendingPanelSavesState = atom<Record<string, number>>({});
let nextPanelSaveId = 0;

/**
 * Retains panel form edits across navigation and reconciles saves without
 * replacing changes made after submission.
 */
export const usePanelFormDraft = <T extends FieldValues>({
  form,
  recordKey,
  values,
  draftsState,
  isNew = false,
  discardMessage = 'Discard your unsaved changes?',
}: {
  form: UseFormReturn<T>;
  recordKey: string;
  values: T;
  draftsState: PrimitiveAtom<TPanelFormDrafts<T>>;
  isNew?: boolean;
  discardMessage?: string;
}): {
  clearDraft: () => void;
  markSaved: (savedValues: T, submittedValues?: T) => boolean;
  isActive: () => boolean;
  captureUpdate: (field?: string) => (update: (latest: T) => T) => void;
  invalidateUpdates: (field: string) => void;
  hasPendingUpdates: () => boolean;
  beginSave: () => number | undefined;
  endSave: (saveId: number) => void;
  saving: boolean;
} => {
  const store = useStore();
  const pendingSaves = useAtomValue(pendingPanelSavesState);
  const saveKey = `${draftsState.toString()}:${recordKey}`;
  const { confirm } = useConfirm();
  const { isDirty } = useFormState({ control: form.control });
  const active = useRef(false);
  const suspended = useRef(false);
  const hydrating = useRef(false);
  const request = useRef(0);
  const session = useRef<{
    recordKey: string;
    defaultValues: T;
    source: T;
    hasPendingSource: boolean;
  }>();

  /** Restores draft values while preserving their accepted dirty-value baseline. */
  const restore = useCallback(
    (defaultValues: T, nextValues: T) => {
      hydrating.current = true;
      form.reset(defaultValues, {
        keepValues: true,
        keepDirtyValues: true,
      });
      form.reset(nextValues, { keepDefaultValues: true });
      hydrating.current = false;
    },
    [form],
  );

  /** Removes the active draft and suspends further writes from its old form session. */
  const clearDraft = useCallback(() => {
    if (session.current?.recordKey === recordKey) {
      suspended.current = true;
      request.current += 1;
    }
    store.set(draftsState, (previous) => {
      if (!previous[recordKey]) return previous;
      return Object.fromEntries(
        Object.entries(previous).filter(([key]) => key !== recordKey),
      );
    });
  }, [store, draftsState, recordKey]);

  /** Acknowledges saved values while preserving edits made after submission. */
  const markSaved = useCallback(
    (savedValues: T, submittedValues: T = savedValues) => {
      const cached = store.get(draftsState)[recordKey];
      const current = session.current;
      const ownsForm = active.current && current?.recordKey === recordKey;
      const currentValues = ownsForm ? form.getValues() : undefined;
      const cachedChanged =
        cached &&
        !isDeeplyEqual(cached.values, submittedValues, { strict: true });
      const formChanged =
        currentValues &&
        !isDeeplyEqual(currentValues, submittedValues, { strict: true });
      const nextValues = { ...savedValues };
      const newerValues = formChanged
        ? currentValues
        : cachedChanged
          ? cached?.values
          : undefined;
      if (newerValues) {
        for (const field in newerValues) {
          if (
            !isDeeplyEqual(newerValues[field], submittedValues[field], {
              strict: true,
            })
          ) {
            nextValues[field] = newerValues[field];
          }
        }
      }

      store.set(draftsState, (previous) => ({
        ...previous,
        [recordKey]: {
          values: nextValues,
          defaultValues: savedValues,
          submittedValues,
          updateToken: cached?.updateToken,
          pendingUpdates: cached?.pendingUpdates,
        },
      }));

      const acknowledged = store.get(draftsState)[recordKey];
      const hasNewerChanges = Boolean(
        cachedChanged ||
        formChanged ||
        (acknowledged &&
          !isDeeplyEqual(acknowledged.values, savedValues, {
            strict: true,
          })),
      );
      if (!hasNewerChanges && !acknowledged?.pendingUpdates?.length) {
        clearDraft();
        if (ownsForm) suspended.current = false;
      } else if (acknowledged?.submittedValues) {
        store.set(draftsState, (previous) => ({
          ...previous,
          [recordKey]: {
            ...acknowledged,
            submittedValues: undefined,
            values: acknowledged.values,
            defaultValues: savedValues,
          },
        }));
      }
      return !hasNewerChanges;
    },
    [clearDraft, form, recordKey, store, draftsState],
  );

  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
      request.current += 1;
    };
  }, []);

  useEffect(() => {
    let current = session.current;
    if (current?.recordKey !== recordKey) {
      request.current += 1;
      const saved = store.get(draftsState)[recordKey];
      current = {
        recordKey,
        defaultValues: saved?.defaultValues ?? values,
        source: saved?.defaultValues ?? values,
        hasPendingSource: false,
      };
      session.current = current;
      suspended.current = false;
      if (saved) {
        restore(saved.defaultValues, saved.values);
      } else {
        hydrating.current = true;
        form.reset(values);
        hydrating.current = false;
      }
      if (!saved || !isNew) return;
    }

    const sourceChanged = !isDeeplyEqual(current.source, values, {
      strict: true,
    });
    current.source = values;
    if (sourceChanged) current.hasPendingSource = true;
    if (suspended.current) return;

    /** Applies replacement defaults and resets the active draft baseline. */
    const replace = () => {
      const pending = store.get(draftsState)[recordKey];
      if (!isNew && pending?.updateToken) {
        store.set(draftsState, (previous) => ({
          ...previous,
          [recordKey]: { ...pending, values, defaultValues: values },
        }));
      } else clearDraft();
      current.defaultValues = values;
      current.hasPendingSource = false;
      suspended.current = false;
      hydrating.current = true;
      form.reset(values);
      hydrating.current = false;
    };
    const hasChanges = !isDeeplyEqual(form.getValues(), current.defaultValues, {
      strict: true,
    });

    if (hasChanges) {
      if (isNew && sourceChanged) {
        const pending = ++request.current;
        confirm({ message: discardMessage }).then(
          () => {
            if (active.current && pending === request.current) replace();
          },
          () => undefined,
        );
      }
      return;
    }

    if (current.hasPendingSource) {
      current.hasPendingSource = false;
      if (!isDeeplyEqual(values, current.defaultValues, { strict: true }))
        replace();
    }
  }, [
    form,
    recordKey,
    values,
    draftsState,
    store,
    isDirty,
    isNew,
    confirm,
    discardMessage,
    clearDraft,
    restore,
  ]);

  useEffect(
    () =>
      store.sub(draftsState, () => {
        const current = session.current;
        const saved = store.get(draftsState)[recordKey];
        if (
          current?.recordKey !== recordKey ||
          suspended.current ||
          hydrating.current ||
          !saved ||
          (!saved.submittedValues &&
            isDeeplyEqual(current.defaultValues, saved.defaultValues, {
              strict: true,
            }))
        )
          return;
        const currentValues = form.getValues();
        const nextValues = { ...saved.values };
        if (saved.submittedValues) {
          for (const field in currentValues) {
            if (
              !isDeeplyEqual(
                currentValues[field],
                saved.submittedValues[field],
                { strict: true },
              )
            ) {
              nextValues[field] = currentValues[field];
            }
          }
        }
        request.current += 1;
        current.defaultValues = saved.defaultValues;
        current.hasPendingSource = false;
        restore(saved.defaultValues, nextValues);
        if (!isDeeplyEqual(nextValues, saved.values, { strict: true })) {
          store.set(draftsState, (previous) => ({
            ...previous,
            [recordKey]: {
              ...saved,
              values: nextValues,
              defaultValues: saved.defaultValues,
            },
          }));
        }
      }),
    [store, draftsState, recordKey, form, restore],
  );

  useEffect(() => {
    const subscription = form.watch(() => {
      const current = session.current;
      if (
        current?.recordKey !== recordKey ||
        suspended.current ||
        hydrating.current
      )
        return;
      const nextValues = form.getValues();
      const hasChanges = !isDeeplyEqual(nextValues, current.defaultValues, {
        strict: true,
      });
      store.set(draftsState, (previous) => {
        if (hasChanges) {
          return {
            ...previous,
            [recordKey]: {
              values: nextValues,
              defaultValues: current.defaultValues,
              updateToken: previous[recordKey]?.updateToken,
              pendingUpdates: previous[recordKey]?.pendingUpdates,
            },
          };
        }
        if (previous[recordKey]?.updateToken)
          return {
            ...previous,
            [recordKey]: {
              values: nextValues,
              defaultValues: current.defaultValues,
              updateToken: previous[recordKey]?.updateToken,
              pendingUpdates: previous[recordKey]?.pendingUpdates,
            },
          };
        if (!previous[recordKey]) return previous;
        return Object.fromEntries(
          Object.entries(previous).filter(([key]) => key !== recordKey),
        );
      });
    });
    return () => subscription.unsubscribe();
  }, [form, recordKey, store, draftsState]);

  /** Checks whether this mounted form still owns its record key. */
  const isActive = useCallback(
    () => active.current && session.current?.recordKey === recordKey,
    [recordKey],
  );
  const captureUpdate = useCallback(
    (field?: string) => {
      const current = session.current;
      if (
        !active.current ||
        suspended.current ||
        current?.recordKey !== recordKey
      )
        return () => undefined;
      const cached = store.get(draftsState)[recordKey];
      const updateToken = cached?.updateToken ?? Symbol(recordKey);
      const operation = Symbol();
      store.set(draftsState, (previous) => ({
        ...previous,
        [recordKey]: {
          values: form.getValues(),
          defaultValues: current.defaultValues,
          updateToken,
          pendingUpdates: [
            ...(cached?.pendingUpdates ?? []).filter(
              (item) => !field || item.field !== field,
            ),
            { token: operation, field },
          ],
        },
      }));
      return (update: (latest: T) => T) => {
        store.set(draftsState, (previous) => {
          const latest = previous[recordKey];
          if (
            latest?.updateToken !== updateToken ||
            !latest.pendingUpdates?.some((item) => item.token === operation)
          )
            return previous;
          const pendingUpdates = latest.pendingUpdates.filter(
            (item) => item.token !== operation,
          );
          return {
            ...previous,
            [recordKey]: {
              ...latest,
              values: update(latest.values),
              submittedValues: latest.values,
              updateToken: pendingUpdates.length ? updateToken : undefined,
              pendingUpdates,
            },
          };
        });
      };
    },
    [draftsState, form, recordKey, store],
  );
  const invalidateUpdates = useCallback(
    (field: string) => {
      store.set(draftsState, (previous) => {
        const current = previous[recordKey];
        if (!current?.pendingUpdates) return previous;
        const pendingUpdates = current.pendingUpdates.filter(
          (item) => item.field !== field,
        );
        return {
          ...previous,
          [recordKey]: {
            ...current,
            pendingUpdates,
            updateToken: pendingUpdates.length
              ? current.updateToken
              : undefined,
          },
        };
      });
    },
    [draftsState, recordKey, store],
  );
  const hasPendingUpdates = useCallback(
    () => Boolean(store.get(draftsState)[recordKey]?.pendingUpdates?.length),
    [draftsState, recordKey, store],
  );
  const beginSave = useCallback(() => {
    if (store.get(pendingPanelSavesState)[saveKey] !== undefined)
      return undefined;
    const saveId = ++nextPanelSaveId;
    store.set(pendingPanelSavesState, (previous) => ({
      ...previous,
      [saveKey]: saveId,
    }));
    return saveId;
  }, [saveKey, store]);
  const endSave = useCallback(
    (saveId: number) => {
      store.set(pendingPanelSavesState, (previous) => {
        if (previous[saveKey] !== saveId) return previous;
        return Object.fromEntries(
          Object.entries(previous).filter(([key]) => key !== saveKey),
        );
      });
    },
    [saveKey, store],
  );
  return {
    clearDraft,
    markSaved,
    isActive,
    captureUpdate,
    invalidateUpdates,
    hasPendingUpdates,
    beginSave,
    endSave,
    saving: pendingSaves[saveKey] !== undefined,
  };
};
