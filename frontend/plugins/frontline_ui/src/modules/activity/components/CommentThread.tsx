import { IActivity, INote } from '@/activity/types';
import { ActivityTimelineItem } from '@/activity/components/ActivityTimelineItem';
import { IconMessage2 } from '@tabler/icons-react';
import { BlockEditorReadOnly } from 'erxes-ui';
import { MembersInline } from 'ui-modules';
import { useTranslation } from 'react-i18next';

const CommentAuthorName = ({ comment }: { comment: INote }) => {
  const { t } = useTranslation('frontline');
  const { clientPortalAuthor, createdBy } = comment;

  if (clientPortalAuthor) {
    const fullName =
      clientPortalAuthor.fullName ||
      clientPortalAuthor.email ||
      t('unknown', 'Unknown');

    return (
      <>
        <span className="font-semibold">{fullName}</span>
        <span className="text-xs text-muted-foreground leading-6">
          {t('requester', 'Requester')}
        </span>
      </>
    );
  }

  return (
    <MembersInline.Provider memberIds={createdBy ? [createdBy] : []}>
      <MembersInline.Title className="font-semibold" />
    </MembersInline.Provider>
  );
};

export const CommentActivityItem = ({
  activity,
  comment,
}: {
  activity: IActivity;
  comment: INote;
}) => {
  const { t } = useTranslation('frontline');

  return (
    <div className="flex flex-col gap-1">
      <ActivityTimelineItem
        avatar={<IconMessage2 className="size-4 text-accent-foreground" />}
        createdAt={activity.createdAt?.toLocaleString()}
        id={activity._id}
      >
        <CommentAuthorName comment={comment} />
        <div className="lowercase">{t('activity-comment', 'commented')}</div>
      </ActivityTimelineItem>
      <div className="ml-4">
        <BlockEditorReadOnly content={comment.content} className="read-only" />
      </div>
    </div>
  );
};
