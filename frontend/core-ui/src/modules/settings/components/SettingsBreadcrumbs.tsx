import { Link, useLocation } from 'react-router';
import { Breadcrumb, Button } from 'erxes-ui';
import { GET_SETTINGS_PATH_DATA } from '../constants/data';
import { TSettingPath } from '@/types/paths/SettingsPath';
import {
  PageHeader,
  PageHeaderEnd,
  PageHeaderStart,
  useVersion,
} from 'ui-modules';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';

export function SettingsBreadcrumbs({
  children,
  actions,
}: {
  children?: React.ReactNode;
  /** What the page can do, where every other page keeps it: the far right. */
  actions?: React.ReactNode;
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
  const Icon = currentPath?.icon;

  return (
    <PageHeader>
      <PageHeaderStart>
        <Breadcrumb>
          <Breadcrumb.List className="gap-1">
            <Breadcrumb.Item>
              <Button
                variant="ghost"
                className="gap-2 rounded-lg px-2 font-medium transition-[background-color,transform] duration-150 active:scale-[0.98]"
                asChild
              >
                <Link to={pathname}>
                  {Icon && (
                    <span className="flex size-6 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <Icon className="size-3.5" />
                    </span>
                  )}
                  <span>{currentPath?.name}</span>
                </Link>
              </Button>
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Breadcrumb>
        {children}
      </PageHeaderStart>
      {actions && <PageHeaderEnd>{actions}</PageHeaderEnd>}
    </PageHeader>
  );
}
