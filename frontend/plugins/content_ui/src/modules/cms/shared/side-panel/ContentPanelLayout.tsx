import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { IconInfoCircle } from '@tabler/icons-react';
import { Empty, ScrollArea, Spinner } from 'erxes-ui';
import { ActivityLogs } from 'ui-modules';

const ContentPanelEmptyState = ({ error }: { error?: Error | null }) => {
  const { t } = useTranslation('common', { keyPrefix: 'side-panel' });

  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <Empty>
        <Empty.Header>
          <Empty.Media variant="icon">
            <IconInfoCircle />
          </Empty.Media>
          <Empty.Title>
            {error
              ? t('error', 'Unable to load record')
              : t('not-found-title', 'Nothing here')}
          </Empty.Title>
          <Empty.Description>
            {error?.message ||
              t('record-not-found', 'This record no longer exists.')}
          </Empty.Description>
        </Empty.Header>
      </Empty>
    </div>
  );
};

export const ContentPanelRecordState = ({
  loading,
  hasRecord,
  error,
  children,
}: {
  loading: boolean;
  hasRecord: boolean;
  error?: Error | null;
  children?: ReactNode;
}) => {
  if (loading && !hasRecord) {
    return <Spinner containerClassName="py-12" />;
  }

  if (!hasRecord) {
    return <ContentPanelEmptyState error={error} />;
  }

  return children ?? null;
};

export const ContentPanelActivity = ({ contentId }: { contentId: string }) => (
  <ScrollArea className="flex-1 min-h-0" viewportClassName="[&>div]:block!">
    <div className="pt-3 [&_.px-6]:px-2">
      <ActivityLogs targetId={contentId} showInternalNotes={false} />
    </div>
  </ScrollArea>
);
