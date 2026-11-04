import { useQuery } from '@apollo/client';
import {
  IconDotsVertical,
  IconFileText,
  IconPlus,
  IconWorldPlus,
} from '@tabler/icons-react';
import { Button, cn, NavigationMenuLinkItem, Sidebar } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';

import { CONTENT_CMS_LIST } from './cms/graphql/queries';
import { CMS_WEBSITE_CONTENT_TYPE } from './cms/shared/side-panel/contentPanelTypes';
import { useContentPanel } from './cms/shared/side-panel/useContentPanel';
import { IWebsite } from './cms/types';

export const ContentNavigation = () => {
  const { t } = useTranslation('content');
  const { pathname } = useLocation();
  const { openDraft, openDetail } = useContentPanel(CMS_WEBSITE_CONTENT_TYPE);
  const { data } = useQuery<{
    contentCMSList: IWebsite[];
  }>(CONTENT_CMS_LIST);

  const cmsList = data?.contentCMSList || [];
  const onlyCms = cmsList.length === 1 ? cmsList[0] : null;
  const cmsPath = onlyCms?.clientPortalId
    ? `/content/cms/${onlyCms.clientPortalId}/posts`
    : '/content/cms';
  const isCmsActive = pathname.startsWith('/content/cms');

  return (
    <div>
      {/* <NavigationMenuLinkItem
        name="Knowledge Base"
        path="/content/knowledgebase"
        icon={IconLibraryPhoto}
      /> */}
      {onlyCms?.clientPortalId ? (
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
              aria-label={t('add-cms')}
              className="h-6 w-6 p-0 text-primary/70 hover:bg-transparent hover:text-primary"
              size="icon"
              title={t('add-cms')}
              type="button"
              variant="ghost"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                openDraft();
              }}
            >
              <IconPlus className="h-4 w-4" />
            </Button>
            <Button
              aria-label={t('manage-cms')}
              className="h-6 w-6 p-0 text-primary/70 hover:bg-transparent hover:text-primary"
              size="icon"
              title={t('manage-cms')}
              type="button"
              variant="ghost"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                openDetail(onlyCms._id);
              }}
            >
              <IconDotsVertical className="h-4 w-4" />
            </Button>
          </div>
        </Sidebar.MenuItem>
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
