import type { NotificationSenderAvatarProps } from '@/notification/types/myInbox';
import { Avatar, readImage, Tooltip } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const NotificationSenderAvatar = ({
  fromUser,
}: NotificationSenderAvatarProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'notification' });
  const sender =
    fromUser?.details?.fullName || fromUser?.email || t('system', 'System');

  return (
    <Tooltip.Provider>
      <Tooltip delayDuration={200}>
        <Tooltip.Trigger asChild>
          <Avatar className="size-5" aria-label={sender}>
            <Avatar.Image
              src={readImage(fromUser?.details?.avatar || '')}
              alt={sender}
            />
            <Avatar.Fallback className="text-[10px]">
              {sender[0].toUpperCase()}
            </Avatar.Fallback>
          </Avatar>
        </Tooltip.Trigger>
        <Tooltip.Content>{sender}</Tooltip.Content>
      </Tooltip>
    </Tooltip.Provider>
  );
};
