import { PanelEmptyState } from '@/side-panel/components/PagePanelStatus';
import { useApolloClient, useQuery } from '@apollo/client';
import {
  Badge,
  Button,
  RelativeDateDisplay,
  Separator,
  Spinner,
} from 'erxes-ui';
import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ApprovalNotificationActions,
  type ApprovalRequest,
  type IUser,
  type IRecordViewProps,
  RecordSidePanel,
  PanelField,
} from 'ui-modules';
import { CORE_APPROVAL_REQUEST_PANEL } from '@/settings/approval/graphql/approvalRequestPanel';
import { ApprovalContentTarget } from '@/approval/components/ApprovalContentTarget';
import { getApprovalRequestUserName } from '@/settings/approval/components/approvalRequestUtils';

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
  <PanelField label={label} cell={false}>
    {children}
  </PanelField>
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
        <PanelEmptyState
          title={t('request-unavailable', 'Request unavailable')}
          description={error?.message}
          action={
            <Button onClick={() => refetch()}>{t('retry', 'Retry')}</Button>
          }
        />
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
      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        <div className="space-y-3">
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

          <div className="flex flex-col gap-1">
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
