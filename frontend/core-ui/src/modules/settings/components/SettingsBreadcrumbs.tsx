import { Link, useLocation } from 'react-router';
import { Breadcrumb, Button } from 'erxes-ui';
import { GET_SETTINGS_PATH_DATA } from '../constants/data';
import { PageHeader, PageHeaderStart, useVersion } from 'ui-modules';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';

/**
 * `children` land beside the breadcrumb, for pages that put a view switch or
 * similar control in the header rather than above the table.
 */
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

    // Every section the sidebar can navigate to has to be searched, or the
    // pages in the ones left out show an empty title.
    return [
      ...settingsData.nav,
      ...settingsData.account,
      ...settingsData.developer,
    ].find((entry: any) => pathname.includes(entry.path));
    // `version` decides which entries exist at all, so it belongs here too.
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
