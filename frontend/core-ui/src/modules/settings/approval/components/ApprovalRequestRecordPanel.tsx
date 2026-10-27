import { useApolloClient, useQuery } from '@apollo/client';
import {
  Badge,
  Button,
  RelativeDateDisplay,
  Separator,
  Spinner,
  Empty,
} from 'erxes-ui';
import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ApprovalNotificationActions,
  type ApprovalRequest,
  type IUser,
  type IRecordViewProps,
  RecordSidePanel,
} from 'ui-modules';
import { CORE_APPROVAL_REQUEST_PANEL } from '../graphql/approvalRequestPanel';
import { ApprovalContentTarget } from '@/approval/components/ApprovalContentTarget';
import { getApprovalRequestUserName } from './approvalRequestUtils';

const findDecisionUserName = ({
  requester,
  approvers,
  userId,
}: {
  requester?: IUser;
  approvers?: IUser[];
  userId: string;
}) => {
  const user = [requester, ...(approvers || [])].find(
    (member) => member?._id === userId,
  );

  return user ? getApprovalRequestUserName(user) : userId;
};

const DetailField = ({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) => (
  <div className="space-y-1">
    <div className="text-xs font-medium uppercase text-muted-foreground">
      {label}
    </div>
    <div className="text-sm text-foreground">{children}</div>
  </div>
);

export const ApprovalRequestRecordPanel = ({
  record,
  onBack,
  onClose,
}: IRecordViewProps) => {
  const { t } = useTranslation('approval');
  const client = useApolloClient();
  const { data, loading, error, refetch } = useQuery<{
    approvalRequestDetail: ApprovalRequest | null;
  }>(CORE_APPROVAL_REQUEST_PANEL, { variables: { id: record.contentId } });
  const request = data?.approvalRequestDetail;
  const header = (
    <RecordSidePanel.Header
      title={t('request-details')}
      onBack={onBack}
      onClose={onClose}
    />
  );
  if (loading && !request)
    return (
      <>
        {header}
        <Spinner containerClassName="py-12" />
      </>
    );
  if (error || !request)
    return (
      <>
        {header}
        <Empty>
          <Empty.Header>
            <Empty.Title>
              {t('request-unavailable', 'Request unavailable')}
            </Empty.Title>
            <Empty.Description>{error?.message}</Empty.Description>
          </Empty.Header>
          <Empty.Content>
            <Button onClick={() => refetch()}>{t('retry', 'Retry')}</Button>
          </Empty.Content>
        </Empty>
      </>
    );
  const targetLabel = request.content?.label || request.contentType;
  const approvers = request.requiredApprovers || [];
  const approverNames = approvers
    .map(getApprovalRequestUserName)
    .filter((name) => name !== '-');
  const onCompleted = () => {
    client.cache.evict({ id: 'ROOT_QUERY', fieldName: 'approvalRequests' });
    refetch();
  };
  return (
    <>
      {header}
      <div className="min-h-0 overflow-y-auto p-5">
        <div className="space-y-5">
          <div className="rounded-md border p-3">
            <div className="min-w-0">
              <ApprovalContentTarget
                contentType={request.contentType}
                contentId={request.contentId}
                label={targetLabel}
              />
              <div className="truncate text-xs text-muted-foreground">
                {request.contentType}
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <DetailField label={t('status')}>
              <Badge variant="secondary">{t(`status-${request.status}`)}</Badge>
            </DetailField>
            <DetailField label={t('requester')}>
              {getApprovalRequestUserName(request.requester)}
            </DetailField>
            <DetailField label={t('created')}>
              <RelativeDateDisplay.Value value={request.createdAt} />
            </DetailField>
            <DetailField label={t('resolved')}>
              {request.resolvedAt ? (
                <RelativeDateDisplay.Value value={request.resolvedAt} />
              ) : (
                '-'
              )}
            </DetailField>
            <DetailField label={t('approvers')}>
              {approverNames.length ? approverNames.join(', ') : '-'}
            </DetailField>
          </div>

          <DetailField label={t('reason')}>
            <div className="whitespace-pre-wrap break-words rounded-md border bg-muted/30 p-3 text-muted-foreground">
              {request.reason || '-'}
            </div>
          </DetailField>

          <Separator />

          <div className="space-y-3">
            <div className="text-sm font-medium">{t('decision-history')}</div>
            {request.decisions.length ? (
              <div className="space-y-2">
                {request.decisions.map((decision) => (
                  <div
                    key={`${decision.userId}-${decision.at}`}
                    className="rounded-md border p-3 text-sm"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="font-medium">
                        {findDecisionUserName({
                          requester: request.requester,
                          approvers,
                          userId: decision.userId,
                        })}
                      </div>
                      <Badge variant="secondary">
                        {t(`status-${decision.decision}`)}
                      </Badge>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      <RelativeDateDisplay.Value value={decision.at} />
                    </div>
                    {decision.reason && (
                      <div className="mt-2 whitespace-pre-wrap break-words text-muted-foreground">
                        {decision.reason}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
                {t('no-decisions')}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex shrink-0 justify-end border-t p-3">
        <ApprovalNotificationActions
          request={request}
          onCompleted={onCompleted}
        />
      </div>
    </>
  );
};
