import { Icon, IconProps } from '@tabler/icons-react';
import {
  Avatar,
  Button,
  readImage,
  RelativeDateDisplay,
  Skeleton,
} from 'erxes-ui';
import { Link } from 'react-router-dom';
import { IUser } from 'ui-modules/modules/team-members';
import { useAtomValue } from 'jotai';
import { currentUserState } from 'ui-modules/states/currentUserState';

const getUserDisplayName = (user?: IUser) =>
  user?.details?.fullName || user?.email || 'Unknown user';

const getUserInitial = (user?: IUser) => {
  const name = user?.details?.fullName || user?.email || '';
  return name.charAt(0).toUpperCase() || '?';
};

export const AssigneeNotificationContent = ({
  name = '',
  loading,
  action,
  fromUser,
  createdAt,
  contentType,
  Icon,
}: {
  name: string;
  contentType: string;
  createdAt: string;
  action: string;
  fromUser: IUser;
  Icon: React.ForwardRefExoticComponent<IconProps & React.RefAttributes<Icon>>;
  loading?: boolean;
}) => {
  const currentUser = useAtomValue(currentUserState);
  const isSelf = !!(currentUser?._id && fromUser?._id === currentUser._id);
  const displayName = isSelf ? 'You' : getUserDisplayName(fromUser);

  return (
    <div className="flex flex-col gap-3 h-screen justify-center w-full max-w-md mx-auto items-center text-muted-foreground">
      <div className="size-28 bg-sidebar rounded-2xl border-2 border-dashed flex items-center justify-center">
        <Icon size={64} className="text-accent-foreground" stroke={1} />
      </div>

      <div className="flex flex-col items-center gap-1 text-center">
        <span className="text-lg font-semibold text-foreground capitalize">
          {contentType}
        </span>

        <div className="flex items-center justify-center gap-2 text-sm flex-wrap mt-2">
          <Avatar className="size-6">
            <Avatar.Image
              src={readImage(
                (isSelf ? currentUser : fromUser)?.details?.avatar || '',
              )}
              alt={displayName}
            />
            <Avatar.Fallback className="text-xs">
              {getUserInitial(isSelf ? currentUser : fromUser)}
            </Avatar.Fallback>
          </Avatar>
          <span className="font-medium text-foreground">{displayName}</span>
          <span>
            {action} {isSelf ? 'yourself' : 'you'} on
          </span>
          {loading ? (
            <Skeleton className="w-16 h-4 inline-block" />
          ) : (
            <span className="font-semibold text-foreground">{name}</span>
          )}
        </div>

        {createdAt && (
          <span className="text-xs mt-1">
            <RelativeDateDisplay.Value value={createdAt} />
          </span>
        )}
      </div>

      {fromUser?._id && !isSelf && (
        <Button asChild variant="secondary" size="sm" className="mt-2">
          <Link to={`/settings/team/members?user_id=${fromUser._id}`}>
            View {displayName}
          </Link>
        </Button>
      )}
    </div>
  );
};
