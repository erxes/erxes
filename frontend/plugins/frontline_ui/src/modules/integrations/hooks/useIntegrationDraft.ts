import { isDeeplyEqual } from 'erxes-ui';
import { isRecord } from '@/shared/utils/isRecord';
import {
  atom,
  useAtomValue,
  useStore,
  type PrimitiveAtom,
  type WritableAtom,
} from 'jotai';
import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useEffect,
  useRef,
  type SetStateAction,
} from 'react';
import type { FieldValues, UseFormReturn } from 'react-hook-form';
import {
  usePanelFormDraft,
  type TPanelFormDrafts,
} from '@/shared/hooks/usePanelFormDraft';

export const IntegrationDraftContext = createContext('integration:unscoped');

type Store = ReturnType<typeof useStore>;
const draftRevisions = atom<Record<string, number>>({});

const advanceRevision = (store: Store, key: string): void => {
  store.set(draftRevisions, (previous) => ({
    ...previous,
    [key]: (previous[key] ?? 0) + 1,
  }));
};
const clearers: ((store: Store, matches: (key: string) => boolean) => void)[] =
  [];

const registerDrafts = <T>(state: PrimitiveAtom<Record<string, T>>): void => {
  clearers.push((store, matches) =>
    store.set(state, (previous) =>
      Object.fromEntries(
        Object.entries(previous).filter(([key]) => !matches(key)),
      ),
    ),
  );
};

export const clearIntegrationDrafts = (
  store: Store,
  matches: (key: string) => boolean,
): void => {
  clearers.forEach((clear) => clear(store, matches));
  store.set(draftRevisions, (previous) =>
    Object.fromEntries(
      Object.entries(previous).map(([key, revision]) => [
        key,
        matches(key) ? revision + 1 : revision,
      ]),
    ),
  );
};

export const useIntegrationDraftSession = (): {
  clearSession: () => void;
  isActive: () => boolean;
  captureRevision: () => number;
  acknowledgeRevision: (revision: number) => boolean;
} => {
  const key = useContext(IntegrationDraftContext);
  const store = useStore();
  const activeKey = useRef<string>();
  useEffect(() => {
    activeKey.current = key;
    return () => {
      activeKey.current = undefined;
    };
  }, [key]);
  const clearSession = useCallback(
    () => clearIntegrationDrafts(store, (candidate) => candidate === key),
    [key, store],
  );
  const isActive = useCallback(() => activeKey.current === key, [key]);
  const captureRevision = useCallback(() => {
    const current = store.get(draftRevisions)[key];
    if (current !== undefined) return current;
    store.set(draftRevisions, (previous) => ({ ...previous, [key]: 0 }));
    return 0;
  }, [key, store]);
  const acknowledgeRevision = useCallback(
    (revision: number) => {
      if (captureRevision() !== revision) return false;
      clearSession();
      return true;
    },
    [captureRevision, clearSession],
  );
  return { clearSession, isActive, captureRevision, acknowledgeRevision };
};

export const createIntegrationFormDraft = <T extends FieldValues>() => {
  const draftsState = atom<TPanelFormDrafts<T>>({});
  registerDrafts(draftsState);
  return function useIntegrationFormDraft(
    form: UseFormReturn<T>,
    values?: T,
  ): ReturnType<typeof usePanelFormDraft<T>> & {
    clearSession: () => void;
    getSaveValues: (submittedValues: T) => T;
  } {
    const recordKey = useContext(IntegrationDraftContext);
    const initial = useRef(form.getValues());
    const { clearSession } = useIntegrationDraftSession();
    const draft = usePanelFormDraft({
      form,
      recordKey,
      values: values ?? initial.current,
      draftsState,
    });
    const getSaveValues = (submittedValues: T): T => {
      const savedValues = { ...(values ?? initial.current) };
      for (const field in submittedValues) {
        if (
          !isDeeplyEqual(
            submittedValues[field],
            form.formState.defaultValues?.[field],
            { strict: true },
          )
        ) {
          savedValues[field] = submittedValues[field];
        }
      }
      return savedValues;
    };
    return { ...draft, clearSession, getSaveValues };
  };
};

const isDraftInitializer = <T>(value: T | (() => T)): value is () => T =>
  typeof value === 'function';

