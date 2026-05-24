import { useQuery } from '@apollo/client';
import {
  IconDotsVertical,
  IconFileText,
  IconPlus,
  IconWorldPlus,
} from '@tabler/icons-react';
import { NavigationMenuLinkItem, Sidebar } from 'erxes-ui';
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
            <Sidebar.MenuButton asChild isActive={isCmsActive}>
              <Link to={cmsPath}>
                <IconFileText />
                <span className="capitalize">CMS</span>
              </Link>
            </Sidebar.MenuButton>
            <Sidebar.MenuAction
              aria-label="Add CMS"
              className="right-7 top-0.5 h-6 w-6 rounded text-primary/70 hover:bg-primary/10 hover:text-primary focus-visible:ring-1 focus-visible:ring-primary/40"
              title="Add CMS"
              type="button"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                handleOpenWebsiteDrawer();
              }}
            >
              <IconPlus className="h-4 w-4" />
            </Sidebar.MenuAction>
            <Sidebar.MenuAction
              aria-label="Manage CMS"
              className="right-1 top-0.5 h-6 w-6 rounded text-primary/70 hover:bg-primary/10 hover:text-primary focus-visible:ring-1 focus-visible:ring-primary/40"
              title="Manage CMS"
              type="button"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                handleOpenWebsiteDrawer(onlyCms);
              }}
            >
              <IconDotsVertical className="h-4 w-4" />
            </Sidebar.MenuAction>
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
