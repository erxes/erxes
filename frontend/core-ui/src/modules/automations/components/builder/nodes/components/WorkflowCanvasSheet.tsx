import { AutomationBuilderCanvas } from '@/automations/components/builder/AutomationBuilderCanvas';
import { AutomationBuilderSidebar } from '@/automations/components/builder/sidebar/components/AutomationBuilderSidebar';
import { useWorkflowTemplatePrompt } from '@/automations/components/builder/hooks/useWorkflowTemplatePrompt';
import { AutomationProvider } from '@/automations/context/AutomationProvider';
import { WorkflowEditScopeProvider } from '@/automations/context/WorkflowEditScopeProvider';
import { useAutomationNodes } from '@/automations/hooks/useAutomationNodes';
import { TAutomationBuilderForm } from '@/automations/utils/automationFormDefinitions';
import { IconArrowsMaximize } from '@tabler/icons-react';
import { ReactFlowProvider } from '@xyflow/react';
import { AlertDialog, Button, Input, Popover, Sheet } from 'erxes-ui';
import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  FieldPath,
  FormProvider,
  useForm,
  useFormContext,
  useWatch,
} from 'react-hook-form';
import { TAutomationAction } from 'ui-modules';

type TWorkflowEditCanvasHandle = {
  getMembers: () => TAutomationAction[];
};

const WorkflowEditCanvas = forwardRef<
  TWorkflowEditCanvasHandle,
  { workflowId: string; onDirty: () => void }
>(({ workflowId, onDirty }, ref) => {
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

    onDirty();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [innerActions]);

  useImperativeHandle(
    ref,
    () => ({
      getMembers: () => innerForm.getValues('actions') || [],
    }),
    [innerForm],
  );

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
});

WorkflowEditCanvas.displayName = 'WorkflowEditCanvas';

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
  const [isDirty, setDirty] = useState(false);
  const [isDiscardOpen, setDiscardOpen] = useState(false);
  const editorRef = useRef<TWorkflowEditCanvasHandle>(null);

  const outerForm = useFormContext<TAutomationBuilderForm>();
  const { workflows } = useAutomationNodes();
  const workflowIndex = (workflows || []).findIndex(
    ({ id }) => id === workflowId,
  );

  const { hasTemplate, isPromptOpen, setPromptOpen, confirmUpdateTemplate } =
    useWorkflowTemplatePrompt(workflowId);

  const handleDirty = useCallback(() => setDirty(true), []);

  // Commits the sheet's edits to the outer form in one write; the automation
  // Save persists them as usual
  const handleSave = useCallback(() => {
    const members = editorRef.current?.getMembers();

    if (!members || workflowIndex < 0) {
      return;
    }

    outerForm.setValue(
      `workflows.${workflowIndex}.actions` as FieldPath<TAutomationBuilderForm>,
      members,
      { shouldDirty: true },
    );
    setDirty(false);

    if (hasTemplate) {
      setPromptOpen(true);
    }
  }, [workflowIndex, outerForm, hasTemplate, setPromptOpen]);

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      // Closing with unsaved edits needs an explicit discard
      if (!nextOpen && isDirty) {
        setDiscardOpen(true);
        return;
      }

      setOpen(nextOpen);

      if (nextOpen) {
        setDirty(false);
      }
    },
    [isDirty],
  );

  const handleDiscard = useCallback(() => {
    setDiscardOpen(false);
    setDirty(false);
    setOpen(false);
  }, []);

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
            <Button onClick={handleSave} disabled={!isDirty}>
              Save workflow
            </Button>
            <Sheet.Close />
          </Sheet.Header>
          <Sheet.Content className="min-h-0 flex-1">
            {open && (
              <WorkflowEditCanvas
                ref={editorRef}
                workflowId={workflowId}
                onDirty={handleDirty}
              />
            )}
          </Sheet.Content>
        </Sheet.View>
      </Sheet>

      <AlertDialog open={isDiscardOpen} onOpenChange={setDiscardOpen}>
        <AlertDialog.Content>
          <AlertDialog.Header>
            <AlertDialog.Title>Unsaved changes</AlertDialog.Title>
            <AlertDialog.Description>
              Close without saving? The edits made in this workflow will be
              lost.
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

      <AlertDialog open={isPromptOpen} onOpenChange={setPromptOpen}>
        <AlertDialog.Content>
          <AlertDialog.Header>
            <AlertDialog.Title>Update template?</AlertDialog.Title>
            <AlertDialog.Description>
              This workflow was inserted from a template. Apply the saved edits
              to the template as well, or keep them only in this automation?
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
