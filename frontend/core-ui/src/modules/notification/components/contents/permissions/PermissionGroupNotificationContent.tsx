import { IconShieldLock } from '@tabler/icons-react';
import { Avatar, RelativeDateDisplay, readImage } from 'erxes-ui';
import { TNotification } from 'ui-modules';
import { useTranslation } from 'react-i18next';

export const PermissionGroupNotificationContent = ({
  title,
  message,
  fromUser,
  createdAt,
}: TNotification) => {
  const { t } = useTranslation('common', { keyPrefix: 'notification' });
  const actorName =
    fromUser?.details?.fullName || fromUser?.email || t('unknown-user');

  return (
    <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col px-6 py-8">
      <div className="flex flex-wrap items-start gap-4 border-b pb-6">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-accent text-muted-foreground">
          <IconShieldLock className="size-6" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {t('permission-group')}
          </p>
          <h2 className="mt-1 break-words text-2xl font-semibold text-foreground">
            {title}
          </h2>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            {fromUser && (
              <span className="flex items-center gap-1.5">
                <Avatar className="size-5">
                  <Avatar.Image
                    src={readImage(fromUser.details?.avatar || '')}
                    alt={actorName}
                  />
                  <Avatar.Fallback className="text-[10px]">
                    {actorName[0].toUpperCase()}
                  </Avatar.Fallback>
                </Avatar>
                {actorName}
              </span>
            )}
            {createdAt && <RelativeDateDisplay.Value value={createdAt} />}
          </div>
        </div>
      </div>
      <p className="py-6 text-sm text-foreground">{message}</p>
    </div>
  );
};
