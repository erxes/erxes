import { useMemo, useState } from 'react';
import { ITicket } from '@/ticket/types';
import { ActivityListProvider } from '@/activity/context/ActivityListContext';
import { ACTIVITY_MODULES } from '@/activity/constants';
import { NoteInputReadOnly } from '@/activity/components/NoteInputReadOnly';
import { NoteInput } from '@/activity/components/NoteInput';
import { CommentInput } from '@/activity/components/CommentInput';
import { CommentActivityItem } from '@/activity/components/CommentThread';
import { CreatorInfo } from '@/activity/components/CreatorInfo';
import { ActivityItemWrapper } from '@/activity/components/ActivityItemWrapper';
import { useActivities } from '@/activity/hooks/useActivities';
import { useTicketComments } from '@/activity/hooks/useTicketComments';
import { IActivity } from '@/activity/types';
import { Badge, Spinner, Tabs } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

const ACTIVITY_TABS = {
  NOTE: 'note',
  COMMENTS: 'comments',
} as const;

type TActivityTab = (typeof ACTIVITY_TABS)[keyof typeof ACTIVITY_TABS];

export const ActivityList = ({
  contentId,
  contentDetail,
}: {
  contentId: string;
  contentDetail: ITicket;
}) => {
  const { t } = useTranslation('frontline');
  const [tab, setTab] = useState<TActivityTab>(ACTIVITY_TABS.NOTE);
  const { activities, loading } = useActivities(contentId);

  // Comments live in the timeline next to notes so the ticket reads as one
  // chronological stream. Their body and client-portal author come from the
  // thread query, because the activity record carries only the note's id.
  const timelineActivities: IActivity[] = activities ?? [];

  // The newest COMMENT activity is the signal that the thread moved; passing it
  // as the sync token reuses the existing activity subscription instead of
  // opening a second one. The count drives the Comments tab badge.
  const { latestCommentActivityId, commentCount } = useMemo(() => {
    const commentActivities = (activities ?? []).filter(
      (activity) => activity.module === ACTIVITY_MODULES.COMMENT,
    );

    return {
      latestCommentActivityId:
        commentActivities[commentActivities.length - 1]?._id,
      commentCount: commentActivities.length,
    };
  }, [activities]);

  const { comments } = useTicketComments({
    contentId,
    syncToken: latestCommentActivityId,
  });

  const commentsById = useMemo(
    () => new Map(comments.map((comment) => [comment._id, comment])),
    [comments],
  );

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="flex flex-col mb-12 gap-4">
      <ActivityListProvider contentDetail={contentDetail}>
        <div className="ml-2.5 relative before:absolute before:left-0 before:top-1 before:bottom-1 before:w-px before:bg-muted before:-translate-x-1/2  flex flex-col gap-6">
          <CreatorInfo contentDetail={contentDetail} />
          {timelineActivities.map((activity) => {
            if (activity.module === ACTIVITY_MODULES.COMMENT) {
              const comment = commentsById.get(activity.metadata?.newValue);

              return comment ? (
                <CommentActivityItem
                  key={activity._id}
                  activity={activity}
                  comment={comment}
                />
              ) : null;
            }

            return (
              <div className="flex flex-col gap-2" key={activity._id}>
                <ActivityItemWrapper activity={activity} />
                {activity.module === ACTIVITY_MODULES.NOTE && (
                  <NoteInputReadOnly newValueId={activity.metadata?.newValue} />
                )}
              </div>
            );
          })}
        </div>
      </ActivityListProvider>

      <Tabs
        value={tab}
        onValueChange={(value) => setTab(value as TActivityTab)}
        className="ml-2.5 mb-6 flex flex-col gap-4"
      >
        <Tabs.List>
          <Tabs.Trigger value={ACTIVITY_TABS.NOTE}>
            {t('note', 'Note')}
          </Tabs.Trigger>
          <Tabs.Trigger value={ACTIVITY_TABS.COMMENTS} className="gap-2">
            {t('comments', 'Comments')}
            {commentCount > 0 && (
              <Badge variant="secondary">{commentCount}</Badge>
            )}
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value={ACTIVITY_TABS.NOTE}>
          <NoteInput contentId={contentId} />
        </Tabs.Content>

        <Tabs.Content value={ACTIVITY_TABS.COMMENTS}>
          <CommentInput contentId={contentId} />
        </Tabs.Content>
      </Tabs>
    </div>
  );
};
