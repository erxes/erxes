import { Can, PageHeader, PageHeaderEnd, PageHeaderStart } from 'ui-modules';
import { Breadcrumb, Button } from 'erxes-ui';
import { Link } from 'react-router-dom';
import { IconApi } from '@tabler/icons-react';
import { CreateOAuthClient } from './CreateOAuthClient';
import { useTranslation } from 'react-i18next';

export function OAuthClientsHeader() {
  const { t } = useTranslation('settings');
  return (
    <PageHeader>
      <PageHeaderStart>
        <Breadcrumb>
          <Breadcrumb.List className="gap-1">
            <Breadcrumb.Item>
              <Button variant="ghost" asChild>
                <Link to="/settings/oauth-clients">
                  <IconApi />
                  {t('oauth-clients._', 'OAuth clients')}
                </Link>
              </Button>
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Breadcrumb>
      </PageHeaderStart>
      <PageHeaderEnd>
        <Can action="appsManage">
          <CreateOAuthClient />
        </Can>
      </PageHeaderEnd>
    </PageHeader>
  );
}
