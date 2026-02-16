import { IconChevronRight } from '@tabler/icons-react';
import { ScrollArea } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { NOTIFICATION_CHANNELS } from '../../constants';

export const NotificationSettingsMenu = () => {
  const { t } = useTranslation('settings', {
    keyPrefix: 'notification',
  });

  return (
    <div className="flex flex-auto overflow-hidden">
      <ScrollArea className="flex-auto">
        <div className="m-4">
          <div className="max-w-lg mx-auto flex flex-col gap-8">
            <h1 className="text-xl text-foreground">{t('_')}</h1>

            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-foreground capitalize">
                    {t('channels')}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {t('channel-description')}
                </p>
              </div>

              <div className="rounded-md border divide-y overflow-hidden">
                {Object.entries(NOTIFICATION_CHANNELS).map(
                  ([channel, { label, available, icon: Icon }]) => {
                    if (!available) {
                      return (
                        <div
                          key={channel}
                          className="flex items-center justify-between px-4 py-3 hover:bg-accent transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                          <div className="min-w-0 flex-1 flex gap-3 items-center">
                            <Icon className="text-muted-foreground" />

                            <div className="flex flex-col gap-2">
                              <span className="font-semibold text-muted-foreground capitalize">
                                {label}
                              </span>
                              <p className="text-sm text-muted-foreground">
                                Coming soon...
                              </p>
                            </div>
                          </div>

                          <IconChevronRight className="text-muted-foreground" />
                        </div>
                      );
                    }

                    return (
                      <Link
                        key={channel}
                        to={`/settings/notification/${channel}`}
                        className="flex items-center justify-between px-4 py-3 hover:bg-accent transition-colors focus:outline-none"
                      >
                        <div className="min-w-0 flex-1 flex gap-3 items-center">
                          <Icon />

                          <div className="flex flex-col gap-2">
                            <span className="font-semibold text-foreground capitalize">
                              {label}
                            </span>
                            <p className="text-sm text-muted-foreground">
                              Notifications will always go to your Linear inbox.
                            </p>
                          </div>
                        </div>

                        <IconChevronRight />
                      </Link>
                    );
                  },
                )}
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};
