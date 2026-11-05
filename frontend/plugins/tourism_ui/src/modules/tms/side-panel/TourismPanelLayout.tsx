import { ReactNode } from 'react';
import { ScrollArea, Spinner } from 'erxes-ui';
import { ActivityLogs } from 'ui-modules';

export const TourismPanelRecordState = ({
  loading,
  hasRecord,
  children,
}: {
  loading: boolean;
  hasRecord: boolean;
  children?: ReactNode;
}) => {
  if (loading && !hasRecord) {
    return <Spinner containerClassName="py-12" />;
  }

  if (!hasRecord) {
    return null;
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
