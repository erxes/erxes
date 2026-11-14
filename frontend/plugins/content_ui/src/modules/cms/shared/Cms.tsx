import { useQuery } from '@apollo/client';
import {
  IconFileText,
  IconLayoutGrid,
  IconList,
  IconPlus,
} from '@tabler/icons-react';
import { Button, Spinner, ToggleGroup, toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAtomValue } from 'jotai';
import { currentUserState } from 'ui-modules';
import { CMS_WEBSITE_CONTENT_TYPE } from './side-panel/contentPanelTypes';
import { useContentPanel } from './side-panel/useContentPanel';
import { CONTENT_CMS_LIST } from '../graphql/queries';
import { IWebsite } from '../types';
import { CmsLayout } from './CmsLayout';
import { EmptyState } from './EmptyState';
import { CmsWebsiteCard } from './components/CmsWebsiteCard';
import { CmsWebsitesRecordTable } from './components/CmsWebsitesRecordTable';

export function Cms() {
  const { t } = useTranslation('content');
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'list' | 'thumbnail'>('thumbnail');
  const { openDraft, openDetail } = useContentPanel(CMS_WEBSITE_CONTENT_TYPE);
  const { data, loading } = useQuery<{
    contentCMSList: IWebsite[];
  }>(CONTENT_CMS_LIST);
  const currentUser = useAtomValue(currentUserState);
  const cmsList = data?.contentCMSList || [];
  const displayWebsites: IWebsite[] = cmsList;
  const onlyCms = cmsList.length === 1 ? cmsList[0] : null;

  const canAccessWebsite = (website: IWebsite) =>
    !!currentUser?.isOwner ||
    website.accessPolicy !== 'assigned' ||
    (website.assignedMemberIds || []).includes(currentUser?._id || '');

  const handleEditWebsite = (website: IWebsite) => {
    if (!canAccessWebsite(website)) {
      toast({
        title: t('access-restricted'),
        description: t('access-restricted-desc'),
        variant: 'destructive',
      });
      return;
    }
    openDetail(website._id);
  };

  const handleWebsiteClick = (website: IWebsite) => {
    if (!canAccessWebsite(website)) {
      toast({
        title: t('access-restricted'),
        description: t('access-restricted-desc'),
        variant: 'destructive',
      });
      return;
    }

    if (!website.clientPortalId) {
      navigate('/content/cms');
      return;
    }

    navigate(`/content/cms/${website.clientPortalId}/posts`);
  };

  const breadcrumbItems = [
    {
      label: 'CMS',
      href: '/content/cms',
      icon: <IconFileText />,
    },
  ];

  const headerActions = (
    <div className="flex items-center gap-2">
      <ToggleGroup
        type="single"
        value={viewMode}
        onValueChange={(value) => setViewMode(value as 'list' | 'thumbnail')}
      >
        <ToggleGroup.Item value="list" aria-label={t('list-view')}>
          <IconList className="h-4 w-4" />
        </ToggleGroup.Item>
        <ToggleGroup.Item value="thumbnail" aria-label={t('thumbnail-view')}>
          <IconLayoutGrid className="h-4 w-4" />
        </ToggleGroup.Item>
      </ToggleGroup>
      <Button onClick={() => openDraft()}>
        <IconPlus className="mr-2 h-4 w-4" />
        {t('add-cms')}
      </Button>
    </div>
  );

  if (!loading && onlyCms?.clientPortalId && canAccessWebsite(onlyCms)) {
    return (
      <Navigate to={`/content/cms/${onlyCms.clientPortalId}/posts`} replace />
    );
  }

  return (
    <CmsLayout
      showSidebar={false}
      breadcrumbItems={breadcrumbItems}
      headerActions={headerActions}
      contentClassName="flex flex-col min-h-0 min-w-0 overflow-hidden p-0"
    >
      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          {cmsList.length === 0 ? (
            <div className="m-3 bg-card rounded-lg overflow-hidden">
              <EmptyState
                icon={IconFileText}
                title={t('no-cms-yet')}
                description={t('no-cms-yet-desc')}
                actionLabel={t('add-cms')}
                onAction={() => openDraft()}
              />
            </div>
          ) : viewMode === 'thumbnail' ? (
            <div className="grid min-h-0 grid-cols-1 content-start gap-4 overflow-y-auto p-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {displayWebsites.map((website) => (
                <CmsWebsiteCard
                  key={website._id}
                  website={website}
                  restricted={!canAccessWebsite(website)}
                  onOpen={() => handleWebsiteClick(website)}
                  onManage={() => handleEditWebsite(website)}
                />
              ))}
            </div>
          ) : (
            <CmsWebsitesRecordTable
              websites={displayWebsites}
              isRestricted={(website) => !canAccessWebsite(website)}
              onOpen={handleWebsiteClick}
              onManage={handleEditWebsite}
            />
          )}
        </>
      )}
    </CmsLayout>
  );
}
