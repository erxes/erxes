import { AutomationBuilderCanvas } from '@/automations/components/builder/AutomationBuilderCanvas';
import { AutomationBuilderSidebar } from '@/automations/components/builder/sidebar/components/AutomationBuilderSidebar';
import { useAutomationBuilderSidebarHooks } from '@/automations/components/builder/sidebar/hooks/useAutomationBuilderSidebarHooks';
import { AutomationProvider } from '@/automations/context/AutomationProvider';
import { WorkflowEditScopeProvider } from '@/automations/context/WorkflowEditScopeProvider';
import { AutomationNodeType } from '@/automations/types';
import { TAutomationBuilderForm } from '@/automations/utils/automationFormDefinitions';
import { TWorkflowInputBindings } from '@/automations/utils/workflowInputs';
import { IconArrowLeft, IconChevronRight, IconPlus } from '@tabler/icons-react';
import { ReactFlowProvider } from '@xyflow/react';
import { AlertDialog, Button, Input, Popover } from 'erxes-ui';
import { useCallback, useMemo, useState } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { TAutomationAction } from 'ui-modules';

export type TWorkflowEditorValue = {
  name: string;
  description?: string;
  actions: TAutomationAction[];
  entryActionId?: string;
  inputs?: TWorkflowInputBindings;
};

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

type TWorkflowEditorProps = {
  // Identifies the workflow scope to the canvas; any stable id works
  scopeId: string;
  initial: TWorkflowEditorValue;
  breadcrumbLabel: string;
  saveLabel?: string;
  edgeType?: string;
  flowDirection?: string;
  onSave: (value: TWorkflowEditorValue) => void | Promise<void>;
  onBack: () => void;
};

/**
 * Edits a set of workflow member actions with the real builder canvas, in its
 * own form scope where members live as root `actions`. Knows nothing about
 * where the workflow comes from: the caller supplies the initial value and
 * persists whatever `onSave` hands back, so the same editor serves both the
 * in-automation drill-in and the standalone template editor.
 */
export const WorkflowEditor = ({
  scopeId,
  initial,
  breadcrumbLabel,
  saveLabel = 'Save workflow',
  edgeType = 'default',
  flowDirection = 'horizontal',
  onSave,
  onBack,
}: TWorkflowEditorProps) => {
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

  const [meta, setMeta] = useState({
    name: initial.name || '',
    description: initial.description || '',
  });
  const [inputs, setInputs] = useState<TWorkflowInputBindings>(
    initial.inputs || {},
  );
  const [savedSnapshot, setSavedSnapshot] = useState(() =>
    snapshotOf({
      name: initial.name,
      description: initial.description,
      actions: initial.actions,
      inputs: initial.inputs,
    }),
  );
  const [isDiscardOpen, setDiscardOpen] = useState(false);

  // Compared by value, not identity: react-hook-form hands back a fresh
  // `actions` array on unrelated re-renders, which would otherwise mark an
  // untouched workflow dirty the moment the canvas mounts.
  const currentSnapshot = useMemo(
    () =>
      snapshotOf({
        name: meta.name,
        description: meta.description,
        actions: innerActions,
        inputs,
      }),
    [innerActions, inputs, meta],
  );
  const isDirty = currentSnapshot !== savedSnapshot;

  const updateMeta = useCallback(
    (key: 'name' | 'description', value: string) => {
      setMeta((previous) => ({ ...previous, [key]: value }));
    },
    [],
  );

  const addInput = useCallback((name: string) => {
    const trimmed = name.trim();

    if (!trimmed) {
      return;
    }

    setInputs((previous) =>
      previous[trimmed] !== undefined
        ? previous
        : { ...previous, [trimmed]: '' },
    );
  }, []);

  const handleSave = useCallback(async () => {
    const actions = innerForm.getValues('actions') || [];
    // The stored entry may have been deleted while editing; fall back to the
    // first member so the workflow always has an entry point.
    const entryActionId = actions.some(
      ({ id }) => id === initial.entryActionId,
    )
      ? initial.entryActionId
      : actions[0]?.id;

    try {
      await onSave({
        name: meta.name,
        description: meta.description,
        actions,
        entryActionId,
        inputs,
      });
      setSavedSnapshot(
        snapshotOf({
          name: meta.name,
          description: meta.description,
          actions,
          inputs,
        }),
      );
    } catch {
      // The caller surfaces the failure; stay dirty so the edits aren't lost
    }
  }, [innerForm, initial.entryActionId, inputs, meta, onSave]);

  const handleBack = useCallback(() => {
    // Leaving with unsaved edits needs an explicit discard
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

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <AutomationProvider scoped>
        <ReactFlowProvider>
          <FormProvider {...innerForm}>
            <WorkflowEditScopeProvider
              workflowId={scopeId}
              entryActionId={initial.entryActionId}
              inputs={inputs}
              addInput={addInput}
            >
              <WorkflowEditorHeader
                breadcrumbLabel={breadcrumbLabel}
                saveLabel={saveLabel}
                meta={meta}
                onMetaChange={updateMeta}
                isDirty={isDirty}
                onBack={handleBack}
                onSave={handleSave}
              />
              <div className="relative flex min-h-0 flex-1 flex-row overflow-hidden">
                <AutomationBuilderCanvas />
                <AutomationBuilderSidebar />
              </div>
            </WorkflowEditScopeProvider>
          </FormProvider>
        </ReactFlowProvider>
      </AutomationProvider>

      <AlertDialog open={isDiscardOpen} onOpenChange={setDiscardOpen}>
        <AlertDialog.Content>
          <AlertDialog.Header>
            <AlertDialog.Title>Unsaved changes</AlertDialog.Title>
            <AlertDialog.Description>
              Leave without saving? The edits made here will be lost.
            </AlertDialog.Description>
          </AlertDialog.Header>
          <AlertDialog.Footer>
            <AlertDialog.Cancel>Keep editing</AlertDialog.Cancel>
            <AlertDialog.Action
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDiscard}
            >
              Discard changes
            </AlertDialog.Action>
          </AlertDialog.Footer>
        </AlertDialog.Content>
      </AlertDialog>
    </div>
  );
};

