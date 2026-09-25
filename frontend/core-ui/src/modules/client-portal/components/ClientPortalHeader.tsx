import { Breadcrumb, Button } from 'erxes-ui';
import { Can, PageHeader } from 'ui-modules';
import { Link } from 'react-router-dom';
import { IconTerminal2 } from '@tabler/icons-react';
import { ClientPortalAddButton } from '@/client-portal/components/ClientPortalAddButton';

export const ClientPortalHeader = () => {
  return (
    <PageHeader>
      <PageHeader.Start>
        <Breadcrumb>
          <Breadcrumb.List className="gap-1">
            <Breadcrumb.Item>
              <Button variant="ghost" asChild>
                <Link to="/settings/client-portals">
                  <IconTerminal2 />
                  Client portal
                </Link>
              </Button>
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Breadcrumb>
      </PageHeader.Start>
      <PageHeader.End>
        <Can action="clientPortalManage">
          <ClientPortalAddButton />
        </Can>
      </PageHeader.End>
    </PageHeader>
  );
};
