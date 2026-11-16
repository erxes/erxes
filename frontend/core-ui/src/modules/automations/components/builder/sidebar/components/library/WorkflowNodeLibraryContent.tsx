import { TWorkflowTemplate } from '@/automations/components/builder/hooks/useWorkflowTemplates';
import { NODE_LIBRARY_GROUP_CLASS } from '@/automations/components/builder/sidebar/components/library/AutomationNodeLibraryTabContent';
import { NodeLibraryRow } from '@/automations/components/builder/sidebar/components/library/NodeLibraryRow';
import { SidebarNodeLibrarySkeleton } from '@/automations/components/builder/sidebar/components/library/SidebarNodeLibrarySkeleton';
import {
  useWorkflowNodeLibraryContent,
  useWorkflowTemplateRemoveButton,
} from '@/automations/components/builder/sidebar/hooks/useWorkflowNodeLibraryContent';
import { AutomationNodeType } from '@/automations/types';
import { IconTrash } from '@tabler/icons-react';
import { AlertDialog, Button, Command } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const WorkflowNodeLibraryContent = () => {
  const { t } = useTranslation('automations');
  const {
    loading,
    rows,
    removeTarget,
    requestRemove,
    handleDialogOpenChange,
    handleConfirmRemove,
  } = useWorkflowNodeLibraryContent();

  if (loading) {
    return <SidebarNodeLibrarySkeleton />;
  }

  return (
    <>
      <Command.Empty />
      <Command.Group
        heading={t('templates')}
        className={NODE_LIBRARY_GROUP_CLASS}
      >
        {rows.map((row) => (
          <NodeLibraryRow
            key={row.key}
            nodeType={AutomationNodeType.Workflow}
            item={row.item}
            onSelectNode={row.onSelect}
            onDragStart={row.onDragStart}
            rightElement={
              <WorkflowTemplateRemoveButton
                template={row.template}
                onRequestRemove={requestRemove}
              />
            }
          />
        ))}
      </Command.Group>

      <AlertDialog open={!!removeTarget} onOpenChange={handleDialogOpenChange}>
        <AlertDialog.Content>
          <AlertDialog.Header>
            <AlertDialog.Title>
              {t('sidebar-delete-template-title')}
            </AlertDialog.Title>
            <AlertDialog.Description>
              {t('sidebar-delete-template-description', {
                name: removeTarget?.name,
              })}
            </AlertDialog.Description>
          </AlertDialog.Header>
          <AlertDialog.Footer>
            <AlertDialog.Cancel>{t('cancel')}</AlertDialog.Cancel>
            <AlertDialog.Action
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleConfirmRemove}
            >
              {t('delete')}
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
  const { handlePointerUp, handleClick } = useWorkflowTemplateRemoveButton({
    template,
    onRequestRemove,
  });

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
