import { useDeleteSelectedNodesAlert } from '@/automations/components/builder/hooks/useDeleteSelectedNodesAlert';
import { useAutomation } from '@/automations/context/AutomationProvider';
import {
  describeNodeSelection,
  pluralize,
  TNodeSelection,
} from '@/automations/utils/automationBuilderUtils/nodeSelection';
import { IconTrash } from '@tabler/icons-react';
import { AlertDialog, Button } from 'erxes-ui';

export const MarqueeDeleteSelectionAction = ({
  selection,
  selectedIds,
  onDeleted,
}: {
  selection: TNodeSelection;
  selectedIds: string[];
  onDeleted: () => void;
}) => {
  const { isReadOnly } = useAutomation();
  const { isOpen, onDelete, setOpen } = useDeleteSelectedNodesAlert({
    selectedIds,
    onDeleted,
  });

  return (
    <>
      <Button
        variant="secondary"
        disabled={isReadOnly}
        className="bg-destructive/10 text-destructive hover:bg-destructive/20"
        onClick={() => setOpen(true)}
      >
        <IconTrash />
        Delete
      </Button>

      <AlertDialog open={isOpen} onOpenChange={setOpen}>
        <AlertDialog.Content>
          <AlertDialog.Header>
            <AlertDialog.Title>
              Delete {pluralize(selectedIds.length, 'node')}?
            </AlertDialog.Title>
            <AlertDialog.Description>
              {describeNodeSelection(selection)} will be removed from the
              canvas, together with every connection pointing at them.
            </AlertDialog.Description>
          </AlertDialog.Header>
          <AlertDialog.Footer>
            <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
            <AlertDialog.Action
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={onDelete}
            >
              Delete
            </AlertDialog.Action>
          </AlertDialog.Footer>
        </AlertDialog.Content>
      </AlertDialog>
    </>
  );
};
