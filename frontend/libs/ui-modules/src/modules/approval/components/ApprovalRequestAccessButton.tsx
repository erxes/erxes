import { IconSend } from '@tabler/icons-react';
import { Button, Dialog, Label, Spinner, Textarea, useToast } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApprovalLockActions } from '../hooks';
import { ApprovalRequest } from '../types';

type ApprovalRequestAccessButtonProps = {
  contentType: string;
  contentId: string;
  pendingRequest?: ApprovalRequest;
  disabled?: boolean;
  onCompleted?: () => void;
};

export const ApprovalRequestAccessButton = ({
  contentType,
  contentId,
  pendingRequest,
  disabled,
  onCompleted,
}: ApprovalRequestAccessButtonProps) => {
  const { t } = useTranslation('approval');
  const { toast } = useToast();
  const { createRequest, loading } = useApprovalLockActions();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const isPending = pendingRequest?.status === 'pending';

  const handleRequest = async () => {
    try {
      const normalizedReason = reason.trim();

      await createRequest({
        contentType,
        contentId,
        reason: normalizedReason || undefined,
      });
      toast({
        title: t('request-sent-title'),
        description: t('request-sent-description'),
        variant: 'success',
      });
      setReason('');
      setOpen(false);
      onCompleted?.();
    } catch (error) {
      toast({
        title: t('request-failed-title'),
        description:
          error instanceof Error ? error.message : t('unknown-error'),
        variant: 'destructive',
      });
    }
  };

  if (isPending) {
    return (
      <Button disabled>
        <IconSend />
        {t('request-pending')}
      </Button>
    );
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);

        if (!nextOpen) {
          setReason('');
        }
      }}
    >
      <Dialog.Trigger asChild>
        <Button disabled={disabled || loading}>
          {loading ? <Spinner /> : <IconSend />}
          {t('request-access')}
        </Button>
      </Dialog.Trigger>
      <Dialog.Content className="max-w-md">
        <Dialog.Header>
          <Dialog.Title>{t('request-dialog-title')}</Dialog.Title>
          <Dialog.Description>
            {t('request-dialog-description')}
          </Dialog.Description>
        </Dialog.Header>
        <div className="space-y-2">
          <Label htmlFor="approval-request-reason">{t('request-reason')}</Label>
          <Textarea
            id="approval-request-reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder={t('request-reason-placeholder')}
            disabled={loading}
            rows={4}
            className="resize-none"
          />
        </div>
        <Dialog.Footer>
          <Dialog.Close asChild>
            <Button variant="ghost" disabled={loading}>
              {t('cancel')}
            </Button>
          </Dialog.Close>
          <Button disabled={disabled || loading} onClick={handleRequest}>
            {loading ? <Spinner /> : <IconSend />}
            {t('send-request')}
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
};
