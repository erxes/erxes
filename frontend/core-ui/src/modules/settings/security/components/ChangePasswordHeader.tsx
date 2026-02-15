import React from 'react';
import { IconInfoCircle, IconKey } from '@tabler/icons-react';
import { Breadcrumb, Button } from 'erxes-ui';
import { Link } from 'react-router';
import { PageHeader, PageHeaderStart } from 'ui-modules';
import { SettingsPath } from '@/types/paths/SettingsPath';
import { useTranslation } from 'react-i18next';

export const ChangePasswordHeader = () => {
  const { t } = useTranslation('settings', {
    keyPrefix: 'change-password',
  });

  return (
    <PageHeader>
      <PageHeaderStart>
        <Breadcrumb>
          <Breadcrumb.List className="gap-1">
            <Breadcrumb.Item>
              <Button variant="ghost" asChild>
                <Link to={SettingsPath.ChangePassword} aria-current="page">
                  <IconKey />
                  {t('_')}
                </Link>
              </Button>
              <IconInfoCircle className="size-4 text-accent-foreground" />
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Breadcrumb>
      </PageHeaderStart>
    </PageHeader>
  );
};
