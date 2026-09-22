import { IconExternalLink, IconInfoCircle } from '@tabler/icons-react';
import { format, isToday, isYesterday, parseISO } from 'date-fns';
import { Avatar, Button, Empty, readImage, Skeleton } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { ReactNode } from 'react';
import { TNotification } from 'ui-modules';

export const formatAssignmentDate = (isoDate: string) => {
  const date = parseISO(isoDate);
  if (isToday(date)) return `Today, ${format(date, 'HH:mm')}`;
  if (isYesterday(date)) return `Yesterday, ${format(date, 'HH:mm')}`;
  return format(date, 'yyyy-MM-dd HH:mm');
};

export const AssignmentUnavailable = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => (
  <div className="flex min-h-dvh items-center justify-center p-6">
    <Empty>
      <Empty.Header>
        <Empty.Media variant="icon">
          <IconInfoCircle />
        </Empty.Media>
        <Empty.Title>{title}</Empty.Title>
        <Empty.Description>{description}</Empty.Description>
      </Empty.Header>
    </Empty>
  </div>
);

const AssignmentActor = ({ fromUser }: Pick<TNotification, 'fromUser'>) => (
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
);

export const AssignmentNotificationLayout = ({
  icon,
  kindLabel,
  action,
  entityName,
  loading,
  createdAt,
  openTo,
  openLabel,
  fromUser,
  fromUserId,
}: Pick<TNotification, 'createdAt' | 'fromUser' | 'fromUserId'> & {
  icon: ReactNode;
  kindLabel: string;
  action: string;
  entityName?: ReactNode;
  loading: boolean;
  openTo?: string;
  openLabel?: string;
}) => {
  const { t } = useTranslation('operation');

  return (
    <div className="flex flex-col gap-4 w-full max-w-md mx-auto justify-center items-center h-full text-muted-foreground">
      <div className="size-36 bg-sidebar rounded-2xl border-2 border-dashed flex flex-col items-center justify-center">
        {icon}
      </div>

      <p className="font-bold text-lg">{kindLabel}</p>

      <div className="flex flex-col items-center gap-2 text-center">
        <AssignmentActor fromUser={fromUser} />

        <p className="text-foreground">
          {action}{' '}
          {loading ? (
            <Skeleton className="inline-block w-24 h-4 align-middle" />
          ) : (
            <span className="font-bold text-foreground">{entityName}</span>
          )}
        </p>
      </div>

      {createdAt && (
        <p className="text-accent-foreground text-sm">
          {formatAssignmentDate(createdAt)}
        </p>
      )}

      <div className="flex flex-wrap justify-center gap-2">
        {openTo && openLabel && (
          <Button variant="secondary" asChild>
            <Link to={openTo}>
              <IconExternalLink className="size-4" />
              {openLabel}
            </Link>
          </Button>
        )}
        {fromUserId && (
          <Button variant="secondary" asChild>
            <Link to={`/settings/team/members?user_id=${fromUserId}`}>
              {t('view')} {fromUser?.details?.fullName || fromUser?.email}
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
};
