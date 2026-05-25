import { useGetProject } from '@/project/hooks/useGetProject';
import { IconClipboard } from '@tabler/icons-react';
import { format, isToday, isYesterday, parseISO } from 'date-fns';
import { Avatar, Button, readImage, Skeleton } from 'erxes-ui';
import { Link } from 'react-router';

const formatDate = (isoDate: string) => {
  const date = parseISO(isoDate);
  if (isToday(date)) return `Today, ${format(date, 'HH:mm')}`;
  if (isYesterday(date)) return `Yesterday, ${format(date, 'HH:mm')}`;
  return format(date, 'yyyy-MM-dd HH:mm');
};

export const NotificationProjectAssignment = ({
  contentTypeId,
  title,
  fromUser,
  fromUserId,
  createdAt,
}: any) => {
  const { project, loading } = useGetProject({
    variables: { _id: contentTypeId },
    skip: !contentTypeId,
  });

  const isAssigned = title === 'Project Assigned';
  const action = isAssigned ? 'assigned you to' : 'changed status on';

  return (
    <div className="flex flex-col gap-4 w-full max-w-md mx-auto justify-center items-center h-full text-muted-foreground">
      <div className="size-36 bg-sidebar rounded-2xl border-2 border-dashed flex flex-col items-center justify-center">
        <IconClipboard size={64} className="text-accent-foreground" stroke={1} />
      </div>

      <p className="font-bold text-lg">Project</p>

      <div className="flex flex-col items-center gap-2 text-center">
        <div className="flex items-center gap-2">
          <Avatar className="size-6">
            <Avatar.Image
              src={readImage(fromUser?.details?.avatar || '')}
              alt={fromUser?.details?.fullName || ''}
            />
            <Avatar.Fallback className="rounded-lg">
              {fromUser?.details?.fullName?.[0]}
            </Avatar.Fallback>
          </Avatar>
          <span className="font-semibold text-foreground">
            {fromUser?.details?.fullName || fromUser?.email}
          </span>
        </div>

        <p className="text-foreground">
          {action}{' '}
          {loading ? (
            <Skeleton className="inline-block w-24 h-4 align-middle" />
          ) : (
            <span className="font-bold text-foreground">
              {project?.name || 'a project'}
            </span>
          )}
        </p>
      </div>

      {createdAt && (
        <p className="text-accent-foreground text-sm">{formatDate(createdAt)}</p>
      )}

      <Button variant="secondary" asChild>
        <Link to={`/settings/team-member?user_id=${fromUserId}`}>
          View {fromUser?.details?.fullName || fromUser?.email}
        </Link>
      </Button>
    </div>
  );
};
