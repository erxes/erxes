import { IconCheck, IconX } from '@tabler/icons-react';
import { Badge, Button, Spinner, useToast } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';
import { currentUserState } from 'ui-modules/states';
import { useApprovalLockActions } from '../hooks';
import { ApprovalRequest } from '../types';

type ApprovalNotificationActionsProps = {
  request: ApprovalRequest;
  onCompleted?: () => void;
};

export const ApprovalNotificationActions = ({
  request,
  onCompleted,
}: ApprovalNotificationActionsProps) => {
  const { t } = useTranslation('approval');
  const { toast } = useToast();
  const currentUser = useAtomValue(currentUserState);
  const { approveRequest, rejectRequest, cancelRequest, loading } =
    useApprovalLockActions();

  if (request.status !== 'pending') {
    return <Badge variant="secondary">{t(`status-${request.status}`)}</Badge>;
  }

  const isRequester = request.requesterId === currentUser?._id;
  const isApprover = request.requiredApproverIds.includes(
    currentUser?._id || '',
  );

  const handleAction = async (action: 'approve' | 'reject' | 'cancel') => {
    try {
      if (action === 'approve') {
        await approveRequest(request._id);
      }

      if (action === 'reject') {
        await rejectRequest(request._id);
      }

      if (action === 'cancel') {
        await cancelRequest(request._id);
      }

      toast({ title: t(`request-${action}-success`), variant: 'success' });
      onCompleted?.();
    } catch (error) {
      toast({
        title: t('request-action-failed'),
        description:
          error instanceof Error ? error.message : t('unknown-error'),
        variant: 'destructive',
      });
    }
  };

  if (isRequester) {
    return (
      <Button
        variant="outline"
        disabled={loading}
        onClick={() => handleAction('cancel')}
      >
        {loading ? <Spinner /> : <IconX />}
        {t('cancel-request')}
      </Button>
    );
  }

  if (!isApprover) {
    return <Badge variant="secondary">{t('waiting-for-approver')}</Badge>;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button disabled={loading} onClick={() => handleAction('approve')}>
        {loading ? <Spinner /> : <IconCheck />}
        {t('approve')}
      </Button>
      <Button
        variant="outline"
        disabled={loading}
        onClick={() => handleAction('reject')}
      >
        <IconX />
        {t('reject')}
      </Button>
    </div>
  );
};
