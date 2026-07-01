import { Can, PageHeader, PageHeaderEnd, PageHeaderStart } from 'ui-modules';
import { Breadcrumb, Button } from 'erxes-ui';
import { Link } from 'react-router-dom';
import { IconShieldCog } from '@tabler/icons-react';
import { CreateApp } from './CreateApp';
import { useTranslation } from 'react-i18next';

export function AppsHeader() {
  const { t } = useTranslation('settings');
  return (
    <PageHeader>
      <PageHeaderStart>
        <Breadcrumb>
          <Breadcrumb.List className="gap-1">
            <Breadcrumb.Item>
              <Button variant="ghost" asChild>
                <Link to="/settings/app-tokens">
                  <IconShieldCog />
                  {t('apps', 'Apps')}
                </Link>
              </Button>
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Breadcrumb>
      </PageHeaderStart>
      <PageHeaderEnd>
        <Can action="appsManage">
          <CreateApp />
        </Can>
      </PageHeaderEnd>
    </PageHeader>
  );
}
