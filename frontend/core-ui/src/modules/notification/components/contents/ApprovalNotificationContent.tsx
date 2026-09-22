import { ApprovalContentTarget } from '@/approval/components/ApprovalContentTarget';
import { useQuery } from '@apollo/client';
import { IconLock } from '@tabler/icons-react';
import { Badge, RelativeDateDisplay, Separator, Spinner } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  ApprovalNotificationActions,
  ApprovalNotificationMetadata,
  ApprovalRequest,
  IUser,
  TNotification,
} from 'ui-modules';
import { APPROVAL_REQUEST_DETAIL } from 'ui-modules/modules/approval/graphql/queries';

type ApprovalRequestDetail = ApprovalRequest & {
  requester?: IUser;
};

type ApprovalRequestDetailResponse = {
  approvalRequestDetail: ApprovalRequestDetail;
};

const isApprovalNotificationMetadata = (
  metadata: unknown,
): metadata is ApprovalNotificationMetadata => {
  if (!metadata || typeof metadata !== 'object') {
    return false;
  }

  const value = metadata as Record<string, unknown>;

  return (
    typeof value.approvalRequestId === 'string' &&
    typeof value.lockId === 'string' &&
    typeof value.targetContentType === 'string' &&
    typeof value.targetContentId === 'string'
  );
};

const getRequesterName = (requester?: IUser) => {
  const fullName = requester?.details?.fullName;
  const firstLastName = [
    requester?.details?.firstName,
    requester?.details?.lastName,
  ]
    .filter(Boolean)
    .join(' ');

  return fullName || firstLastName || requester?.email || requester?.username;
};

export const ApprovalNotificationContent = (notification: TNotification) => {
  const { t } = useTranslation('approval');
  const metadata = isApprovalNotificationMetadata(notification.metadata)
    ? notification.metadata
    : null;

  const { data, loading, refetch } = useQuery<ApprovalRequestDetailResponse>(
    APPROVAL_REQUEST_DETAIL,
    {
      variables: { id: metadata?.approvalRequestId },
      skip: !metadata?.approvalRequestId,
      fetchPolicy: 'cache-and-network',
    },
  );

  if (!metadata) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        {t('invalid-notification')}
      </div>
    );
  }

  if (loading && !data) {
    return <Spinner />;
  }

  const request = data?.approvalRequestDetail;
  const requesterName = getRequesterName(request?.requester) || t('someone');
  const targetLabel = metadata.targetLabel || metadata.targetContentType;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-5 p-6">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <IconLock className="size-5" />
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-semibold">{t('approval-request')}</h2>
            {request?.status && (
              <Badge variant="secondary">{t(`status-${request.status}`)}</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {t('approval-request-description', {
              requester: requesterName,
              label: targetLabel,
            })}
          </p>
          <div className="text-xs text-muted-foreground">
            <RelativeDateDisplay.Value value={notification.createdAt} />
          </div>
        </div>
      </div>
      <Separator />
      {request?.reason && (
        <div className="space-y-2">
          <div className="text-xs font-medium uppercase text-muted-foreground">
            {t('request-reason')}
          </div>
          <div className="whitespace-pre-wrap break-words rounded-md border p-3 text-sm text-muted-foreground">
            {request.reason}
          </div>
        </div>
      )}
      <div className="space-y-2">
        <div className="text-xs font-medium uppercase text-muted-foreground">
          {t('target')}
        </div>
        <div className="rounded-md border p-3">
          <div className="min-w-0">
            <ApprovalContentTarget
              contentType={metadata.targetContentType}
              contentId={metadata.targetContentId}
              label={targetLabel}
            />
            <div className="truncate text-xs text-muted-foreground">
              {metadata.targetContentType}
            </div>
          </div>
        </div>
      </div>
      {request && (
        <div className="flex justify-end">
          <ApprovalNotificationActions
            request={request}
            onCompleted={() => refetch()}
          />
        </div>
      )}
    </div>
  );
};
