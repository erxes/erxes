import { useQuery } from '@apollo/client';
import { IconDots, IconFileText, IconWorldPlus } from '@tabler/icons-react';
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
              aria-label="Manage CMS"
              title="Manage CMS"
              type="button"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                setIsWebsiteDrawerOpen(true);
              }}
            >
              <IconDots />
            </Sidebar.MenuAction>
          </Sidebar.MenuItem>
          <WebsiteDrawer
            isOpen={isWebsiteDrawerOpen}
            onClose={() => setIsWebsiteDrawerOpen(false)}
            onSuccess={handleWebsiteUpdated}
            website={onlyCms}
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
