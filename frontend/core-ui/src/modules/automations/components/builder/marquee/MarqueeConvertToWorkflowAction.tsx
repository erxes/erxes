import { useConvertSelectionToWorkflowDialog } from '@/automations/components/builder/hooks/useConvertSelectionToWorkflowDialog';
import { useAutomation } from '@/automations/context/AutomationProvider';
import { IconArrowsSplit2 } from '@tabler/icons-react';
import { Button, Dialog, Input } from 'erxes-ui';

export const MarqueeConvertToWorkflowAction = ({
  actionIds,
  onConverted,
}: {
  actionIds: string[];
  onConverted: () => void;
}) => {
  const { canConvert, doc, isOpen, onConvert, setDoc, setOpen } =
    useConvertSelectionToWorkflowDialog({ actionIds, onConverted });
  const { isReadOnly } = useAutomation();

  return (
    <>
      <Button disabled={isReadOnly} onClick={() => setOpen(true)}>
        <IconArrowsSplit2 />
        Convert to workflow
      </Button>

      <Dialog open={isOpen} onOpenChange={setOpen}>
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
            <Button onClick={onConvert} disabled={!canConvert}>
              Convert
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog>
    </>
  );
};
