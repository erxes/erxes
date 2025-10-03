import { useLogDetail } from '@/logs/hooks/useLogDetail';
import React, { lazy, Suspense } from 'react';
import ReactJson from 'react-json-view';
import { ILogDoc, ILogSourceType, ILogStatusType } from '../types';
import { Badge, RelativeDateDisplay } from 'erxes-ui';
import { LogUserInfo } from '@/logs/components/LogUser';

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
  [ILogSourceType.mongo]: MongoContent,
  [ILogSourceType.graphql]: GraphqlContent,
  [ILogSourceType.auth]: AuthContent,
  [ILogSourceType.webhook]: ({ payload }: ILogDoc) => (
    <ReactJson src={payload} collapsed={1} />
  ),
};

const generateOperationText = ({ source, action, payload }: ILogDoc) => {
  const operationTextMap = {
    [ILogSourceType.mongo]: action,
    [ILogSourceType.graphql]: payload?.mutationName,
    [ILogSourceType.auth]: action,
    [ILogSourceType.webhook]: action,
  };

  return operationTextMap[source] || '-';
};

export const LogDetailView = ({ logId }: { logId: string }) => {
  const { detail, error } = useLogDetail(logId);

  if (!detail) {
    return error?.message || 'Something went wrong';
  }

  const { source, status, createdAt, user } = detail;

  const Component = LogDetailComponents[source];

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="flex flex-row gap-6 h-full w-full">
        <div className="flex flex-col gap-2 w-1/4 border-r-2 p-4">
          <h4 className="text-lg font-semibold text-foreground leading-none">
            Operation Summary
          </h4>
          <LogDetailSideBarItem title="Operation">
            <Badge className="uppercase">{generateOperationText(detail)}</Badge>
          </LogDetailSideBarItem>
          <LogDetailSideBarItem title="Status">
            <Badge
              variant={
                status === ILogStatusType.failed ? 'destructive' : 'success'
              }
              className="uppercase"
            >
              {status}
            </Badge>
          </LogDetailSideBarItem>
          <LogDetailSideBarItem title="Timestamp">
            <RelativeDateDisplay value={createdAt}>
              <RelativeDateDisplay.Value value={createdAt} />
            </RelativeDateDisplay>
          </LogDetailSideBarItem>
          <LogDetailSideBarItem title="Source">
            <Badge variant="secondary" className="uppercase">
              {source}
            </Badge>
          </LogDetailSideBarItem>

          {user && (
            <LogDetailSideBarItem title="User">
              <LogUserInfo user={user} />
            </LogDetailSideBarItem>
          )}
        </div>
        <div className="flex-1 flex flex-col min-h-0">
          <Component {...detail} />
        </div>
      </div>
    </Suspense>
  );
};

const LogDetailSideBarItem = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<'div'> & {
    title: string;
  }
>(({ children, title, ...props }, ref) => {
  return (
    <div ref={ref} {...props}>
      <span className="text-sm font-medium text-accent-foreground block mb-2">
        {title}
      </span>
      {children}
    </div>
  );
});
