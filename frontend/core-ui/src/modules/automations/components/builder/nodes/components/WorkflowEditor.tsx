import { AutomationBuilderCanvas } from '@/automations/components/builder/AutomationBuilderCanvas';
import {
  TWorkflowEditorMeta,
  TWorkflowEditorValue,
  useWorkflowEditor,
} from '@/automations/components/builder/nodes/hooks/useWorkflowEditor';
import { useWorkflowEditorHeader } from '@/automations/components/builder/nodes/hooks/useWorkflowEditorHeader';
import { AutomationBuilderSidebar } from '@/automations/components/builder/sidebar/components/AutomationBuilderSidebar';
import { AutomationProvider } from '@/automations/context/AutomationProvider';
import { WorkflowEditScopeProvider } from '@/automations/context/WorkflowEditScopeProvider';
import { IconArrowLeft, IconChevronRight, IconPlus } from '@tabler/icons-react';
import { ReactFlowProvider } from '@xyflow/react';
import { AlertDialog, Button, Input, Popover } from 'erxes-ui';
import { FormProvider } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

export type { TWorkflowEditorValue };

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
  const { t } = useTranslation('automations');
  const {
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
  } = useWorkflowEditor({ initial, edgeType, flowDirection, onSave, onBack });

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
            <AlertDialog.Title>
              {t('workflow-editor-unsaved-changes')}
            </AlertDialog.Title>
            <AlertDialog.Description>
              {t('workflow-editor-leave-description')}
            </AlertDialog.Description>
          </AlertDialog.Header>
          <AlertDialog.Footer>
            <AlertDialog.Cancel>
              {t('workflow-editor-keep-editing')}
            </AlertDialog.Cancel>
            <AlertDialog.Action
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDiscard}
            >
              {t('workflow-editor-discard-changes')}
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
  meta: TWorkflowEditorMeta;
  onMetaChange: (key: keyof TWorkflowEditorMeta, value: string) => void;
  isDirty: boolean;
  onBack: () => void;
  onSave: () => void;
}) => {
  const { t } = useTranslation('automations');
  const { onNameChange, onDescriptionChange, openActionLibrary } =
    useWorkflowEditorHeader(onMetaChange);

  return (
    <div className="flex items-center gap-3 border-b bg-sidebar px-4 py-2">
      <Button variant="ghost" size="sm" onClick={onBack}>
        <IconArrowLeft className="size-4" />
        {t('workflow-editor-back')}
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
              {meta.name || t('workflow-label')}
            </button>
          </Popover.Trigger>
          <Popover.Content align="start" className="w-80 space-y-2 p-3">
            <Input
              value={meta.name}
              placeholder={t('workflow-editor-name-placeholder')}
              onChange={onNameChange}
            />
            <Input
              value={meta.description}
              placeholder={t('description')}
              onChange={onDescriptionChange}
            />
          </Popover.Content>
        </Popover>
      </div>

      <div className="ml-auto flex items-center gap-3">
        {isDirty && (
          <>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="size-1.5 rounded-full bg-amber-500" />
              {t('workflow-editor-unsaved-changes')}
            </span>
            <Button onClick={onSave}>{saveLabel}</Button>
          </>
        )}
        <Button variant="outline" onClick={openActionLibrary}>
          <IconPlus className="size-4" />
          {t('workflow-editor-add-action')}
        </Button>
      </div>
    </div>
  );
};
