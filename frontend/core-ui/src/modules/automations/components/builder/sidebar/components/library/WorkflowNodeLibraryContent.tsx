import {
  TWorkflowTemplate,
  useWorkflowTemplates,
} from '@/automations/components/builder/hooks/useWorkflowTemplates';
import { NODE_LIBRARY_GROUP_CLASS } from '@/automations/components/builder/sidebar/components/library/AutomationNodeLibraryTabContent';
import { NodeLibraryRow } from '@/automations/components/builder/sidebar/components/library/NodeLibraryRow';
import { SidebarNodeLibrarySkeleton } from '@/automations/components/builder/sidebar/components/library/SidebarNodeLibrarySkeleton';
import { AutomationNodeType } from '@/automations/types';
import { IconTrash } from '@tabler/icons-react';
import { AlertDialog, Button, Command } from 'erxes-ui';
import { MouseEvent, PointerEvent, useCallback, useState } from 'react';

export const WorkflowNodeLibraryContent = () => {
  const { templates, loading, insertTemplate, removeTemplate } =
    useWorkflowTemplates();
  // The confirm dialog lives OUTSIDE the Command.Item rows: cmdk items select
  // on pointer events, so a dialog nested inside a row would leak its clicks
  // into onSelect (inserting the template).
  const [removeTarget, setRemoveTarget] = useState<TWorkflowTemplate | null>(
    null,
  );

  const handleDialogOpenChange = useCallback((open: boolean) => {
    if (!open) {
      setRemoveTarget(null);
    }
  }, []);

  const handleConfirmRemove = useCallback(() => {
    if (removeTarget) {
      removeTemplate(removeTarget._id);
    }
    setRemoveTarget(null);
  }, [removeTarget, removeTemplate]);

  if (loading) {
    return <SidebarNodeLibrarySkeleton />;
  }

  return (
    <>
      <Command.Empty />
      <Command.Group heading="Templates" className={NODE_LIBRARY_GROUP_CLASS}>
        {templates.map((template) => (
          <NodeLibraryRow
            key={template._id}
            nodeType={AutomationNodeType.Workflow}
            item={{
              type: template._id,
              label: template.name,
              description: template.description,
              icon: 'IconArrowsSplit2',
            }}
            onSelectNode={() => insertTemplate(template)}
            onDragStart={(event) => {
              event.dataTransfer.setData(
                'application/reactflow/draggingNode',
                JSON.stringify({
                  nodeType: AutomationNodeType.Workflow,
                  automationId: '',
                  name: template.name,
                  description: template.description || '',
                  template,
                }),
              );
              event.dataTransfer.effectAllowed = 'move';
            }}
            rightElement={
              <WorkflowTemplateRemoveButton
                template={template}
                onRequestRemove={setRemoveTarget}
              />
            }
          />
        ))}
      </Command.Group>

      <AlertDialog
        open={!!removeTarget}
        onOpenChange={handleDialogOpenChange}
      >
        <AlertDialog.Content>
          <AlertDialog.Header>
            <AlertDialog.Title>Delete template?</AlertDialog.Title>
            <AlertDialog.Description>
              "{removeTarget?.name}" will be permanently deleted. Workflows
              already inserted from it are not affected.
            </AlertDialog.Description>
          </AlertDialog.Header>
          <AlertDialog.Footer>
            <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
            <AlertDialog.Action
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleConfirmRemove}
            >
              Delete
            </AlertDialog.Action>
          </AlertDialog.Footer>
        </AlertDialog.Content>
      </AlertDialog>
    </>
  );
};

const WorkflowTemplateRemoveButton = ({
  template,
  onRequestRemove,
}: {
  template: TWorkflowTemplate;
  onRequestRemove: (template: TWorkflowTemplate) => void;
}) => {
  // cmdk selects rows on pointer-up, so that must be stopped too — a click
  // handler alone fires after the row has already handled the pointer event.
  const handlePointerUp = useCallback(
    (event: PointerEvent) => event.stopPropagation(),
    [],
  );

  const handleClick = useCallback(
    (event: MouseEvent) => {
      event.stopPropagation();
      onRequestRemove(template);
    },
    [onRequestRemove, template],
  );

  return (
    <Button
      variant="ghost"
      size="icon"
      onPointerUp={handlePointerUp}
      onClick={handleClick}
    >
      <IconTrash className="size-4" />
    </Button>
  );
};
