import { useQuery } from '@apollo/client';
import {
  IconArrowUpRight,
  IconCalendar,
  IconEdit,
  IconFileText,
  IconLayoutGrid,
  IconList,
  IconLock,
  IconPlus,
} from '@tabler/icons-react';
import { Button, Spinner, ToggleGroup, toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAtomValue } from 'jotai';
import { currentUserState } from 'ui-modules';
import { WebsiteDrawer } from '../components/websites/WebsiteDrawer';
import { CONTENT_CMS_LIST } from '../graphql/queries';
import { IWebsite } from '../types';
import { CmsLayout } from './CmsLayout';
import { EmptyState } from './EmptyState';

const getThumbnailGradient = (color: string) => {
  const gradients = {
    orange: 'bg-gradient-to-br from-orange-200 to-orange-300',
    red: 'bg-gradient-to-br from-red-200 to-red-300',
    blue: 'bg-gradient-to-br from-blue-200 to-blue-300',
    green: 'bg-gradient-to-br from-green-200 to-green-300',
    yellow: 'bg-gradient-to-br from-yellow-200 to-yellow-300',
    purple: 'bg-gradient-to-br from-purple-200 to-purple-300',
    pink: 'bg-gradient-to-br from-pink-200 to-pink-300',
    indigo: 'bg-gradient-to-br from-indigo-200 to-indigo-300',
    teal: 'bg-gradient-to-br from-teal-200 to-teal-300',
  };
  return gradients[color as keyof typeof gradients] || gradients.orange;
};

export function Cms() {
  const { t } = useTranslation('content');
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'list' | 'thumbnail'>('thumbnail');
  const [isWebsiteDrawerOpen, setIsWebsiteDrawerOpen] = useState(false);
  const [editingWebsite, setEditingWebsite] = useState<IWebsite>();
  const { data, loading, refetch } = useQuery<{
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

  const handleWebsiteCreatedOrUpdated = () => {
    refetch();
    setIsWebsiteDrawerOpen(false);
    setEditingWebsite(undefined);
  };

  const handleCloseWebsiteDrawer = () => {
    setIsWebsiteDrawerOpen(false);
    setEditingWebsite(undefined);
  };

  const handleEditWebsite = (website: IWebsite) => {
    if (!canAccessWebsite(website)) {
      toast({
        title: t('access-restricted'),
        description: t('access-restricted-desc'),
        variant: 'destructive',
      });
      return;
    }
    setEditingWebsite(website);
    setIsWebsiteDrawerOpen(true);
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
    <div>
      <Button onClick={() => setIsWebsiteDrawerOpen(true)}>
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
    >
      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-6">
            <div className="text-sm text-muted-foreground">
              {t('found-x-results', { count: cmsList.length })}
            </div>
            <ToggleGroup
              type="single"
              value={viewMode}
              onValueChange={(value) =>
                setViewMode(value as 'list' | 'thumbnail')
              }
            >
              <ToggleGroup.Item value="list" aria-label={t('list-view')}>
                <IconList className="h-4 w-4" />
              </ToggleGroup.Item>
              <ToggleGroup.Item value="thumbnail" aria-label={t('thumbnail-view')}>
                <IconLayoutGrid className="h-4 w-4" />
              </ToggleGroup.Item>
            </ToggleGroup>
          </div>

          {cmsList.length === 0 ? (
            <div className="bg-card rounded-lg overflow-hidden">
              <EmptyState
                icon={IconFileText}
                title={t('no-cms-yet')}
                description={t('no-cms-yet-desc')}
                actionLabel={t('add-cms')}
                onAction={() => setIsWebsiteDrawerOpen(true)}
              />
            </div>
          ) : viewMode === 'thumbnail' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
              {displayWebsites.map((website, index) => (
                <div
                  key={website._id}
                  className="bg-card h-full rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleWebsiteClick(website)}
                >
                  <div
                    className={`aspect-video ${getThumbnailGradient(
                      [
                        'orange',
                        'red',
                        'blue',
                        'green',
                        'yellow',
                        'purple',
                        'pink',
                        'indigo',
                        'teal',
                      ][index % 9],
                    )} relative overflow-hidden`}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                        <svg
                          className="w-8 h-8 text-white"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                        </svg>
                      </div>
                    </div>

                    {website.domain && (
                      <div className="absolute bottom-2 right-2">
                        <div className="px-2 py-1 bg-white/90 rounded text-xs font-medium text-gray-700">
                          {website.domain}
                        </div>
                      </div>
                    )}

                    {!canAccessWebsite(website) && (
                      <div className="absolute top-2 left-2">
                        <div className="flex items-center gap-1 px-2 py-1 bg-black/60 rounded text-xs font-medium text-white">
                          <IconLock className="w-3 h-3" />
                          <span>{t('restricted')}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-foreground mb-2 line-clamp-2">
                      {website.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                      {website.description || t('no-description-available')}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <IconCalendar className="w-3 h-3" />
                        <span>
                          {t('created-on')}:{' '}
                          {new Date(website.createdAt).toLocaleDateString(
                            'en-US',
                            {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            },
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditWebsite(website);
                          }}
                          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                        >
                          <IconEdit className="w-3 h-3" />
                          <span>{t('manage')}</span>
                        </button>
                        {website.url && (
                          <a
                            href={website.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                          >
                            <IconArrowUpRight className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {displayWebsites.map((website, index) => (
                <div
                  key={website._id}
                  className="bg-card rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleWebsiteClick(website)}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-16 h-16 ${getThumbnailGradient(
                        [
                          'orange',
                          'red',
                          'blue',
                          'green',
                          'yellow',
                          'purple',
                          'pink',
                          'indigo',
                          'teal',
                        ][index % 9],
                      )} rounded-lg flex items-center justify-center`}
                    >
                      <svg
                        className="w-6 h-6 text-white"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground mb-1">
                        {website.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {website.description || t('no-description-available')}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <IconCalendar className="w-3 h-3" />
                          <span>
                            {t('created-on')}{' '}
                            {new Date(website.createdAt).toLocaleDateString(
                              'en-US',
                              {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              },
                            )}
                          </span>
                        </div>
                        {website.domain && (
                          <div className="flex items-center gap-1">
                            <span className="font-medium">
                              {website.domain}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditWebsite(website);
                        }}
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                      >
                        <IconEdit className="w-3 h-3" />
                        <span>{t('manage')}</span>
                      </button>
                      {website.url && (
                        <a
                          href={website.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                        >
                          <IconArrowUpRight className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <WebsiteDrawer
            isOpen={isWebsiteDrawerOpen}
            onClose={handleCloseWebsiteDrawer}
            onSuccess={handleWebsiteCreatedOrUpdated}
            website={editingWebsite}
          />
        </>
      )}
    </CmsLayout>
  );
}
