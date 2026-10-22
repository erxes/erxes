import type { TNotification } from 'ui-modules';
import { Avatar, cn, ErxesLogoIcon, readImage } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

interface NotificationAvatarProps {
  fromUser: TNotification['fromUser'];
  isRead: boolean;
  count?: number;
}

export const NotificationAvatar = ({
  fromUser,
  isRead,
  count = 1,
}: NotificationAvatarProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'notification' });
  const sender =
    fromUser?.details?.fullName || fromUser?.email || t('system', 'System');

  return (
    <div className="relative flex size-8 flex-none items-center justify-center rounded-full bg-foreground/5">
      {fromUser ? (
        <Avatar size="xl" className={cn(isRead && 'opacity-60 grayscale')}>
          <Avatar.Image
            src={readImage(fromUser.details?.avatar || '')}
            alt={sender}
          />
          <Avatar.Fallback>{sender.charAt(0).toUpperCase()}</Avatar.Fallback>
        </Avatar>
      ) : (
        <ErxesLogoIcon
          className={cn(
            'size-5',
            isRead ? 'text-muted-foreground' : 'text-primary',
          )}
        />
      )}
      {!isRead && (
        <span
          className={cn(
            'absolute -right-0.5 -top-0.5 flex items-center justify-center rounded-full bg-destructive text-[10px] font-semibold leading-none text-white',
            fromUser ? 'h-4 min-w-4 px-1' : 'size-2.5',
          )}
        >
          {fromUser ? count : null}
        </span>
      )}
    </div>
  );
};
