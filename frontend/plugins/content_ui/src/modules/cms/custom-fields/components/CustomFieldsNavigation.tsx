import { IconCube, IconAlignJustified } from '@tabler/icons-react';
import { Breadcrumb, Button } from 'erxes-ui';
import { Link, useLocation } from 'react-router-dom';
import { PageHeader } from 'ui-modules';
import { useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { CONTENT_CMS_LIST, GET_CLIENT_PORTALS } from '../../graphql/queries';

export const CustomFieldsNavigation = () => {
  const { pathname } = useLocation();

  const { data: cmsData } = useQuery(CONTENT_CMS_LIST, {
    fetchPolicy: 'cache-first',
  });

  const { data: websitesData } = useQuery(GET_CLIENT_PORTALS, {
    fetchPolicy: 'cache-first',
  });

  const { basePath, websiteId } = useMemo(() => {
    const pathSegments = pathname.split('/');
    const cmsIndex = pathSegments.findIndex((segment) => segment === 'cms');
    const websiteId =
      cmsIndex > 0 && cmsIndex < pathSegments.length - 1
        ? pathSegments[cmsIndex + 1]
        : '';
    const basePath = websiteId ? `/content/cms/${websiteId}` : '/content/cms';
    return { basePath, websiteId };
  }, [pathname]);

  const websiteName =
    cmsData?.contentCMSList?.find((w: any) => w.clientPortalId === websiteId)
      ?.name ||
    websitesData?.getClientPortals?.list?.find((w: any) => w._id === websiteId)
      ?.name ||
    '';

  return (
    <PageHeader.Start>
      <Breadcrumb>
        <Breadcrumb.List className="gap-1">
          <Breadcrumb.Item>
            <Button variant="ghost" asChild>
              <Link to={'/content/cms'}>
                <IconCube />
                CMS
              </Link>
            </Button>
          </Breadcrumb.Item>
          <Breadcrumb.Separator />
          <Breadcrumb.Item>
            <Button variant="ghost" asChild>
              <Link to="/content/cms">{websiteName || 'Website'}</Link>
            </Button>
          </Breadcrumb.Item>
          <Breadcrumb.Separator />
          <Breadcrumb.Page>
            <Button variant="ghost" asChild>
              <Link to={`${basePath}/custom-fields`}>
                <IconAlignJustified />
                Custom Fields
              </Link>
            </Button>
          </Breadcrumb.Page>
          <Breadcrumb.Separator />
          <PageHeader.FavoriteToggleButton />
        </Breadcrumb.List>
      </Breadcrumb>
    </PageHeader.Start>
  );
};
