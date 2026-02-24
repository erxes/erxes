import { IconCategory, IconCube, IconRulerMeasure } from '@tabler/icons-react';
import { Breadcrumb, Button } from 'erxes-ui';
import { Link, useLocation } from 'react-router-dom';
import { PageHeader } from 'ui-modules';
import { useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { CONTENT_CMS_LIST, GET_CLIENT_PORTALS } from '../../graphql/queries';

export const PostsNavigation = () => {
  const { pathname } = useLocation();

  const { data: cmsData } = useQuery(CONTENT_CMS_LIST, {
    fetchPolicy: 'cache-and-network',
  });

  const { data: websitesData } = useQuery(GET_CLIENT_PORTALS, {
    fetchPolicy: 'cache-and-network',
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

  const currentPage = useMemo(() => {
    console.log('ppp', pathname)
    if (pathname.includes('/pages')) {
      return {
        path: `${basePath}/pages`,
        label: 'Pages',
        icon: IconRulerMeasure,
      };
    }
    if (pathname.includes('/categories')) {
      return {
        path: `${basePath}/categories`,
        label: 'Categories',
        icon: IconRulerMeasure,
      };
    }
    if (pathname.includes('/tags')) {
      return {
        path: `${basePath}/tags`,
        label: 'Tags',
        icon: IconRulerMeasure,
      };
    }
    if (pathname.includes('/custom-fields')) {
      return {
        path: `${basePath}/custom-fields`,
        label: 'Custom Fields',
        icon: IconRulerMeasure,
      };
    }
    if (pathname.includes('/custom-types')) {
      return {
        path: `${basePath}/custom-types`,
        label: 'Custom Post Types',
        icon: IconRulerMeasure,
      };
    }
    if (pathname.includes('/posts')) {
      return {
        path: `${basePath}/posts`,
        label: 'Posts',
        icon: IconCategory,
      };
    }

    return {
      path: `${basePath}/posts`,
      label: 'Posts',
      icon: IconCube,
    };
  }, [pathname, basePath]);

  const Icon = currentPage.icon;
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
              <Link to={currentPage.path}>
                <Icon />
                {currentPage.label}
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
