import { IconChalkboard } from '@tabler/icons-react';
import { format, isToday, isYesterday, parseISO } from 'date-fns';
import { Avatar, Button, readImage, Skeleton, Spinner } from 'erxes-ui';
import { Link } from 'react-router';
import { useChannel } from '~/widgets/notifications/my-inbox/hooks/useChannel';

const getDate = (isoDate: string) => {
  const date = parseISO(isoDate);

  let display = '';

  if (isToday(date)) {
    display = `Today, ${format(date, 'HH:mm')}`;
  } else if (isYesterday(date)) {
    display = `Yesterday, ${format(date, 'HH:mm')}`;
  } else {
    display = format(date, 'yyyy-MM-dd HH:mm');
  }
  return display;
};

const type: any = {
  'Removed from Channel': 'removed',
  'Added on Channel': 'assigned',
};

export const NotificationChannelContent = ({
  title,
  fromUser,
  createdAt,
  contentTypeId,
  fromUserId,
}: any) => {
  const { channelDetail, loading } = useChannel(contentTypeId);
  const date = getDate(createdAt);

  const action = type[title as string];
  return (
    <div className="flex flex-col gap-2 w-full max-w-md mx-auto justify-center items-center h-full text-muted-foreground">
      <div className="size-36 bg-sidebar rounded-2xl border-2 border-dashed flex flex-col items-center justify-center">
        <IconChalkboard
          size={64}
          className="text-accent-foreground"
          stroke={1}
        />
      </div>

      <p className="font-bold text-lg font-stretch-extra-expanded">Channel</p>

      <div className="flex flex-row items-center gap-2">
        <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm text-foreground">
          <Avatar className="size-6">
            <Avatar.Image
              src={readImage(fromUser?.details?.avatar || '')}
              alt={fromUser?.details?.fullName || ''}
            />
            <Avatar.Fallback className="rounded-lg">
              {fromUser?.details?.fullName?.split('')[0]}
            </Avatar.Fallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">
              {fromUser?.details?.fullName || fromUser.email}
            </span>
          </div>
        </div>
        <p className="text-foreground">
          {`${action} you on `}
          {loading ? (
            <Skeleton className="w-8 h-2" />
          ) : (
            <span className="font-bold">{channelDetail?.name}</span>
          )}
        </p>
        <p>channel</p>
      </div>
      <p className="text-accent-foreground">{date}</p>
      <Button variant={'secondary'}>
        <Link to={`/settings/team-member?user_id=${fromUserId}`}>
          {`View ${fromUser?.details?.fullName || fromUser.email}`}
        </Link>
      </Button>
    </div>
  );
};
