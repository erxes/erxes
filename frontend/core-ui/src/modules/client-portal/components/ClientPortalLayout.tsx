import { Breadcrumb, Button, PageContainer } from 'erxes-ui';
import { PageHeader } from 'ui-modules';
import { IconUser, IconPlus } from '@tabler/icons-react';
import { Link, Outlet, useMatch, useParams } from 'react-router-dom';
import { ClientPortalPath } from '@/types/paths/ClientPortalPath';
import { AppPath } from '@/types/paths/AppPath';
import { useQuery } from '@apollo/client';
import { CLIENT_PORTAL_GET_CONFIG } from '@/client-portal/graphql/queries';

export function ClientPortalLayout() {
  const { id } = useParams<{ id: string }>();
  const isCreate = !!useMatch(
    `/${AppPath.ClientPortal}/${ClientPortalPath.CreateWebsite}`,
  );
  const { data } = useQuery(CLIENT_PORTAL_GET_CONFIG, {
    variables: { _id: id },
    skip: !id,
  });
  const websiteName = data?.clientPortalGetConfig?.name;
  return (
    <PageContainer>
      <PageHeader>
        <PageHeader.Start>
          <Breadcrumb>
            <Breadcrumb.List>
              <Breadcrumb.Item>
                <Button variant="ghost" asChild>
                  <Link
                    to={
                      isCreate
                        ? `/${AppPath.ClientPortal}/${ClientPortalPath.CreateWebsite}`
                        : `/${AppPath.ClientPortal}`
                    }
                  >
                    <IconUser />
                    {isCreate ? 'Create website' : 'Client Portal'}
                  </Link>
                </Button>
              </Breadcrumb.Item>
              {websiteName && (
                <Breadcrumb.Item>
                  <div className="inline-block bg-border rounded-lg flex-none w-0.5 h-3"></div>
                  <span>{websiteName}</span>
                </Breadcrumb.Item>
              )}
            </Breadcrumb.List>
          </Breadcrumb>
        </PageHeader.Start>
        <PageHeader.End>
          {isCreate || id ? (
            <Button size="sm" type="submit" form="website-form">
              {isCreate ? 'Create' : 'Save'}
            </Button>
          ) : (
            <Button size="sm" asChild>
              <Link
                to={`/${AppPath.ClientPortal}/${ClientPortalPath.CreateWebsite}`}
              >
                <IconPlus />d New website
              </Link>
            </Button>
          )}
        </PageHeader.End>
      </PageHeader>
      <Outlet />
    </PageContainer>
  );
}
