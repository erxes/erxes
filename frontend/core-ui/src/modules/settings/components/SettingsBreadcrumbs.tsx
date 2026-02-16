import { Link, useLocation } from 'react-router';
import { Breadcrumb, Button, Tooltip } from 'erxes-ui';
import { IconInfoCircle } from '@tabler/icons-react';
import { GET_SETTINGS_PATH_DATA } from '../constants/data';
import { PageHeader, PageHeaderStart, useVersion } from 'ui-modules';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';

export function SettingsBreadcrumbs() {
  const { pathname } = useLocation();
  const { t } = useTranslation('common', {
    keyPrefix: 'sidebar',
  });
  const version = useVersion();
  const currentPath = useMemo(() => {
    const settingsData = GET_SETTINGS_PATH_DATA(version, t);
    return (
      settingsData.nav.find((nav: any) => pathname.includes(nav.path)) ||
      settingsData.account.find((acc: any) => pathname.includes(acc.path))
    );
  }, [pathname, t]);

  return (
    <PageHeader>
      <PageHeaderStart>
        <Breadcrumb>
          <Breadcrumb.List className="gap-1">
            <Breadcrumb.Item>
              <Button variant="ghost" asChild>
                <Link to={pathname}>{currentPath?.name}</Link>
              </Button>
              {currentPath?.shortDescription && (
                <Tooltip>
                  <Tooltip.Trigger>
                    {currentPath?.helpUrl && (
                      <Link to={currentPath.helpUrl} target="_blank">
                        <IconInfoCircle className="size-4 text-accent-foreground" />
                      </Link>
                    )}
                  </Tooltip.Trigger>
                  <Tooltip.Content>
                    <p>{currentPath.shortDescription}</p>
                  </Tooltip.Content>
                </Tooltip>
              )}
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Breadcrumb>
      </PageHeaderStart>
    </PageHeader>
  );
}
