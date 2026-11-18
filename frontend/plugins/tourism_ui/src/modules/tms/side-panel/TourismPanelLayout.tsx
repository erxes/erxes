import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { IconInfoCircle, type Icon } from '@tabler/icons-react';
import { Empty, ScrollArea, Spinner } from 'erxes-ui';
import { ActivityLogs } from 'ui-modules';

export const TourismPanelEmpty = ({
  icon: EmptyIcon,
  title,
  description,
}: {
  icon: Icon;
  title: ReactNode;
  description?: ReactNode;
}) => (
  <div className="flex justify-center px-6 py-12">
    <Empty>
      <Empty.Header>
        <Empty.Media variant="icon">
          <EmptyIcon />
        </Empty.Media>
        <Empty.Title>{title}</Empty.Title>
        {description && <Empty.Description>{description}</Empty.Description>}
      </Empty.Header>
    </Empty>
  </div>
);

export const TourismPanelLoading = () => <Spinner containerClassName="py-12" />;

const TourismPanelEmptyState = ({ error }: { error?: Error | null }) => {
  const { t } = useTranslation('common', { keyPrefix: 'side-panel' });

  return (
    <TourismPanelEmpty
      icon={IconInfoCircle}
      title={
        error
          ? t('error', 'Unable to load record')
          : t('not-found-title', 'Nothing here')
      }
      description={
        error?.message || t('record-not-found', 'This record no longer exists.')
      }
    />
  );
};

export const TourismPanelRecordState = ({
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
    return <TourismPanelLoading />;
  }

  if (!hasRecord) {
    return <TourismPanelEmptyState error={error} />;
  }

  return children ?? null;
};

export const TourismPanelActivity = ({ contentId }: { contentId: string }) => (
  <ScrollArea className="flex-1 min-h-0" viewportClassName="[&>div]:block!">
    <div className="pt-3 [&_.px-6]:px-2">
      <ActivityLogs targetId={contentId} showInternalNotes={false} />
    </div>
  </ScrollArea>
);
