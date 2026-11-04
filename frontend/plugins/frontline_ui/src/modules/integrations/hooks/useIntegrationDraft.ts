import { isDeeplyEqual } from 'erxes-ui';
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

/** Advances the originating context synchronously when a provider atom changes. */
const advanceRevision = (store: Store, key: string): void => {
  store.set(draftRevisions, (previous) => ({
    ...previous,
    [key]: (previous[key] ?? 0) + 1,
  }));
};
const clearers: ((store: Store, matches: (key: string) => boolean) => void)[] =
  [];

/** Registers typed draft collections for completion and deletion cleanup. */
const registerDrafts = <T>(state: PrimitiveAtom<Record<string, T>>): void => {
  clearers.push((store, matches) =>
    store.set(state, (previous) =>
      Object.fromEntries(
        Object.entries(previous).filter(([key]) => !matches(key)),
      ),
    ),
  );
};

/** Clears only the selected user's completed or deleted integration drafts. */
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

/** Clears completed snapshots and prevents async callbacks from closing another record. */
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
  /** Clears the originating context even after its panel has unmounted. */
  const clearSession = useCallback(
    () => clearIntegrationDrafts(store, (candidate) => candidate === key),
    [key, store],
  );
  /** Tests ownership before changing shared provider atoms or panel navigation. */
  const isActive = useCallback(() => activeKey.current === key, [key]);
  /** Captures an immutable revision without retaining mutable form object references. */
  const captureRevision = useCallback(() => {
    const current = store.get(draftRevisions)[key];
    if (current !== undefined) return current;
    store.set(draftRevisions, (previous) => ({ ...previous, [key]: 0 }));
    return 0;
  }, [key, store]);
  /** Acknowledges only the submitted revision, including after the editor remounts. */
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

/** Gives each provider form its own typed, memory-only draft collection. */
export const createIntegrationFormDraft = <T extends FieldValues>() => {
  const draftsState = atom<TPanelFormDrafts<T>>({});
  registerDrafts(draftsState);
  /** Restores this form without overwriting subsequent local edits. */
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

/** Narrows a lazy draft default without widening the state returned to provider forms. */
const isDraftInitializer = <T>(value: T | (() => T)): value is () => T =>
  typeof value === 'function';

/** Retains wizard progress and typed secrets in memory, scoped to the panel context. */
export const createIntegrationDraftState = <T>(initialValue: T | (() => T)) => {
  const initial = isDraftInitializer(initialValue)
    ? initialValue()
    : initialValue;
  const state = atom<Record<string, T>>({});
  registerDrafts(state);
  /** Reads and updates wizard state for the current integration context. */
  return function useIntegrationDraftState(): readonly [
    T,
    (value: T) => void,
    (update: (previous: T) => T) => void,
  ] {
    const key = useContext(IntegrationDraftContext);
    const store = useStore();
    const values = useAtomValue(state);
    /** Stores a direct state value without retaining it in browser storage. */
    const setValue = useCallback(
      (value: T): void => {
        store.set(state, (previous) => ({ ...previous, [key]: value }));
      },
      [store, key],
    );
    /** Applies an update to the latest snapshot, including pending async results. */
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

/** Snapshots existing provider atoms without changing their public consumers. */
export const createIntegrationAtomDraft = <T>(
  target: WritableAtom<T, [SetStateAction<T>], unknown>,
  initialValue: T | (() => T),
) => {
  const initial = isDraftInitializer(initialValue)
    ? initialValue()
    : initialValue;
  const drafts = atom<Record<string, T>>({});
  registerDrafts(drafts);
  /** Restores a provider atom before subscribing to subsequent edits. */
  return function useIntegrationAtomDraft(): void {
    const key = useContext(IntegrationDraftContext);
    const store = useStore();
    useLayoutEffect(() => {
      store.set(target, store.get(drafts)[key] ?? initial);
      return store.sub(target, () => {
        const value = store.get(target);
        const previous = store.get(drafts)[key] ?? initial;
        if (isDeeplyEqual(previous, value, { strict: true })) return;
        advanceRevision(store, key);
        store.set(drafts, (values) => ({ ...values, [key]: value }));
      });
    }, [key, store]);
  };
};

/** Applies an OAuth return after scoped wizard restoration without losing form fields. */
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
