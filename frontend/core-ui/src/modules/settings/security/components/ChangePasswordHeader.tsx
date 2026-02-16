import React from 'react';
import { IconInfoCircle, IconKey } from '@tabler/icons-react';
import { Breadcrumb, Button, Tooltip } from 'erxes-ui';
import { Link } from 'react-router';
import { PageHeader, PageHeaderStart } from 'ui-modules';
import { SettingsPath } from '@/types/paths/SettingsPath';
import { useTranslation } from 'react-i18next';

export const ChangePasswordHeader = () => {
  const { t } = useTranslation('settings', {
    keyPrefix: 'change-password',
  });
  const guideUrl =
    'https://erxes.io/guides/68ef769c1a9ddbd30aec6c35/6992b5205cac46b2ff76c037';
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
              <Tooltip>
                <Tooltip.Trigger asChild>
                  <Link to={guideUrl} target="_blank">
                    <IconInfoCircle className="size-4 text-accent-foreground" />
                  </Link>
                </Tooltip.Trigger>
                <Tooltip.Content>
                  <p>Update your login password for security</p>
                </Tooltip.Content>
              </Tooltip>
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Breadcrumb>
      </PageHeaderStart>
    </PageHeader>
  );
};
