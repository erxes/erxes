import { useQuery } from '@apollo/client';
import {
  IconDotsVertical,
  IconFileText,
  IconPlus,
  IconWorldPlus,
} from '@tabler/icons-react';
import { Button, NavigationMenuLinkItem, Sidebar } from 'erxes-ui';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { WebsiteDrawer } from './cms/components/websites/WebsiteDrawer';
import { CONTENT_CMS_LIST } from './cms/graphql/queries';

type CmsWebsite = {
  _id: string;
  clientPortalId: string;
  name: string;
  description: string;
  domain: string;
  url: string;
  kind?: string;
  createdAt: string;
  languages?: string[];
  language?: string;
  postUrlField?: '_id' | 'count' | 'slug';
};

export const ContentNavigation = () => {
  const { pathname } = useLocation();
  const [isWebsiteDrawerOpen, setIsWebsiteDrawerOpen] = useState(false);
  const [editingWebsite, setEditingWebsite] = useState<CmsWebsite>();
  const { data, refetch } = useQuery<{
    contentCMSList: CmsWebsite[];
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

  const handleOpenWebsiteDrawer = (website?: CmsWebsite) => {
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
      {onlyCms ? (
        <>
          <Sidebar.MenuItem>
            <Sidebar.MenuButton asChild isActive={isCmsActive} className="pr-14">
              <Link to={cmsPath}>
                <IconFileText />
                <span className="capitalize">CMS</span>
              </Link>
            </Sidebar.MenuButton>
            <div className="absolute inset-y-0 right-1 flex items-center gap-0.5">
              <Button
                aria-label="Add CMS"
                className="h-6 w-6 p-0 text-primary/70 hover:bg-primary/10 hover:text-primary"
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
                className="h-6 w-6 p-0 text-primary/70 hover:bg-primary/10 hover:text-primary"
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
