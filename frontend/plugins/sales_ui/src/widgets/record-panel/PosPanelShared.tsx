import { Empty, ScrollArea, Spinner, cn } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { ActivityLogs } from 'ui-modules';

export const PosPanelText = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={cn('flex h-7 min-w-0 items-center px-2 text-xs', className)}>
    <span className="truncate">{children ?? '-'}</span>
  </div>
);

export const PosPanelDetailLayout = ({
  loading,
  hasRecord,
  error,
  emptyMessage,
  children,
}: {
  loading: boolean;
  hasRecord: boolean;
  error?: Error;
  emptyMessage: string;
  children: React.ReactNode;
}) => {
  const { t } = useTranslation('sales');

  if (loading && !hasRecord) {
    return <Spinner containerClassName="py-12" />;
  }

  if (!hasRecord) {
    return (
      <Empty className="py-12">
        <Empty.Header>
          <Empty.Title>{error ? t('error') : emptyMessage}</Empty.Title>
          {error && <Empty.Description>{error.message}</Empty.Description>}
        </Empty.Header>
      </Empty>
    );
  }

  return (
    <ScrollArea className="flex-1 min-h-0" viewportClassName="[&>div]:block!">
      <div className="grid gap-5 p-3 @3xl/record-panel:grid-cols-[minmax(18rem,22rem)_minmax(0,1fr)] @3xl/record-panel:p-6">
        {children}
      </div>
    </ScrollArea>
  );
};

export const PosPanelActivity = ({ contentId }: { contentId: string }) => (
  <ScrollArea className="flex-1 min-h-0" viewportClassName="[&>div]:block!">
    <div className="pt-3 [&_.px-6]:px-2">
      <ActivityLogs targetId={contentId} showInternalNotes={false} />
    </div>
  </ScrollArea>
);

export const PosPanelFields = ({ children }: { children: React.ReactNode }) => (
  <div className="flex min-w-0 flex-col gap-1">{children}</div>
);

export const PosPanelAside = ({ children }: { children: React.ReactNode }) => (
  <div className="min-w-0 @3xl/record-panel:border-l @3xl/record-panel:pl-6">
    <div className="flex max-w-3xl flex-col gap-3">{children}</div>
  </div>
);
