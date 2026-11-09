import { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import {
  IconChevronRight,
  IconFileDescription,
  IconPlus,
  IconWorld,
} from '@tabler/icons-react';
import {
  Button,
  Collapsible,
  NavigationMenuGroup,
  Sidebar,
  Skeleton,
  TextOverflowTooltip,
  cn,
} from 'erxes-ui';
import { CONTENT_CMS_LIST } from './cms/graphql/queries';
import { useCustomTypes } from './cms/custom-types/hooks/useCustomTypes';
import {
  IPostsFieldType,
  usePostsFieldTypes,
} from './cms/posts/constants/postsFieldTypes';
import { PostsPath } from './cms/posts/types/path/PostsPath';
import { CMS_WEBSITE_CONTENT_TYPE } from './cms/shared/side-panel/contentPanelTypes';
import { useContentPanel } from './cms/shared/side-panel/useContentPanel';
import { IWebsite } from './cms/types';

const CMS_PATH = '/content/cms';

const getWebsitePath = (websiteId: string) => `${CMS_PATH}/${websiteId}`;

const NavigationSkeleton = () => (
  <div className="flex flex-col gap-1">
    {['w-32', 'w-36', 'w-28'].map((width) => (
      <Skeleton key={width} className={cn('mt-1 h-4', width)} />
    ))}
  </div>
);

const NavigationLinkItem = ({
  to,
  name,
  icon: Icon,
  isActive,
  depth = 1,
}: {
  to: string;
  name: string;
  icon: IPostsFieldType['icon'];
  isActive: boolean;
  depth?: 1 | 2;
}) => (
  <Sidebar.MenuItem>
    <Sidebar.MenuButton
      asChild
      isActive={isActive}
      className={depth === 2 ? 'pl-12' : 'pl-7'}
    >
      <Link to={to}>
        <Icon
          className={cn('text-accent-foreground', isActive && 'text-primary')}
        />
        <TextOverflowTooltip className="min-w-0 flex-1" value={name} />
      </Link>
    </Sidebar.MenuButton>
  </Sidebar.MenuItem>
);

const WebsitePostTypes = ({
  websiteId,
  postsPath,
}: {
  websiteId: string;
  postsPath: string;
}) => {
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const { customTypes } = useCustomTypes({ clientPortalId: websiteId });
  const currentType = searchParams.get('type');

  return (
    <>
      {customTypes.map((type) => (
        <NavigationLinkItem
          key={type._id}
          to={`${postsPath}?type=${type.code}`}
          name={type.pluralLabel || type.label || type.code}
          icon={IconFileDescription}
          isActive={pathname === postsPath && currentType === type.code}
          depth={2}
        />
      ))}
    </>
  );
};

const WebsiteItem = ({
  website,
  isActive,
  hasActiveWebsite,
}: {
  website: IWebsite & { clientPortalId: string };
  isActive: boolean;
  hasActiveWebsite: boolean;
}) => {
  const { t } = useTranslation('content');
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const sections = usePostsFieldTypes();
  const [open, setOpen] = useState(isActive || !hasActiveWebsite);
  const websitePath = getWebsitePath(website.clientPortalId);
  const name = website.name || t('website');

  useEffect(() => {
    setOpen(isActive || !hasActiveWebsite);
  }, [isActive, hasActiveWebsite]);

  const isSectionActive = (section: IPostsFieldType) => {
    const sectionPath = `${websitePath}${section.value}`;

    if (section.value === PostsPath.Posts) {
      return pathname.startsWith(sectionPath) && !searchParams.get('type');
    }

    return pathname.startsWith(sectionPath);
  };

  return (
    <Collapsible className="group/website" open={open} onOpenChange={setOpen}>
      <div className="flex w-full items-center">
        <Collapsible.Trigger asChild>
          <Button
            variant="ghost"
            className={cn(
              'w-full justify-start gap-2 overflow-hidden p-2 text-left',
              !isActive && 'text-muted-foreground',
            )}
            aria-expanded={open}
          >
            <IconWorld className="size-3.5 shrink-0 text-accent-foreground" />
            <TextOverflowTooltip
              className="min-w-0 flex-1 font-medium"
              value={name}
            />
            <span className="flex text-muted-foreground transition-transform duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] group-data-[state=open]/website:rotate-90 motion-reduce:transition-none">
              <IconChevronRight className="size-3.5!" />
            </span>
          </Button>
        </Collapsible.Trigger>
      </div>
      <div
        className={cn(
          'grid transition-[grid-template-rows,visibility] duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none',
          open ? 'visible grid-rows-[1fr]' : 'invisible grid-rows-[0fr]',
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <Sidebar.Menu>
            {sections.map((section) => (
              <div key={section.value}>
                <NavigationLinkItem
                  to={`${websitePath}${section.value}`}
                  name={section.label}
                  icon={section.icon}
                  isActive={isActive && isSectionActive(section)}
                />
                {isActive && section.value === PostsPath.Posts && (
                  <WebsitePostTypes
                    websiteId={website.clientPortalId}
                    postsPath={`${websitePath}${section.value}`}
                  />
                )}
              </div>
            ))}
          </Sidebar.Menu>
        </div>
      </div>
    </Collapsible>
  );
};

const CmsSubNavigation = () => {
  const { t } = useTranslation('content');
  const { pathname } = useLocation();
  const { openDraft } = useContentPanel(CMS_WEBSITE_CONTENT_TYPE);
  const { data, loading } = useQuery<{ contentCMSList: IWebsite[] }>(
    CONTENT_CMS_LIST,
  );
  const websites = (data?.contentCMSList || []).filter(
    (website): website is IWebsite & { clientPortalId: string } =>
      !!website.clientPortalId,
  );
  const activeWebsiteId = pathname.startsWith(`${CMS_PATH}/`)
    ? pathname.slice(CMS_PATH.length + 1).split('/')[0]
    : '';

  return (
    <NavigationMenuGroup
      name={t('content-management')}
      className="[&_[data-sidebar=group-label]]:min-w-0 [&_[data-sidebar=group-label]>span]:truncate"
      actions={
        <Button
          variant="ghost"
          size="icon"
          aria-label={t('add-cms')}
          title={t('add-cms')}
          className="size-5 p-0"
          onClick={(event) => {
            event.stopPropagation();
            openDraft();
          }}
        >
          <IconPlus className="size-3.5" />
        </Button>
      }
    >
      {loading && !websites.length ? (
        <NavigationSkeleton />
      ) : (
        websites.map((website) => (
          <WebsiteItem
            key={website._id}
            website={website}
            isActive={website.clientPortalId === activeWebsiteId}
            hasActiveWebsite={!!activeWebsiteId}
          />
        ))
      )}
    </NavigationMenuGroup>
  );
};

export const ContentSubNavigation = () => {
  const { pathname } = useLocation();

  if (!pathname.startsWith(CMS_PATH)) {
    return null;
  }

  return <CmsSubNavigation />;
};
