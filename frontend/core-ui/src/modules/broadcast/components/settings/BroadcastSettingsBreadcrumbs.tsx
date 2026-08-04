import { Breadcrumb, Button } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router';
import { PageHeader, PageHeaderStart } from 'ui-modules';

export function BroadcastSettingsBreadcrumbs() {
  const { pathname } = useLocation();

  const { t } = useTranslation('common', {
    keyPrefix: 'sidebar',
  });

  return (
    <PageHeader>
      <PageHeaderStart>
        <Breadcrumb>
          <Breadcrumb.List className="gap-1">
            <Breadcrumb.Item>
              <Button variant="ghost" asChild>
                <Link to={pathname}>{t('broadcast-config')}</Link>
              </Button>
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Breadcrumb>
      </PageHeaderStart>
    </PageHeader>
  );
}