export const createIntegrationDraftState = <T>(initialValue: T | (() => T)) => {
  const initial = isDraftInitializer(initialValue)
    ? initialValue()
    : initialValue;
  const state = atom<Record<string, T>>({});
  registerDrafts(state);
  return function useIntegrationDraftState(): readonly [
    T,
    (value: T) => void,
    (update: (previous: T) => T) => void,
  ] {
    const key = useContext(IntegrationDraftContext);
    const store = useStore();
    const values = useAtomValue(state);
    const setValue = useCallback(
      (value: T): void => {
        store.set(state, (previous) => ({ ...previous, [key]: value }));
      },
      [store, key],
    );
    const updateValue = useCallback(
      (update: (previous: T) => T): void => {
        store.set(state, (previous) => ({
          ...previous,
          [key]: update(previous[key] ?? initial),
        }));
      },
      [store, key],
    );
    return [values[key] ?? initial, setValue, updateValue];
  };
};

const mergeDraftValues = <T>(source: T, defaults: T, draft: T): T => {
  if (isDeeplyEqual(defaults, draft, { strict: true })) return source;
  if (!isRecord(source) || !isRecord(defaults) || !isRecord(draft))
    return draft;
  return Object.assign(
    {},
    source,
    Object.fromEntries(
      Object.entries(draft).map(([key, value]) => [
        key,
        mergeDraftValues(source[key], defaults[key], value),
      ]),
    ),
  );
};

export const createIntegrationAtomDraft = <T>(
  target: WritableAtom<T, [SetStateAction<T>], unknown>,
  initialValue: T | (() => T),
) => {
  const initial = isDraftInitializer(initialValue)
    ? initialValue()
    : initialValue;
  const drafts = atom<Record<string, T>>({});
  const defaults = atom<Record<string, T>>({});
  const refreshing = new WeakSet<Store>();
  const activeKeys = new WeakMap<Store, string>();
  registerDrafts(drafts);
  registerDrafts(defaults);
  const resolve = (
    store: Store,
    key: string,
    source: T,
    draft = activeKeys.get(store) === key
      ? store.get(target)
      : store.get(drafts)[key] ?? store.get(defaults)[key] ?? initial,
  ): T => mergeDraftValues(source, store.get(defaults)[key] ?? initial, draft);
  const refresh = (
    store: Store,
    key: string,
    source: T,
    submitted?: T,
  ): void => {
    const current =
      activeKeys.get(store) === key
        ? store.get(target)
        : store.get(drafts)[key] ?? store.get(defaults)[key] ?? initial;
    const value =
      submitted === undefined
        ? resolve(store, key, source)
        : mergeDraftValues(source, submitted, current);
    store.set(defaults, (previous) => ({ ...previous, [key]: source }));
    store.set(drafts, (previous) => {
      if (!isDeeplyEqual(value, source, { strict: true }))
        return { ...previous, [key]: value };
      return Object.fromEntries(
        Object.entries(previous).filter(([candidate]) => candidate !== key),
      );
    });
    refreshing.add(store);
    try {
      if (activeKeys.get(store) === key) store.set(target, value);
    } finally {
      refreshing.delete(store);
    }
  };
  const useDraft = (): void => {
    const key = useContext(IntegrationDraftContext);
    const store = useStore();
    useLayoutEffect(() => {
      activeKeys.set(store, key);
      store.set(
        target,
        store.get(drafts)[key] ?? store.get(defaults)[key] ?? initial,
      );
      const unsubscribe = store.sub(target, () => {
        if (refreshing.has(store)) return;
        const value = store.get(target);
        const source = store.get(defaults)[key] ?? initial;
        const previous = store.get(drafts)[key] ?? source;
        if (isDeeplyEqual(previous, value, { strict: true })) return;
        advanceRevision(store, key);
        store.set(drafts, (values) => {
          if (!isDeeplyEqual(source, value, { strict: true }))
            return { ...values, [key]: value };
          return Object.fromEntries(
            Object.entries(values).filter(([candidate]) => candidate !== key),
          );
        });
      });
      return () => {
        unsubscribe();
        if (activeKeys.get(store) === key) activeKeys.delete(store);
      };
    }, [key, store]);
  };
  return Object.assign(useDraft, { refresh, resolve });
};

export const useIntegrationAuthorization = (
  pending: PrimitiveAtom<string | undefined>,
  account: PrimitiveAtom<string | undefined>,
  page: PrimitiveAtom<string | undefined>,
  step: PrimitiveAtom<number>,
): void => {
  const store = useStore();
  const accountId = useAtomValue(pending);
  useLayoutEffect(() => {
    if (!accountId) return;
    store.set(account, accountId);
    store.set(page, () => undefined);
    store.set(step, 2);
    store.set(pending, () => undefined);
  }, [store, accountId, pending, account, page, step]);
};
