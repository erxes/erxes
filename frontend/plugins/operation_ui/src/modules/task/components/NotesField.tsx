import { NoteInputReadOnly } from '@/task/components/NoteInputReadOnly';
import { NoteInput } from '@/activity/components/NoteInput';
import { useActivities } from '@/activity/hooks/useActivities';

export const NotesField = ({ contentId }: { contentId: string }) => {
  const { activities } = useActivities(contentId);
  return (
    <div className="flex flex-col gap-4 mb-14">
      {activities &&
        activities
          ?.filter((activity) => activity.module === 'NOTE')
          .map((activity) => (
            <NoteInputReadOnly
              key={activity._id}
              newValueId={activity.metadata?.newValue}
              authorId={activity.createdBy}
              createdAt={activity.createdAt?.toLocaleString()}
            />
          ))}
      <NoteInput contentId={contentId} />
    </div>
  );
};
