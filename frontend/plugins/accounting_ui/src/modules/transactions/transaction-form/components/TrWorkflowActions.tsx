import { IconAdjustmentsHorizontal } from '@tabler/icons-react';
import { Button, Dialog, Popover, Textarea, Toggle } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SelectMember } from 'ui-modules';

const DeclineButton = ({
  disabled,
  onDecline,
}: {
  disabled?: boolean;
  onDecline: (note: string) => void;
}) => {
  const { t } = useTranslation('accounting');
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState('');

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setNote('');
      }}
    >
      <Popover.Trigger asChild>
        <Button
          type="button"
          variant="secondary"
          className="text-destructive"
          disabled={disabled}
        >
          {t('reject')}
        </Button>
      </Popover.Trigger>
      <Popover.Content align="end" className="flex w-80 flex-col gap-2 p-3">
        <Textarea
          autoFocus
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder={t('decline-reason-placeholder')}
          aria-label={t('decline-reason-placeholder')}
        />
        <Button
          type="button"
          variant="secondary"
          className="self-end text-destructive"
          disabled={disabled}
          onClick={() => {
            onDecline(note);
            setOpen(false);
            setNote('');
          }}
        >
          {t('reject')}
        </Button>
      </Popover.Content>
    </Popover>
  );
};

const RequestApprovalButton = ({
  disabled,
  onRequest,
}: {
  disabled?: boolean;
  onRequest: (approverIds: string[]) => void;
}) => {
  const { t } = useTranslation('accounting');
  const [open, setOpen] = useState(false);
  const [approverIds, setApproverIds] = useState<string[]>([]);

  return (
    <>
      <Button
        type="button"
        variant="secondary"
        disabled={disabled}
        onClick={() => {
          setApproverIds([]);
          setOpen(true);
        }}
      >
        {t('request-approval')}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>{t('request-approval')}</Dialog.Title>
            <Dialog.Description>
              {t('select-approvers-description')}
            </Dialog.Description>
          </Dialog.Header>
          <SelectMember
            mode="multiple"
            value={approverIds}
            onValueChange={(value) =>
              setApproverIds(
                Array.isArray(value) ? value : value ? [value] : [],
              )
            }
            placeholder={t('select-approvers')}
          />
          <Dialog.Footer className="mt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setOpen(false)}
            >
              {t('cancel-label')}
            </Button>
            <Button
              type="button"
              disabled={!approverIds.length || disabled}
              onClick={() => {
                onRequest(approverIds);
                setOpen(false);
              }}
            >
              {t('send-request')}
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog>
    </>
  );
};

/**
 * A listed user gets Approve and Decline while the form still holds the
 * saved status and recipients, followed by the manage toggle that reveals
 * the ordinary record controls. Everyone else may request approval.
 */
export const TrWorkflowActions = ({
  responder,
  showDecision,
  manageOpen,
  onManageChange,
  canRequestApproval,
  disabled,
  onApprove,
  onDecline,
  onRequestApproval,
}: {
  responder: boolean;
  showDecision: boolean;
  manageOpen: boolean;
  onManageChange: (open: boolean) => void;
  canRequestApproval: boolean;
  disabled?: boolean;
  onApprove: () => void;
  onDecline: (note: string) => void;
  onRequestApproval: (approverIds: string[]) => void;
}) => {
  const { t } = useTranslation('accounting');

  if (!responder) {
    return canRequestApproval ? (
      <RequestApprovalButton
        disabled={disabled}
        onRequest={onRequestApproval}
      />
    ) : null;
  }

  return (
    <>
      {showDecision && (
        <>
          <Button type="button" disabled={disabled} onClick={onApprove}>
            {t('approve-request')}
          </Button>
          <DeclineButton disabled={disabled} onDecline={onDecline} />
        </>
      )}
      <Toggle
        variant="outline"
        pressed={manageOpen}
        onPressedChange={onManageChange}
        aria-label={t('full-control')}
        title={t('full-control')}
      >
        <IconAdjustmentsHorizontal />
      </Toggle>
    </>
  );
};
