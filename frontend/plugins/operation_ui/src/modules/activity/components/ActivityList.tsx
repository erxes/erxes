import { Button, cn, ScrollArea, Spinner, useToast } from 'erxes-ui';
import { useLayoutEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useActivities } from '@/activity/hooks/useActivities';
import { ITaskDetail } from '@/task/types';
import { IProject } from '@/project/types';
import { ActivityListProvider } from '@/activity/context/ActivityListContext';
import { ACTIVITY_MODULES } from '@/activity/constants';
import { NoteInputReadOnly } from '@/activity/components/NoteInputReadOnly';
import { NoteInput } from '@/activity/components/NoteInput';
import { CreatorInfo } from '@/activity/components/CreatorInfo';
import { ActivityItemWrapper } from '@/activity/components/ActivityItemWrapper';
import { ITriageDetail } from '@/triage/types/triage';

export const ActivityList = ({
  contentId,
  contentDetail,
  inPanel = false,
}: {
  contentId: string;
  inPanel?: boolean;
  contentDetail: ITaskDetail | IProject | ITriageDetail;
}) => {
  const { activities, loading, error, refetch, pageInfo, loadOlder } =
    useActivities(contentId);
  const { t } = useTranslation('operation');
  const { toast } = useToast();
  const viewportRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const followLatest = useRef(true);
  const restoreScroll = useRef<{ height: number; top: number }>();

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const previous = restoreScroll.current;
    if (loading || !viewport || !previous) return;
    viewport.scrollTop = previous.top + viewport.scrollHeight - previous.height;
    restoreScroll.current = undefined;
  }, [activities.length, loading]);

  useLayoutEffect(() => {
    if (!inPanel) return;
    followLatest.current = true;
    restoreScroll.current = undefined;
    const viewport = viewportRef.current;
    const timeline = timelineRef.current;
    if (!viewport || !timeline) return;
    const scrollToLatest = () => {
      if (followLatest.current) viewport.scrollTop = viewport.scrollHeight;
    };
    scrollToLatest();
    const observer = new ResizeObserver(scrollToLatest);
    observer.observe(timeline);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [inPanel, contentId]);

  const handleLoadOlder = async () => {
    const viewport = viewportRef.current;
    if (viewport)
      restoreScroll.current = {
        height: viewport.scrollHeight,
        top: viewport.scrollTop,
      };
    followLatest.current = false;
    try {
      await loadOlder();
    } catch (error) {
      restoreScroll.current = undefined;
      toast({
        title: t('error'),
        description:
          error instanceof Error
            ? error.message
            : t('failed-to-load-activity', 'Failed to load activity'),
        variant: 'destructive',
      });
    }
  };

  const timeline = (
    <div ref={timelineRef} className="mx-auto w-full min-w-0 max-w-3xl p-4">
      {loading && !activities.length ? (
        <Spinner containerClassName="py-8" />
      ) : error && !activities.length ? (
        <div className="flex flex-col items-center gap-2 py-8 text-sm text-muted-foreground">
          {t('failed-to-load-activity', 'Failed to load activity')}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              void refetch().catch(() => undefined);
            }}
          >
            {t('retry', 'Retry')}
          </Button>
        </div>
      ) : (
        <ActivityListProvider contentDetail={contentDetail}>
          {pageInfo?.hasPreviousPage && (
            <Button
              variant="ghost"
              size="sm"
              className="mb-4 w-full"
              disabled={loading}
              onClick={handleLoadOlder}
            >
              {loading ? (
                <Spinner />
              ) : (
                t('load-older-activity', 'Load older activity')
              )}
            </Button>
          )}
          <div className="relative ml-2.5 flex min-w-0 flex-col gap-5 before:absolute before:bottom-1 before:left-0 before:top-1 before:w-px before:-translate-x-1/2 before:bg-border">
            {!pageInfo?.hasPreviousPage && (
              <CreatorInfo contentDetail={contentDetail} />
            )}
            {activities.map((activity) =>
              activity.module === ACTIVITY_MODULES.TEAM ? null : (
                <div className="flex min-w-0 flex-col gap-2" key={activity._id}>
                  <ActivityItemWrapper activity={activity} />
                  {activity.module === ACTIVITY_MODULES.NOTE && (
                    <NoteInputReadOnly
                      newValueId={activity.metadata?.newValue}
                    />
                  )}
                </div>
              ),
            )}
          </div>
        </ActivityListProvider>
      )}
    </div>
  );

  return (
    <div
      className={cn(
        'flex min-w-0 flex-col',
        inPanel ? 'min-h-0 flex-1 overflow-hidden' : 'gap-3',
      )}
    >
      {inPanel ? (
        <ScrollArea.Root className="min-h-0 flex-1">
          <ScrollArea.Viewport
            ref={viewportRef}
            className="[&>div]:block!"
            onScroll={(event) => {
              const viewport = event.currentTarget;
              followLatest.current =
                viewport.scrollHeight -
                  viewport.scrollTop -
                  viewport.clientHeight <
                64;
            }}
          >
            {timeline}
          </ScrollArea.Viewport>
          <ScrollArea.Bar />
        </ScrollArea.Root>
      ) : (
        timeline
      )}
      <div
        className={cn(
          'shrink-0 bg-background',
          inPanel ? 'border-t p-3' : 'sticky bottom-0 z-10 py-3',
        )}
      >
        <div className="mx-auto w-full max-w-3xl">
          <NoteInput
            key={contentId}
            contentId={contentId}
            onSent={() => {
              followLatest.current = true;
              const viewport = viewportRef.current;
              if (viewport) viewport.scrollTop = viewport.scrollHeight;
            }}
          />
        </div>
      </div>
    </div>
  );
};
