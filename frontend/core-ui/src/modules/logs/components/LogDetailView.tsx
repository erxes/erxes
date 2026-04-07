import { useLogDetail } from '@/logs/hooks/useLogDetail';
import React, { lazy, Suspense } from 'react';
import { ILogDoc, ILogSourceType, ILogStatusType } from '../types';
import { Badge, RelativeDateDisplay, Spinner, cn } from 'erxes-ui';
import { LogUserInfo } from '@/logs/components/LogUser';
import { maskFields } from '../utils/logFormUtils';
import { LogDetailJsonPanel, LogDetailSection } from './LogDetailPrimitives';
import { IconClockHour4, IconDatabase } from '@tabler/icons-react';

const MongoContent = lazy(() =>
  import('./MongoLogDetailContent').then((module) => ({
    default: module.MongoLogDetailContent,
  })),
);

const GraphqlContent = lazy(() =>
  import('./GraphqlLogDetailContent').then((module) => ({
    default: module.GraphqlLogDetailContent,
  })),
);

const AuthContent = lazy(() =>
  import('./AuthLogDetailContent').then((module) => ({
    default: module.AuthLogDetailContent,
  })),
);

const LogDetailComponents: Record<ILogSourceType, any> = {
  [ILogSourceType.MONGO]: MongoContent,
  [ILogSourceType.GRAPHQL]: GraphqlContent,
  [ILogSourceType.AUTH]: AuthContent,
  [ILogSourceType.WEBHOOK]: ({ payload }: ILogDoc) => (
    <LogDetailSection
      title="Webhook Payload"
      description="Captured request or response body for this webhook event."
      icon={IconDatabase}
    >
      <LogDetailJsonPanel
        title="Payload"
        src={maskFields(payload)}
        emptyMessage="No webhook payload was captured."
      />
    </LogDetailSection>
  ),
};

const generateOperationText = ({ source, action, payload }: ILogDoc) => {
  const operationTextMap = {
    [ILogSourceType.MONGO]: action,
    [ILogSourceType.GRAPHQL]: payload?.mutationName,
    [ILogSourceType.AUTH]: action,
    [ILogSourceType.WEBHOOK]: action,
  };

  return operationTextMap[source] || '-';
};

const formatLabel = (value?: string) => {
  if (!value) {
    return '-';
  }

  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[._:-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const SummaryBadge = ({
  children,
  variant = 'secondary',
  className,
}: {
  children: React.ReactNode;
  variant?: React.ComponentProps<typeof Badge>['variant'];
  className?: string;
}) => {
  return (
    <Badge
      variant={variant}
      className={cn(
        'rounded-md px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide',
        className,
      )}
    >
      {children}
    </Badge>
  );
};

const getStatusBadgeVariant = (
  status?: string,
): React.ComponentProps<typeof Badge>['variant'] => {
  if (status === ILogStatusType.FAILED) {
    return 'destructive';
  }

  if (status === ILogStatusType.SUCCESS) {
    return 'success';
  }

  return 'secondary';
};

export const LogDetailView = ({ logId }: { logId: string }) => {
  const { detail, error, loading } = useLogDetail(logId);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!detail) {
    return error?.message || 'Something went wrong';
  }

  const { _id, source, status, createdAt, user, payload } = detail;

  const Component =
    LogDetailComponents[source] || LogDetailComponents[ILogSourceType.WEBHOOK];
  const detailEmail = payload?.email || undefined;

  return (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center">
          <Spinner />
        </div>
      }
    >
      <div className="h-full overflow-auto bg-muted/10">
        <div className="mx-auto flex max-w-4xl flex-col gap-4 p-6">
          <section className="rounded-3xl border bg-background">
            <div className="flex flex-col gap-4 border-b px-6 py-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <h2 className="text-xl font-semibold text-foreground">
                  Log Details
                </h2>
                <p className="mt-1 truncate font-mono text-xs text-muted-foreground">
                  {_id || logId}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2 text-sm text-muted-foreground">
                <IconClockHour4 size={16} />
                <RelativeDateDisplay value={createdAt}>
                  <RelativeDateDisplay.Value value={createdAt} />
                </RelativeDateDisplay>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 px-6 py-4">
              <SummaryBadge>
                {formatLabel(generateOperationText(detail))}
              </SummaryBadge>
              <SummaryBadge variant={getStatusBadgeVariant(status)}>
                {formatLabel(status)}
              </SummaryBadge>
              <SummaryBadge variant="secondary">
                {formatLabel(source)}
              </SummaryBadge>
            </div>

            {(user || detailEmail) && (
              <div className="px-6 pb-6">
                <LogUserInfo user={user} email={detailEmail} variant="card" />
              </div>
            )}
          </section>

          <Component {...detail} />
        </div>
      </div>
    </Suspense>
  );
};
