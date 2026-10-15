import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { FieldValues, UseFormReturn } from 'react-hook-form';
import {
  TAutomationConditional,
  TAutomationConditionalErrors,
  TAutomationConditionalFieldRender,
  TAutomationConditionals,
} from '../types/conditionalTypes';

// What the host needs to open one conditional in its full editor
export type TAutomationConditionalEditorRequest = {
  id: string;
  label: string;
  names: string[];
  form: UseFormReturn<FieldValues>;
  render: TAutomationConditionalFieldRender;
};

export type TAutomationConditionalsStore = {
  conditionals: TAutomationConditionals;
  errors: TAutomationConditionalErrors;
  setConditional: (id: string, conditional: TAutomationConditional) => void;
  setErrors: (errors: TAutomationConditionalErrors) => void;
  // Read at save time, after the last edit has landed
  getSnapshot: () => TAutomationConditionals;
  editor: TAutomationConditionalEditorRequest | null;
  openEditor: (request: TAutomationConditionalEditorRequest) => void;
  closeEditor: () => void;
};

const AutomationConditionalsContext =
  createContext<TAutomationConditionalsStore | null>(null);

/**
 * Edits are a draft of the open action: they start from what was saved and
 * reach the action config only through the host's save, so closing the
 * sidebar without saving drops them like every other field.
 */
export const useAutomationConditionalsStore = (
  actionId: string | undefined,
  saved: TAutomationConditionals | undefined,
): TAutomationConditionalsStore => {
  const [conditionals, setConditionals] = useState<TAutomationConditionals>(
    () => saved || {},
  );
  const [errors, setErrors] = useState<TAutomationConditionalErrors>({});
  const [editor, setEditor] =
    useState<TAutomationConditionalEditorRequest | null>(null);
  const snapshotRef = useRef(conditionals);

  useEffect(() => {
    snapshotRef.current = saved || {};
    setConditionals(saved || {});
    setErrors({});
    setEditor(null);
  }, [actionId, saved]);

  const setConditional = useCallback(
    (id: string, conditional: TAutomationConditional) => {
      snapshotRef.current = { ...snapshotRef.current, [id]: conditional };
      setConditionals(snapshotRef.current);
      setErrors((current) => {
        if (!current[id]) {
          return current;
        }

        return Object.fromEntries(
          Object.entries(current).filter(([errorId]) => errorId !== id),
        );
      });
    },
    [],
  );

  const getSnapshot = useCallback(() => snapshotRef.current, []);

  const closeEditor = useCallback(() => setEditor(null), []);

  return useMemo(
    () => ({
      conditionals,
      errors,
      setConditional,
      setErrors,
      getSnapshot,
      editor,
      openEditor: setEditor,
      closeEditor,
    }),
    [conditionals, errors, setConditional, getSnapshot, editor, closeEditor],
  );
};

export const AutomationConditionalsProvider = ({
  store,
  children,
}: {
  store: TAutomationConditionalsStore;
  children: ReactNode;
}) => (
  <AutomationConditionalsContext.Provider value={store}>
    {children}
  </AutomationConditionalsContext.Provider>
);

// Null outside a host that supports conditionals; fields then stay plain
export const useAutomationConditionals = () =>
  useContext(AutomationConditionalsContext);
