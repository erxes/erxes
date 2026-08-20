import { AutomationCanvasControlButton } from '@/automations/components/builder/controls/AutomationCanvasControlButton';
import { useAutomationDuplicateAction } from '@/automations/components/builder/hooks/useAutomationDuplicateAction';
import { IconCopy } from '@tabler/icons-react';
import { AlertDialog, Input, Label, Spinner } from 'erxes-ui';
import { Can } from 'ui-modules';

export const AutomationCanvasDuplicateAction = () => {
  const {
    duplicating,
    isOpen,
    name,
    onDuplicate,
    open,
    setName,
    setOpen,
    suggestedName,
  } = useAutomationDuplicateAction();

  return (
    <Can action="automationsCreate">
      <AutomationCanvasControlButton
        label="Duplicate automation"
        disabled={duplicating}
        onClick={open}
      >
        {duplicating ? <Spinner /> : <IconCopy />}
      </AutomationCanvasControlButton>

      <AlertDialog open={isOpen} onOpenChange={setOpen}>
        <AlertDialog.Content>
          <AlertDialog.Header>
            <AlertDialog.Title>Duplicate this automation?</AlertDialog.Title>
            <AlertDialog.Description>
              The copy is created as a draft, so it never starts running on the
              same triggers by itself.
            </AlertDialog.Description>
          </AlertDialog.Header>

          <div className="space-y-2">
            <Label htmlFor="duplicate-name">Name</Label>
            <Input
              id="duplicate-name"
              autoFocus
              value={name}
              placeholder={suggestedName}
              onChange={(event) => setName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  onDuplicate();
                }
              }}
            />
            <p className="text-xs text-muted-foreground">
              Leave it empty to use “{suggestedName}”.
            </p>
          </div>

          <AlertDialog.Footer>
            <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
            <AlertDialog.Action
              disabled={duplicating}
              onClick={(event) => {
                event.preventDefault();
                onDuplicate();
              }}
            >
              {duplicating ? <Spinner /> : null}
              Duplicate
            </AlertDialog.Action>
          </AlertDialog.Footer>
        </AlertDialog.Content>
      </AlertDialog>
    </Can>
  );
};
