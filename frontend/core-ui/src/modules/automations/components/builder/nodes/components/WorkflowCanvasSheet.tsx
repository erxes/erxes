import { AutomationBuilderCanvas } from '@/automations/components/builder/AutomationBuilderCanvas';
import { AutomationBuilderSidebar } from '@/automations/components/builder/sidebar/components/AutomationBuilderSidebar';
import { AutomationProvider } from '@/automations/context/AutomationProvider';
import { WorkflowEditScopeProvider } from '@/automations/context/WorkflowEditScopeProvider';
import { useAutomationNodes } from '@/automations/hooks/useAutomationNodes';
import { TAutomationBuilderForm } from '@/automations/utils/automationFormDefinitions';
import { useWorkflowTemplatePrompt } from '@/automations/components/builder/hooks/useWorkflowTemplatePrompt';
import { IconArrowsMaximize } from '@tabler/icons-react';
import { ReactFlowProvider } from '@xyflow/react';
import { AlertDialog, Button, Input, Popover, Sheet } from 'erxes-ui';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  FieldPath,
  FormProvider,
  useForm,
  useFormContext,
  useWatch,
} from 'react-hook-form';

// Edits a workflow's member actions with the real builder canvas: the sheet
// hosts its own form scope where members live as root `actions`, so every
// main-canvas behavior (config sidebar, output variables, connect, drop)
// works unchanged. Changes sync back to the outer form live.
const WorkflowEditCanvas = ({
  workflowId,
  onMembersChanged,
}: {
  workflowId: string;
  onMembersChanged?: () => void;
}) => {
  const outerForm = useFormContext<TAutomationBuilderForm>();
  const { workflows } = useAutomationNodes();

  const workflowIndex = (workflows || []).findIndex(
    ({ id }) => id === workflowId,
  );
  const workflow = (workflows || [])[workflowIndex];

  const innerForm = useForm<TAutomationBuilderForm>({
    defaultValues: {
      name: workflow?.name || 'Workflow',
      status: 'draft',
      edgeType: outerForm.getValues('edgeType') ?? 'default',
      flowDirection: outerForm.getValues('flowDirection') ?? 'horizontal',
      triggers: [],
      actions: workflow?.actions || [],
      workflows: [],
    },
  });

  const innerActions = useWatch({
    control: innerForm.control,
    name: 'actions',
  });
  const isFirstSyncRef = useRef(true);

  useEffect(() => {
    if (isFirstSyncRef.current) {
      isFirstSyncRef.current = false;
      return;
    }

    if (workflowIndex < 0) {
      return;
    }

    onMembersChanged?.();
    outerForm.setValue(
      `workflows.${workflowIndex}.actions` as FieldPath<TAutomationBuilderForm>,
      innerActions,
      { shouldDirty: true },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [innerActions, workflowIndex]);

  const inputs = workflow?.config?.inputs || {};

  const addInput = useCallback(
    (name: string) => {
      const trimmed = name.trim();
      if (!trimmed || workflowIndex < 0 || inputs[trimmed] !== undefined) {
        return;
      }

      outerForm.setValue(
        `workflows.${workflowIndex}.config.inputs` as FieldPath<TAutomationBuilderForm>,
        { ...inputs, [trimmed]: '' },
        { shouldDirty: true },
      );
    },
    [outerForm, workflowIndex, inputs],
  );

  if (!workflow) {
    return null;
  }

  return (
    <AutomationProvider scoped>
      <ReactFlowProvider>
        <FormProvider {...innerForm}>
          <WorkflowEditScopeProvider
            workflowId={workflowId}
            entryActionId={workflow.config?.entryActionId}
            inputs={inputs}
            addInput={addInput}
          >
            <div className="relative flex h-full w-full flex-row overflow-hidden">
              <AutomationBuilderCanvas />
              <AutomationBuilderSidebar />
            </div>
          </WorkflowEditScopeProvider>
        </FormProvider>
      </ReactFlowProvider>
    </AutomationProvider>
  );
};

// Sheet title/description edit the workflow node's name/description directly
const WorkflowSheetMeta = ({ workflowId }: { workflowId: string }) => {
  const outerForm = useFormContext<TAutomationBuilderForm>();
  const { workflows } = useAutomationNodes();

  const workflowIndex = (workflows || []).findIndex(
    ({ id }) => id === workflowId,
  );
  const workflow = (workflows || [])[workflowIndex];

  const [meta, setMeta] = useState({
    name: workflow?.name || '',
    description: workflow?.description || '',
  });

  const updateMeta = (key: 'name' | 'description', value: string) => {
    setMeta((previous) => ({ ...previous, [key]: value }));

    if (workflowIndex >= 0) {
      outerForm.setValue(
        `workflows.${workflowIndex}.${key}` as FieldPath<TAutomationBuilderForm>,
        value,
        { shouldDirty: true },
      );
    }
  };

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <Popover>
        <Popover.Trigger asChild>
          <button
            type="button"
            className="-mx-1 w-fit max-w-full truncate rounded px-1 text-left hover:bg-accent"
          >
            <Sheet.Title>{meta.name || 'Workflow'}</Sheet.Title>
          </button>
        </Popover.Trigger>
        <Popover.Content align="start" className="w-80 p-3">
          <Input
            value={meta.name}
            placeholder="Workflow name"
            onChange={(event) => updateMeta('name', event.currentTarget.value)}
          />
        </Popover.Content>
      </Popover>
      <Popover>
        <Popover.Trigger asChild>
          <button
            type="button"
            className="-mx-1 w-fit max-w-full truncate rounded px-1 text-left hover:bg-accent"
          >
            <Sheet.Description>
              {meta.description || 'Add description...'}
            </Sheet.Description>
          </button>
        </Popover.Trigger>
        <Popover.Content align="start" className="w-80 p-3">
          <Input
            value={meta.description}
            placeholder="Description"
            onChange={(event) =>
              updateMeta('description', event.currentTarget.value)
            }
          />
        </Popover.Content>
      </Popover>
    </div>
  );
};

export const WorkflowCanvasSheet = ({ workflowId }: { workflowId: string }) => {
  const [open, setOpen] = useState(false);
  const {
    isPromptOpen,
    setPromptOpen,
    markMembersChanged,
    handleSheetOpenChange,
    confirmUpdateTemplate,
  } = useWorkflowTemplatePrompt(workflowId);

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      setOpen(nextOpen);
      handleSheetOpenChange(nextOpen);
    },
    [handleSheetOpenChange],
  );

  return (
    <>
      <Sheet open={open} onOpenChange={handleOpenChange}>
        <Sheet.Trigger asChild>
          <Button variant="ghost" size="sm" className="w-full justify-start">
            <IconArrowsMaximize className="size-4" />
          </Button>
        </Sheet.Trigger>
        <Sheet.View className="p-0 md:w-[calc(96vw-theme(spacing.4))] flex flex-col gap-0 transition-all duration-100 ease-out overflow-hidden flex-none sm:max-w-none">
          <Sheet.Header>
            {open && <WorkflowSheetMeta workflowId={workflowId} />}
            <Sheet.Close />
          </Sheet.Header>
          <Sheet.Content className="min-h-0 flex-1">
            {open && (
              <WorkflowEditCanvas
                workflowId={workflowId}
                onMembersChanged={markMembersChanged}
              />
            )}
          </Sheet.Content>
        </Sheet.View>
      </Sheet>

      <AlertDialog open={isPromptOpen} onOpenChange={setPromptOpen}>
        <AlertDialog.Content>
          <AlertDialog.Header>
            <AlertDialog.Title>Update template?</AlertDialog.Title>
            <AlertDialog.Description>
              This workflow was inserted from a template. Apply your edits to
              the template as well, or keep them only in this automation?
            </AlertDialog.Description>
          </AlertDialog.Header>
          <AlertDialog.Footer>
            <AlertDialog.Cancel>Only this automation</AlertDialog.Cancel>
            <AlertDialog.Action onClick={confirmUpdateTemplate}>
              Update template
            </AlertDialog.Action>
          </AlertDialog.Footer>
        </AlertDialog.Content>
      </AlertDialog>
    </>
  );
};
