import { IconExternalLink, IconLifebuoy } from '@tabler/icons-react';
import { Button, RelativeDateDisplay } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { TNotification } from 'ui-modules';
import { SUPPORT_ACCESS_PATH } from '@/settings/support-access/utils';

/** A support request or visit; the message already names the staff member and the reason. */
export const SupportAccessNotificationContent = ({
  title,
  message,
  createdAt,
}: TNotification) => {
  const { t } = useTranslation('settings', { keyPrefix: 'support-access' });

  return (
    <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col gap-6 px-6 py-8">
      <div className="flex items-start gap-4 border-b pb-6">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-accent text-muted-foreground">
          <IconLifebuoy className="size-6" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="text-sm">{message}</p>
          {createdAt && (
            <span className="text-sm text-muted-foreground">
              <RelativeDateDisplay value={createdAt}>
                <RelativeDateDisplay.Value value={createdAt} />
              </RelativeDateDisplay>
            </span>
          )}
        </div>
      </div>
      <Button asChild className="self-start">
        <Link to={SUPPORT_ACCESS_PATH}>
          <IconExternalLink /> {t('open')}
        </Link>
      </Button>
    </div>
  );
};
