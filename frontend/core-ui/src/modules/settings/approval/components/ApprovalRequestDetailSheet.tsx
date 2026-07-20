import { ApprovalContentTarget } from '@/approval/components/ApprovalContentTarget';
import { Badge, RelativeDateDisplay, Separator, Sheet } from 'erxes-ui';
import { type ReactNode } from 'react';
import {
  ApprovalNotificationActions,
  type ApprovalRequest,
  type IUser,
} from 'ui-modules';
import { getApprovalRequestUserName } from './approvalRequestUtils';

type ApprovalRequestDetailSheetProps = {
  request: ApprovalRequest;
  onCompleted: () => void;
  t: (key: string, defaultValue: string) => string;
  children: ReactNode;
};

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

export const ApprovalRequestDetailSheet = ({
  request,
  onCompleted,
  t,
  children,
}: ApprovalRequestDetailSheetProps) => {
  const targetLabel = request.content?.label || request.contentType;
  const approvers = request.requiredApprovers || [];
  const approverNames = approvers
    .map(getApprovalRequestUserName)
    .filter((name) => name !== '-');

  return (
    <Sheet>
      <Sheet.Trigger asChild>{children}</Sheet.Trigger>
      <Sheet.View className="sm:max-w-xl">
        <Sheet.Header>
          <div className="min-w-0">
            <Sheet.Title>{t('request-details', 'Request details')}</Sheet.Title>
            <Sheet.Description className="truncate">
              {targetLabel}
            </Sheet.Description>
          </div>
          <Sheet.Close />
        </Sheet.Header>
        <Sheet.Content className="min-h-0 overflow-y-auto p-5">
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
              <DetailField label={t('status', 'Status')}>
                <Badge variant="secondary">
                  {t(`status-${request.status}`, request.status)}
                </Badge>
              </DetailField>
              <DetailField label={t('requester', 'Requester')}>
                {getApprovalRequestUserName(request.requester)}
              </DetailField>
              <DetailField label={t('created', 'Created')}>
                <RelativeDateDisplay.Value value={request.createdAt} />
              </DetailField>
              <DetailField label={t('resolved', 'Resolved')}>
                {request.resolvedAt ? (
                  <RelativeDateDisplay.Value value={request.resolvedAt} />
                ) : (
                  '-'
                )}
              </DetailField>
              <DetailField label={t('approvers', 'Approvers')}>
                {approverNames.length ? approverNames.join(', ') : '-'}
              </DetailField>
            </div>

            <DetailField label={t('reason', 'Reason')}>
              <div className="whitespace-pre-wrap break-words rounded-md border bg-muted/30 p-3 text-muted-foreground">
                {request.reason || '-'}
              </div>
            </DetailField>

            <Separator />

            <div className="space-y-3">
              <div className="text-sm font-medium">{t('decision-history', 'Decision history')}</div>
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
                          {t(`status-${decision.decision}`, decision.decision)}
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
                  {t('no-decisions', 'No decisions yet')}
                </div>
              )}
            </div>
          </div>
        </Sheet.Content>
        <Sheet.Footer>
          <ApprovalNotificationActions
            request={request}
            onCompleted={onCompleted}
          />
        </Sheet.Footer>
      </Sheet.View>
    </Sheet>
  );
};
