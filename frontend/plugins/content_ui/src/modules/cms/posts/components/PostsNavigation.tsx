import {
  IconCategory,
  IconCube,
  IconRulerMeasure,
  IconSettings,
} from '@tabler/icons-react';
import { Breadcrumb, Button } from 'erxes-ui';
import { Link, useLocation } from 'react-router-dom';
import { PageHeader } from 'ui-modules';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@apollo/client';
import { CONTENT_CMS_LIST, GET_CLIENT_PORTALS } from '../../graphql/queries';

export const PostsNavigation = () => {
  const { t } = useTranslation('content');
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
    if (pathname.includes('/pages')) {
      return {
        path: `${basePath}/pages`,
        label: t('pages'),
        icon: IconRulerMeasure,
      };
    }
    if (pathname.includes('/categories')) {
      return {
        path: `${basePath}/categories`,
        label: t('categories'),
        icon: IconRulerMeasure,
      };
    }
    if (pathname.includes('/tags')) {
      return {
        path: `${basePath}/tags`,
        label: t('tags'),
        icon: IconRulerMeasure,
      };
    }
    if (pathname.includes('/custom-fields')) {
      return {
        path: `${basePath}/custom-fields`,
        label: t('custom-fields'),
        icon: IconRulerMeasure,
      };
    }
    if (pathname.includes('/custom-types')) {
      return {
        path: `${basePath}/custom-types`,
        label: t('custom-post-types'),
        icon: IconRulerMeasure,
      };
    }
    if (pathname.includes('/cmssettings')) {
      return {
        path: `${basePath}/cmssettings`,
        label: t('settings'),
        icon: IconSettings,
      };
    }
    if (pathname.includes('/posts')) {
      return {
        path: `${basePath}/posts`,
        label: t('posts'),
        icon: IconCategory,
      };
    }

    return {
      path: `${basePath}/posts`,
      label: t('posts'),
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
                {t('cms')}
              </Link>
            </Button>
          </Breadcrumb.Item>
          <Breadcrumb.Separator />
          <Breadcrumb.Item>
            <Button variant="ghost" asChild>
              <Link to="/content/cms">{websiteName || t('website')}</Link>
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
