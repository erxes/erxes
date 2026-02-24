import { IconMail, IconNotification } from '@tabler/icons-react';
import { Breadcrumb, Button, useIsMatchingLocation } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const NotificationBreadcrumb = () => {
  const { t } = useTranslation('settings');

  const isMatchingLocation = useIsMatchingLocation();

  return (
    <Breadcrumb>
      <Breadcrumb.List className="gap-1">
        <Breadcrumb.Item>
          <Button variant="ghost" asChild>
            <Link to={'/settings/notification'}>
              <IconNotification />
              {t('Notifications')}
            </Link>
          </Button>
        </Breadcrumb.Item>

        {isMatchingLocation('/settings/notification/email') && (
          <>
            <Breadcrumb.Separator />
            <Button variant="ghost" asChild>
              <Link to={'/settings/notification/email'}>
                <IconMail />
                {t('Email')}
              </Link>
            </Button>
          </>
        )}
      </Breadcrumb.List>
    </Breadcrumb>
  );
};

export default NotificationBreadcrumb;