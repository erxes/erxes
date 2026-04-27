import { Breadcrumb, Button, Skeleton } from 'erxes-ui';
import { IconTerminal2 } from '@tabler/icons-react';
import { Link, useParams } from 'react-router-dom';
import { PageHeader } from 'ui-modules';
import { useClientPortal } from '@/client-portal/hooks/useClientPortal';

export const ClientPortalDetailHeader = () => {
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
            <Breadcrumb.Separator />
            <Breadcrumb.Item>
              <ClientPortalDetailHeaderContent />
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Breadcrumb>
      </PageHeader.Start>
    </PageHeader>
  );
};

export const ClientPortalDetailHeaderContent = () => {
  const { clientPortalId } = useParams<{ clientPortalId: string }>();

  const { clientPortal, loading } = useClientPortal(clientPortalId ?? '');

  if (loading) {
    return <Skeleton className="w-20 h-4 bg-border mx-3" />;
  }

  return (
    <Button variant="ghost" asChild>
      <Link to={`/settings/client-portals/${clientPortalId}`}>
        {clientPortal?.name}
      </Link>
    </Button>
  );
};
