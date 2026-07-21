import { useConvertSelectionToWorkflow } from '@/automations/components/builder/hooks/useConvertSelectionToWorkflow';
import { useRemoveSelectedNodes } from '@/automations/components/builder/hooks/useRemoveSelectedNodes';
import { useWorkflowEditScope } from '@/automations/context/WorkflowEditScopeProvider';
import { AutomationNodeType } from '@/automations/types';
import { IconArrowsSplit2, IconTrash } from '@tabler/icons-react';
import {
  OnSelectionChangeParams,
  Panel,
  useOnSelectionChange,
} from '@xyflow/react';
import { AlertDialog, Button, Dialog, Input } from 'erxes-ui';
import { useCallback, useState } from 'react';

type TNodeSelection = {
  actionIds: string[];
  triggerIds: string[];
  workflowIds: string[];
};

const EMPTY_SELECTION: TNodeSelection = {
  actionIds: [],
  triggerIds: [],
  workflowIds: [],
};

const pluralize = (count: number, noun: string) =>
  `${count} ${noun}${count > 1 ? 's' : ''}`;

const describeSelection = ({
  actionIds,
  triggerIds,
  workflowIds,
}: TNodeSelection) =>
  [
    triggerIds.length && pluralize(triggerIds.length, 'trigger'),
    actionIds.length && pluralize(actionIds.length, 'action'),
    workflowIds.length && pluralize(workflowIds.length, 'workflow'),
  ]
    .filter(Boolean)
    .join(', ');

export const MarqueeSelectionPanel = ({
  isMarqueeMode,
}: {
  isMarqueeMode: boolean;
}) => {
  const [selection, setSelection] = useState<TNodeSelection>(EMPTY_SELECTION);
  const [isOpenConvertDialog, setOpenConvertDialog] = useState(false);
  const [isOpenDeleteAlert, setOpenDeleteAlert] = useState(false);
  const [doc, setDoc] = useState({ name: 'New workflow', description: '' });
  const { convertSelectionToWorkflow } = useConvertSelectionToWorkflow();
  const { removeNodes } = useRemoveSelectedNodes();

  const onChange = useCallback(({ nodes }: OnSelectionChangeParams) => {
    const idsOfType = (nodeType: AutomationNodeType) =>
      nodes.filter((node) => node.type === nodeType).map((node) => node.id);

    setSelection({
      actionIds: idsOfType(AutomationNodeType.Action),
      triggerIds: idsOfType(AutomationNodeType.Trigger),
      workflowIds: idsOfType(AutomationNodeType.Workflow),
    });
  }, []);

  useOnSelectionChange({ onChange });

  const workflowEditScope = useWorkflowEditScope();

  const selectedIds = [
    ...selection.triggerIds,
    ...selection.actionIds,
    ...selection.workflowIds,
  ];

  const onConvert = () => {
    convertSelectionToWorkflow(selection.actionIds, doc);
    setSelection(EMPTY_SELECTION);
    setOpenConvertDialog(false);
    setDoc({ name: 'New workflow', description: '' });
  };

  const onDelete = () => {
    removeNodes(selectedIds);
    setSelection(EMPTY_SELECTION);
    setOpenDeleteAlert(false);
  };

  if (!isMarqueeMode || selectedIds.length < 2) {
    return null;
  }

  // Converting inside a workflow would nest workflows — not supported
  const canConvertToWorkflow =
    !workflowEditScope &&
    selection.actionIds.length >= 2 &&
    !selection.triggerIds.length &&
    !selection.workflowIds.length;

  return (
    <Panel position="top-center" className="pointer-events-auto">
      <div className="flex items-center gap-3 rounded-md border bg-background/95 px-3 py-2 shadow-sm backdrop-blur">
        <span className="text-sm text-muted-foreground">
          {describeSelection(selection)} selected
        </span>
        {canConvertToWorkflow && (
          <Button onClick={() => setOpenConvertDialog(true)}>
            <IconArrowsSplit2 />
            Convert to workflow
          </Button>
        )}
        <Button
          variant="secondary"
          className="bg-destructive/10 text-destructive hover:bg-destructive/20"
          onClick={() => setOpenDeleteAlert(true)}
        >
          <IconTrash />
          Delete
        </Button>
      </div>

      <Dialog open={isOpenConvertDialog} onOpenChange={setOpenConvertDialog}>
        <Dialog.Content>
          <Dialog.Title>Convert to workflow</Dialog.Title>
          <Dialog.Description>
            Name the workflow before converting the selected actions.
          </Dialog.Description>
          <Input
            name="name"
            value={doc.name}
            onChange={(event) =>
              setDoc({ ...doc, name: event.currentTarget.value })
            }
          />
          <Input
            type="textarea"
            name="description"
            placeholder="Description"
            value={doc.description}
            onChange={(event) =>
              setDoc({ ...doc, description: event.currentTarget.value })
            }
          />
          <Dialog.Footer>
            <Button onClick={onConvert} disabled={!doc.name.trim()}>
              Convert
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog>

      <AlertDialog open={isOpenDeleteAlert} onOpenChange={setOpenDeleteAlert}>
        <AlertDialog.Content>
          <AlertDialog.Header>
            <AlertDialog.Title>
              Delete {pluralize(selectedIds.length, 'node')}?
            </AlertDialog.Title>
            <AlertDialog.Description>
              {describeSelection(selection)} will be removed from the canvas,
              together with every connection pointing at them.
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
    </Panel>
  );
};
