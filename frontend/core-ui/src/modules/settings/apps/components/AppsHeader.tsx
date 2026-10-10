import { useTranslation } from 'react-i18next';
import { Can, PageHeader, PageHeaderEnd, PageHeaderStart } from 'ui-modules';
import { Breadcrumb, Button, Kbd, useScopedHotkeys } from 'erxes-ui';
import { Link } from 'react-router-dom';
import { IconPlus, IconShieldCog } from '@tabler/icons-react';
import { useAtom } from 'jotai';
import { isAddingAppAtom } from '../state';
import { SettingsHotKeyScope } from '@/types/SettingsHotKeyScope';

export function AppsHeader() {
  const { t } = useTranslation('settings', { keyPrefix: 'apps' });
  const [isAddingApp, setIsAddingApp] = useAtom(isAddingAppAtom);

  useScopedHotkeys(
    'c',
    () => {
      setIsAddingApp(true);
    },
    SettingsHotKeyScope.AppsPage,
  );

  return (
    <PageHeader>
      <PageHeaderStart>
        <Breadcrumb>
          <Breadcrumb.List className="gap-1">
            <Breadcrumb.Item>
              <Button variant="ghost" asChild>
                <Link to="/settings/app-tokens">
                  <IconShieldCog />
                  {t('apps')}
                </Link>
              </Button>
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Breadcrumb>
      </PageHeaderStart>
      <PageHeaderEnd>
        <Can action="appsManage">
          <Button disabled={isAddingApp} onClick={() => setIsAddingApp(true)}>
            <IconPlus />
            {t('create-app')}
            <Kbd>C</Kbd>
          </Button>
        </Can>
      </PageHeaderEnd>
    </PageHeader>
  );
}
