import { Link, useLocation } from 'react-router';
import { Breadcrumb, Button } from 'erxes-ui';
import { IconMinusVertical, IconSettings } from '@tabler/icons-react';
import { SETTINGS_PATH_DATA } from '../constants/data';
import { PageHeader, PageHeaderStart } from 'ui-modules';

export function SettingsBreadcrumbs() {
  const { pathname } = useLocation();
  const currentPath =
    SETTINGS_PATH_DATA.nav.find((nav) => pathname.includes(nav.path)) ||
    SETTINGS_PATH_DATA.account.find((acc) => pathname.includes(acc.path));
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
      </PageHeaderStart>
    </PageHeader>
  );
}
