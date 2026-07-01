import { Button, Breadcrumb, Sidebar, Separator } from 'erxes-ui';
import { PageHeader } from 'ui-modules';
import { useTranslation } from 'react-i18next';
import {
  IconFileText,
  IconPlus,
  IconTag,
  IconFolder,
  IconFile,
  IconLayout,
  IconMenu,
  IconAlignJustified,
  IconSettings,
} from '@tabler/icons-react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { ReactNode, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { GET_WEBSITES, CONTENT_CMS_LIST } from '../graphql/queries';

interface CmsLayoutProps {
  children: ReactNode;
  activeNav?: string;
  onNavChange?: (nav: string) => void;
  showSidebar?: boolean;
  breadcrumbItems?: Array<{
    label: string;
    href?: string;
    icon?: ReactNode;
  }>;
  headerActions?: ReactNode;
}

export function CmsLayout({
  children,
  activeNav,
  onNavChange,
  showSidebar = true,
  breadcrumbItems,
  headerActions,
}: CmsLayoutProps) {
  const { t } = useTranslation('content');
  const { websiteId } = useParams();
  const location = useLocation();

  // Force re-render when location changes (fixes back button issue)
  useEffect(() => {
    // This effect will run whenever the location changes
    // ensuring the component updates when browser back/forward is used
  }, [location]);

  // const [expandedSections, setExpandedSections] = useState({
  //   contentBuilder: true,
  //   customPostType: true,
  //   contentSettings: true,
  // });

  const { data: websitesData } = useQuery(GET_WEBSITES, {
    variables: { search: '' },
    skip: !websiteId,
    fetchPolicy: 'cache-first',
  });

  const { data: cmsData } = useQuery(CONTENT_CMS_LIST, {
    fetchPolicy: 'cache-first',
  });

  const websiteName =
    cmsData?.contentCMSList?.find((w: any) => w.clientPortalId === websiteId)
      ?.name ||
    websitesData?.clientPortalGetConfigs?.list?.find(
      (w: any) => w._id === websiteId,
    )?.name ||
    '';

  const navigationItems = [
    {
      id: 'posts',
      label: t('posts'),
      icon: <IconFileText className="w-4 h-4" />,
      href: websiteId ? `/content/cms/${websiteId}/posts` : '/content/cms',
    },
    {
      id: 'pages',
      label: t('pages'),
      icon: <IconFile className="w-4 h-4" />,
      href: websiteId ? `/content/cms/${websiteId}/pages` : '/content/cms',
    },
    {
      id: 'categories',
      label: t('categories'),
      icon: <IconFolder className="w-4 h-4" />,
      href: websiteId ? `/content/cms/${websiteId}/categories` : '/content/cms',
    },
    {
      id: 'tags',
      label: t('tags'),
      icon: <IconTag className="w-4 h-4" />,
      href: websiteId ? `/content/cms/${websiteId}/tags` : '/content/cms',
    },

    {
      id: 'menus',
      label: t('menus'),
      icon: <IconMenu className="w-4 h-4" />,
      href: websiteId ? `/content/cms/${websiteId}/menus` : '/content/cms',
    },
    {
      id: 'custom-fields',
      label: t('custom-fields'),
      icon: <IconAlignJustified className="w-4 h-4" />,
      href: websiteId
        ? `/content/cms/${websiteId}/custom-fields`
        : '/content/cms',
    },
    {
      id: 'custom-types',
      label: t('custom-post-types'),
      icon: <IconLayout className="w-4 h-4" />,
      href: websiteId
        ? `/content/cms/${websiteId}/custom-types`
        : '/content/cms',
    },
    {
      id: 'settings',
      label: t('settings'),
      icon: <IconSettings className="w-4 h-4" />,
      href: websiteId
        ? `/content/cms/${websiteId}/cmssettings`
        : '/content/cms',
    },
  ];

  const getCurrentActiveNav = () => {
    if (!websiteId) return 'posts';
    const pathSegments = location.pathname.split('/');
    const lastSegment = pathSegments[pathSegments.length - 1];
    return lastSegment || 'posts';
  };

  const currentActiveNav = activeNav || getCurrentActiveNav();

  return (
    <div className="flex h-full">
      <div className="flex flex-col flex-1 min-w-0 overflow-auto">
        <PageHeader>
          <PageHeader.Start>
            <Breadcrumb>
              <Breadcrumb.List className="gap-1">
                {breadcrumbItems ? (
                  breadcrumbItems.map((item, index) => (
                    <div key={index} className="flex items-center">
                      {index > 0 && <Breadcrumb.Separator />}
                      <Breadcrumb.Item>
                        {item.href ? (
                          <Button variant="ghost" asChild>
                            <Link to={item.href}>
                              {item.icon}
                              {item.label}
                            </Link>
                          </Button>
                        ) : (
                          <Button variant="ghost">
                            {item.icon}
                            {item.label}
                          </Button>
                        )}
                      </Breadcrumb.Item>
                    </div>
                  ))
                ) : (
                  <>
                    <Breadcrumb.Item>
                      <Button variant="ghost" asChild>
                        <Link to="/content/cms">
                          <IconFileText />
                          {t('cms')}
                        </Link>
                      </Button>
                    </Breadcrumb.Item>
                    {websiteId && (
                      <>
                        <Breadcrumb.Separator />
                        <Breadcrumb.Item>
                          <Button variant="ghost" asChild>
                            <Link to="/content/cms">
                              {websiteName || t('website')}
                            </Link>
                          </Button>
                        </Breadcrumb.Item>
                        <Breadcrumb.Separator />
                        <Breadcrumb.Item>
                          <Button variant="ghost">
                            {navigationItems.find(
                              (item) => item.id === currentActiveNav,
                            )?.label || t('posts')}
                          </Button>
                        </Breadcrumb.Item>
                      </>
                    )}
                  </>
                )}
              </Breadcrumb.List>
            </Breadcrumb>
            <Separator.Inline />
            <PageHeader.FavoriteToggleButton />
          </PageHeader.Start>
          <PageHeader.End>
            {headerActions || (
              <div>
                <Button asChild>
                  <Link to={`/content/cms/${websiteId || ''}/posts/add`}>
                    <IconPlus className="mr-2 h-4 w-4" />
                    {t('create-post')}
                  </Link>
                </Button>
              </div>
            )}
          </PageHeader.End>
        </PageHeader>

        <div className="flex flex-1 min-w-0 overflow-auto">
          {showSidebar && (
            <Sidebar collapsible="none" className="border-r flex-none">
              <Sidebar.Group>
                <Sidebar.GroupLabel>{t('content-management')}</Sidebar.GroupLabel>
                <Sidebar.GroupContent>
                  {navigationItems.map((item) => (
                    <Sidebar.Menu key={item.id}>
                      <Sidebar.MenuButton
                        asChild
                        isActive={currentActiveNav === item.id}
                        onClick={() => onNavChange?.(item.id)}
                      >
                        <Link to={item.href}>
                          {item.icon}
                          <span>{item.label}</span>
                        </Link>
                      </Sidebar.MenuButton>
                    </Sidebar.Menu>
                  ))}
                </Sidebar.GroupContent>
              </Sidebar.Group>
            </Sidebar>
          )}

          <div className="w-full py-2 px-4">{children}</div>
        </div>
      </div>
    </div>
  );
}
