import { useQuery } from '@apollo/client';
import {
  IconDotsVertical,
  IconFileText,
  IconPlus,
  IconWorldPlus,
} from '@tabler/icons-react';
import { Button, cn, NavigationMenuLinkItem, Sidebar } from 'erxes-ui';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { WebsiteDrawer } from './cms/components/websites/WebsiteDrawer';
import { CONTENT_CMS_LIST } from './cms/graphql/queries';
import { IWebsite } from './cms/types';

export const ContentNavigation = () => {
  const { pathname } = useLocation();
  const [isWebsiteDrawerOpen, setIsWebsiteDrawerOpen] = useState(false);
  const [editingWebsite, setEditingWebsite] = useState<IWebsite>();
  const { data, refetch } = useQuery<{
    contentCMSList: IWebsite[];
  }>(CONTENT_CMS_LIST);

  const cmsList = data?.contentCMSList || [];
  const onlyCms = cmsList.length === 1 ? cmsList[0] : null;
  const cmsPath = onlyCms?.clientPortalId
    ? `/content/cms/${onlyCms.clientPortalId}/posts`
    : '/content/cms';
  const isCmsActive = pathname.startsWith('/content/cms');

  const handleWebsiteUpdated = () => {
    refetch();
    setIsWebsiteDrawerOpen(false);
    setEditingWebsite(undefined);
  };

  const handleCloseWebsiteDrawer = () => {
    setIsWebsiteDrawerOpen(false);
    setEditingWebsite(undefined);
  };

  const handleOpenWebsiteDrawer = (website?: IWebsite) => {
    setEditingWebsite(website);
    setIsWebsiteDrawerOpen(true);
  };

  return (
    <div>
      {/* <NavigationMenuLinkItem
        name="Knowledge Base"
        path="/content/knowledgebase"
        icon={IconLibraryPhoto}
      /> */}
      {onlyCms?.clientPortalId ? (
        <>
          <Sidebar.MenuItem className="group/cms-menu">
            <Sidebar.MenuButton
              asChild
              isActive={isCmsActive}
              className={cn(
                'pr-14',
                isCmsActive
                  ? 'group-hover/cms-menu:bg-primary/10'
                  : 'group-hover/cms-menu:bg-accent',
              )}
            >
              <Link to={cmsPath}>
                <IconFileText
                  className={cn(
                    'text-accent-foreground',
                    isCmsActive && 'text-primary',
                  )}
                />
                <span className="capitalize">CMS</span>
              </Link>
            </Sidebar.MenuButton>
            <div className="absolute inset-y-0 right-1 flex items-center gap-0.5">
              <Button
                aria-label="Add CMS"
                className="h-6 w-6 p-0 text-primary/70 hover:bg-transparent hover:text-primary"
                size="icon"
                title="Add CMS"
                type="button"
                variant="ghost"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  handleOpenWebsiteDrawer();
                }}
              >
                <IconPlus className="h-4 w-4" />
              </Button>
              <Button
                aria-label="Manage CMS"
                className="h-6 w-6 p-0 text-primary/70 hover:bg-transparent hover:text-primary"
                size="icon"
                title="Manage CMS"
                type="button"
                variant="ghost"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  handleOpenWebsiteDrawer(onlyCms);
                }}
              >
                <IconDotsVertical className="h-4 w-4" />
              </Button>
            </div>
          </Sidebar.MenuItem>
          <WebsiteDrawer
            isOpen={isWebsiteDrawerOpen}
            onClose={handleCloseWebsiteDrawer}
            onSuccess={handleWebsiteUpdated}
            website={editingWebsite}
          />
        </>
      ) : (
        <NavigationMenuLinkItem
          name="CMS"
          path="/content/cms"
          icon={IconFileText}
        />
      )}
      <NavigationMenuLinkItem
        name="Web Builder"
        path="/content/web-builder"
        icon={IconWorldPlus}
      />
    </div>
  );
};