// Rendered inside the scoped providers so "Add action" drives this editor's
// own node library sidebar rather than the automation's.
const WorkflowEditorHeader = ({
  breadcrumbLabel,
  saveLabel,
  meta,
  onMetaChange,
  isDirty,
  onBack,
  onSave,
}: {
  breadcrumbLabel: string;
  saveLabel: string;
  meta: { name: string; description: string };
  onMetaChange: (key: 'name' | 'description', value: string) => void;
  isDirty: boolean;
  onBack: () => void;
  onSave: () => void;
}) => {
  const { handleNodeLibraryToggle } = useAutomationBuilderSidebarHooks();

  return (
    <div className="flex items-center gap-3 border-b bg-sidebar px-4 py-2">
      <Button variant="ghost" size="sm" onClick={onBack}>
        <IconArrowLeft className="size-4" />
        Back
      </Button>

      <div className="flex min-w-0 items-center gap-1 text-sm">
        <span className="text-muted-foreground">{breadcrumbLabel}</span>
        <IconChevronRight className="size-3.5 shrink-0 text-muted-foreground" />
        <Popover>
          <Popover.Trigger asChild>
            <button
              type="button"
              className="-mx-1 max-w-[16rem] truncate rounded px-1 text-left font-medium hover:bg-accent"
            >
              {meta.name || 'Workflow'}
            </button>
          </Popover.Trigger>
          <Popover.Content align="start" className="w-80 space-y-2 p-3">
            <Input
              value={meta.name}
              placeholder="Workflow name"
              onChange={(event) =>
                onMetaChange('name', event.currentTarget.value)
              }
            />
            <Input
              value={meta.description}
              placeholder="Description"
              onChange={(event) =>
                onMetaChange('description', event.currentTarget.value)
              }
            />
          </Popover.Content>
        </Popover>
      </div>

      <div className="ml-auto flex items-center gap-3">
        {isDirty && (
          <>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="size-1.5 rounded-full bg-amber-500" />
              Unsaved changes
            </span>
            <Button onClick={onSave}>{saveLabel}</Button>
          </>
        )}
        <Button
          variant="outline"
          onClick={() => handleNodeLibraryToggle(AutomationNodeType.Action)}
        >
          <IconPlus className="size-4" />
          Add action
        </Button>
      </div>
    </div>
  );
};
