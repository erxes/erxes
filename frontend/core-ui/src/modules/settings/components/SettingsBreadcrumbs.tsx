import { Link, useLocation } from 'react-router';
import { Breadcrumb, Button } from 'erxes-ui';
import { GET_SETTINGS_PATH_DATA } from '../constants/data';
import { TSettingPath } from '@/types/paths/SettingsPath';
import { PageHeader, PageHeaderStart, useVersion } from 'ui-modules';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';

export function SettingsBreadcrumbs({
  children,
}: {
  children?: React.ReactNode;
}) {
  const { pathname } = useLocation();
  const { t } = useTranslation('common', {
    keyPrefix: 'sidebar',
  });
  const version = useVersion();
  const currentPath = useMemo(() => {
    const settingsData = GET_SETTINGS_PATH_DATA(version, t);

    return [
      ...settingsData.nav,
      ...settingsData.account,
      ...settingsData.developer,
    ].find((entry: TSettingPath) => pathname.includes(entry.path));
  }, [pathname, t, version]);

  return (
    <PageHeader>
      <PageHeaderStart>
        <Breadcrumb>
          <Breadcrumb.List className="gap-1">
            <Breadcrumb.Item>
              <Button variant="ghost" asChild>
                <Link to={pathname}>{currentPath?.name}</Link>
              </Button>
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Breadcrumb>
        {children}
      </PageHeaderStart>
    </PageHeader>
  );
}
