import { Can, PageHeader, PageHeaderEnd, PageHeaderStart } from 'ui-modules';
import { Breadcrumb, Button } from 'erxes-ui';
import { Link } from 'react-router-dom';
import { IconApi } from '@tabler/icons-react';
import { CreateOAuthClient } from './CreateOAuthClient';

export function OAuthClientsHeader() {
  return (
    <PageHeader>
      <PageHeaderStart>
        <Breadcrumb>
          <Breadcrumb.List className="gap-1">
            <Breadcrumb.Item>
              <Button variant="ghost" asChild>
                <Link to="/settings/oauth-clients">
                  <IconApi />
                  OAuth clients
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
