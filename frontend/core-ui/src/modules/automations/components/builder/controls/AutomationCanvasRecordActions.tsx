import {
  AutomationCanvasControlButton,
  CANVAS_ACTIVE_CONTROL_BUTTON_CLASS,
  CANVAS_CONTROL_BUTTON_CLASS,
} from '@/automations/components/builder/controls/AutomationCanvasControlButton';
import { useAutomationBuilderCanvasActions } from '@/automations/components/builder/hooks/useAutomationBuilderCanvasActions';
import { AUTOMATION_APPROVAL_CONTENT_TYPES } from '@/automations/constants';
import { IconCopy, IconLock, IconLockOpen } from '@tabler/icons-react';
import {
  AlertDialog,
  Button,
  Input,
  Label,
  Separator,
  Spinner,
  cn,
} from 'erxes-ui';
import { ApprovalLockButton } from 'ui-modules';

export const AutomationCanvasRecordActions = () => {
  const {
    automationId,
    automationCreatedBy,
    canLock,
    duplicateName,
    duplicating,
    isDuplicateOpen,
    onDuplicate,
    openDuplicate,
    setDuplicateName,
    setDuplicateOpen,
    suggestedDuplicateName,
  } = useAutomationBuilderCanvasActions();

  if (!automationId) {
    return null;
  }

  return (
    <>
      <Separator orientation="vertical" className="h-5" />

      <AutomationCanvasControlButton
        label="Duplicate automation"
        disabled={duplicating}
        onClick={openDuplicate}
      >
        {duplicating ? <Spinner /> : <IconCopy />}
      </AutomationCanvasControlButton>

      <AlertDialog open={isDuplicateOpen} onOpenChange={setDuplicateOpen}>
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
              value={duplicateName}
              placeholder={suggestedDuplicateName}
              onChange={(event) => setDuplicateName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  onDuplicate();
                }
              }}
            />
            <p className="text-xs text-muted-foreground">
              Leave it empty to use “{suggestedDuplicateName}”.
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

      {canLock && (
        <ApprovalLockButton
          contentType={AUTOMATION_APPROVAL_CONTENT_TYPES.AUTOMATION}
          contentId={automationId}
          ownerId={automationCreatedBy}
          action="edit"
          whenUnlocked={({ loading }) => (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={loading}
              title="Lock automation"
              className={CANVAS_CONTROL_BUTTON_CLASS}
            >
              {loading ? <Spinner /> : <IconLock />}
            </Button>
          )}
          whenLocked={({ canRelease, loading, onRelease }) => (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={!canRelease || loading}
              onClick={onRelease}
              title={canRelease ? 'Unlock automation' : 'Locked'}
              className={cn(
                CANVAS_CONTROL_BUTTON_CLASS,
                CANVAS_ACTIVE_CONTROL_BUTTON_CLASS,
              )}
            >
              {loading ? <Spinner /> : <IconLockOpen />}
            </Button>
          )}
        />
      )}
    </>
  );
};
