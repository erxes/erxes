import { TAutomationBuilderForm } from '@/automations/utils/automationFormDefinitions';
import { TWorkflowInputBindings } from '@/automations/utils/workflowInputs';
import { useCallback, useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { TAutomationAction } from 'ui-modules';

export type TWorkflowEditorValue = {
  name: string;
  description?: string;
  actions: TAutomationAction[];
  entryActionId?: string;
  inputs?: TWorkflowInputBindings;
};

export type TWorkflowEditorMeta = { name: string; description: string };

/** Stable value fingerprint used to decide whether the editor has edits. */
const snapshotOf = ({
  name,
  description,
  actions,
  inputs,
}: Partial<TWorkflowEditorValue>) =>
  JSON.stringify({
    name: name || '',
    description: description || '',
    actions: actions || [],
    inputs: inputs || {},
  });

/**
 * The stored entry may have been deleted while editing; the first member
 * takes its place so the workflow always has an entry point.
 */
const entryActionIdOf = (actions: TAutomationAction[], stored?: string) =>
  actions.some(({ id }) => id === stored) ? stored : actions[0]?.id;

const withInput = (inputs: TWorkflowInputBindings, name: string) =>
  inputs[name] !== undefined ? inputs : { ...inputs, [name]: '' };

/**
 * A workflow edited in its own form scope: name and description, its inputs,
 * whether anything changed since the last save, and leaving with unsaved
 * edits only after an explicit discard.
 */
export const useWorkflowEditor = ({
  initial,
  edgeType,
  flowDirection,
  onSave,
  onBack,
}: {
  initial: TWorkflowEditorValue;
  edgeType: string;
  flowDirection: string;
  onSave: (value: TWorkflowEditorValue) => void | Promise<void>;
  onBack: () => void;
}) => {
  const innerForm = useForm<TAutomationBuilderForm>({
    defaultValues: {
      name: initial.name || 'Workflow',
      status: 'draft',
      edgeType,
      flowDirection,
      triggers: [],
      actions: initial.actions || [],
      workflows: [],
    } as TAutomationBuilderForm,
  });
  const innerActions = useWatch({
    control: innerForm.control,
    name: 'actions',
  });

  const [meta, setMeta] = useState<TWorkflowEditorMeta>({
    name: initial.name || '',
    description: initial.description || '',
  });
  const [inputs, setInputs] = useState<TWorkflowInputBindings>(
    initial.inputs || {},
  );
  const [savedSnapshot, setSavedSnapshot] = useState(() => snapshotOf(initial));
  const [isDiscardOpen, setDiscardOpen] = useState(false);

  // Compared by value, not identity: react-hook-form hands back a fresh
  // `actions` array on unrelated re-renders
  const currentSnapshot = useMemo(
    () => snapshotOf({ ...meta, actions: innerActions, inputs }),
    [innerActions, inputs, meta],
  );
  const isDirty = currentSnapshot !== savedSnapshot;

  const updateMeta = useCallback(
    (key: keyof TWorkflowEditorMeta, value: string) =>
      setMeta((previous) => ({ ...previous, [key]: value })),
    [],
  );

  const addInput = useCallback((name: string) => {
    const trimmed = name.trim();

    if (trimmed) {
      setInputs((previous) => withInput(previous, trimmed));
    }
  }, []);

  const handleSave = useCallback(async () => {
    const actions = innerForm.getValues('actions') || [];
    const value = {
      ...meta,
      actions,
      entryActionId: entryActionIdOf(actions, initial.entryActionId),
      inputs,
    };

    try {
      await onSave(value);
      setSavedSnapshot(snapshotOf(value));
    } catch {
      // The caller surfaces the failure; stay dirty so the edits aren't lost
    }
  }, [innerForm, initial.entryActionId, inputs, meta, onSave]);

  const handleBack = useCallback(() => {
    if (isDirty) {
      setDiscardOpen(true);
      return;
    }

    onBack();
  }, [isDirty, onBack]);

  const handleDiscard = useCallback(() => {
    setDiscardOpen(false);
    onBack();
  }, [onBack]);

  return {
    innerForm,
    meta,
    updateMeta,
    inputs,
    addInput,
    isDirty,
    isDiscardOpen,
    setDiscardOpen,
    handleSave,
    handleBack,
    handleDiscard,
  };
};
