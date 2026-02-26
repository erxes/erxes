import { Breadcrumb, Button, Tooltip } from 'erxes-ui';
import { PageHeader } from 'ui-modules';
import { Link } from 'react-router-dom';
import { IconInfoCircle, IconTerminal2 } from '@tabler/icons-react';
import { CreateClientPortalSheet } from '@/client-portal/components/ClientPortalAddSheet';

export const ClientPortalHeader = () => {
  const guideUrl =
    'https://erxes.io/guides/68ef769c1a9ddbd30aec6c35/6992b25a5cac46b2ff76b17b';
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
              <Tooltip>
                <Tooltip.Trigger>
                  <Link to={guideUrl} target="_blank">
                    <IconInfoCircle className="size-4 text-accent-foreground" />
                  </Link>
                </Tooltip.Trigger>
                <Tooltip.Content>
                  <p>Configure customer-facing self-service portal access</p>
                </Tooltip.Content>
              </Tooltip>
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Breadcrumb>
      </PageHeader.Start>
      <PageHeader.End>
        <CreateClientPortalSheet />
      </PageHeader.End>
    </PageHeader>
  );
};
