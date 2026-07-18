import { useConvertSelectionToWorkflow } from '@/automations/components/builder/hooks/useConvertSelectionToWorkflow';
import { useWorkflowEditScope } from '@/automations/context/WorkflowEditScopeProvider';
import { AutomationNodeType } from '@/automations/types';
import { IconArrowsSplit2 } from '@tabler/icons-react';
import {
  OnSelectionChangeParams,
  Panel,
  useOnSelectionChange,
} from '@xyflow/react';
import { Button, Dialog, Input } from 'erxes-ui';
import { useCallback, useState } from 'react';

export const MarqueeSelectionPanel = ({
  isMarqueeMode,
}: {
  isMarqueeMode: boolean;
}) => {
  const [selectedActionIds, setSelectedActionIds] = useState<string[]>([]);
  const [isOpenConvertDialog, setOpenConvertDialog] = useState(false);
  const [doc, setDoc] = useState({ name: 'New workflow', description: '' });
  const { convertSelectionToWorkflow } = useConvertSelectionToWorkflow();

  const onChange = useCallback(({ nodes }: OnSelectionChangeParams) => {
    setSelectedActionIds(
      nodes
        .filter((node) => node.type === AutomationNodeType.Action)
        .map((node) => node.id),
    );
  }, []);

  useOnSelectionChange({ onChange });

  const workflowEditScope = useWorkflowEditScope();

  const onConvert = () => {
    convertSelectionToWorkflow(selectedActionIds, doc);
    setSelectedActionIds([]);
    setOpenConvertDialog(false);
    setDoc({ name: 'New workflow', description: '' });
  };

  // Converting inside a workflow would nest workflows — not supported
  if (workflowEditScope || !isMarqueeMode || selectedActionIds.length < 2) {
    return null;
  }

  return (
    <Panel position="top-center" className="pointer-events-auto">
      <div className="flex items-center gap-3 rounded-md border bg-background/95 px-3 py-2 shadow-sm backdrop-blur">
        <span className="text-sm text-muted-foreground">
          {selectedActionIds.length} actions selected
        </span>
        <Button onClick={() => setOpenConvertDialog(true)}>
          <IconArrowsSplit2 />
          Convert to workflow
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
    </Panel>
  );
};
